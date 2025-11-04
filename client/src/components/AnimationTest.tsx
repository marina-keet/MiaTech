import React from 'react'
import { motion } from 'framer-motion'

export const AnimationTest: React.FC = () => {
  return (
    <div style={{ padding: '20px', background: '#f0f0f0', margin: '20px', borderRadius: '10px' }}>
      <h2>🎬 Test d'Animation</h2>
      
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        style={{
          padding: '20px',
          background: '#3b82f6',
          color: 'white',
          borderRadius: '8px',
          margin: '10px 0'
        }}
      >
        ✨ Cette div devrait apparaître avec une animation
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{
          padding: '10px 20px',
          background: '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        🚀 Bouton Animé
      </motion.button>

      <motion.div
        animate={{ 
          rotate: 360,
          transition: { duration: 2, repeat: Infinity, ease: "linear" }
        }}
        style={{
          width: '50px',
          height: '50px',
          background: '#f59e0b',
          margin: '20px auto',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        ⚡
      </motion.div>
    </div>
  )
}