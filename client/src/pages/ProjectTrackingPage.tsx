import React, { useState, useEffect } from 'react'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface ProjectTrackingPageProps {
  user: User
  onBack: () => void
}

interface Project {
  id: number
  title: string
  service: string
  status: 'planning' | 'in_progress' | 'review' | 'completed' | 'delivered'
  progress: number
  startDate: string
  estimatedEndDate: string
  description: string
  milestones: {
    id: number
    title: string
    completed: boolean
    date: string
    description?: string
  }[]
  files: {
    id: number
    name: string
    type: 'document' | 'design' | 'code' | 'other'
    url: string
    uploadDate: string
  }[]
  comments: {
    id: number
    author: string
    message: string
    date: string
    isFromClient: boolean
  }[]
}

const ProjectTrackingPage: React.FC<ProjectTrackingPageProps> = ({ user, onBack }) => {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')

  // Récupération des projets depuis l'API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`http://localhost:5000/api/projects/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setProjects(data.projects)
        } else {
          console.error('Erreur lors du chargement des projets')
        }
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [user.id])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planning': return '📋'
      case 'in_progress': return '⚙️'
      case 'review': return '👁️'
      case 'completed': return '✅'
      case 'delivered': return '🚀'
      default: return '📄'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planning': return 'Planification'
      case 'in_progress': return 'En cours'
      case 'review': return 'En révision'
      case 'completed': return 'Terminé'
      case 'delivered': return 'Livré'
      default: return 'Inconnu'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return '#f59e0b'
      case 'in_progress': return '#3b82f6'
      case 'review': return '#8b5cf6'
      case 'completed': return '#10b981'
      case 'delivered': return '#059669'
      default: return '#6b7280'
    }
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'document': return '📄'
      case 'design': return '🎨'
      case 'code': return '💻'
      default: return '📎'
    }
  }

  const handleAddComment = async (projectId: number) => {
    if (!newComment.trim()) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user.id,
          message: newComment
        })
      })

      if (response.ok) {
        const comment = {
          id: Date.now(),
          author: user.name,
          message: newComment,
          date: new Date().toISOString().split('T')[0],
          isFromClient: true
        }

        setProjects(prev => prev.map(project => 
          project.id === projectId 
            ? { ...project, comments: [...project.comments, comment] }
            : project
        ))

        setSelectedProject(prev => 
          prev && prev.id === projectId 
            ? { ...prev, comments: [...prev.comments, comment] }
            : prev
        )

        setNewComment('')
        alert('💬 Commentaire ajouté ! Notre équipe vous répondra bientôt.')
      } else {
        alert('❌ Erreur lors de l\'ajout du commentaire')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('❌ Erreur de connexion')
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ color: 'white', fontSize: '1.2rem' }}>
          ⏳ Chargement de vos projets...
        </div>
      </div>
    )
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
        maxWidth: '1200px',
        margin: '0 auto 30px'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '2.5rem', 
            color: 'white',
            margin: '0',
            textShadow: '0 2px 10px rgba(0,0,0,0.3)'
          }}>
            📊 Suivi de Projets
          </h1>
          <p style={{ 
            color: 'rgba(255,255,255,0.9)', 
            fontSize: '1.1rem',
            margin: '5px 0 0 0'
          }}>
            Suivez l'avancement de vos projets en temps réel
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
          🏠 Retour
        </button>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {selectedProject ? (
          /* Vue détaillée d'un projet */
          <div>
            <button
              onClick={() => setSelectedProject(null)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                cursor: 'pointer',
                marginBottom: '20px'
              }}
            >
              ← Retour à la liste
            </button>

            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '30px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}>
              {/* En-tête du projet */}
              <div style={{
                borderBottom: '2px solid #f3f4f6',
                paddingBottom: '20px',
                marginBottom: '30px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '15px'
                }}>
                  <div>
                    <h2 style={{
                      fontSize: '2rem',
                      color: '#1f2937',
                      margin: '0 0 10px 0'
                    }}>
                      {selectedProject.title}
                    </h2>
                    <p style={{
                      color: '#6b7280',
                      fontSize: '1.1rem',
                      margin: '0'
                    }}>
                      {selectedProject.service}
                    </p>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: getStatusColor(selectedProject.status) + '20',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: `2px solid ${getStatusColor(selectedProject.status)}`
                  }}>
                    <span style={{ fontSize: '1.2rem' }}>
                      {getStatusIcon(selectedProject.status)}
                    </span>
                    <span style={{
                      color: getStatusColor(selectedProject.status),
                      fontWeight: '600'
                    }}>
                      {getStatusLabel(selectedProject.status)}
                    </span>
                  </div>
                </div>

                <p style={{
                  color: '#4b5563',
                  fontSize: '1rem',
                  lineHeight: '1.6',
                  margin: '0 0 20px 0'
                }}>
                  {selectedProject.description}
                </p>

                {/* Barre de progression */}
                <div style={{ marginBottom: '15px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontWeight: '600', color: '#374151' }}>
                      Progression
                    </span>
                    <span style={{ fontWeight: '600', color: '#3b82f6' }}>
                      {selectedProject.progress}%
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '12px',
                    background: '#e5e7eb',
                    borderRadius: '6px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${selectedProject.progress}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>

                {/* Dates */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '20px'
                }}>
                  <div>
                    <span style={{ fontWeight: '600', color: '#374151' }}>
                      📅 Début: 
                    </span>
                    <span style={{ marginLeft: '8px', color: '#6b7280' }}>
                      {new Date(selectedProject.startDate).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontWeight: '600', color: '#374151' }}>
                      🎯 Fin prévue: 
                    </span>
                    <span style={{ marginLeft: '8px', color: '#6b7280' }}>
                      {new Date(selectedProject.estimatedEndDate).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sections en grille */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '30px'
              }}>
                {/* Étapes du projet */}
                <div>
                  <h3 style={{
                    fontSize: '1.5rem',
                    color: '#1f2937',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    📋 Étapes du projet
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {selectedProject.milestones.map((milestone) => (
                      <div
                        key={milestone.id}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '15px',
                          padding: '15px',
                          background: milestone.completed ? '#f0f9f5' : '#f9fafb',
                          borderRadius: '12px',
                          border: `2px solid ${milestone.completed ? '#10b981' : '#e5e7eb'}`
                        }}
                      >
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: milestone.completed ? '#10b981' : '#d1d5db',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          color: 'white',
                          fontWeight: '600',
                          flexShrink: 0
                        }}>
                          {milestone.completed ? '✓' : milestone.id}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontWeight: '600',
                            color: milestone.completed ? '#065f46' : '#374151',
                            marginBottom: '4px'
                          }}>
                            {milestone.title}
                          </div>
                          <div style={{
                            fontSize: '0.9rem',
                            color: '#6b7280',
                            marginBottom: '4px'
                          }}>
                            📅 {new Date(milestone.date).toLocaleDateString('fr-FR')}
                          </div>
                          {milestone.description && (
                            <div style={{
                              fontSize: '0.9rem',
                              color: '#4b5563'
                            }}>
                              {milestone.description}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fichiers */}
                <div>
                  <h3 style={{
                    fontSize: '1.5rem',
                    color: '#1f2937',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    📁 Fichiers du projet
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {selectedProject.files.map((file) => (
                      <div
                        key={file.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px',
                          background: '#f9fafb',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = '#f3f4f6'
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = '#f9fafb'
                        }}
                      >
                        <span style={{ fontSize: '1.5rem' }}>
                          {getFileIcon(file.type)}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontWeight: '600',
                            color: '#374151',
                            marginBottom: '2px'
                          }}>
                            {file.name}
                          </div>
                          <div style={{
                            fontSize: '0.8rem',
                            color: '#6b7280'
                          }}>
                            {new Date(file.uploadDate).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                        <button style={{
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          cursor: 'pointer'
                        }}>
                          📥 Télécharger
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section des commentaires */}
              <div style={{
                marginTop: '30px',
                padding: '20px',
                background: '#f8fafc',
                borderRadius: '12px'
              }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  color: '#1f2937',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  💬 Communications
                </h3>

                {/* Liste des commentaires */}
                <div style={{
                  maxHeight: '300px',
                  overflowY: 'auto',
                  marginBottom: '20px'
                }}>
                  {selectedProject.comments.map((comment) => (
                    <div
                      key={comment.id}
                      style={{
                        display: 'flex',
                        gap: '12px',
                        marginBottom: '15px',
                        flexDirection: comment.isFromClient ? 'row-reverse' : 'row'
                      }}
                    >
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: comment.isFromClient 
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '1.2rem',
                        flexShrink: 0
                      }}>
                        {comment.isFromClient ? '👤' : '👨‍💻'}
                      </div>
                      <div style={{
                        flex: 1,
                        background: 'white',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb',
                        textAlign: comment.isFromClient ? 'right' : 'left'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: comment.isFromClient ? 'flex-end' : 'flex-start',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '6px'
                        }}>
                          <span style={{
                            fontWeight: '600',
                            color: '#374151',
                            fontSize: '0.9rem'
                          }}>
                            {comment.author}
                          </span>
                          <span style={{
                            fontSize: '0.8rem',
                            color: '#9ca3af'
                          }}>
                            {new Date(comment.date).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <p style={{
                          margin: '0',
                          color: '#4b5563',
                          lineHeight: '1.5'
                        }}>
                          {comment.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Formulaire d'ajout de commentaire */}
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-end'
                }}>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Tapez votre message..."
                    rows={2}
                    style={{
                      flex: 1,
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                  />
                  <button
                    onClick={() => handleAddComment(selectedProject.id)}
                    disabled={!newComment.trim()}
                    style={{
                      background: newComment.trim() 
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : '#9ca3af',
                      color: 'white',
                      border: 'none',
                      padding: '12px 20px',
                      borderRadius: '8px',
                      cursor: newComment.trim() ? 'pointer' : 'not-allowed',
                      fontWeight: '600',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    📤 Envoyer
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Liste des projets */
          <div>
            {projects.length === 0 ? (
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '60px 30px',
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📊</div>
                <h3 style={{
                  fontSize: '1.5rem',
                  color: '#374151',
                  marginBottom: '10px'
                }}>
                  Aucun projet en cours
                </h3>
                <p style={{
                  color: '#6b7280',
                  fontSize: '1.1rem'
                }}>
                  Vos projets apparaîtront ici une fois qu'ils auront démarré
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '25px'
              }}>
                {projects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    style={{
                      background: 'white',
                      borderRadius: '16px',
                      padding: '25px',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      border: '1px solid transparent'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)'
                      e.currentTarget.style.boxShadow = '0 12px 35px rgba(0,0,0,0.2)'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '15px'
                    }}>
                      <h3 style={{
                        fontSize: '1.3rem',
                        color: '#1f2937',
                        margin: '0',
                        flex: 1,
                        marginRight: '15px'
                      }}>
                        {project.title}
                      </h3>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: getStatusColor(project.status) + '20',
                        padding: '4px 10px',
                        borderRadius: '15px',
                        border: `1px solid ${getStatusColor(project.status)}`,
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        color: getStatusColor(project.status),
                        whiteSpace: 'nowrap'
                      }}>
                        <span>{getStatusIcon(project.status)}</span>
                        {getStatusLabel(project.status)}
                      </div>
                    </div>

                    <p style={{
                      color: '#6b7280',
                      fontSize: '0.95rem',
                      marginBottom: '8px'
                    }}>
                      {project.service}
                    </p>

                    <p style={{
                      color: '#4b5563',
                      fontSize: '0.9rem',
                      lineHeight: '1.5',
                      marginBottom: '20px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {project.description}
                    </p>

                    {/* Barre de progression */}
                    <div style={{ marginBottom: '15px' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '6px'
                      }}>
                        <span style={{
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          color: '#374151'
                        }}>
                          Progression
                        </span>
                        <span style={{
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          color: '#3b82f6'
                        }}>
                          {project.progress}%
                        </span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '8px',
                        background: '#e5e7eb',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${project.progress}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>

                    {/* Informations sur les dates */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.8rem',
                      color: '#6b7280'
                    }}>
                      <span>
                        📅 Début: {new Date(project.startDate).toLocaleDateString('fr-FR')}
                      </span>
                      <span>
                        🎯 Fin: {new Date(project.estimatedEndDate).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectTrackingPage