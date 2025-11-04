import React from 'react'
import { motion } from 'framer-motion'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface SimpleHomePageProps {
  user: User
  onLogout: () => void
  onNavigateToOrder: () => void
  onNavigateToQuote: () => void
  onNavigateToProjects: () => void
  onNavigateToChat: () => void
}

const SimpleHomePage: React.FC<SimpleHomePageProps> = ({ 
  user, 
  onLogout, 
  onNavigateToOrder, 
  onNavigateToQuote, 
  onNavigateToProjects, 
  onNavigateToChat 
}) => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      {/* Header animé */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          maxWidth: '1200px',
          margin: '0 auto 30px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <motion.div 
            whileHover={{ rotate: 5, scale: 1.1 }}
            style={{ 
              width: '60px', 
              height: '60px', 
              background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
              borderRadius: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '15px',
              boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)'
            }}
          >
            <span style={{ fontSize: '24px' }}>⚡</span>
          </motion.div>
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{ 
                fontSize: '2.5rem', 
                color: 'white',
                margin: '0',
                textShadow: '0 2px 10px rgba(0,0,0,0.3)'
              }}
            >
              🚀 MiaTech Dashboard
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              style={{ 
                color: 'rgba(255,255,255,0.9)', 
                fontSize: '1.1rem',
                margin: '5px 0 0 0'
              }}
            >
              Bienvenue, {user.name}! ✨
            </motion.p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <motion.button
            onClick={onNavigateToChat}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.3)',
              color: 'white',
              padding: '12px 20px',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            💬 Chat Support
          </motion.button>
          
          <motion.button
            onClick={onLogout}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.3)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            🚪 Se déconnecter
          </motion.button>
        </div>
      </motion.div>

      {/* Navigation rapide */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        style={{
          maxWidth: '1200px',
          margin: '0 auto 30px auto'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          flexWrap: 'wrap'
        }}>
          <motion.button
            onClick={onNavigateToProjects}
            whileHover={{ y: -5, scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              background: 'rgba(255,255,255,0.95)',
              border: 'none',
              borderRadius: '15px',
              padding: '15px 25px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>📊</span>
            Suivi de Projets
          </motion.button>
          
          <motion.button
            onClick={onNavigateToOrder}
            whileHover={{ y: -5, scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              background: 'rgba(255,255,255,0.95)',
              border: 'none',
              borderRadius: '15px',
              padding: '15px 25px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>🛍️</span>
            Passer une commande
          </motion.button>
          
          <motion.button
            onClick={onNavigateToQuote}
            whileHover={{ y: -5, scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              background: 'rgba(255,255,255,0.95)',
              border: 'none',
              borderRadius: '15px',
              padding: '15px 25px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>📋</span>
            Demander un devis
          </motion.button>
        </div>
      </motion.div>

      {/* Contenu principal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}
      >
        {/* Informations utilisateur */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          whileHover={{ y: -3 }}
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '15px',
            padding: '25px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            marginBottom: '30px'
          }}
        >
          <h2 style={{ 
            color: '#6b46c1', 
            marginBottom: '20px',
            fontSize: '1.5rem'
          }}>
            👤 Vos informations
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px'
          }}>
            <div style={{
              background: '#f8fafc',
              padding: '15px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <strong>📧 Email:</strong> {user.email}
            </div>
            
            <div style={{
              background: '#f8fafc',
              padding: '15px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <strong>🏷️ Rôle:</strong> {user.role}
            </div>
            
            <div style={{
              background: '#f8fafc',
              padding: '15px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <strong>🆔 ID:</strong> {user.id}
            </div>
          </div>
        </motion.div>

        {/* Message de statut */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          style={{
            background: 'rgba(34, 197, 94, 0.1)',
            border: '2px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            color: '#166534'
          }}
        >
          <h3 style={{ margin: '0 0 10px 0', color: '#15803d' }}>
            🎉 Système d'animation activé!
          </h3>
          <p style={{ margin: '0', fontSize: '1.1rem' }}>
            ✨ Toutes les animations sont maintenant **ultra-fluides** et **responsives**
          </p>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
        style={{
          textAlign: 'center',
          marginTop: '50px',
          color: 'rgba(255,255,255,0.8)',
          fontSize: '0.9rem'
        }}
      >
        <p>🚀 MiaTech - Solutions Technologiques Innovantes</p>
        <p>© 2025 - Votre partenaire digital de confiance</p>
      </motion.div>
    </div>
  )
}

export default SimpleHomePage