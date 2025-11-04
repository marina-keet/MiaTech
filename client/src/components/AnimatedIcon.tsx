import React from 'react'
import Lottie from 'lottie-react'
import { motion } from 'framer-motion'

interface AnimatedIconProps {
  animationData?: object
  size?: number
  loop?: boolean
  autoplay?: boolean
  className?: string
  style?: React.CSSProperties
}

export const AnimatedIcon: React.FC<AnimatedIconProps> = ({
  animationData,
  size = 100,
  loop = true,
  autoplay = true,
  className,
  style
}) => {
  // Animation JSON simple pour les icônes tech
  const defaultTechAnimation = {
    v: "5.7.4",
    fr: 60,
    ip: 0,
    op: 120,
    w: 200,
    h: 200,
    nm: "Tech Icon",
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: "Circle",
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: { 
            a: 1, 
            k: [
              { i: { x: 0.833, y: 0.833 }, o: { x: 0.167, y: 0.167 }, t: 0, s: 0 },
              { t: 120, s: 360 }
            ]
          },
          p: { a: 0, k: [100, 100, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 0, k: [100, 100, 100] }
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "el",
                s: { a: 0, k: [60, 60] },
                p: { a: 0, k: [0, 0] }
              },
              {
                ty: "fl",
                c: { a: 0, k: [0.2, 0.5, 1, 1] },
                o: { a: 0, k: 100 }
              }
            ]
          }
        ],
        ip: 0,
        op: 120,
        st: 0,
        bm: 0
      }
    ]
  }

  return (
    <motion.div
      className={className}
      style={{ 
        width: size, 
        height: size,
        ...style 
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.1 }}
    >
      <Lottie
        animationData={animationData || defaultTechAnimation}
        loop={loop}
        autoplay={autoplay}
        style={{ width: '100%', height: '100%' }}
      />
    </motion.div>
  )
}

// Composant pour les animations de chargement
export const LoadingAnimation: React.FC<{ size?: number }> = ({ size = 50 }) => {
  const loadingAnimation = {
    v: "5.7.4",
    fr: 60,
    ip: 0,
    op: 60,
    w: 100,
    h: 100,
    nm: "Loading",
    layers: [
      {
        ty: 4,
        nm: "Dot 1",
        ks: {
          o: { 
            a: 1,
            k: [
              { t: 0, s: 30 },
              { t: 20, s: 100 },
              { t: 40, s: 30 },
              { t: 60, s: 30 }
            ]
          },
          p: { a: 0, k: [30, 50] },
          s: { a: 0, k: [100, 100] }
        },
        shapes: [{
          ty: "el",
          s: { a: 0, k: [8, 8] },
          p: { a: 0, k: [0, 0] }
        }],
        ip: 0,
        op: 60
      },
      {
        ty: 4,
        nm: "Dot 2", 
        ks: {
          o: { 
            a: 1,
            k: [
              { t: 0, s: 30 },
              { t: 10, s: 30 },
              { t: 30, s: 100 },
              { t: 50, s: 30 },
              { t: 60, s: 30 }
            ]
          },
          p: { a: 0, k: [50, 50] },
          s: { a: 0, k: [100, 100] }
        },
        shapes: [{
          ty: "el",
          s: { a: 0, k: [8, 8] },
          p: { a: 0, k: [0, 0] }
        }],
        ip: 0,
        op: 60
      },
      {
        ty: 4,
        nm: "Dot 3",
        ks: {
          o: { 
            a: 1,
            k: [
              { t: 0, s: 30 },
              { t: 20, s: 30 },
              { t: 40, s: 100 },
              { t: 60, s: 30 }
            ]
          },
          p: { a: 0, k: [70, 50] },
          s: { a: 0, k: [100, 100] }
        },
        shapes: [{
          ty: "el",
          s: { a: 0, k: [8, 8] },
          p: { a: 0, k: [0, 0] }
        }],
        ip: 0,
        op: 60
      }
    ]
  }

  return (
    <motion.div
      style={{ width: size, height: size }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Lottie
        animationData={loadingAnimation}
        loop={true}
        autoplay={true}
        style={{ width: '100%', height: '100%' }}
      />
    </motion.div>
  )
}