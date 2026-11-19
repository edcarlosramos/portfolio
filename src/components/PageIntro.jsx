import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MOTION_OK } from '../constants'
import { heroReady, markHeroPrepare, markIntroDone, markIntroEnd } from '../utils/intro'

gsap.registerPlugin(ScrollTrigger)

// Revelação de entrada da página, sem tela de carregamento: o card do hero
// sobe e aparece, os itens dele entram em cascata e a navbar desce no fim.
// Elementos animados (de fora): `[data-hero-card]`, `[data-hero-item]`
// (Hero) e `[data-site-nav]` (Navbar). Não desenha nada.
//
// Antes de começar, espera a fonte e o preparo do "Ramos." em WebGL (com um
// teto curto), para os itens não entrarem com a fonte errada nem o vidro
// surgir depois. Os loops contínuos do hero (blobs, render do WebGL) só
// começam no fim (`markIntroEnd`), deixando a GPU livre para a revelação.

// Teto de espera pela fonte e pelo WebGL antes de revelar (s).
const READY_TIMEOUT = 1.2

const withTimeout = (promise, seconds) =>
  Promise.race([promise, new Promise((resolve) => setTimeout(resolve, seconds * 1000))])
const nextPaint = () =>
  new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))

const PageIntro = () => {
  useLayoutEffect(() => {
    // Libera o preparo do WebGL do hero já na montagem.
    markHeroPrepare()

    if (!window.matchMedia(MOTION_OK).matches) {
      markIntroDone()
      markIntroEnd()
      return undefined
    }

    // No modo de desenvolvimento o React monta os efeitos duas vezes; as
    // promessas da primeira montagem não podem disparar a revelação.
    let alive = true
    const card = document.querySelector('[data-hero-card]')
    const items = gsap.utils.toArray('[data-hero-item]')
    const nav = document.querySelector('[data-site-nav]')

    const ctx = gsap.context(() => {
      // Estado inicial antes da primeira pintura (sem "piscar" o hero pronto).
      if (card) gsap.set(card, { autoAlpha: 0, y: 70, scale: 0.965, willChange: 'transform, opacity' })
      gsap.set(items, { autoAlpha: 0, y: 56 })
      if (nav) gsap.set(nav, { autoAlpha: 0, y: -20 })
    })

    const ready = Promise.all([document.fonts?.ready ?? Promise.resolve(), heroReady])

    withTimeout(ready, READY_TIMEOUT)
      .then(() => {
        if (!alive) return undefined
        // Medidas das seções com a fonte final, uma vez só e antes do
        // movimento (o ScrollTrigger não se recalcula sozinho no `load`, ver
        // SmoothScroll.jsx).
        ScrollTrigger.refresh()
        return nextPaint()
      })
      .then(() => {
        if (!alive) return
        markIntroDone()
        ctx.add(() => {
          const tl = gsap.timeline({
            onComplete: () => {
              // O card mantém a própria camada de GPU (removê-la forçaria
              // repintar todo o hero de uma vez).
              if (card) gsap.set(card, { clearProps: 'transform,opacity,visibility' })
              gsap.set(items, { clearProps: 'transform,opacity,visibility' })
              if (nav) gsap.set(nav, { clearProps: 'transform,opacity,visibility' })
              markIntroEnd()
            },
          })

          if (card) {
            tl.to(card, { y: 0, scale: 1, duration: 1.5, ease: 'expo.out' }, 0)
              .to(card, { autoAlpha: 1, duration: 0.8, ease: 'power2.out' }, 0)
          }
          tl.to(items, { autoAlpha: 1, y: 0, duration: 1.2, ease: 'expo.out', stagger: 0.12 }, 0.3)
          if (nav) tl.to(nav, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 0.55)
        })
      })

    return () => {
      alive = false
      ctx.revert()
    }
  }, [])

  return null
}

export default PageIntro
