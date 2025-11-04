import { useEffect, useRef } from 'react'
import { useAnimation } from 'framer-motion'

interface UseScrollAnimationOptions {
  threshold?: number
  triggerOnce?: boolean
  delay?: number
}

export const useScrollAnimation = (
  options: UseScrollAnimationOptions = {}
) => {
  const { threshold = 0.1, triggerOnce = true, delay = 0 } = options
  
  const ref = useRef<HTMLDivElement>(null)
  const controls = useAnimation()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const timer = setTimeout(() => {
            controls.start('visible')
          }, delay * 1000)
          
          if (triggerOnce) {
            observer.disconnect()
          }
          
          return () => clearTimeout(timer)
        } else if (!triggerOnce) {
          controls.start('hidden')
        }
      },
      { threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [controls, delay, triggerOnce, threshold])

  return { ref, controls }
}

// Hook pour les animations de hover fluides
export const useHoverAnimation = () => {
  const controls = useAnimation()
  
  const handleHoverStart = () => controls.start('hover')
  const handleHoverEnd = () => controls.start('visible')
  
  return {
    controls,
    onHoverStart: handleHoverStart,
    onHoverEnd: handleHoverEnd
  }
}

// Hook pour les animations de clic
export const useTapAnimation = () => {
  const controls = useAnimation()
  
  const handleTapStart = () => controls.start('tap')
  const handleTapEnd = () => controls.start('visible')
  
  return {
    controls,
    onTapStart: handleTapStart,
    onTapCancel: handleTapEnd,
    onTap: handleTapEnd
  }
}