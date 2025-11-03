import React, { useState, useEffect, useRef, useCallback } from 'react'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface Message {
  id: number
  senderId: string
  senderName: string
  senderRole: string
  message: string
  timestamp: string
  isRead: boolean
}

interface ChatPageProps {
  user: User
  onBack: () => void
}

const ChatPage: React.FC<ChatPageProps> = ({ user, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Fonctions de gestion des messages
  const markMessagesAsRead = useCallback(async () => {
    try {
      await fetch('http://localhost:5000/api/chat/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ userId: user.id })
      })
    } catch (error) {
      console.error('Erreur marquage lu:', error)
    }
  }, [user.id])

  // Polling pour simuler temps réel
  useEffect(() => {
    const loadMessagesInterval = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/chat/messages', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        const data = await response.json()
        if (data.success) {
          setMessages(data.messages)
          
          // Marquer les messages comme lus
          markMessagesAsRead()
        }
      } catch (error) {
        console.error('Erreur chargement messages:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMessagesInterval()
    
    // Polling toutes les 2 secondes pour nouveaux messages
    const interval = setInterval(loadMessagesInterval, 2000)
    setIsConnected(true)

    return () => {
      clearInterval(interval)
      setIsConnected(false)
    }
  }, [user.id, markMessagesAsRead])

  // Auto-scroll vers le bas quand nouveaux messages
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Compter messages non lus
  useEffect(() => {
    const unread = messages.filter(msg => 
      msg.senderId !== user.id && !msg.isRead
    ).length
    setUnreadCount(unread)
  }, [messages, user.id])

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    try {
      const response = await fetch('http://localhost:5000/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: newMessage.trim(),
          senderId: user.id,
          senderName: user.name,
          senderRole: user.role
        })
      })

      const data = await response.json()
      if (data.success) {
        setNewMessage('')
        // Recharger pour voir le nouveau message sera fait par le polling
      } else {
        alert('❌ Erreur envoi message: ' + data.message)
      }
    } catch (error) {
      console.error('Erreur envoi:', error)
      alert('❌ Erreur réseau')
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const isNewDay = (currentMsg: Message, previousMsg?: Message) => {
    if (!previousMsg) return true
    
    const currentDate = new Date(currentMsg.timestamp).toDateString()
    const previousDate = new Date(previousMsg.timestamp).toDateString()
    
    return currentDate !== previousDate
  }

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        background: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid #e5e7eb',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>💬 Chargement du chat...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '15px',
      overflow: 'hidden',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      height: '600px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header du chat */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button
            onClick={onBack}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            ← Retour
          </button>
          <h2 style={{ margin: 0 }}>💬 Chat Support MiaTech</h2>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {unreadCount > 0 && (
            <span style={{
              background: '#ef4444',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '0.8rem',
              fontWeight: 'bold'
            }}>
              {unreadCount} nouveau{unreadCount > 1 ? 'x' : ''}
            </span>
          )}
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255,255,255,0.2)',
            padding: '6px 12px',
            borderRadius: '20px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isConnected ? '#10b981' : '#ef4444'
            }}></div>
            <span style={{ fontSize: '0.9rem' }}>
              {isConnected ? 'En ligne' : 'Hors ligne'}
            </span>
          </div>
        </div>
      </div>

      {/* Zone des messages */}
      <div
        ref={chatContainerRef}
        style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto',
          background: '#f8fafc'
        }}
      >
        {messages.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: '#6b7280',
            marginTop: '50px'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>💬</div>
            <h3>Aucun message pour le moment</h3>
            <p>Commencez la conversation avec l'équipe MiaTech !</p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isOwnMessage = message.senderId === user.id
              const showDate = isNewDay(message, messages[index - 1])
              
              return (
                <div key={message.id}>
                  {showDate && (
                    <div style={{
                      textAlign: 'center',
                      margin: '20px 0',
                      color: '#6b7280',
                      fontSize: '0.9rem'
                    }}>
                      {formatDate(message.timestamp)}
                    </div>
                  )}
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                    marginBottom: '15px'
                  }}>
                    <div style={{
                      maxWidth: '70%',
                      background: isOwnMessage 
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : 'white',
                      color: isOwnMessage ? 'white' : '#1f2937',
                      padding: '12px 16px',
                      borderRadius: isOwnMessage 
                        ? '20px 20px 5px 20px'
                        : '20px 20px 20px 5px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      position: 'relative'
                    }}>
                      {!isOwnMessage && (
                        <div style={{
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          marginBottom: '5px',
                          color: message.senderRole === 'admin' ? '#059669' : '#3b82f6'
                        }}>
                          {message.senderRole === 'admin' ? '👨‍💻' : '👤'} {message.senderName}
                          {message.senderRole === 'admin' && ' (Support)'}
                        </div>
                      )}
                      
                      <div style={{ marginBottom: '5px' }}>
                        {message.message}
                      </div>
                      
                      <div style={{
                        fontSize: '0.75rem',
                        opacity: 0.8,
                        textAlign: 'right'
                      }}>
                        {formatTime(message.timestamp)}
                        {isOwnMessage && (
                          <span style={{ marginLeft: '5px' }}>
                            {message.isRead ? '✓✓' : '✓'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Zone de saisie */}
      <div style={{
        padding: '20px',
        background: 'white',
        borderTop: '1px solid #e5e7eb'
      }}>
        <div style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-end'
        }}>
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Tapez votre message..."
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            style={{
              flex: 1,
              padding: '12px',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '16px',
              resize: 'none',
              minHeight: '50px',
              maxHeight: '120px',
              fontFamily: 'inherit',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
          
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            style={{
              background: newMessage.trim() 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : '#9ca3af',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '12px',
              cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'all 0.2s',
              minWidth: '80px'
            }}
          >
            📤
          </button>
        </div>
        
        <p style={{
          fontSize: '0.8rem',
          color: '#6b7280',
          margin: '8px 0 0 0',
          textAlign: 'center'
        }}>
          Appuyez sur Entrée pour envoyer, Shift+Entrée pour nouvelle ligne
        </p>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default ChatPage