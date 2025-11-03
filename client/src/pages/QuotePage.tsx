import React, { useState } from 'react'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface QuotePageProps {
  user: User
  onBack: () => void
}

const QuotePage: React.FC<QuotePageProps> = ({ user, onBack }) => {
  const [selectedService, setSelectedService] = useState('')
  const [projectType, setProjectType] = useState('')
  const [description, setDescription] = useState('')
  const [features, setFeatures] = useState('')
  const [timeline, setTimeline] = useState('')
  const [budget, setBudget] = useState('')
  const [contact, setContact] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const services = [
    { id: 'web-dev', name: '💻 Développement Site Web', basePrice: 700 },
    { id: 'ui-ux', name: '🎨 UI/UX Design', basePrice: 300 },
    { id: 'poster', name: '🖼️ Conception d\'affiches', basePrice: 150 },
    { id: 'logo', name: '🏷️ Logo Professionnel', basePrice: 80 },
    { id: 'business-card', name: '💳 Cartes de visite', basePrice: 150 },
    { id: 'branding', name: '🎨 Identité visuelle complète', basePrice: 800 },
    { id: 'others', name: '⚡ Autres services', basePrice: 0 }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const quoteData = {
        userId: user.id,
        serviceId: selectedService,
        projectType,
        description,
        features,
        timeline,
        budget,
        contact,
        type: 'quote',
        status: 'pending'
      }

      const response = await fetch('http://localhost:5000/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(quoteData)
      })

      if (response.ok) {
        alert('✅ Demande de devis envoyée avec succès ! Notre équipe vous contactera sous 24h avec une proposition détaillée.')
        // Reset form
        setSelectedService('')
        setProjectType('')
        setDescription('')
        setFeatures('')
        setTimeline('')
        setBudget('')
        setContact('')
      } else {
        alert('❌ Erreur lors de l\'envoi de la demande. Veuillez réessayer.')
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
        maxWidth: '900px',
        margin: '0 auto 30px'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '2.5rem', 
            color: 'white',
            margin: '0',
            textShadow: '0 2px 10px rgba(0,0,0,0.3)'
          }}>
            📋 Demander un devis
          </h1>
          <p style={{ 
            color: 'rgba(255,255,255,0.9)', 
            fontSize: '1.1rem',
            margin: '5px 0 0 0'
          }}>
            Obtenez une proposition personnalisée sous 24h
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

      {/* Formulaire de devis */}
      <div style={{
        maxWidth: '900px',
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
              <h3 style={{ color: '#6b46c1', marginBottom: '15px', fontSize: '1.3rem' }}>
                👤 Vos informations
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
                marginBottom: '20px'
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
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Téléphone ou moyen de contact préféré
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Ex: +33 6 12 34 56 78 ou votre@email.com"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
              </div>
            </div>

            {/* Détails du projet */}
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ color: '#6b46c1', marginBottom: '15px', fontSize: '1.3rem' }}>
                🎯 Détails du projet
              </h3>
              
              {/* Service souhaité */}
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
                      {service.name} {service.basePrice > 0 && `(à partir de $${service.basePrice})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type de projet */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Type de projet
                </label>
                <input
                  type="text"
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  placeholder="Ex: Site e-commerce, Application mobile, Logo d'entreprise..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
              </div>

              {/* Description détaillée */}
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
                  rows={4}
                  placeholder="Décrivez votre projet, vos objectifs, votre public cible..."
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

              {/* Fonctionnalités souhaitées */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Fonctionnalités ou spécifications souhaitées
                </label>
                <textarea
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  rows={3}
                  placeholder="Listez les fonctionnalités importantes pour votre projet..."
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
            </div>

            {/* Contraintes et budget */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ color: '#6b46c1', marginBottom: '15px', fontSize: '1.3rem' }}>
                💰 Budget et délais
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px'
              }}>
                {/* Délai souhaité */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    Délai souhaité
                  </label>
                  <input
                    type="text"
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    placeholder="Ex: 2 semaines, 1 mois, urgent..."
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  />
                </div>

                {/* Budget approximatif */}
                <div>
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
                    placeholder="Ex: $1000 - $3000, Flexible..."
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div style={{ display: 'grid', gap: '15px' }}>
              {/* Bouton d'envoi */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '15px',
                  background: isSubmitting ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                {isSubmitting ? '📤 Envoi en cours...' : '📋 Envoyer la demande de devis'}
              </button>

              {/* Bouton de retour */}
              <button
                type="button"
                onClick={onBack}
                style={{
                  width: '100%',
                  padding: '15px',
                  background: 'transparent',
                  border: '2px solid #6b7280',
                  borderRadius: '12px',
                  color: '#6b7280',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#6b7280'
                  e.currentTarget.style.color = 'white'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#6b7280'
                }}
              >
                🏠 Retour à la page d'accueil
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default QuotePage