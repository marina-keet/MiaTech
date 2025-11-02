const nodemailer = require('nodemailer');

class NotificationService {
  constructor() {
    this.emailTransporter = this.createEmailTransporter();
  }

  createEmailTransporter() {
    return nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  // Notification par email
  async sendEmail(to, subject, htmlContent, textContent = null) {
    try {
      const mailOptions = {
        from: `"MiaTech" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html: htmlContent,
        text: textContent || htmlContent.replace(/<[^>]*>/g, '')
      };

      const info = await this.emailTransporter.sendMail(mailOptions);
      console.log('Email envoyé:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Erreur envoi email:', error);
      return { success: false, error: error.message };
    }
  }

  // Templates d'emails
  getEmailTemplate(type, data) {
    const templates = {
      orderConfirmation: (data) => ({
        subject: `Confirmation de commande ${data.orderNumber} - MiaTech`,
        html: `
          <h2>Commande confirmée ! 🎉</h2>
          <p>Bonjour <strong>${data.clientName}</strong>,</p>
          
          <p>Votre commande <strong>${data.orderNumber}</strong> a été confirmée avec succès.</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Détails de la commande:</h3>
            <p><strong>Service:</strong> ${data.serviceName}</p>
            <p><strong>Montant:</strong> ${data.amount}€</p>
            <p><strong>Statut:</strong> ${data.status}</p>
          </div>
          
          <p>Nous allons maintenant créer votre projet et vous assigner une équipe dédiée.</p>
          <p>Vous recevrez bientôt plus d'informations sur l'avancement.</p>
          
          <p><a href="${process.env.CLIENT_URL}/dashboard/orders/${data.orderId}" 
             style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
             Voir ma commande
          </a></p>
          
          <p>Merci de votre confiance !<br>
          L'équipe MiaTech</p>
        `
      }),

      projectAssigned: (data) => ({
        subject: `Nouveau projet assigné - ${data.projectTitle}`,
        html: `
          <h2>Nouveau projet assigné 🚀</h2>
          <p>Bonjour <strong>${data.memberName}</strong>,</p>
          
          <p>Un nouveau projet vous a été assigné:</p>
          
          <div style="background: #f0f9ff; padding: 20px; border-left: 4px solid #3b82f6; margin: 20px 0;">
            <h3>${data.projectTitle}</h3>
            <p><strong>Client:</strong> ${data.clientName}</p>
            <p><strong>Rôle:</strong> ${data.role}</p>
            <p><strong>Date limite:</strong> ${data.deadline}</p>
          </div>
          
          <p>Description: ${data.description}</p>
          
          <p><a href="${process.env.CLIENT_URL}/dashboard/projects/${data.projectId}" 
             style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
             Voir le projet
          </a></p>
          
          <p>Bonne chance !<br>
          L'équipe MiaTech</p>
        `
      }),

      projectUpdate: (data) => ({
        subject: `Mise à jour: ${data.projectTitle}`,
        html: `
          <h2>Mise à jour de projet 📊</h2>
          <p>Bonjour <strong>${data.clientName}</strong>,</p>
          
          <p>Voici une nouvelle mise à jour concernant votre projet:</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>${data.projectTitle}</h3>
            <h4>${data.updateTitle}</h4>
            <p>${data.updateContent}</p>
            <p><strong>Progression:</strong> ${data.progress}%</p>
            <p><em>Par ${data.authorName} le ${data.date}</em></p>
          </div>
          
          <p><a href="${process.env.CLIENT_URL}/dashboard/projects/${data.projectId}" 
             style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
             Voir le projet
          </a></p>
          
          <p>Cordialement,<br>
          L'équipe MiaTech</p>
        `
      }),

      paymentReceived: (data) => ({
        subject: `Paiement reçu - Commande ${data.orderNumber}`,
        html: `
          <h2>Paiement confirmé ✅</h2>
          <p>Bonjour <strong>${data.clientName}</strong>,</p>
          
          <p>Nous avons bien reçu votre paiement de <strong>${data.amount}€</strong> 
             pour la commande <strong>${data.orderNumber}</strong>.</p>
          
          <div style="background: #f0fdf4; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0;">
            <p><strong>Montant:</strong> ${data.amount}€</p>
            <p><strong>Méthode:</strong> ${data.paymentMethod}</p>
            <p><strong>Date:</strong> ${data.paymentDate}</p>
            ${data.receiptUrl ? `<p><a href="${data.receiptUrl}">Télécharger le reçu</a></p>` : ''}
          </div>
          
          <p>Votre projet va maintenant démarrer. Vous recevrez bientôt les détails de votre équipe assignée.</p>
          
          <p>Merci pour votre confiance !<br>
          L'équipe MiaTech</p>
        `
      }),

      milestoneCompleted: (data) => ({
        subject: `Étape complétée - ${data.projectTitle}`,
        html: `
          <h2>Étape terminée ! 🎯</h2>
          <p>Bonjour <strong>${data.clientName}</strong>,</p>
          
          <p>Excellente nouvelle ! Une étape importante de votre projet a été complétée:</p>
          
          <div style="background: #f0fdf4; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0;">
            <h3>${data.projectTitle}</h3>
            <p><strong>Étape complétée:</strong> ${data.milestoneName}</p>
            <p><strong>Date de completion:</strong> ${data.completionDate}</p>
            <p><strong>Nouvelle progression:</strong> ${data.progress}%</p>
          </div>
          
          ${data.deliverables ? `
          <h4>Livrables:</h4>
          <ul>
            ${data.deliverables.map(d => `<li><a href="${d.url}">${d.name}</a></li>`).join('')}
          </ul>
          ` : ''}
          
          <p><a href="${process.env.CLIENT_URL}/dashboard/projects/${data.projectId}" 
             style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
             Voir le projet
          </a></p>
          
          <p>Merci pour votre collaboration !<br>
          L'équipe MiaTech</p>
        `
      })
    };

    return templates[type] ? templates[type](data) : null;
  }

  // Notifications spécifiques par événement
  async notifyOrderConfirmation(order, user) {
    const template = this.getEmailTemplate('orderConfirmation', {
      clientName: user.fullName,
      orderNumber: order.orderNumber,
      serviceName: order.service.name,
      amount: order.pricing.totalAmount,
      status: order.status,
      orderId: order._id
    });

    return await this.sendEmail(user.email, template.subject, template.html);
  }

  async notifyProjectAssigned(project, member, role) {
    const template = this.getEmailTemplate('projectAssigned', {
      memberName: member.fullName,
      projectTitle: project.title,
      clientName: project.client.fullName,
      role: role,
      deadline: project.timeline.endDate.toLocaleDateString('fr-FR'),
      description: project.description,
      projectId: project._id
    });

    return await this.sendEmail(member.email, template.subject, template.html);
  }

  async notifyProjectUpdate(project, update, client) {
    const template = this.getEmailTemplate('projectUpdate', {
      clientName: client.fullName,
      projectTitle: project.title,
      updateTitle: update.title,
      updateContent: update.content,
      progress: project.progress.percentage,
      authorName: update.author.fullName,
      date: update.date.toLocaleDateString('fr-FR'),
      projectId: project._id
    });

    return await this.sendEmail(client.email, template.subject, template.html);
  }

  async notifyPaymentReceived(order, user, paymentDetails) {
    const template = this.getEmailTemplate('paymentReceived', {
      clientName: user.fullName,
      orderNumber: order.orderNumber,
      amount: order.pricing.totalAmount,
      paymentMethod: paymentDetails.method,
      paymentDate: new Date().toLocaleDateString('fr-FR'),
      receiptUrl: paymentDetails.receiptUrl
    });

    return await this.sendEmail(user.email, template.subject, template.html);
  }

  async notifyMilestoneCompleted(project, milestone, client, deliverables = []) {
    const template = this.getEmailTemplate('milestoneCompleted', {
      clientName: client.fullName,
      projectTitle: project.title,
      milestoneName: milestone.name,
      completionDate: milestone.completedDate.toLocaleDateString('fr-FR'),
      progress: project.progress.percentage,
      deliverables: deliverables,
      projectId: project._id
    });

    return await this.sendEmail(client.email, template.subject, template.html);
  }

  // Notification push (placeholder pour intégration future)
  async sendPushNotification(userId, title, message, data = {}) {
    // TODO: Intégrer avec un service de push notifications
    // comme Firebase Cloud Messaging, OneSignal, etc.
    console.log(`Push notification pour ${userId}: ${title} - ${message}`);
    return { success: true, type: 'push', userId, title, message };
  }

  // Notification SMS (placeholder pour intégration future)
  async sendSMS(phoneNumber, message) {
    // TODO: Intégrer avec un service SMS comme Twilio, etc.
    console.log(`SMS vers ${phoneNumber}: ${message}`);
    return { success: true, type: 'sms', phoneNumber, message };
  }

  // Notification Slack/Discord (pour l'équipe interne)
  async notifyTeam(message, channel = 'general') {
    // TODO: Intégrer avec Slack/Discord webhook
    console.log(`Notification équipe [${channel}]: ${message}`);
    return { success: true, type: 'team', channel, message };
  }

  // Méthode générale pour envoyer toutes les notifications
  async notify(type, recipients, data, channels = ['email']) {
    const results = [];

    for (const recipient of recipients) {
      for (const channel of channels) {
        let result;

        switch (channel) {
          case 'email':
            result = await this.sendEmailByType(type, recipient, data);
            break;
          case 'push':
            result = await this.sendPushNotification(
              recipient.id, 
              data.title, 
              data.message, 
              data
            );
            break;
          case 'sms':
            if (recipient.phone) {
              result = await this.sendSMS(recipient.phone, data.message);
            }
            break;
          default:
            console.warn(`Canal de notification non supporté: ${channel}`);
        }

        if (result) {
          results.push({ recipient: recipient.email, channel, ...result });
        }
      }
    }

    return results;
  }

  async sendEmailByType(type, recipient, data) {
    switch (type) {
      case 'orderConfirmation':
        return await this.notifyOrderConfirmation(data.order, recipient);
      case 'projectUpdate':
        return await this.notifyProjectUpdate(data.project, data.update, recipient);
      case 'paymentReceived':
        return await this.notifyPaymentReceived(data.order, recipient, data.payment);
      default:
        console.warn(`Type de notification email non supporté: ${type}`);
        return null;
    }
  }
}

module.exports = new NotificationService();