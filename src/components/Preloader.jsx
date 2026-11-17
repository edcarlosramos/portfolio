import React, { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollSmoother } from 'gsap/ScrollSmoother'
import styles from '../styles'
import { MOTION_OK } from '../constants'

gsap.registerPlugin(ScrollTrigger)

// Tempo mínimo na tela (s): mesmo com tudo em cache, o contador tem tempo de
// correr e a entrada não vira um "piscar".
const MIN_DURATION = 1.6

// O que conta como "carregado". Cada etapa concluída avança o alvo do
// contador; ele só chega a 100 quando todas terminam.
const loadSteps = () => [
  document.fonts?.ready ?? Promise.resolve(),
  document.readyState === 'complete'
    ? Promise.resolve()
    : new Promise((resolve) => window.addEventListener('load', resolve, { once: true })),
]

// Tela de carregamento: contador 0–100 ligado ao carregamento real, uma luz
// azul que cresce com o progresso e, no fim, a tela sobe em duas camadas
// (escura na frente, azul atrás) revelando o hero, que entra subindo.
// Elementos de fora animados na entrada: `[data-hero-card]` (Hero) e
// `[data-site-nav]` (Navbar).
const Preloader = () => {
  // Com "reduzir movimento" ligado no sistema, a tela nem aparece.
  const [done, setDone] = useState(() => !window.matchMedia(MOTION_OK).matches)
  const rootRef = useRef(null)
  const frontRef = useRef(null)
  const backRef = useRef(null)
  const countRef = useRef(null)
  const barRef = useRef(null)
  const glowRef = useRef(null)
  const contentRef = useRef(null)

  useLayoutEffect(() => {
    if (done) return undefined
    const root = document.documentElement
    // No modo de desenvolvimento o React monta os efeitos duas vezes; as
    // promessas da primeira montagem não podem disparar a saída.
    let alive = true

    const heroCard = document.querySelector('[data-hero-card]')
    const nav = document.querySelector('[data-site-nav]')
    const pageTargets = [heroCard, nav].filter(Boolean)

    // Página travada enquanto carrega.
    root.style.overflow = 'hidden'
    const smoother = ScrollSmoother.get()
    smoother?.paused(true)
    window.scrollTo(0, 0)

    const ctx = gsap.context(() => {
      if (heroCard) gsap.set(heroCard, { y: 120, scale: 0.94, autoAlpha: 0 })
      if (nav) gsap.set(nav, { y: -24, autoAlpha: 0 })
      gsap.set(barRef.current, { scaleX: 0, transformOrigin: 'left center' })
      gsap.set(glowRef.current, { scale: 0.2, autoAlpha: 0 })

      const progress = { value: 0 }
      const render = () => {
        const v = Math.round(progress.value)
        countRef.current.textContent = String(v).padStart(3, '0')
        gsap.set(barRef.current, { scaleX: progress.value / 100 })
        gsap.set(glowRef.current, { scale: 0.2 + (progress.value / 100) * 0.8, autoAlpha: 0.25 + (progress.value / 100) * 0.75 })
      }

      // O contador persegue um alvo que sobe a cada etapa concluída.
      const chase = (target, duration) =>
        gsap.to(progress, { value: target, duration, ease: 'power2.out', overwrite: true, onUpdate: render })

      const steps = loadSteps()
      let finished = 0
      // Começa andando sozinho até ~30% para dar vida enquanto nada terminou.
      chase(30, 0.8)
      steps.forEach((step) =>
        step.then(() => {
          if (!alive) return
          finished += 1
          chase(30 + (finished / steps.length) * 60, 0.6)
        }),
      )

      const minTime = new Promise((resolve) => gsap.delayedCall(MIN_DURATION, resolve))

      Promise.all([...steps, minTime]).then(() => {
        if (!alive) return
        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set(pageTargets, { clearProps: 'all' })
            root.style.overflow = ''
            smoother?.paused(false)
            ScrollTrigger.refresh()
            setDone(true)
          },
        })

        tl.to(progress, { value: 100, duration: 0.5, ease: 'power2.inOut', overwrite: true, onUpdate: render })
          .to({}, { duration: 0.15 })
          // Conteúdo da tela sai subindo, em cascata.
          .to(contentRef.current.children, {
            yPercent: -60,
            autoAlpha: 0,
            duration: 0.55,
            ease: 'power3.in',
            stagger: 0.06,
          })
          .to(glowRef.current, { scale: 1.4, autoAlpha: 0, duration: 0.6, ease: 'power2.in' }, '<')
          // A tela sobe: camada escura na frente, a azul logo atrás.
          .to(frontRef.current, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.1, ease: 'expo.inOut' }, '-=0.15')
          .to(backRef.current, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.1, ease: 'expo.inOut' }, '<0.12')
          // O hero entra subindo enquanto a tela sai.
          .to(heroCard, { y: 0, scale: 1, autoAlpha: 1, duration: 1.3, ease: 'expo.out' }, '<0.35')
          .to(nav, { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out' }, '<0.4')
      })
    }, rootRef)

    return () => {
      alive = false
      ctx.revert()
      root.style.overflow = ''
      smoother?.paused(false)
    }
    // Só roda na montagem; `done` só muda no fim da própria animação.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (done) return null

  return (
    <div
      ref={rootRef}
      role="status"
      aria-live="polite"
      aria-label="Carregando o site"
      className="fixed inset-0 z-[100] cursor-wait"
    >
      {/* Camada azul de trás: aparece como uma faixa logo atrás da escura. */}
      <div
        ref={backRef}
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-b from-dim-bluestrong to-blueton-bg [clip-path:inset(0%_0%_0%_0%)]"
      />

      <div
        ref={frontRef}
        className="absolute inset-0 overflow-hidden bg-hugeblack-bg [clip-path:inset(0%_0%_0%_0%)]"
      >
        {/* Luz que cresce com o progresso, ecoando a luz do hero. */}
        <div
          ref={glowRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-full size-[min(140vw,1400px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--color-dim-sky)_0%,var(--color-blueton-bg)_40%,transparent_70%)] blur-2xl"
        />

        <div
          ref={contentRef}
          className="relative flex h-full flex-col justify-between px-[clamp(20px,5vw,72px)] py-[clamp(20px,4vw,56px)]"
        >
          <p className="font-sans font-medium tracking-[-0.01em] text-dim-mist/70 text-[clamp(14px,1.3vw,18px)]">
            Edcarlos Ramos — Portfólio
          </p>

          <div>
            <p
              aria-hidden="true"
              className={`${styles.fadetitle} font-sans font-semibold tracking-[-0.04em] leading-[0.8] tabular-nums text-[clamp(96px,22vw,320px)]`}
            >
              <span ref={countRef}>000</span>
            </p>
            <div className="mt-[clamp(16px,2vw,28px)] h-px w-full bg-dim-mist/15">
              <div ref={barRef} className="h-full w-full bg-dim-turk" />
            </div>
            <div className="mt-3 flex justify-between font-sans text-dim-mist/50 text-[clamp(12px,1vw,14px)]">
              <span>Carregando</span>
              <span>Analista de dados · Dev · Product Manager</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Preloader
