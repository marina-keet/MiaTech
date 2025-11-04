import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

interface ParallaxContainerProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const ParallaxContainer: React.FC<ParallaxContainerProps> = ({
  children,
  speed = 0.5,
  className,
  style
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", `${speed * 100}%`]);
  const springY = useSpring(y, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      ref={ref}
      style={{ y: springY, ...style }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Hook pour les animations au scroll
export const useScrollAnimation = () => {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [1, 1, 1, 0.8]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.98]);

  return { opacity, scale };
};

// Composant pour des animations de texte fluides
interface FluidTextProps {
  children: string;
  className?: string;
  style?: React.CSSProperties;
}

export const FluidText: React.FC<FluidTextProps> = ({ children, className, style }) => {
  const words = children.split(' ');

  return (
    <motion.div className={className} style={style}>
      {words.map((word, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.5,
            delay: index * 0.1,
            ease: "easeOut"
          }}
          style={{ display: 'inline-block', marginRight: '0.3em' }}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};

// Hook pour les interactions tactiles améliorées
export const useTouchInteractions = () => {
  const [isTouch, setIsTouch] = React.useState(false);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };

    checkTouch();
    window.addEventListener('touchstart', checkTouch, { once: true });

    return () => {
      window.removeEventListener('touchstart', checkTouch);
    };
  }, []);

  return { isTouch };
};

// Composant pour des boutons avec feedback haptique
interface HapticButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  hapticFeedback?: boolean;
}

export const HapticButton: React.FC<HapticButtonProps> = ({
  children,
  onClick,
  className,
  style,
  hapticFeedback = true
}) => {
  const { isTouch } = useTouchInteractions();

  const handleClick = () => {
    // Feedback haptique sur les appareils compatibles
    if (hapticFeedback && isTouch && 'vibrate' in navigator) {
      navigator.vibrate(10); // Vibration légère de 10ms
    }
    onClick?.();
  };

  return (
    <motion.button
      whileHover={{ scale: isTouch ? 1 : 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      onClick={handleClick}
      className={className}
      style={style}
    >
      {children}
    </motion.button>
  );
};

// Animation de particules subtiles pour l'arrière-plan
export const FloatingParticles: React.FC = () => {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: 0
    }}>
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: Math.random() * window.innerWidth,
            y: window.innerHeight + 100,
            opacity: 0
          }}
          animate={{
            y: -100,
            opacity: [0, 0.3, 0.6, 0.3, 0],
            x: Math.random() * window.innerWidth
          }}
          transition={{
            duration: Math.random() * 10 + 15,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "linear"
          }}
          style={{
            position: 'absolute',
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            background: 'rgba(59, 130, 246, 0.4)',
            borderRadius: '50%',
            filter: 'blur(1px)'
          }}
        />
      ))}
    </div>
  );
};