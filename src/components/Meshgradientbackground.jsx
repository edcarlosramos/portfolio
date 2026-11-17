import React, { useRef, useEffect, useLayoutEffect, useState } from 'react'
import gsap from 'gsap'
import { introEnd } from '../utils/intro'

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
    right: '25%',
    bottom: '-58%',
    colorCenter: '#005AAF', 
    colorEdge: '#005AAF',   
    glowColor: '#021F40',   
    glowOpacity: 0.35,      
    blur: 35,              
    moveY: -130,             
    moveX: 500,              
    duration: 9,          
    delay: 0,
  },
  {
    id: 'azul',
    size: 600,
    right: '25%',
    bottom: '-58%',
    colorCenter: '#7FBBD0', 
    colorEdge: '#A3E6FF',   
    glowColor: '#021F40F',   
    isLight: true, // luz clara refletida pelo "Ramos." (GlassTextGL)
    glowOpacity: 0.35,      
    blur: 35,               
    moveY: -130,            
    moveX: 500,             
    duration: 9,          
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

// Os blobs foram desenhados para o card do desktop (REFERENCE). Em cards
// menores (celular, tablet) tudo é reduzido na mesma proporção: tamanho, blur
// e brilho pelo maior dos dois fatores (para a luz não sumir num card estreito
// e alto), o movimento horizontal pela largura e o vertical pela altura.
const REFERENCE = { width: 1345, height: 838 }
const round = (n) => Math.round(n * 100) / 100

const useCardScale = (ref) => {
  const [scale, setScale] = useState({ x: 1, y: 1, size: 1 })

  // Mede antes da primeira pintura (sem "piscar" a luz no tamanho do desktop)
  // e de novo sempre que o card muda de tamanho.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const measure = (width, height) => {
      if (!width || !height) return
      const x = round(Math.min(1, width / REFERENCE.width))
      const y = round(Math.min(1, height / REFERENCE.height))
      const size = Math.max(x, y)
      setScale((prev) => (prev.x === x && prev.y === y ? prev : { x, y, size }))
    }
    measure(el.clientWidth, el.clientHeight)
    const observer = new ResizeObserver(([entry]) => measure(entry.contentRect.width, entry.contentRect.height))
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref])

  return scale
}

const MeshGradientBackground = ({ blobs = DEFAULT_BLOBS, className = '' }) => {
  const containerRef = useRef(null)
  const blobRefs = useRef([])
  const scale = useCardScale(containerRef)

  useEffect(() => {
    let alive = true
    const ctx = gsap.context(() => {
      const tweens = []
      blobRefs.current.forEach((blobEl, i) => {
        if (!blobEl || !blobs[i]) return
        const { moveY = -46, moveX = 24, duration = 7, delay = 0 } = blobs[i]

        tweens.push(gsap.to(blobEl, {
          y: moveY * scale.y,
          duration,
          delay,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        }))

        tweens.push(gsap.to(blobEl, {
          x: moveX * scale.x,
          duration: duration * 1.35,
          delay: delay + 0.4,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        }))
      })

      // Parados até a tela de carregamento terminar de sair: blobs com blur se
      // movendo durante a revelação obrigavam a GPU a refazer o desfoque a
      // cada quadro, e era isso que travava a transição no celular. Depois,
      // aceleram suavemente até a velocidade normal.
      tweens.forEach((t) => t.timeScale(0).pause())
      introEnd.then(() => {
        if (!alive) return
        tweens.forEach((t) => t.resume())
        gsap.to(tweens, { timeScale: 1, duration: 1.2, ease: 'power1.in' })
      })
    }, containerRef)

    return () => {
      alive = false
      ctx.revert()
    }
  }, [blobs, scale])

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
          ? `0 0 ${90 * scale.size}px ${30 * scale.size}px ${hexToRgba(blob.glowColor, blob.glowOpacity ?? 0.3)}`
          : 'none'

        return (
          <div
            key={`${blob.id}-${i}`}
            ref={(el) => (blobRefs.current[i] = el)}
            data-hero-light={blob.isLight ? '' : undefined}
            className="absolute rounded-full will-change-transform"
            style={{
              width: `${blob.size * scale.size}px`,
              height: `${blob.size * scale.size}px`,
              top: blob.top,
              bottom: blob.bottom,
              left: blob.left,
              right: blob.right,
              transform: 'translate3d(0,0,0)',
              background: `radial-gradient(circle at 50% 50%, ${blob.colorCenter} 0%, ${blob.colorEdge} 65%, transparent 100%)`,
              filter: `blur(${(blob.blur ?? 80) * scale.size}px)`,
              boxShadow: glowStyle,
            }}
          />
        )
      })}
    </div>
  )
}

export default MeshGradientBackground