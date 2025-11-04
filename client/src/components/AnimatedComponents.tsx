import React from 'react'
import { motion } from 'framer-motion'

interface AnimatedSectionProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  delay?: number
  direction?: 'up' | 'left' | 'right' | 'scale'
}

export const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  className,
  style,
  delay = 0,
  direction = 'up'
}) => {
  const variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 30 : 0,
      x: direction === 'left' ? -30 : direction === 'right' ? 30 : 0,
      scale: direction === 'scale' ? 0.95 : 1
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={variants}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  )
}

interface AnimatedButtonProps {
  children: React.ReactNode
  onClick?: () => void
  style?: React.CSSProperties
  className?: string
  type?: 'button' | 'submit'
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onClick,
  style,
  className,
  type = 'button'
}) => {
  return (
    <motion.button
      type={type}
      className={className}
      onClick={onClick}
      style={style}
      whileHover={{ 
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
      whileTap={{ 
        scale: 0.95,
        transition: { duration: 0.1 }
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.4, ease: 'easeOut' }
      }}
    >
      {children}
    </motion.button>
  )
}

interface AnimatedCardProps {
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
  delay?: number
  hoverLift?: boolean
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  style,
  className,
  delay = 0,
  hoverLift = true
}) => {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: {
          duration: 0.6,
          delay,
          ease: [0.25, 0.46, 0.45, 0.94]
        }
      }}
      whileHover={hoverLift ? { 
        y: -8, 
        scale: 1.02,
        transition: { duration: 0.3, ease: 'easeOut' }
      } : {}}
      viewport={{ once: true, margin: '-5%' }}
    >
      {children}
    </motion.div>
  )
}

interface AnimatedTextProps {
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
  delay?: number
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span'
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  children,
  style,
  className,
  delay = 0,
  as: Component = 'div'
}) => {
  return (
    <motion.div
      as={Component}
      className={className}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ 
        opacity: 1, 
        y: 0,
        transition: {
          duration: 0.8,
          delay,
          ease: [0.25, 0.46, 0.45, 0.94]
        }
      }}
      viewport={{ once: true, margin: '-10%' }}
    >
      {children}
    </motion.div>
  )
}