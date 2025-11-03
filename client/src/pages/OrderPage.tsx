import React, { useState } from 'react'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface OrderPageProps {
  user: User
  onBack: () => void
  onNavigateToPayment: (orderData: {
    id: number
    serviceId: string
    serviceName: string
    description: string
    amount: number
  }) => void
}

const OrderPage: React.FC<OrderPageProps> = ({ user, onBack, onNavigateToPayment }) => {
  const [selectedService, setSelectedService] = useState('')
  const [description, setDescription] = useState('')
  const [budget, setBudget] = useState('')
  const [deadline, setDeadline] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const services = [
    { id: 'web-dev', name: '💻 Développement Site Web', price: '$700' },
    { id: 'ui-ux', name: '🎨 UI/UX Design', price: '$300' },
    { id: 'poster', name: '🖼️ Conception d\'affiches', price: '$150' },
    { id: 'logo', name: '🏷️ Logo Professionnel', price: '$80 (négociable)' },
    { id: 'business-card', name: '💳 Cartes de visite', price: '$150' },
    { id: 'others', name: '⚡ Autres services', price: 'Sur devis' }
  ]

  const getServicePrice = (serviceId: string): number => {
    const prices: { [key: string]: number } = {
      'web-dev': 700,
      'ui-ux': 300,
      'poster': 150,
      'logo': 80,
      'business-card': 150,
      'others': 0
    }
    return prices[serviceId] || 0
  }

  const getServiceName = (serviceId: string): string => {
    const service = services.find(s => s.id === serviceId)
    return service ? service.name : ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedService || !description) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }

    setIsSubmitting(true)

    try {
      // Créer la commande temporaire
      const orderData = {
        userId: user.id,
        serviceId: selectedService,
        description,
        budget,
        deadline,
        paymentMode: 'online',
        status: 'draft' // Statut draft avant paiement
      }

      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderData)
      })

      if (response.ok) {
        const result = await response.json()
        
        // Rediriger vers la page de paiement
        const paymentData = {
          id: result.order.id,
          serviceId: selectedService,
          serviceName: getServiceName(selectedService),
          description,
          amount: getServicePrice(selectedService)
        }
        
        onNavigateToPayment(paymentData)
      } else {
        alert('❌ Erreur lors de la création de la commande. Veuillez réessayer.')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('❌ Erreur de connexion. Veuillez réessayer.')
    }

    setIsSubmitting(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        maxWidth: '800px',
        margin: '0 auto 30px'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '2.5rem', 
            color: 'white',
            margin: '0',
            textShadow: '0 2px 10px rgba(0,0,0,0.3)'
          }}>
            🛍️ Commander un service
          </h1>
          <p style={{ 
            color: 'rgba(255,255,255,0.9)', 
            fontSize: '1.1rem',
            margin: '5px 0 0 0'
          }}>
            Commandez et payez en ligne - Démarrage immédiat
          </p>
          <p style={{ 
            color: 'rgba(255,255,255,0.9)', 
            fontSize: '1.1rem',
            margin: '5px 0 0 0'
          }}>
            Décrivez votre projet et nous vous accompagnons !
          </p>
        </div>
        <button
          onClick={onBack}
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
          ← Retour
        </button>
      </div>

      {/* Formulaire de commande */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '15px',
          padding: '30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <form onSubmit={handleSubmit}>
            {/* Informations client */}
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ color: '#6b46c1', marginBottom: '15px' }}>
                👤 Vos informations
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px'
              }}>
                <div style={{
                  background: '#f8fafc',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <strong>Nom:</strong> {user.name}
                </div>
                <div style={{
                  background: '#f8fafc',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <strong>Email:</strong> {user.email}
                </div>
              </div>
            </div>

            {/* Sélection du service */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Service souhaité *
              </label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  backgroundColor: 'white'
                }}
              >
                <option value="">-- Choisir un service --</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name} - À partir de {service.price}
                  </option>
                ))}
              </select>
            </div>

            {/* Description du projet */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Description détaillée du projet *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={6}
                placeholder="Décrivez votre projet en détail : objectifs, fonctionnalités souhaitées, style, etc."
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Budget */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Budget approximatif
              </label>
              <input
                type="text"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="Ex: $300 - $1500"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              />
            </div>

            {/* Délai souhaité */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Délai souhaité
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              />
            </div>



            {/* Bouton d'envoi */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '15px',
                background: isSubmitting ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                marginBottom: '15px'
              }}
            >
              {isSubmitting 
                ? '📤 Envoi en cours...' 
                : '💳 Payer maintenant'
              }
            </button>

            {/* Bouton de retour vers la page d'accueil */}
            <button
              type="button"
              onClick={onBack}
              style={{
                width: '100%',
                padding: '15px',
                background: 'transparent',
                border: '2px solid #667eea',
                borderRadius: '12px',
                color: '#667eea',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#667eea'
                e.currentTarget.style.color = 'white'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = '#667eea'
              }}
            >
              🏠 Retour à la page d'accueil
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default OrderPage