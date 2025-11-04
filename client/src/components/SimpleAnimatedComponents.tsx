import { motion } from 'framer-motion';
import type { ReactNode, CSSProperties } from 'react';

// Interfaces simples
interface SimpleAnimatedProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

interface SimpleAnimatedButtonProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  disabled?: boolean;
}

// Composants animés simples et fonctionnels
export const AnimatedSection = ({ children, className, style }: SimpleAnimatedProps) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    {...(className && { className })}
    {...(style && { style })}
  >
    {children}
  </motion.div>
);

export const AnimatedCard = ({ children, className, style }: SimpleAnimatedProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
    {...(className && { className })}
    {...(style && { style })}
  >
    {children}
  </motion.div>
);

export const AnimatedButton = ({ children, className, style, onClick, disabled }: SimpleAnimatedButtonProps) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buttonProps: any = {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.2 }
  };
  
  if (className) buttonProps.className = className;
  if (style) buttonProps.style = style;
  if (onClick) buttonProps.onClick = onClick;
  if (disabled) buttonProps.disabled = disabled;

  return (
    <motion.button {...buttonProps}>
      {children}
    </motion.button>
  );
};

export const AnimatedText = ({ children, className, style }: SimpleAnimatedProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay: 0.2 }}
    {...(className && { className })}
    {...(style && { style })}
  >
    {children}
  </motion.div>
);

export const AnimatedDiv = ({ children, className, style }: SimpleAnimatedProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4 }}
    {...(className && { className })}
    {...(style && { style })}
  >
    {children}
  </motion.div>
);