import React, { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { MOTION_OK } from '../constants'

// Proporções em `em` (relativas à fonte do link):
// cada letra ocupa uma "janela" de LINE de altura; a cópia que entra fica
// GAP abaixo, para não aparecer na janela em repouso.
const LINE = 1.2
const GAP = 0.3
const COLUMN = LINE * 2 + GAP
const SHIFT = (-100 * (LINE + GAP)) / COLUMN

// Texto sublinhado com efeito de giro no hover/foco: cada letra rola para
// cima como um tambor (com rotação 3D) e a cópia de baixo entra no lugar,
// em sequência. O sublinhado é desenhado no fundo de cada letra, para seguir
// as letras (o `text-decoration` não alcança elementos inline-block).
// O texto real fica em `sr-only`; as letras animadas são só visuais.
const SpinText = ({ text }) => {
  const rootRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    const host = root.closest('a, button') ?? root
    const mm = gsap.matchMedia()

    mm.add(MOTION_OK, () => {
      const columns = root.querySelectorAll('[data-spin-col]')
      const tops = root.querySelectorAll('[data-spin-top]')
      const bottoms = root.querySelectorAll('[data-spin-bottom]')
      const stagger = 0.02

      gsap.set([...tops, ...bottoms], { transformPerspective: 400, transformOrigin: '50% 50%' })
      gsap.set(bottoms, { rotationX: -90 })

      const enter = () => {
        const options = { duration: 0.55, ease: 'power3.inOut', stagger, overwrite: 'auto' }
        gsap.to(columns, { yPercent: SHIFT, ...options })
        gsap.to(tops, { rotationX: 90, ...options })
        gsap.to(bottoms, { rotationX: 0, ...options })
      }

      const leave = () => {
        const options = { duration: 0.55, ease: 'power3.inOut', stagger, overwrite: 'auto' }
        gsap.to(columns, { yPercent: 0, ...options })
        gsap.to(tops, { rotationX: 0, ...options })
        gsap.to(bottoms, { rotationX: -90, ...options })
      }

      host.addEventListener('mouseenter', enter)
      host.addEventListener('mouseleave', leave)
      host.addEventListener('focus', enter)
      host.addEventListener('blur', leave)

      return () => {
        host.removeEventListener('mouseenter', enter)
        host.removeEventListener('mouseleave', leave)
        host.removeEventListener('focus', enter)
        host.removeEventListener('blur', leave)
      }
    })

    return () => mm.revert()
  }, [text])

  const words = text.split(' ')

  return (
    <span ref={rootRef}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, wordIndex) => {
          // O espaço vai junto da palavra anterior para o sublinhado não falhar
          // e a quebra de linha acontecer só entre palavras.
          const chars = [...word, ...(wordIndex < words.length - 1 ? [' '] : [])]

          return (
            <span key={`${word}-${wordIndex}`} className="inline-block whitespace-nowrap">
              {chars.map((char, charIndex) => (
                <span
                  key={charIndex}
                  className="inline-block overflow-hidden align-[-0.32em] h-[1.26em] pb-[0.06em] bg-[linear-gradient(currentColor,currentColor)] bg-no-repeat bg-bottom bg-size-[100%_0.07em]"
                >
                  <span data-spin-col className="block">
                    <span data-spin-top className="block h-[1.2em] leading-[1.2em]">
                      {char}
                    </span>
                    <span data-spin-bottom className="block mt-[0.3em] h-[1.2em] leading-[1.2em]">
                      {char}
                    </span>
                  </span>
                </span>
              ))}
            </span>
          )
        })}
      </span>
    </span>
  )
}

export default SpinText
