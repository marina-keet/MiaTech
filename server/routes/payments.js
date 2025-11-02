const express = require('express');
const { body, validationResult } = require('express-validator');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/payments/create-payment-intent
// @desc    Créer une intention de paiement Stripe
// @access  Private
router.post('/create-payment-intent', [
  auth,
  body('orderId').notEmpty().withMessage('L\'ID de commande est requis'),
  body('amount').isNumeric().withMessage('Le montant est requis')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { orderId, amount } = req.body;

    // Vérifier que la commande existe et appartient à l'utilisateur
    const order = await Order.findById(orderId).populate('client service');
    
    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    if (order.client._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    if (order.payment.status === 'paid') {
      return res.status(400).json({ message: 'Cette commande a déjà été payée' });
    }

    // Créer l'intention de paiement Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe utilise les centimes
      currency: order.pricing.currency.toLowerCase(),
      metadata: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        clientId: req.user.id,
        serviceName: order.service.name
      },
      description: `Paiement pour ${order.service.name} - Commande ${order.orderNumber}`,
      receipt_email: order.client.email
    });

    // Enregistrer l'intention de paiement dans la commande
    const transaction = {
      transactionId: paymentIntent.id,
      amount: amount,
      method: 'stripe',
      status: 'pending',
      details: {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret
      }
    };

    order.payment.transactions.push(transaction);
    order.payment.status = 'pending';
    await order.save();

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amount
    });

  } catch (error) {
    console.error('Erreur création PaymentIntent:', error);
    res.status(500).json({ message: 'Erreur lors de la création du paiement' });
  }
});

// @route   POST /api/payments/confirm-payment
// @desc    Confirmer un paiement
// @access  Private
router.post('/confirm-payment', [
  auth,
  body('paymentIntentId').notEmpty().withMessage('L\'ID de l\'intention de paiement est requis'),
  body('orderId').notEmpty().withMessage('L\'ID de commande est requis')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { paymentIntentId, orderId } = req.body;

    // Récupérer l'intention de paiement depuis Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ 
        message: 'Le paiement n\'a pas été confirmé',
        status: paymentIntent.status 
      });
    }

    // Mettre à jour la commande
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    if (order.client.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    // Trouver et mettre à jour la transaction
    const transaction = order.payment.transactions.find(
      t => t.transactionId === paymentIntentId
    );

    if (transaction) {
      transaction.status = 'paid';
      transaction.details = {
        ...transaction.details,
        paymentMethod: paymentIntent.payment_method,
        receiptUrl: paymentIntent.receipt_url
      };
    }

    // Mettre à jour le statut de paiement de la commande
    order.payment.status = 'paid';
    
    // Si la commande était en attente, la passer à confirmée
    if (order.status === 'pending') {
      order.status = 'confirmed';
    }

    await order.save();

    res.json({ 
      message: 'Paiement confirmé avec succès',
      order: order,
      receiptUrl: paymentIntent.receipt_url
    });

  } catch (error) {
    console.error('Erreur confirmation paiement:', error);
    res.status(500).json({ message: 'Erreur lors de la confirmation du paiement' });
  }
});

// @route   POST /api/payments/webhook
// @desc    Webhook Stripe pour les événements de paiement
// @access  Public (mais sécurisé par signature Stripe)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Erreur signature webhook:', err.message);
    return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
  }

  // Traiter l'événement
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      
      try {
        const orderId = paymentIntent.metadata.orderId;
        const order = await Order.findById(orderId);
        
        if (order) {
          // Mettre à jour la transaction
          const transaction = order.payment.transactions.find(
            t => t.transactionId === paymentIntent.id
          );
          
          if (transaction) {
            transaction.status = 'paid';
          }
          
          order.payment.status = 'paid';
          
          if (order.status === 'pending') {
            order.status = 'confirmed';
          }
          
          await order.save();
          
          console.log(`Paiement confirmé pour la commande ${order.orderNumber}`);
        }
      } catch (error) {
        console.error('Erreur traitement webhook payment_intent.succeeded:', error);
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      
      try {
        const orderId = failedPayment.metadata.orderId;
        const order = await Order.findById(orderId);
        
        if (order) {
          const transaction = order.payment.transactions.find(
            t => t.transactionId === failedPayment.id
          );
          
          if (transaction) {
            transaction.status = 'failed';
          }
          
          order.payment.status = 'failed';
          await order.save();
          
          console.log(`Paiement échoué pour la commande ${order.orderNumber}`);
        }
      } catch (error) {
        console.error('Erreur traitement webhook payment_intent.payment_failed:', error);
      }
      break;

    default:
      console.log(`Événement non traité: ${event.type}`);
  }

  res.json({ received: true });
});

// @route   GET /api/payments/orders/:orderId
// @desc    Obtenir l'historique des paiements d'une commande
// @access  Private
router.get('/orders/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('client', 'firstName lastName email');

    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    // Vérifier les permissions
    if (req.user.role !== 'admin' && order.client._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    res.json({
      orderNumber: order.orderNumber,
      totalAmount: order.pricing.totalAmount,
      currency: order.pricing.currency,
      paymentStatus: order.payment.status,
      paymentMethod: order.payment.method,
      transactions: order.payment.transactions,
      invoiceNumber: order.payment.invoiceNumber,
      invoiceUrl: order.payment.invoiceUrl
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   POST /api/payments/refund
// @desc    Créer un remboursement (Admin seulement)
// @access  Private (Admin)
router.post('/refund', [
  auth,
  body('orderId').notEmpty().withMessage('L\'ID de commande est requis'),
  body('amount').optional().isNumeric().withMessage('Le montant doit être numérique'),
  body('reason').optional().notEmpty().withMessage('La raison ne peut pas être vide')
], async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé. Admin seulement.' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { orderId, amount, reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    if (order.payment.status !== 'paid') {
      return res.status(400).json({ message: 'La commande n\'a pas été payée' });
    }

    // Trouver la transaction payée
    const paidTransaction = order.payment.transactions.find(t => t.status === 'paid');
    if (!paidTransaction) {
      return res.status(400).json({ message: 'Aucune transaction payée trouvée' });
    }

    // Créer le remboursement Stripe
    const refundAmount = amount ? Math.round(amount * 100) : Math.round(order.pricing.totalAmount * 100);
    
    const refund = await stripe.refunds.create({
      payment_intent: paidTransaction.transactionId,
      amount: refundAmount,
      reason: 'requested_by_customer',
      metadata: {
        orderId: order._id.toString(),
        reason: reason || 'Remboursement demandé par l\'administrateur'
      }
    });

    // Ajouter la transaction de remboursement
    const refundTransaction = {
      transactionId: refund.id,
      amount: -(refundAmount / 100),
      method: 'stripe_refund',
      status: 'paid',
      details: {
        refundId: refund.id,
        originalTransactionId: paidTransaction.transactionId,
        reason: reason
      }
    };

    order.payment.transactions.push(refundTransaction);
    order.payment.status = 'refunded';
    order.status = 'refunded';

    await order.save();

    res.json({
      message: 'Remboursement créé avec succès',
      refund: refund,
      refundAmount: refundAmount / 100
    });

  } catch (error) {
    console.error('Erreur création remboursement:', error);
    res.status(500).json({ message: 'Erreur lors de la création du remboursement' });
  }
});

module.exports = router;