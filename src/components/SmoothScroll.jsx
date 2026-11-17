import React, { useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollSmoother } from 'gsap/ScrollSmoother'
import { MOTION_OK } from '../constants'

gsap.registerPlugin(ScrollTrigger, ScrollSmoother)

// Com a tela de carregamento ativa, o ScrollTrigger não se recalcula sozinho
// no evento `load` da página: isso caía no começo da contagem (~0,3s de
// travada no celular) e era refeito de qualquer jeito. A tela de carregamento
// faz o recálculo uma vez, com o contador parado no 100.
if (window.matchMedia(MOTION_OK).matches) {
  ScrollTrigger.config({ autoRefreshEvents: 'visibilitychange,DOMContentLoaded,resize' })
}

// Envolve a página no ScrollSmoother. Elementos `position: fixed` (ex.: Navbar)
// precisam ficar FORA deste componente.
const SmoothScroll = ({ children }) => {
  const wrapperRef = useRef(null)
  const contentRef = useRef(null)

  // useLayoutEffect: o smoother precisa existir antes dos ScrollTriggers que
  // as seções filhas criam em seus useEffect.
  useLayoutEffect(() => {
    const mm = gsap.matchMedia()

    mm.add(MOTION_OK, () => {
      const smoother = ScrollSmoother.create({
        wrapper: wrapperRef.current,
        content: contentRef.current,
        smooth: 1.2,
        effects: true,
      })

      return () => smoother.kill()
    })

    // A fonte web altera a altura do conteúdo quando termina de carregar.
    // Com movimento ligado quem faz isso é a tela de carregamento, uma vez só
    // e com o contador parado (aqui seria um segundo refresh, no meio da
    // contagem, e travava o contador no celular).
    mm.add('(prefers-reduced-motion: reduce)', () => {
      document.fonts?.ready.then(() => ScrollTrigger.refresh())
    })

    return () => mm.revert()
  }, [])

  return (
    <div ref={wrapperRef} id="smooth-wrapper">
      <div ref={contentRef} id="smooth-content">
        {children}
      </div>
    </div>
  )
}

export default SmoothScroll
