import React, { useRef, useEffect } from 'react'
import gsap from 'gsap'

const hexToRgba = (hex, alpha = 1) => {
  if (!hex) return 'transparent'
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const DEFAULT_BLOBS = [
    {
    id: 'azul',
    size: 680,
    right: '15%',
    bottom: '-65%',
    colorCenter: '#005AAF', 
    colorEdge: '#005AAF',   
    glowColor: '#021F40',   
    glowOpacity: 0.35,      
    blur: 35,              
    moveY: -105,             
    moveX: 500,              
    duration: 12,          
    delay: 0,
  },
  {
    id: 'azul',
    size: 600,
    right: '15%',
    bottom: '-65%',
    colorCenter: '#7FBBD0', 
    colorEdge: '#A3E6FF',   
    glowColor: '#021F40F',   
    glowOpacity: 0.35,      
    blur: 35,               
    moveY: -105,            
    moveX: 500,             
    duration: 12,          
    delay: 0,
  },

  {
    id: 'azul',
    size: 680,
    right: '-40%',
    top: '-60%',
    colorCenter: '#021F40', 
    colorEdge: '#021F40',   
    glowColor: '#021F40',   
    glowOpacity: 0.35,      
    blur: 65,               
    moveY: -55,             
    moveX: 200,              
    duration: 6,        
    delay: -2,
  },
]

const MeshGradientBackground = ({ blobs = DEFAULT_BLOBS, className = '' }) => {
  const containerRef = useRef(null)
  const blobRefs = useRef([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      blobRefs.current.forEach((blobEl, i) => {
        if (!blobEl || !blobs[i]) return
        const { moveY = -46, moveX = 24, duration = 7, delay = 0 } = blobs[i]

        gsap.to(blobEl, {
          y: moveY,
          duration,
          delay,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        })

        gsap.to(blobEl, {
          x: moveX,
          duration: duration * 1.35,
          delay: delay + 0.4,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        })
      })
    }, containerRef)

    return () => ctx.revert()
  }, [blobs])

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] z-0 ${className}`}
      style={{
        WebkitMaskImage: '-webkit-radial-gradient(white, black)',
        maskImage: 'radial-gradient(white, black)',
      }}
      aria-hidden="true"
    >
      {blobs.map((blob, i) => {
        const hasGlow = Boolean(blob.glowColor)
        const glowStyle = hasGlow
          ? `0 0 90px 30px ${hexToRgba(blob.glowColor, blob.glowOpacity ?? 0.3)}`
          : 'none'

        return (
          <div
            key={blob.id || i}
            ref={(el) => (blobRefs.current[i] = el)}
            className="absolute rounded-full will-change-transform"
            style={{
              width: `${blob.size}px`,
              height: `${blob.size}px`,
              top: blob.top,
              bottom: blob.bottom,
              left: blob.left,
              right: blob.right,
              transform: 'translate3d(0,0,0)',
              background: `radial-gradient(circle at 50% 50%, ${blob.colorCenter} 0%, ${blob.colorEdge} 65%, transparent 100%)`,
              filter: `blur(${blob.blur ?? 80}px)`,
              boxShadow: glowStyle,
            }}
          />
        )
      })}
    </div>
  )
}

export default MeshGradientBackground