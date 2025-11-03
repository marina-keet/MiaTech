// Base de données temporaire pour les messages de chat
let chatMessages = [];

// Route pour récupérer tous les messages
app.get('/api/chat/messages', (req, res) => {
  try {
    console.log('📬 Chargement des messages de chat');
    
    // Trier par date (plus anciens en premier pour affichage chronologique)
    const sortedMessages = chatMessages.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    res.json({ 
      success: true, 
      messages: sortedMessages,
      count: sortedMessages.length 
    });
    
  } catch (error) {
    console.error('❌ Erreur chargement messages:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Route pour envoyer un message
app.post('/api/chat/send', (req, res) => {
  try {
    const { message, senderId, senderName, senderRole } = req.body;
    
    // Validation
    if (!message || !senderId || !senderName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Données manquantes' 
      });
    }
    
    // Créer le nouveau message
    const newMessage = {
      id: chatMessages.length + 1,
      senderId,
      senderName,
      senderRole: senderRole || 'client',
      message: message.trim(),
      timestamp: new Date().toISOString(),
      isRead: false
    };
    
    chatMessages.push(newMessage);
    
    console.log(`💬 Nouveau message de ${senderName} (${senderRole}): "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);
    
    // Déclencher notification email si c'est un client qui écrit
    if (senderRole !== 'admin') {
      sendNotificationEmail(newMessage);
    }
    
    res.json({ 
      success: true, 
      message: newMessage,
      messageId: newMessage.id 
    });
    
  } catch (error) {
    console.error('❌ Erreur envoi message:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Route pour marquer les messages comme lus
app.post('/api/chat/mark-read', (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: 'ID utilisateur requis' });
    }
    
    // Marquer tous les messages non-lus envoyés par d'autres comme lus
    let markedCount = 0;
    chatMessages.forEach(msg => {
      if (msg.senderId !== userId && !msg.isRead) {
        msg.isRead = true;
        markedCount++;
      }
    });
    
    console.log(`✅ ${markedCount} messages marqués comme lus pour l'utilisateur ${userId}`);
    
    res.json({ 
      success: true, 
      markedCount 
    });
    
  } catch (error) {
    console.error('❌ Erreur marquage lecture:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Route pour obtenir le nombre de messages non lus (pour les notifications)
app.get('/api/chat/unread/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    const unreadCount = chatMessages.filter(msg => 
      msg.senderId !== userId && !msg.isRead
    ).length;
    
    res.json({ 
      success: true, 
      unreadCount,
      hasUnread: unreadCount > 0 
    });
    
  } catch (error) {
    console.error('❌ Erreur comptage messages non lus:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Fonction pour envoyer une notification email
async function sendNotificationEmail(message) {
  try {
    console.log(`📧 Notification email: Nouveau message de ${message.senderName}`);
    
    // Ici vous pourriez intégrer un service d'email réel comme:
    // - Nodemailer + SMTP
    // - SendGrid
    // - AWS SES
    // - Mailgun
    
    // Pour l'instant, simulation
    const emailData = {
      to: 'admin@miatech.com',
      subject: `💬 Nouveau message de ${message.senderName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h1>💬 MiaTech Chat</h1>
            <p>Nouveau message reçu</p>
          </div>
          
          <div style="padding: 30px; background: #f8fafc;">
            <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #1f2937; margin-bottom: 15px;">Message de ${message.senderName}</h2>
              <p style="color: #6b7280; font-size: 14px; margin-bottom: 15px;">
                📅 ${new Date(message.timestamp).toLocaleString('fr-FR')}
              </p>
              <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea;">
                <p style="margin: 0; color: #374151; line-height: 1.6;">
                  "${message.message}"
                </p>
              </div>
            </div>
          </div>
          
          <div style="background: #1f2937; color: white; padding: 20px; text-align: center;">
            <p>Connectez-vous à l'administration pour répondre</p>
            <a href="http://localhost:5000/admin.html" 
               style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Accéder au Chat Admin
            </a>
          </div>
        </div>
      `
    };
    
    console.log('📧 Email préparé:', emailData.subject);
    
    // Ici on enverrait réellement l'email
    // await emailService.send(emailData);
    
  } catch (error) {
    console.error('❌ Erreur notification email:', error);
  }
}

// Route admin pour voir tous les messages avec statistiques
app.get('/api/admin/chat/stats', (req, res) => {
  try {
    const totalMessages = chatMessages.length;
    const unreadMessages = chatMessages.filter(msg => !msg.isRead).length;
    const clientMessages = chatMessages.filter(msg => msg.senderRole !== 'admin').length;
    const adminResponses = chatMessages.filter(msg => msg.senderRole === 'admin').length;
    
    // Regrouper par utilisateur
    const userStats = {};
    chatMessages.forEach(msg => {
      if (!userStats[msg.senderId]) {
        userStats[msg.senderId] = {
          name: msg.senderName,
          role: msg.senderRole,
          messageCount: 0,
          lastMessage: null
        };
      }
      userStats[msg.senderId].messageCount++;
      if (!userStats[msg.senderId].lastMessage || 
          new Date(msg.timestamp) > new Date(userStats[msg.senderId].lastMessage)) {
        userStats[msg.senderId].lastMessage = msg.timestamp;
      }
    });
    
    res.json({
      success: true,
      stats: {
        totalMessages,
        unreadMessages,
        clientMessages,
        adminResponses,
        responseRate: totalMessages > 0 ? (adminResponses / totalMessages * 100).toFixed(1) : 0
      },
      users: Object.values(userStats)
    });
    
  } catch (error) {
    console.error('❌ Erreur stats chat:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});