import { useState } from 'react'
import HomePage from './pages/HomePage'
import OrderPage from './pages/OrderPage'
import QuotePage from './pages/QuotePage'
import ProjectTrackingPage from './pages/ProjectTrackingPage'
import PaymentPage from './pages/PaymentPage'
import ChatPage from './pages/ChatPage'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface OrderData {
  id: number
  serviceId: string
  serviceName: string
  description: string
  amount: number
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [currentPage, setCurrentPage] = useState<'home' | 'order' | 'quote' | 'projects' | 'payment' | 'chat'>('home')
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  })

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setIsLoggedIn(false)
    setCurrentPage('home')
    setFormData({ email: '', password: '', name: '' })
  }

  const handleNavigateToOrder = () => {
    setCurrentPage('order')
  }

  const handleNavigateToQuote = () => {
    setCurrentPage('quote')
  }

  const handleNavigateToProjects = () => {
    setCurrentPage('projects')
  }

  const handleNavigateToChat = () => {
    setCurrentPage('chat')
  }

  const handleNavigateToPayment = (order: OrderData) => {
    setOrderData(order)
    setCurrentPage('payment')
  }

  const handlePaymentSuccess = () => {
    alert('Paiement réussi ! Votre projet va bientôt commencer.')
    setCurrentPage('projects')
  }

  const handleBackToHome = () => {
    setCurrentPage('home')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      
      if (response.ok) {
        if (isLogin) {
          // CONNEXION : Connecter l'utilisateur et rediriger vers la page d'accueil
          localStorage.setItem('token', data.token)
          
          // Transformer les données utilisateur pour correspondre à l'interface
          const userFormatted = {
            id: data.user._id || data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role || 'user'
          }
          
          setUser(userFormatted)
          setIsLoggedIn(true)
          
          console.log('Connexion réussie, redirection vers la page d\'accueil...')
        } else {
          // INSCRIPTION : Rediriger vers la page de connexion
          alert('✅ Compte créé avec succès ! Veuillez maintenant vous connecter.')
          setIsLogin(true) // Basculer vers le formulaire de connexion
          // Pré-remplir l'email pour faciliter la connexion
          setFormData({ 
            email: formData.email, 
            password: '', 
            name: '' 
          })
        }
      } else {
        alert(`❌ Erreur: ${data.message}`)
      }
    } catch (error) {
      alert('❌ Erreur de connexion au serveur')
      console.error('Erreur:', error)
    }
  }

  // Si l'utilisateur est connecté, afficher la page appropriée
  if (isLoggedIn && user) {
    if (currentPage === 'order') {
      return <OrderPage user={user} onBack={handleBackToHome} onNavigateToPayment={handleNavigateToPayment} />
    }
    if (currentPage === 'quote') {
      return <QuotePage user={user} onBack={handleBackToHome} />
    }
    if (currentPage === 'projects') {
      return <ProjectTrackingPage user={user} onBack={handleBackToHome} />
    }
    if (currentPage === 'chat') {
      return <ChatPage user={user} onBack={handleBackToHome} />
    }
    if (currentPage === 'payment' && orderData) {
      return <PaymentPage user={user} orderData={orderData} onBack={handleBackToHome} onPaymentSuccess={handlePaymentSuccess} />
    }
    return <HomePage user={user} onLogout={handleLogout} onNavigateToOrder={handleNavigateToOrder} onNavigateToQuote={handleNavigateToQuote} onNavigateToProjects={handleNavigateToProjects} onNavigateToChat={handleNavigateToChat} />
  }

  return (
    <div style={{ minHeight: '100vh', padding: '20px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '15px',
            boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
          }}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <g fill="white" opacity="0.9">
                <circle cx="12" cy="20" r="3"/>
                <circle cx="28" cy="20" r="3"/>
                <circle cx="20" cy="12" r="3"/>
                <circle cx="20" cy="28" r="3"/>
                <rect x="15" y="18.5" width="10" height="3"/>
                <rect x="18.5" y="15" width="3" height="6"/>
                <rect x="18.5" y="25" width="3" height="6"/>
                <circle cx="8" cy="28" r="2"/>
                <circle cx="32" cy="15" r="2"/>
              </g>
            </svg>
          </div>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontFamily: 'Poppins',
            color: 'white',
            margin: '0',
            textShadow: '0 2px 10px rgba(0,0,0,0.3)'
          }}>
             MiaTech
          </h1>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>
          Solutions Technologiques Innovantes
        </p>
      </div>

      {/* Form Container */}
      <div style={{ 
        maxWidth: '400px', 
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(10px)'
      }}>
        
        {/* Toggle Buttons */}
        <div style={{ 
          display: 'flex', 
          backgroundColor: '#f1f5f9', 
          borderRadius: '12px', 
          padding: '4px',
          marginBottom: '30px'
        }}>
          <button
            onClick={() => setIsLogin(true)}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: isLogin ? '#4f46e5' : 'transparent',
              color: isLogin ? 'white' : '#64748b',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            Connexion
          </button>
          <button
            onClick={() => setIsLogin(false)}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: !isLogin ? '#4f46e5' : 'transparent',
              color: !isLogin ? 'white' : '#64748b',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            Inscription
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500', 
                color: '#374151' 
              }}>
                Nom complet
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="input"
                required={!isLogin}
                placeholder="Votre nom complet"
              />
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '500', 
              color: '#374151' 
            }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="input"
              required
              placeholder="votre@email.com"
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '500', 
              color: '#374151' 
            }}>
              Mot de passe
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="input"
              required
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ 
              width: '100%', 
              fontSize: '1.1rem',
              padding: '16px'
            }}
          >
            {isLogin ? 'Se connecter' : "S'inscrire"}
          </button>
        </form>

        {/* Footer */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '20px', 
          fontSize: '0.9rem', 
          color: '#64748b' 
        }}>
          {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
          <button
            onClick={() => setIsLogin(!isLogin)}
            style={{
              background: 'none',
              border: 'none',
              color: '#4f46e5',
              fontWeight: '500',
              cursor: 'pointer',
              marginLeft: '5px',
              textDecoration: 'underline'
            }}
          >
            {isLogin ? "S'inscrire" : "Se connecter"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default App;