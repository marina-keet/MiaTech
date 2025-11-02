const express = require('express');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Configuration du transporteur email
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// @route   POST /api/contact/send
// @desc    Envoyer un message de contact
// @access  Public
router.post('/send', [
  body('name').notEmpty().withMessage('Le nom est requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('subject').notEmpty().withMessage('Le sujet est requis'),
  body('message').notEmpty().withMessage('Le message est requis'),
  body('message').isLength({ max: 2000 }).withMessage('Message trop long (max 2000 caractères)')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, company, subject, message, projectType, budget } = req.body;

    // Créer le contenu de l'email
    const emailContent = `
      Nouveau message de contact MiaTech
      
      Nom: ${name}
      Email: ${email}
      Téléphone: ${phone || 'Non renseigné'}
      Entreprise: ${company || 'Non renseignée'}
      Type de projet: ${projectType || 'Non spécifié'}
      Budget: ${budget || 'Non spécifié'}
      
      Sujet: ${subject}
      
      Message:
      ${message}
      
      ---
      Envoyé depuis le site MiaTech le ${new Date().toLocaleString('fr-FR')}
    `;

    const htmlContent = `
      <h2>Nouveau message de contact MiaTech</h2>
      <table style="border-collapse: collapse; width: 100%;">
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Nom</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${name}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Email</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${email}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Téléphone</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${phone || 'Non renseigné'}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Entreprise</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${company || 'Non renseignée'}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Type de projet</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${projectType || 'Non spécifié'}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Budget</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${budget || 'Non spécifié'}</td></tr>
      </table>
      
      <h3>Sujet: ${subject}</h3>
      <div style="background: #f5f5f5; padding: 15px; border-left: 4px solid #3b82f6; margin: 15px 0;">
        ${message.replace(/\n/g, '<br>')}
      </div>
      
      <p style="color: #666; font-size: 12px;">
        Envoyé depuis le site MiaTech le ${new Date().toLocaleString('fr-FR')}
      </p>
    `;

    // Envoyer l'email à l'équipe MiaTech
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Site Web MiaTech" <${process.env.EMAIL_USER}>`,
      to: process.env.CONTACT_EMAIL || process.env.EMAIL_USER,
      replyTo: email,
      subject: `[MiaTech Contact] ${subject}`,
      text: emailContent,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);

    // Envoyer un email de confirmation au client
    const confirmationContent = `
      Bonjour ${name},
      
      Nous avons bien reçu votre message concernant "${subject}".
      Notre équipe vous répondra dans les plus brefs délais.
      
      Voici un récapitulatif de votre demande:
      ${message}
      
      Cordialement,
      L'équipe MiaTech
    `;

    const confirmationHtml = `
      <h2>Confirmation de réception - MiaTech</h2>
      <p>Bonjour <strong>${name}</strong>,</p>
      
      <p>Nous avons bien reçu votre message concernant "<em>${subject}</em>".<br>
      Notre équipe vous répondra dans les plus brefs délais.</p>
      
      <h3>Récapitulatif de votre demande:</h3>
      <div style="background: #f8fafc; padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px;">
        ${message.replace(/\n/g, '<br>')}
      </div>
      
      <p style="margin-top: 20px;">
        Si vous avez des questions urgentes, vous pouvez nous contacter directement à 
        <a href="mailto:${process.env.EMAIL_USER}">${process.env.EMAIL_USER}</a>
      </p>
      
      <p>Cordialement,<br>
      <strong>L'équipe MiaTech</strong></p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
      <p style="color: #64748b; font-size: 14px;">
        Cet email a été envoyé automatiquement, merci de ne pas y répondre directement.
      </p>
    `;

    const confirmationOptions = {
      from: `"MiaTech" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Confirmation de réception - ${subject}`,
      text: confirmationContent,
      html: confirmationHtml
    };

    await transporter.sendMail(confirmationOptions);

    res.json({ 
      message: 'Message envoyé avec succès. Nous vous répondrons rapidement !',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur envoi email:', error);
    res.status(500).json({ 
      message: 'Erreur lors de l\'envoi du message. Veuillez réessayer ou nous contacter directement.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/contact/newsletter
// @desc    S'abonner à la newsletter
// @access  Public
router.post('/newsletter', [
  body('email').isEmail().withMessage('Email invalide'),
  body('name').optional().notEmpty().withMessage('Le nom ne peut pas être vide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, name } = req.body;

    // Ici, vous pourriez intégrer avec un service comme Mailchimp, SendGrid, etc.
    // Pour l'instant, on envoie juste un email de confirmation

    const transporter = createTransporter();
    
    // Email à l'équipe
    const teamNotification = {
      from: `"Site Web MiaTech" <${process.env.EMAIL_USER}>`,
      to: process.env.CONTACT_EMAIL || process.env.EMAIL_USER,
      subject: '[MiaTech] Nouvel abonné newsletter',
      text: `Nouvel abonné à la newsletter:\nNom: ${name || 'Non renseigné'}\nEmail: ${email}`,
      html: `
        <h3>Nouvel abonné à la newsletter MiaTech</h3>
        <p><strong>Nom:</strong> ${name || 'Non renseigné'}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><em>Abonnement effectué le ${new Date().toLocaleString('fr-FR')}</em></p>
      `
    };

    await transporter.sendMail(teamNotification);

    // Email de confirmation à l'abonné
    const welcomeEmail = {
      from: `"MiaTech" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Bienvenue dans la newsletter MiaTech !',
      html: `
        <h2>Bienvenue ${name ? name : ''} !</h2>
        <p>Merci de vous être abonné(e) à notre newsletter.</p>
        
        <p>Vous recevrez désormais:</p>
        <ul>
          <li>🚀 Nos dernières réalisations et projets</li>
          <li>💡 Des conseils et astuces tech</li>
          <li>📢 Nos actualités et nouvelles offres</li>
          <li>🎯 Du contenu exclusif sur le développement</li>
        </ul>
        
        <p>À bientôt,<br>
        <strong>L'équipe MiaTech</strong></p>
        
        <hr style="margin: 30px 0;">
        <p style="color: #64748b; font-size: 12px;">
          Si vous souhaitez vous désabonner, 
          <a href="mailto:${process.env.EMAIL_USER}?subject=Désabonnement newsletter">cliquez ici</a>
        </p>
      `
    };

    await transporter.sendMail(welcomeEmail);

    res.json({ 
      message: 'Abonnement confirmé ! Vérifiez votre boîte email.',
      email: email
    });

  } catch (error) {
    console.error('Erreur abonnement newsletter:', error);
    res.status(500).json({ 
      message: 'Erreur lors de l\'abonnement. Veuillez réessayer.'
    });
  }
});

// @route   POST /api/contact/callback
// @desc    Demander un rappel téléphonique
// @access  Public
router.post('/callback', [
  body('name').notEmpty().withMessage('Le nom est requis'),
  body('phone').notEmpty().withMessage('Le téléphone est requis'),
  body('preferredTime').optional().notEmpty().withMessage('L\'heure préférée ne peut pas être vide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone, email, preferredTime, subject } = req.body;

    const transporter = createTransporter();
    
    const callbackRequest = {
      from: `"Site Web MiaTech" <${process.env.EMAIL_USER}>`,
      to: process.env.CONTACT_EMAIL || process.env.EMAIL_USER,
      subject: '[MiaTech] Demande de rappel téléphonique',
      html: `
        <h2>Demande de rappel téléphonique</h2>
        <table style="border-collapse: collapse; width: 100%;">
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Nom</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${name}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Téléphone</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${phone}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Email</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${email || 'Non renseigné'}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Heure préférée</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${preferredTime || 'Flexible'}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Sujet</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${subject || 'Non spécifié'}</td></tr>
        </table>
        
        <p style="margin-top: 20px; padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b;">
          ⚠️ <strong>Action requise:</strong> Rappeler ce prospect dans les plus brefs délais !
        </p>
        
        <p style="color: #666; font-size: 12px;">
          Demande reçue le ${new Date().toLocaleString('fr-FR')}
        </p>
      `
    };

    await transporter.sendMail(callbackRequest);

    // Confirmation au prospect si email fourni
    if (email) {
      const confirmation = {
        from: `"MiaTech" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Demande de rappel confirmée - MiaTech',
        html: `
          <h2>Demande de rappel confirmée</h2>
          <p>Bonjour <strong>${name}</strong>,</p>
          
          <p>Nous avons bien reçu votre demande de rappel au <strong>${phone}</strong>.</p>
          
          ${preferredTime ? `<p>Heure préférée notée: <em>${preferredTime}</em></p>` : ''}
          
          <p>Notre équipe vous contactera dans les plus brefs délais pour discuter de votre projet.</p>
          
          <p>À bientôt,<br>
          <strong>L'équipe MiaTech</strong></p>
        `
      };

      await transporter.sendMail(confirmation);
    }

    res.json({ 
      message: 'Demande de rappel enregistrée ! Nous vous contacterons rapidement.',
      phone: phone
    });

  } catch (error) {
    console.error('Erreur demande rappel:', error);
    res.status(500).json({ 
      message: 'Erreur lors de l\'enregistrement de la demande. Veuillez réessayer.'
    });
  }
});

// @route   GET /api/contact/info
// @desc    Obtenir les informations de contact
// @access  Public
router.get('/info', (req, res) => {
  res.json({
    company: 'MiaTech',
    email: process.env.CONTACT_EMAIL || process.env.EMAIL_USER,
    phone: process.env.CONTACT_PHONE || '+33 1 23 45 67 89',
    address: {
      street: process.env.COMPANY_ADDRESS || '123 Avenue des Tech',
      city: process.env.COMPANY_CITY || 'Paris',
      zipCode: process.env.COMPANY_ZIP || '75001',
      country: 'France'
    },
    socialMedia: {
      linkedin: process.env.LINKEDIN_URL,
      twitter: process.env.TWITTER_URL,
      github: process.env.GITHUB_URL
    },
    businessHours: {
      monday: '9h00 - 18h00',
      tuesday: '9h00 - 18h00',
      wednesday: '9h00 - 18h00',
      thursday: '9h00 - 18h00',
      friday: '9h00 - 17h00',
      weekend: 'Fermé'
    }
  });
});

module.exports = router;