import React from 'react';
import Lottie from 'lottie-react';
import { motion } from 'framer-motion';
import { techLoaderAnimation } from '../assets/lottie-animations';

interface LoadingSpinnerProps {
  size?: number;
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 60, 
  message = "Chargement..." 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div style={{ width: size, height: size }}>
        <Lottie 
          animationData={techLoaderAnimation}
          loop={true}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      {message && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            marginTop: '15px',
            color: '#6b7280',
            fontSize: '0.9rem',
            textAlign: 'center'
          }}
        >
          {message}
        </motion.p>
      )}
    </motion.div>
  );
};

// Composant pour les animations d'icônes de service
interface ServiceIconProps {
  emoji: string;
  animated?: boolean;
  size?: number;
}

export const ServiceIcon: React.FC<ServiceIconProps> = ({ 
  emoji, 
  animated = true, 
  size = 24 
}) => {
  if (!animated) {
    return <span style={{ fontSize: size }}>{emoji}</span>;
  }

  return (
    <motion.div
      whileHover={{ 
        scale: 1.2,
        rotate: [0, -5, 5, 0],
        transition: { duration: 0.3 }
      }}
      whileTap={{ scale: 0.95 }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer'
      }}
    >
      <span style={{ fontSize: size }}>{emoji}</span>
    </motion.div>
  );
};

// Composant pour les notifications toast animées
interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
}

export const AnimatedToast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onClose
}) => {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose?.(), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colors = {
    success: '#10B981',
    error: '#EF4444',
    info: '#3B82F6'
  };

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️'
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.8 }}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: 'white',
        padding: '15px 20px',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        border: `2px solid ${colors[type]}`,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        minWidth: '280px'
      }}
    >
      <span style={{ fontSize: '18px' }}>{icons[type]}</span>
      <span style={{ color: '#374151', fontWeight: '500' }}>{message}</span>
      <button
        onClick={() => setIsVisible(false)}
        style={{
          marginLeft: 'auto',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#6B7280',
          fontSize: '16px',
          padding: '4px'
        }}
      >
        ✕
      </button>
    </motion.div>
  );
};