import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MOTION_OK } from '../constants'

gsap.registerPlugin(ScrollTrigger)

// Revela (fade + subida) todo elemento marcado com `data-reveal` dentro do
// escopo quando ele entra na viewport. Elementos que entram juntos são
// animados em cascata.
const useScrollReveal = (scopeRef) => {
  useEffect(() => {
    const mm = gsap.matchMedia()

    mm.add(MOTION_OK, () => {
      const targets = gsap.utils.toArray('[data-reveal]', scopeRef.current)
      gsap.set(targets, { autoAlpha: 0, y: 40 })

      ScrollTrigger.batch(targets, {
        start: 'top 88%',
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            stagger: 0.08,
            overwrite: true,
          }),
      })
    })

    return () => mm.revert()
  }, [scopeRef])
}

export default useScrollReveal
