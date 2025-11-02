const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

class ChatService {
  constructor(server) {
    this.wss = new WebSocket.Server({ 
      server,
      path: '/ws'
    });
    
    this.connections = new Map(); // userId -> WebSocket
    this.rooms = new Map(); // roomId -> Set of userIds
    this.messageHistory = new Map(); // roomId -> Array of messages
    
    this.initializeWebSocket();
  }

  initializeWebSocket() {
    this.wss.on('connection', (ws, req) => {
      console.log('Nouvelle connexion WebSocket');
      
      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data);
          await this.handleMessage(ws, message);
        } catch (error) {
          console.error('Erreur traitement message WebSocket:', error);
          this.sendError(ws, 'Erreur de traitement du message');
        }
      });

      ws.on('close', () => {
        this.handleDisconnection(ws);
      });

      ws.on('error', (error) => {
        console.error('Erreur WebSocket:', error);
      });
    });
  }

  async handleMessage(ws, message) {
    const { type, token, data } = message;

    // Authentification pour les nouvelles connexions
    if (type === 'authenticate') {
      await this.authenticateConnection(ws, token);
      return;
    }

    // Vérifier que la connexion est authentifiée
    if (!ws.userId) {
      this.sendError(ws, 'Connexion non authentifiée');
      return;
    }

    // Router les messages selon leur type
    switch (type) {
      case 'join_room':
        await this.joinRoom(ws, data.roomId);
        break;
      case 'leave_room':
        await this.leaveRoom(ws, data.roomId);
        break;
      case 'send_message':
        await this.sendMessage(ws, data);
        break;
      case 'typing_start':
        await this.handleTyping(ws, data.roomId, true);
        break;
      case 'typing_stop':
        await this.handleTyping(ws, data.roomId, false);
        break;
      case 'get_history':
        await this.sendMessageHistory(ws, data.roomId, data.offset || 0);
        break;
      case 'mark_read':
        await this.markMessagesAsRead(ws, data.roomId);
        break;
      default:
        this.sendError(ws, `Type de message non supporté: ${type}`);
    }
  }

  async authenticateConnection(ws, token) {
    try {
      if (!token) {
        this.sendError(ws, 'Token manquant');
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        this.sendError(ws, 'Utilisateur non trouvé');
        return;
      }

      // Associer l'utilisateur à la connexion WebSocket
      ws.userId = user._id.toString();
      ws.user = user;
      
      // Enregistrer la connexion
      this.connections.set(ws.userId, ws);

      // Confirmer l'authentification
      this.sendToClient(ws, {
        type: 'authenticated',
        user: {
          id: user._id,
          fullName: user.fullName,
          role: user.role,
          avatar: user.avatar
        }
      });

      // Notifier le statut en ligne
      this.broadcastUserStatus(ws.userId, 'online');

      console.log(`Utilisateur ${user.fullName} authentifié sur WebSocket`);
    } catch (error) {
      console.error('Erreur authentification WebSocket:', error);
      this.sendError(ws, 'Token invalide');
    }
  }

  async joinRoom(ws, roomId) {
    if (!roomId) {
      this.sendError(ws, 'ID de room manquant');
      return;
    }

    // Vérifier les permissions d'accès à la room
    const canAccess = await this.canAccessRoom(ws.userId, roomId);
    if (!canAccess) {
      this.sendError(ws, 'Accès à cette conversation refusé');
      return;
    }

    // Ajouter l'utilisateur à la room
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId).add(ws.userId);
    ws.currentRoom = roomId;

    // Confirmer l'adhésion à la room
    this.sendToClient(ws, {
      type: 'room_joined',
      roomId: roomId,
      participants: Array.from(this.rooms.get(roomId))
    });

    // Notifier les autres participants
    this.broadcastToRoom(roomId, {
      type: 'user_joined',
      userId: ws.userId,
      user: {
        id: ws.user._id,
        fullName: ws.user.fullName,
        role: ws.user.role,
        avatar: ws.user.avatar
      }
    }, ws.userId);

    // Envoyer l'historique des messages récents
    await this.sendMessageHistory(ws, roomId, 0, 50);

    console.log(`Utilisateur ${ws.userId} a rejoint la room ${roomId}`);
  }

  async leaveRoom(ws, roomId) {
    if (this.rooms.has(roomId)) {
      this.rooms.get(roomId).delete(ws.userId);
      
      // Supprimer la room si elle est vide
      if (this.rooms.get(roomId).size === 0) {
        this.rooms.delete(roomId);
      }
    }

    ws.currentRoom = null;

    // Notifier les autres participants
    this.broadcastToRoom(roomId, {
      type: 'user_left',
      userId: ws.userId
    });

    this.sendToClient(ws, {
      type: 'room_left',
      roomId: roomId
    });

    console.log(`Utilisateur ${ws.userId} a quitté la room ${roomId}`);
  }

  async sendMessage(ws, data) {
    const { roomId, content, type = 'text', attachments = [] } = data;

    if (!roomId || !content) {
      this.sendError(ws, 'Room ID et contenu requis');
      return;
    }

    // Créer le message
    const message = {
      id: this.generateMessageId(),
      roomId: roomId,
      sender: {
        id: ws.user._id,
        fullName: ws.user.fullName,
        role: ws.user.role,
        avatar: ws.user.avatar
      },
      content: content,
      type: type,
      attachments: attachments,
      timestamp: new Date(),
      readBy: [ws.userId] // Le sender a automatiquement lu le message
    };

    // Sauvegarder dans l'historique
    if (!this.messageHistory.has(roomId)) {
      this.messageHistory.set(roomId, []);
    }
    this.messageHistory.get(roomId).push(message);

    // Limiter l'historique en mémoire (garder les 1000 derniers messages)
    const history = this.messageHistory.get(roomId);
    if (history.length > 1000) {
      history.splice(0, history.length - 1000);
    }

    // Diffuser le message à tous les participants de la room
    this.broadcastToRoom(roomId, {
      type: 'new_message',
      message: message
    });

    // Sauvegarder en base de données (optionnel pour persistance)
    // await this.saveMessageToDatabase(message);

    console.log(`Message envoyé dans la room ${roomId} par ${ws.user.fullName}`);
  }

  async handleTyping(ws, roomId, isTyping) {
    if (!ws.currentRoom || ws.currentRoom !== roomId) {
      return;
    }

    this.broadcastToRoom(roomId, {
      type: isTyping ? 'user_typing' : 'user_stopped_typing',
      userId: ws.userId,
      user: {
        fullName: ws.user.fullName,
        avatar: ws.user.avatar
      }
    }, ws.userId);
  }

  async sendMessageHistory(ws, roomId, offset = 0, limit = 50) {
    if (!this.messageHistory.has(roomId)) {
      this.sendToClient(ws, {
        type: 'message_history',
        roomId: roomId,
        messages: [],
        hasMore: false
      });
      return;
    }

    const history = this.messageHistory.get(roomId);
    const start = Math.max(0, history.length - offset - limit);
    const end = history.length - offset;
    const messages = history.slice(start, end);

    this.sendToClient(ws, {
      type: 'message_history',
      roomId: roomId,
      messages: messages,
      hasMore: start > 0
    });
  }

  async markMessagesAsRead(ws, roomId) {
    if (!this.messageHistory.has(roomId)) {
      return;
    }

    const history = this.messageHistory.get(roomId);
    history.forEach(message => {
      if (!message.readBy.includes(ws.userId)) {
        message.readBy.push(ws.userId);
      }
    });

    // Notifier les autres participants des messages lus
    this.broadcastToRoom(roomId, {
      type: 'messages_read',
      userId: ws.userId,
      user: {
        fullName: ws.user.fullName,
        avatar: ws.user.avatar
      }
    }, ws.userId);
  }

  handleDisconnection(ws) {
    if (ws.userId) {
      // Retirer de toutes les rooms
      this.rooms.forEach((participants, roomId) => {
        if (participants.has(ws.userId)) {
          participants.delete(ws.userId);
          this.broadcastToRoom(roomId, {
            type: 'user_left',
            userId: ws.userId
          });
        }
      });

      // Supprimer la connexion
      this.connections.delete(ws.userId);

      // Notifier le statut hors ligne
      this.broadcastUserStatus(ws.userId, 'offline');

      console.log(`Utilisateur ${ws.userId} déconnecté`);
    }
  }

  // Méthodes utilitaires

  sendToClient(ws, data) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  sendError(ws, message) {
    this.sendToClient(ws, {
      type: 'error',
      message: message
    });
  }

  broadcastToRoom(roomId, data, excludeUserId = null) {
    if (!this.rooms.has(roomId)) {
      return;
    }

    this.rooms.get(roomId).forEach(userId => {
      if (userId !== excludeUserId) {
        const ws = this.connections.get(userId);
        if (ws) {
          this.sendToClient(ws, data);
        }
      }
    });
  }

  broadcastUserStatus(userId, status) {
    const data = {
      type: 'user_status_changed',
      userId: userId,
      status: status
    };

    // Diffuser à tous les utilisateurs connectés
    this.connections.forEach((ws, connectedUserId) => {
      if (connectedUserId !== userId) {
        this.sendToClient(ws, data);
      }
    });
  }

  async canAccessRoom(userId, roomId) {
    // Logique de vérification des permissions
    // Pour les projets: vérifier si l'utilisateur est client ou membre de l'équipe
    // Pour le support: vérifier si l'utilisateur est client ou admin/staff
    
    // Format des room IDs:
    // project_{projectId} -> conversations de projet
    // support_{userId} -> conversation de support
    // general -> chat général (admin/staff seulement)

    if (roomId.startsWith('project_')) {
      const projectId = roomId.replace('project_', '');
      // TODO: Vérifier si l'utilisateur a accès au projet
      return true; // Placeholder
    }

    if (roomId.startsWith('support_')) {
      const supportUserId = roomId.replace('support_', '');
      const user = await User.findById(userId);
      // Le client peut accéder à son propre support, les admins à tous
      return supportUserId === userId || ['admin', 'staff'].includes(user.role);
    }

    if (roomId === 'general') {
      const user = await User.findById(userId);
      return ['admin', 'staff'].includes(user.role);
    }

    return false;
  }

  generateMessageId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // API REST pour créer des rooms de discussion
  async createProjectRoom(projectId, participants) {
    const roomId = `project_${projectId}`;
    
    // Notifier tous les participants
    participants.forEach(userId => {
      const ws = this.connections.get(userId.toString());
      if (ws) {
        this.sendToClient(ws, {
          type: 'room_created',
          roomId: roomId,
          projectId: projectId,
          participants: participants
        });
      }
    });

    return roomId;
  }

  async createSupportRoom(userId) {
    const roomId = `support_${userId}`;
    
    // Notifier l'utilisateur et les admins
    const ws = this.connections.get(userId.toString());
    if (ws) {
      this.sendToClient(ws, {
        type: 'support_room_created',
        roomId: roomId
      });
    }

    // Notifier les admins/staff connectés
    this.connections.forEach((adminWs, adminUserId) => {
      if (adminWs.user && ['admin', 'staff'].includes(adminWs.user.role)) {
        this.sendToClient(adminWs, {
          type: 'support_request',
          roomId: roomId,
          userId: userId
        });
      }
    });

    return roomId;
  }

  // Statistiques
  getStats() {
    return {
      connectedUsers: this.connections.size,
      activeRooms: this.rooms.size,
      totalMessages: Array.from(this.messageHistory.values())
        .reduce((total, history) => total + history.length, 0)
    };
  }
}

module.exports = ChatService;