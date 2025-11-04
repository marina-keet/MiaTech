import React from 'react'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface HomePageProps {
  user: User
  onLogout: () => void
  onNavigateToOrder: () => void
  onNavigateToQuote: () => void
  onNavigateToProjects: () => void
  onNavigateToChat: () => void
}

const HomePage: React.FC<HomePageProps> = ({ user, onLogout, onNavigateToOrder, onNavigateToQuote, onNavigateToProjects, onNavigateToChat }) => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      position: 'relative'
    }}>
      {/* Header */}
      <div 
        className="home-header animate-slide-down"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          maxWidth: '1200px',
          margin: '0 auto 30px'
        }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className="logo-bounce" style={{ 
            width: '60px', 
            height: '60px', 
            background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
            borderRadius: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '15px',
            boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)'
          }}>
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
              <g fill="white" opacity="0.9">
                <circle cx="9" cy="15" r="2.5"/>
                <circle cx="21" cy="15" r="2.5"/>
                <circle cx="15" cy="9" r="2.5"/>
                <circle cx="15" cy="21" r="2.5"/>
                <rect x="11.5" y="13.5" width="7" height="3"/>
                <rect x="13.5" y="11.5" width="3" height="4"/>
                <rect x="13.5" y="18.5" width="3" height="4"/>
                <circle cx="6" cy="21" r="1.5"/>
                <circle cx="24" cy="12" r="1.5"/>
              </g>
            </svg>
          </div>
          <div>
            <h1 className="animate-slide-right fluid-heading" style={{ 
                fontSize: '2.5rem', 
                color: 'white',
                margin: '0',
                textShadow: '0 2px 10px rgba(0,0,0,0.3)'
              }}>
              Tableau de Bord MiaTech
            </h1>
            <p className="animate-slide-right animate-delay-200 fluid-text" style={{ 
                color: 'rgba(255,255,255,0.9)', 
                fontSize: '1.1rem',
                margin: '5px 0 0 0'
              }}>
              Bienvenue, {user.name}!
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
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
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
      <div className="animate-fade-up animate-delay-300" style={{
        maxWidth: '1200px',
        margin: '0 auto 30px auto'
      }}>
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
        </div>
      </div>

      {/* Contenu principal */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Informations utilisateur */}
        <div 
          className="card-animated animate-fade-up animate-delay-500"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '15px',
            padding: '25px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            marginBottom: '30px'
          }}>
          <h2 style={{ 
            color: '#6b46c1', 
            marginBottom: '20px',
            fontSize: '1.5rem'
          }}>
            👤 Vos informations
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
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
        </div>

        {/* Services disponibles */}
        <div 
          className="card-animated animate-fade-up animate-delay-600"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '15px',
            padding: '30px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}>
          <h2 style={{ 
            color: '#1f2937', 
            marginBottom: '30px',
            fontSize: '2rem',
            fontWeight: '700',
            textAlign: 'center'
          }}>
            Nos Services
          </h2>
          
          {/* Grid de cartes services */}
          <div className="services-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '25px'
          }}>
            
            {/* App Development */}
            <div 
              className="card-animated animate-fade-up animate-delay-700"
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '25px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid #f1f5f9',
                cursor: 'pointer',
                textAlign: 'center'
              }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '24px'
              }}>
                📱
              </div>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '12px'
              }}>
                App Development
              </h3>
              <p style={{
                color: '#6b7280',
                fontSize: '0.95rem',
                lineHeight: '1.5',
                marginBottom: '15px'
              }}>
                Applications web modernes et performantes
              </p>
              <div style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#3b82f6'
              }}>
                À partir de $700
              </div>
            </div>

            {/* UI/UX Design */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '25px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid #f1f5f9',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'center'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)'
              e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.15)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '24px'
              }}>
                🎨
              </div>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '12px'
              }}>
                UI / UX Design
              </h3>
              <p style={{
                color: '#6b7280',
                fontSize: '0.95rem',
                lineHeight: '1.5',
                marginBottom: '15px'
              }}>
                Interfaces modernes et expériences utilisateur
              </p>
              <div style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#8b5cf6'
              }}>
                À partir de $300
              </div>
            </div>

            {/* Conception d'affiches */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '25px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid #f1f5f9',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'center'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)'
              e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.15)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '24px'
              }}>
                🖼️
              </div>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '12px'
              }}>
                Conception d'affiches
              </h3>
              <p style={{
                color: '#6b7280',
                fontSize: '0.95rem',
                lineHeight: '1.5',
                marginBottom: '15px'
              }}>
                Affiches publicitaires et événementielles
              </p>
              <div style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#f59e0b'
              }}>
                À partir de $300
              </div>
            </div>

            {/* Cartes de visite */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '25px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid #f1f5f9',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'center'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)'
              e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.15)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '24px'
              }}>
                💳
              </div>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '12px'
              }}>
                Cartes de visite
              </h3>
              <p style={{
                color: '#6b7280',
                fontSize: '0.95rem',
                lineHeight: '1.5',
                marginBottom: '15px'
              }}>
                Designs professionnels et modernes
              </p>
              <div style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#10b981'
              }}>
                À partir de $150
              </div>
            </div>

            {/* Logo professionnel */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '25px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid #f1f5f9',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'center'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)'
              e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.15)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '15px'
              }}>🏷️</div>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '600',
                marginBottom: '10px',
                color: '#1f2937'
              }}>
                Logo Professionnel
              </h3>
              <p style={{
                color: '#6b7280',
                fontSize: '0.95rem',
                lineHeight: '1.5',
                marginBottom: '15px'
              }}>
                Logos uniques et mémorables pour votre marque (prix négociable)
              </p>
              <div style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#f59e0b'
              }}>
                À partir de $80
              </div>
            </div>

            {/* Autres services */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '25px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid #f1f5f9',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'center'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)'
              e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.15)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '24px'
              }}>
                ⚡
              </div>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '12px'
              }}>
                Autres services
              </h3>
              <p style={{
                color: '#6b7280',
                fontSize: '0.95rem',
                lineHeight: '1.5',
                marginBottom: '15px'
              }}>
                Logos, flyers, bannières et plus
              </p>
              <div style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#ef4444'
              }}>
                Sur devis
              </div>
            </div>
            
          </div>
          
          {/* Boutons d'action */}
          <div style={{ 
            marginTop: '30px', 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            maxWidth: '500px',
            margin: '30px auto 0'
          }}>
            {/* Bouton Demander un devis */}
            <button
              onClick={onNavigateToQuote}
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                border: 'none',
                color: 'white',
                padding: '15px 25px',
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                boxShadow: '0 5px 15px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 5px 15px rgba(59, 130, 246, 0.3)'
              }}
            >
              📋 Demander un devis
            </button>

            {/* Bouton Commander */}
            <button
              onClick={onNavigateToOrder}
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none',
                color: 'white',
                padding: '15px 25px',
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                boxShadow: '0 5px 15px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.4)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 5px 15px rgba(16, 185, 129, 0.3)'
              }}
            >
              🛍️ Commander un service
            </button>
          </div>
        </div>

        {/* Section À propos */}
        <div 
          className="card-animated animate-fade-up animate-delay-800"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '15px',
            padding: '40px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            marginTop: '30px'
          }}>
          <h2 style={{ 
            color: '#1f2937', 
            marginBottom: '30px',
            fontSize: '2rem',
            fontWeight: '700',
            textAlign: 'center'
          }}>
            À Propos de MiaTech
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '30px',
            marginBottom: '30px'
          }}>
            {/* Notre Mission */}
            <div 
              className="card-animated animate-fade-up animate-delay-900"
              style={{
                background: 'linear-gradient(135deg, #f8faff, #e0f2fe)',
                borderRadius: '12px',
                padding: '25px',
                border: '1px solid #e3f2fd'
              }}>
              <div style={{
                fontSize: '2.5rem',
                marginBottom: '15px',
                textAlign: 'center'
              }}>🎯</div>
              <h3 style={{
                color: '#1565c0',
                fontSize: '1.3rem',
                fontWeight: '600',
                marginBottom: '15px',
                textAlign: 'center'
              }}>
                Notre Mission
              </h3>
              <p style={{
                color: '#424242',
                lineHeight: '1.6',
                textAlign: 'center'
              }}>
                Transformer vos idées en solutions technologiques innovantes. 
                Nous accompagnons les entreprises dans leur transformation digitale 
                avec des solutions sur mesure et performantes.
              </p>
            </div>

            {/* Notre Expertise */}
            <div 
              className="card-animated animate-fade-up animate-delay-1000"
              style={{
                background: 'linear-gradient(135deg, #f3e5f5, #e8f5e8)',
                borderRadius: '12px',
                padding: '25px',
                border: '1px solid #e1f5fe'
              }}>
              <div style={{
                fontSize: '2.5rem',
                marginBottom: '15px',
                textAlign: 'center'
              }}>⚡</div>
              <h3 style={{
                color: '#2e7d32',
                fontSize: '1.3rem',
                fontWeight: '600',
                marginBottom: '15px',
                textAlign: 'center'
              }}>
                Notre Expertise
              </h3>
              <p style={{
                color: '#424242',
                lineHeight: '1.6',
                textAlign: 'center'
              }}>
                Plus de 5 ans d'expérience dans le développement web, mobile et design. 
                Une équipe passionnée qui maîtrise les dernières technologies 
                pour créer des expériences exceptionnelles.
              </p>
            </div>

            {/* Nos Valeurs */}
            <div 
              className="card-animated animate-fade-up animate-delay-1100"
              style={{
                background: 'linear-gradient(135deg, #fff3e0, #fce4ec)',
                borderRadius: '12px',
                padding: '25px',
                border: '1px solid #ffe0b2'
              }}>
              <div style={{
                fontSize: '2.5rem',
                marginBottom: '15px',
                textAlign: 'center'
              }}>💎</div>
              <h3 style={{
                color: '#e65100',
                fontSize: '1.3rem',
                fontWeight: '600',
                marginBottom: '15px',
                textAlign: 'center'
              }}>
                Nos Valeurs
              </h3>
              <p style={{
                color: '#424242',
                lineHeight: '1.6',
                textAlign: 'center'
              }}>
                Qualité, innovation et satisfaction client sont au cœur de notre approche. 
                Nous croyons en la transparence, la communication et l'excellence 
                dans chaque projet que nous réalisons.
              </p>
            </div>
          </div>

          {/* Statistiques */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '20px',
            marginTop: '30px',
            textAlign: 'center'
          }}>
            <div className="animate-fade-up animate-delay-1200">
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: '#3b82f6',
                marginBottom: '5px'
              }}>50+</div>
              <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                Projets Réalisés
              </div>
            </div>
            
            <div className="animate-fade-up animate-delay-1300">
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: '#10b981',
                marginBottom: '5px'
              }}>100%</div>
              <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                Clients Satisfaits
              </div>
            </div>
            
            <div className="animate-fade-up animate-delay-1400">
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: '#8b5cf6',
                marginBottom: '5px'
              }}>24h</div>
              <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                Support Réactif
              </div>
            </div>
            
            <div className="animate-fade-up animate-delay-1500">
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: '#f59e0b',
                marginBottom: '5px'
              }}>5+</div>
              <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                Années d'Expérience
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        marginTop: '50px',
        color: 'rgba(255,255,255,0.8)',
        fontSize: '0.9rem'
      }}>
        <p>🚀 MiaTech - Solutions Technologiques Innovantes</p>
        <p>© 2025 - Votre partenaire digital de confiance</p>
      </div>
    </div>
  )
}

export default HomePage
