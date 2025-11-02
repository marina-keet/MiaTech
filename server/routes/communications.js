const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const notificationService = require('../services/notificationService');

// Récupérer les notifications de l'utilisateur
router.get('/notifications', authenticate, async (req, res) => {
  try {
    // TODO: Implémenter la récupération des notifications depuis la base de données
    // Pour l'instant, retourner un tableau vide
    res.json([]);
  } catch (error) {
    console.error('Erreur récupération notifications:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des notifications' 
    });
  }
});

// Marquer une notification comme lue
router.patch('/notifications/:id/read', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: Implémenter la mise à jour en base de données
    res.json({ message: 'Notification marquée comme lue' });
  } catch (error) {
    console.error('Erreur marquage notification:', error);
    res.status(500).json({ 
      message: 'Erreur lors du marquage de la notification' 
    });
  }
});

// Marquer toutes les notifications comme lues
router.patch('/notifications/read-all', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // TODO: Implémenter la mise à jour en base de données
    res.json({ message: 'Toutes les notifications marquées comme lues' });
  } catch (error) {
    console.error('Erreur marquage notifications:', error);
    res.status(500).json({ 
      message: 'Erreur lors du marquage des notifications' 
    });
  }
});

// Supprimer une notification
router.delete('/notifications/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: Implémenter la suppression en base de données
    res.json({ message: 'Notification supprimée' });
  } catch (error) {
    console.error('Erreur suppression notification:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la suppression de la notification' 
    });
  }
});

// Configuration des préférences de notification
router.get('/notifications/settings', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // TODO: Récupérer les préférences depuis la base de données
    const defaultSettings = {
      email: {
        orderUpdates: true,
        projectUpdates: true,
        paymentNotifications: true,
        marketingEmails: false
      },
      push: {
        orderUpdates: true,
        projectUpdates: true,
        paymentNotifications: true,
        chatMessages: true
      },
      sms: {
        urgentOnly: true,
        paymentNotifications: false
      }
    };
    
    res.json(defaultSettings);
  } catch (error) {
    console.error('Erreur récupération préférences:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des préférences' 
    });
  }
});

// Mettre à jour les préférences de notification
router.put('/notifications/settings', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { email, push, sms } = req.body;
    
    // Validation basique
    if (!email && !push && !sms) {
      return res.status(400).json({
        message: 'Au moins un type de préférences doit être fourni'
      });
    }
    
    // TODO: Sauvegarder les préférences en base de données
    
    res.json({ 
      message: 'Préférences de notification mises à jour',
      settings: { email, push, sms }
    });
  } catch (error) {
    console.error('Erreur mise à jour préférences:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la mise à jour des préférences' 
    });
  }
});

// Tester l'envoi de notification (admin seulement)
router.post('/notifications/test', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { type, recipient, testData } = req.body;
    
    if (!type || !recipient) {
      return res.status(400).json({
        message: 'Type et destinataire requis pour le test'
      });
    }
    
    let result;
    
    switch (type) {
      case 'email':
        result = await notificationService.sendEmail(
          recipient,
          'Test de notification - MiaTech',
          '<h2>Test de notification</h2><p>Ceci est un test du système de notification par email.</p>',
          'Test de notification - Ceci est un test du système de notification par email.'
        );
        break;
        
      case 'orderConfirmation':
        const mockOrder = {
          orderNumber: 'TEST-001',
          service: { name: 'Développement Web' },
          pricing: { totalAmount: 1500 },
          status: 'confirmed',
          _id: 'test123'
        };
        const mockUser = {
          fullName: 'Test User',
          email: recipient
        };
        result = await notificationService.notifyOrderConfirmation(mockOrder, mockUser);
        break;
        
      default:
        return res.status(400).json({
          message: `Type de test non supporté: ${type}`
        });
    }
    
    res.json({
      message: 'Test de notification envoyé',
      result: result
    });
  } catch (error) {
    console.error('Erreur test notification:', error);
    res.status(500).json({ 
      message: 'Erreur lors du test de notification' 
    });
  }
});

// Statistiques des notifications (admin seulement)
router.get('/notifications/stats', authenticate, authorize(['admin']), async (req, res) => {
  try {
    // TODO: Implémenter les vraies statistiques depuis la base de données
    const stats = {
      total: 0,
      byType: {
        orderConfirmation: 0,
        projectUpdate: 0,
        paymentReceived: 0,
        milestoneCompleted: 0
      },
      byStatus: {
        sent: 0,
        failed: 0,
        pending: 0
      },
      byChannel: {
        email: 0,
        push: 0,
        sms: 0
      },
      last24Hours: 0,
      last7Days: 0,
      last30Days: 0
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Erreur statistiques notifications:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des statistiques' 
    });
  }
});

// Envoyer une notification manuelle (admin seulement)
router.post('/notifications/send', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { 
      recipients, 
      subject, 
      message, 
      type = 'custom',
      channels = ['email']
    } = req.body;
    
    if (!recipients || !recipients.length) {
      return res.status(400).json({
        message: 'Au moins un destinataire est requis'
      });
    }
    
    if (!subject || !message) {
      return res.status(400).json({
        message: 'Sujet et message sont requis'
      });
    }
    
    const results = [];
    
    for (const recipient of recipients) {
      if (channels.includes('email')) {
        const result = await notificationService.sendEmail(
          recipient,
          subject,
          `<div style="font-family: Arial, sans-serif;">
            <h2>${subject}</h2>
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px;">
              ${message.replace(/\n/g, '<br>')}
            </div>
            <p><small>Message envoyé depuis l'administration MiaTech</small></p>
          </div>`,
          message
        );
        results.push({ recipient, channel: 'email', ...result });
      }
    }
    
    res.json({
      message: `Notification envoyée à ${recipients.length} destinataire(s)`,
      results: results
    });
  } catch (error) {
    console.error('Erreur envoi notification manuelle:', error);
    res.status(500).json({ 
      message: 'Erreur lors de l\'envoi de la notification' 
    });
  }
});

// Créer une room de chat pour un projet
router.post('/chat/rooms/project', authenticate, async (req, res) => {
  try {
    const { projectId, participants } = req.body;
    
    if (!projectId || !participants || !participants.length) {
      return res.status(400).json({
        message: 'ID de projet et participants requis'
      });
    }
    
    // TODO: Vérifier que l'utilisateur a accès au projet
    // TODO: Intégrer avec le ChatService
    
    const roomId = `project_${projectId}`;
    
    res.json({
      message: 'Room de chat créée',
      roomId: roomId,
      participants: participants
    });
  } catch (error) {
    console.error('Erreur création room chat:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la création de la room de chat' 
    });
  }
});

// Créer une room de support
router.post('/chat/rooms/support', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // TODO: Intégrer avec le ChatService
    const roomId = `support_${userId}`;
    
    res.json({
      message: 'Room de support créée',
      roomId: roomId
    });
  } catch (error) {
    console.error('Erreur création room support:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la création de la room de support' 
    });
  }
});

// Statistiques du chat (admin seulement)
router.get('/chat/stats', authenticate, authorize(['admin']), async (req, res) => {
  try {
    // TODO: Intégrer avec le ChatService pour les vraies statistiques
    const stats = {
      connectedUsers: 0,
      activeRooms: 0,
      totalMessages: 0,
      messagesLast24Hours: 0,
      averageResponseTime: 0
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Erreur statistiques chat:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des statistiques du chat' 
    });
  }
});

module.exports = router;