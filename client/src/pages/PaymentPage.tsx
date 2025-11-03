import React, { useState } from 'react'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface PaymentPageProps {
  user: User
  orderData: {
    id: number
    serviceId: string
    serviceName: string
    description: string
    amount: number
  }
  onBack: () => void
  onPaymentSuccess: () => void
}

const PaymentPage: React.FC<PaymentPageProps> = ({ user, orderData, onBack, onPaymentSuccess }) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  })
  const [mobileData, setMobileData] = useState({
    countryCode: '+243',
    phoneNumber: ''
  })

  const paymentMethods = [
    {
      id: 'stripe',
      name: 'Carte Bancaire (Visa/MasterCard)',
      icon: '💳',
      description: 'Paiement sécurisé international',
      regions: ['International', 'Europe', 'Amérique'],
      color: '#635bff'
    },
    {
      id: 'mpesa',
      name: 'M-Pesa',
      icon: '📱',
      description: 'Paiement mobile M-Pesa',
      regions: ['RDC', 'Afrique Centrale', 'Afrique de l\'Est'],
      color: '#00d13a'
    },
    {
      id: 'orange-money',
      name: 'Orange Money',
      icon: '🍊',
      description: 'Paiement mobile Orange',
      regions: ['RDC', 'Afrique Centrale', 'Afrique de l\'Ouest'],
      color: '#ff6900'
    },
    {
      id: 'airtel-money',
      name: 'Airtel Money',
      icon: '🔴',
      description: 'Paiement mobile Airtel',
      regions: ['RDC', 'Afrique Centrale', 'Afrique'],
      color: '#e60012'
    }
  ]

  const handlePayment = async () => {
    if (!selectedMethod) {
      alert('Veuillez sélectionner une méthode de paiement')
      return
    }

    setIsProcessing(true)

    try {
      // Simuler différents types de paiement
      let paymentResult
      
      if (selectedMethod === 'stripe') {
        paymentResult = await processStripePayment()
      } else {
        paymentResult = await processMobilePayment()
      }

      if (paymentResult.success) {
        // Générer la facture PDF
        await generateInvoice(paymentResult.transactionId)
        
        alert('✅ Paiement effectué avec succès ! Votre facture sera générée.')
        onPaymentSuccess()
      } else {
        alert(`❌ Échec du paiement: ${paymentResult.error}`)
      }
    } catch (error) {
      console.error('Erreur paiement:', error)
      alert('❌ Erreur lors du paiement. Veuillez réessayer.')
    }

    setIsProcessing(false)
  }

  const processStripePayment = async () => {
    // Validation des données carte
    if (!cardData.number || !cardData.expiry || !cardData.cvv || !cardData.name) {
      throw new Error('Veuillez remplir tous les champs de la carte')
    }

    const response = await fetch('http://localhost:5000/api/payments/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        orderId: orderData.id,
        amount: orderData.amount,
        currency: 'usd',
        cardData: {
          number: cardData.number.replace(/\s/g, ''),
          expiry: cardData.expiry,
          cvv: cardData.cvv,
          name: cardData.name
        },
        customerData: {
          name: user.name,
          email: user.email
        }
      })
    })

    return await response.json()
  }

  const processMobilePayment = async () => {
    // Validation du numéro de téléphone
    if (!mobileData.phoneNumber) {
      throw new Error('Veuillez saisir votre numéro de téléphone')
    }

    const response = await fetch('http://localhost:5000/api/payments/mobile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        orderId: orderData.id,
        amount: orderData.amount,
        method: selectedMethod,
        phoneNumber: mobileData.countryCode + mobileData.phoneNumber,
        customerData: {
          name: user.name,
          email: user.email
        }
      })
    })

    return await response.json()
  }

  const generateInvoice = async (transactionId: string) => {
    const response = await fetch('http://localhost:5000/api/payments/generate-invoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        orderId: orderData.id,
        transactionId,
        customerData: {
          name: user.name,
          email: user.email
        }
      })
    })

    if (response.ok) {
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `facture-${orderData.id}-${transactionId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
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
            💳 Paiement Sécurisé
          </h1>
          <p style={{ 
            color: 'rgba(255,255,255,0.9)', 
            fontSize: '1.1rem',
            margin: '5px 0 0 0'
          }}>
            Finalisez votre commande
          </p>
        </div>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: '2px solid rgba(255,255,255,0.3)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '12px',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
        >
          ← Retour
        </button>
      </div>

      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 400px',
        gap: '30px'
      }}>
        {/* Récapitulatif de commande */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          height: 'fit-content'
        }}>
          <h3 style={{
            fontSize: '1.5rem',
            color: '#1f2937',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            📋 Récapitulatif de la commande
          </h3>

          <div style={{
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h4 style={{
              color: '#374151',
              marginBottom: '15px'
            }}>
              {orderData.serviceName}
            </h4>
            <p style={{
              color: '#6b7280',
              marginBottom: '15px',
              lineHeight: '1.6'
            }}>
              {orderData.description}
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '15px',
              borderTop: '2px solid #e5e7eb'
            }}>
              <span style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                color: '#374151'
              }}>
                Total:
              </span>
              <span style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#059669'
              }}>
                ${orderData.amount}
              </span>
            </div>
          </div>

          {/* Méthodes de paiement */}
          <h4 style={{
            color: '#374151',
            marginBottom: '15px'
          }}>
            Choisissez votre méthode de paiement:
          </h4>

          <div style={{
            display: 'grid',
            gap: '12px',
            marginBottom: '25px'
          }}>
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                style={{
                  padding: '16px',
                  border: `2px solid ${selectedMethod === method.id ? method.color : '#e5e7eb'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  background: selectedMethod === method.id ? `${method.color}10` : '#f9fafb',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px'
                }}
              >
                <div style={{
                  fontSize: '1.5rem',
                  width: '40px',
                  textAlign: 'center'
                }}>
                  {method.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '4px'
                  }}>
                    {method.name}
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: '#6b7280',
                    marginBottom: '4px'
                  }}>
                    {method.description}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: method.color,
                    fontWeight: '500'
                  }}>
                    {method.regions.join(', ')}
                  </div>
                </div>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: `2px solid ${selectedMethod === method.id ? method.color : '#d1d5db'}`,
                  background: selectedMethod === method.id ? method.color : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {selectedMethod === method.id && (
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: 'white'
                    }} />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Formulaires de paiement conditionnels */}
          {selectedMethod === 'stripe' && (
            <div style={{
              background: '#f8fafc',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <h5 style={{
                color: '#374151',
                marginBottom: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                💳 Informations de carte
              </h5>

              <div style={{
                display: 'grid',
                gap: '15px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontWeight: '600',
                    color: '#374151',
                    fontSize: '0.9rem'
                  }}>
                    Numéro de carte *
                  </label>
                  <input
                    type="text"
                    value={cardData.number}
                    onChange={(e) => setCardData({...cardData, number: formatCardNumber(e.target.value)})}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  />
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '15px'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontWeight: '600',
                      color: '#374151',
                      fontSize: '0.9rem'
                    }}>
                      Expiration *
                    </label>
                    <input
                      type="text"
                      value={cardData.expiry}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '')
                        if (value.length >= 2) {
                          value = value.substring(0, 2) + '/' + value.substring(2, 4)
                        }
                        setCardData({...cardData, expiry: value})
                      }}
                      placeholder="MM/AA"
                      maxLength={5}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontWeight: '600',
                      color: '#374151',
                      fontSize: '0.9rem'
                    }}>
                      CVV *
                    </label>
                    <input
                      type="text"
                      value={cardData.cvv}
                      onChange={(e) => setCardData({...cardData, cvv: e.target.value.replace(/\D/g, '')})}
                      placeholder="123"
                      maxLength={4}
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

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontWeight: '600',
                    color: '#374151',
                    fontSize: '0.9rem'
                  }}>
                    Nom sur la carte *
                  </label>
                  <input
                    type="text"
                    value={cardData.name}
                    onChange={(e) => setCardData({...cardData, name: e.target.value})}
                    placeholder="JOHN DOE"
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
          )}

          {(selectedMethod === 'mpesa' || selectedMethod === 'orange-money' || selectedMethod === 'airtel-money') && (
            <div style={{
              background: '#f8fafc',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <h5 style={{
                color: '#374151',
                marginBottom: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                📱 Paiement Mobile
              </h5>

              <div style={{
                display: 'grid',
                gap: '15px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontWeight: '600',
                    color: '#374151',
                    fontSize: '0.9rem'
                  }}>
                    Numéro de téléphone *
                  </label>
                  <div style={{ display: 'flex' }}>
                    <select
                      value={mobileData.countryCode}
                      onChange={(e) => setMobileData({...mobileData, countryCode: e.target.value})}
                      style={{
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px 0 0 8px',
                        background: '#f9fafb',
                        fontSize: '16px',
                        minWidth: '120px'
                      }}
                    >
                      <option value="+243">🇨🇩 +243</option>
                      <option value="+237">🇨🇲 +237</option>
                      <option value="+236">🇨🇫 +236</option>
                      <option value="+235">🇹🇩 +235</option>
                      <option value="+241">🇬🇦 +241</option>
                      <option value="+240">🇬🇶 +240</option>
                      <option value="+242">🇨🇬 +242</option>
                    </select>
                    <input
                      type="tel"
                      value={mobileData.phoneNumber}
                      onChange={(e) => setMobileData({...mobileData, phoneNumber: e.target.value})}
                      placeholder="821200427"
                      style={{
                        flex: 1,
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderLeft: 'none',
                        borderRadius: '0 8px 8px 0',
                        fontSize: '16px'
                      }}
                    />
                  </div>
                  <p style={{
                    fontSize: '0.8rem',
                    color: '#6b7280',
                    marginTop: '4px'
                  }}>
                    Numéro sans l'indicatif pays (sera ajouté automatiquement)
                  </p>
                </div>
              </div>

              <div style={{
                marginTop: '15px',
                padding: '12px',
                background: '#f0f9ff',
                border: '1px solid #93c5fd',
                borderRadius: '8px',
                fontSize: '0.9rem',
                color: '#1e40af'
              }}>
                💰 <strong>Compte de réception MiaTech:</strong><br />
                {selectedMethod === 'mpesa' && '📱 M-Pesa: +243 821 200 427'}
                {selectedMethod === 'orange-money' && '🍊 Orange Money: +243 894 445 119'}
                {selectedMethod === 'airtel-money' && '🔴 Airtel Money: +243 994 075 028'}
              </div>
              
              <div style={{
                marginTop: '10px',
                padding: '12px',
                background: '#fffbeb',
                border: '1px solid #fed7aa',
                borderRadius: '8px',
                fontSize: '0.9rem',
                color: '#92400e'
              }}>
                ℹ️ Vous recevrez un SMS avec les instructions de paiement sur votre téléphone.
              </div>
            </div>
          )}

          {/* Bouton de paiement */}
          <button
            onClick={handlePayment}
            disabled={!selectedMethod || isProcessing}
            style={{
              width: '100%',
              padding: '15px',
              background: !selectedMethod || isProcessing 
                ? '#9ca3af' 
                : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: !selectedMethod || isProcessing ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s'
            }}
          >
            {isProcessing 
              ? '⏳ Traitement en cours...'
              : `💳 Payer $${orderData.amount}`
            }
          </button>

          {/* Sécurité */}
          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: '#f0f9f5',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '0.9rem',
              color: '#065f46',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              🔒 Paiement sécurisé SSL 256 bits
            </div>
          </div>
        </div>

        {/* Panel informations */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '25px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          height: 'fit-content'
        }}>
          <h4 style={{
            color: '#374151',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🛡️ Paiement Sécurisé
          </h4>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ fontSize: '1.2rem' }}>🔒</span>
              <span style={{
                fontSize: '0.9rem',
                color: '#4b5563'
              }}>
                Données cryptées SSL
              </span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ fontSize: '1.2rem' }}>📄</span>
              <span style={{
                fontSize: '0.9rem',
                color: '#4b5563'
              }}>
                Facture PDF automatique
              </span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ fontSize: '1.2rem' }}>🌍</span>
              <span style={{
                fontSize: '0.9rem',
                color: '#4b5563'
              }}>
                Paiement international et local
              </span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ fontSize: '1.2rem' }}>⚡</span>
              <span style={{
                fontSize: '0.9rem',
                color: '#4b5563'
              }}>
                Traitement instantané
              </span>
            </div>
          </div>

          <div style={{
            marginTop: '25px',
            padding: '15px',
            background: '#f8fafc',
            borderRadius: '8px'
          }}>
            <h5 style={{
              color: '#374151',
              marginBottom: '10px',
              fontSize: '0.9rem'
            }}>
              💡 Besoin d'aide ?
            </h5>
            <p style={{
              fontSize: '0.8rem',
              color: '#6b7280',
              lineHeight: '1.5',
              margin: '0'
            }}>
              Notre équipe support est disponible 24/7 pour vous assister avec votre paiement.
              Email: support@miatech.com
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentPage