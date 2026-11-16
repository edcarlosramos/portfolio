import React, { useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollSmoother } from 'gsap/ScrollSmoother'
import { MOTION_OK } from '../constants'

gsap.registerPlugin(ScrollTrigger, ScrollSmoother)

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
    document.fonts?.ready.then(() => ScrollTrigger.refresh())

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
