import React from 'react'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface WorkingHomePageProps {
  user: User
  onLogout: () => void
  onNavigateToOrder: () => void
  onNavigateToQuote: () => void
  onNavigateToProjects: () => void
  onNavigateToChat: () => void
}

const WorkingHomePage: React.FC<WorkingHomePageProps> = ({ 
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
      padding: '20px',
      animation: 'fadeIn 0.8s ease-out'
    }}>
      {/* Header */}
      <div 
        className="animate-slide-down"
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
          <div 
            className="logo-bounce"
            style={{ 
              width: '60px', 
              height: '60px', 
              background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
              borderRadius: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '15px',
              boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)',
              cursor: 'pointer'
            }}
          >
            <span style={{ fontSize: '24px', userSelect: 'none' }}>⚡</span>
          </div>
          <div>
            <h1 
              className="animate-slide-right"
              style={{ 
                fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', 
                color: 'white',
                margin: '0',
                textShadow: '0 2px 10px rgba(0,0,0,0.3)'
              }}
            >
              🚀 MiaTech Dashboard
            </h1>
            <p 
              className="animate-slide-right animate-delay-200"
              style={{ 
                color: 'rgba(255,255,255,0.9)', 
                fontSize: 'clamp(1rem, 2.5vw, 1.1rem)',
                margin: '5px 0 0 0'
              }}
            >
              Bienvenue, {user.name}! ✨
            </p>
          </div>
        </div>
        
        <div className="home-buttons" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button
            onClick={onNavigateToChat}
            className="btn-animated btn-glass"
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
          </button>
          
          <button
            onClick={onLogout}
            className="btn-animated btn-glass"
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
          </button>
        </div>
      </div>

      {/* Navigation rapide */}
      <div
        className="animate-fade-up animate-delay-300"
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
          <button
            onClick={onNavigateToProjects}
            className="btn-card"
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
          </button>
          
          <button
            onClick={onNavigateToOrder}
            className="btn-card animate-delay-100"
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
          </button>
          
          <button
            onClick={onNavigateToQuote}
            className="btn-card animate-delay-200"
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
          </button>
        </div>
      </div>

      {/* Contenu principal */}
      <div
        className="animate-fade-up animate-delay-500"
        style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}
      >
        {/* Informations utilisateur */}
        <div
          className="card-animated"
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
            <div className="info-card animate-delay-600" style={{
              background: '#f8fafc',
              padding: '15px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <strong>📧 Email:</strong> {user.email}
            </div>
            
            <div className="info-card animate-delay-700" style={{
              background: '#f8fafc',
              padding: '15px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <strong>🏷️ Rôle:</strong> {user.role}
            </div>
            
            <div className="info-card animate-delay-800" style={{
              background: '#f8fafc',
              padding: '15px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <strong>🆔 ID:</strong> {user.id}
            </div>
          </div>
        </div>

        {/* Message de statut */}
        <div
          className="animate-bounce-in animate-delay-900"
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
            🎉 Animations Ultra-Fluides Activées!
          </h3>
          <p style={{ margin: '0', fontSize: '1.1rem' }}>
            ✨ Votre plateforme MiaTech est maintenant **ultra-responsive** avec des animations **subtiles** et **performantes**
          </p>
        </div>
      </div>

      {/* Footer */}
      <div
        className="animate-fade-in animate-delay-1000"
        style={{
          textAlign: 'center',
          marginTop: '50px',
          color: 'rgba(255,255,255,0.8)',
          fontSize: '0.9rem'
        }}
      >
        <p>🚀 MiaTech - Solutions Technologiques Innovantes</p>
        <p>© 2025 - Votre partenaire digital de confiance</p>
      </div>
    </div>
  )
}

export default WorkingHomePage