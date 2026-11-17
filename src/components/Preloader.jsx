import React, { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollSmoother } from 'gsap/ScrollSmoother'
import { MOTION_OK } from '../constants'
import { heroReady, markIntroDone } from '../utils/intro'

gsap.registerPlugin(ScrollTrigger)

// Tempo mínimo na tela (s): mesmo com tudo em cache, o contador tem tempo de
// correr e a entrada não vira um "piscar".
const MIN_DURATION = 1.6
// Teto de espera pelo preparo do hero (s): se algo falhar, a tela sai mesmo assim.
const HERO_TIMEOUT = 4

const withTimeout = (promise, seconds) =>
  Promise.race([promise, new Promise((resolve) => setTimeout(resolve, seconds * 1000))])

// Espera dois quadros: garante que o navegador já pintou (e rasterizou) o que
// mudou antes de seguir.
const nextPaint = () =>
  new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))

// O que conta como "carregado". Cada etapa concluída avança o alvo do
// contador; ele só chega a 100 quando todas terminam.
const loadSteps = () => [
  document.fonts?.ready ?? Promise.resolve(),
  document.readyState === 'complete'
    ? Promise.resolve()
    : new Promise((resolve) => window.addEventListener('load', resolve, { once: true })),
  // Shader e máscara do "Ramos." prontos (trabalho pesado feito escondido).
  withTimeout(heroReady, HERO_TIMEOUT),
]

// Tela de carregamento: contador 0–100 ligado ao carregamento real, uma luz
// azul que cresce com o progresso e, no fim, a tela sobe em duas camadas
// (escura na frente, azul atrás) revelando o hero, que entra subindo.
// Elementos de fora animados na entrada: `[data-hero-card]` (Hero) e
// `[data-site-nav]` (Navbar).
//
// Desempenho: tudo o que anima na transição usa só `transform` e `opacity`
// (rodam na GPU, sem repintar). O trabalho pesado (WebGL, medidas do
// ScrollTrigger) acontece enquanto a tela ainda cobre o site.
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
    if (done) {
      markIntroDone()
      return undefined
    }
    // No modo de desenvolvimento o React monta os efeitos duas vezes; as
    // promessas da primeira montagem não podem disparar a saída.
    let alive = true

    const heroCard = document.querySelector('[data-hero-card]')
    const nav = document.querySelector('[data-site-nav]')

    // Página travada enquanto carrega. O smoother pausado já impede a rolagem;
    // não mexemos no `overflow` do <html>: isso some/volta com a barra de
    // rolagem no desktop, muda a largura da página no fim da transição e
    // dispara um re-layout completo (e a reconstrução do WebGL) no pior momento.
    const smoother = ScrollSmoother.get()
    smoother?.paused(true)
    window.scrollTo(0, 0)

    const ctx = gsap.context(() => {
      // `opacity` (e não `visibility`) + `will-change`: o hero continua sendo
      // pintado por trás da tela, então quando ela sai ele já está pronto na
      // GPU, sem o "engasgo" de rasterizar tudo no primeiro quadro.
      if (heroCard) gsap.set(heroCard, { y: 120, scale: 0.94, opacity: 0, willChange: 'transform, opacity' })
      if (nav) gsap.set(nav, { y: -24, opacity: 0, willChange: 'transform, opacity' })

      // Setters rápidos: sem criar um tween por quadro.
      const setBar = gsap.quickSetter(barRef.current, 'scaleX')
      const setGlowScale = gsap.quickSetter(glowRef.current, 'scale')
      const setGlowAlpha = gsap.quickSetter(glowRef.current, 'opacity')

      const progress = { value: 0 }
      let shown = -1
      const render = () => {
        const p = progress.value / 100
        setBar(p)
        setGlowScale(0.2 + p * 0.8)
        setGlowAlpha(0.25 + p * 0.75)
        // Só toca no texto quando o número muda (trocar texto força layout).
        const v = Math.round(progress.value)
        if (v !== shown) {
          shown = v
          countRef.current.textContent = String(v).padStart(3, '0')
        }
      }
      render()

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

      Promise.all([...steps, minTime])
        .then(() => {
          if (!alive) return undefined
          // Medidas pesadas ainda com a tela cobrindo tudo (antes eram feitas
          // no último quadro da transição e causavam o travamento no final).
          ScrollTrigger.refresh()
          return nextPaint()
        })
        .then(() => {
          if (!alive) return
          const tl = gsap.timeline({
            onComplete: () => {
              // Só limpa o que animou; o card mantém a própria camada de GPU
              // (removê-la forçaria repintar todo o hero de uma vez).
              if (heroCard) gsap.set(heroCard, { clearProps: 'transform,opacity' })
              if (nav) gsap.set(nav, { clearProps: 'transform,opacity,willChange' })
              smoother?.paused(false)
              setDone(true)
            },
          })

          tl.to(progress, { value: 100, duration: 0.5, ease: 'power2.inOut', overwrite: true, onUpdate: render })
            .to({}, { duration: 0.15 })
            // O contador parou: libera os loops do hero (ex.: WebGL), que
            // precisam estar vivos quando ele aparecer.
            .call(markIntroDone)
            // Conteúdo da tela sai subindo, em cascata.
            .to(contentRef.current.children, {
              yPercent: -60,
              opacity: 0,
              duration: 0.55,
              ease: 'power3.in',
              stagger: 0.06,
            })
            .to(glowRef.current, { scale: 1.4, opacity: 0, duration: 0.6, ease: 'power2.in' }, '<')
            // A tela sobe: camada escura na frente, a azul logo atrás.
            // `yPercent` (transform) em vez de `clip-path`, que repinta a tela
            // inteira a cada quadro.
            .to(frontRef.current, { yPercent: -100, duration: 1.1, ease: 'expo.inOut' }, '-=0.15')
            .to(backRef.current, { yPercent: -100, duration: 1.1, ease: 'expo.inOut' }, '<0.12')
            // O hero entra subindo enquanto a tela sai.
            .to(heroCard, { y: 0, scale: 1, opacity: 1, duration: 1.3, ease: 'expo.out' }, '<0.35')
            .to(nav, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, '<0.4')
        })
    }, rootRef)

    return () => {
      alive = false
      ctx.revert()
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
      className="fixed inset-0 z-[100] cursor-wait overflow-hidden touch-none"
    >
      {/* Camada azul de trás: aparece como uma faixa logo atrás da escura. */}
      <div
        ref={backRef}
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-b from-dim-bluestrong to-blueton-bg will-change-transform"
      />

      <div
        ref={frontRef}
        className="absolute inset-0 overflow-hidden bg-hugeblack-bg will-change-transform"
      >
        {/* Luz que cresce com o progresso, ecoando a luz do hero. O degradê
            radial já é suave: sem `filter: blur`, que numa camada desse
            tamanho é o efeito mais caro da página (sobretudo no celular). */}
        <div
          ref={glowRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-[calc(50%-min(70vw,700px))] top-[calc(100%-min(70vw,700px))] size-[min(140vw,1400px)] rounded-full bg-[radial-gradient(circle,var(--color-dim-sky)_0%,color-mix(in_oklab,var(--color-blueton-bg)_85%,transparent)_38%,color-mix(in_oklab,var(--color-blueton-bg)_30%,transparent)_55%,transparent_70%)] will-change-[transform,opacity]"
        />

        <div
          ref={contentRef}
          className="relative flex h-full flex-col justify-between px-[clamp(20px,5vw,72px)] py-[clamp(20px,4vw,56px)]"
        >
          <p className="font-sans font-medium tracking-[-0.01em] text-dim-mist/70 text-[clamp(14px,1.3vw,18px)]">
            Edcarlos Ramos — Portfólio
          </p>

          <div>
            {/* Mesmo degradê do título, mas sem `drop-shadow`: aqui o texto
                muda a cada quadro e a sombra desfocada era repintada junto. */}
            <p
              aria-hidden="true"
              className="bg-linear-to-b from-[#FFFFFF] from-[28%] to-[#C3F2FF] to-[81%] bg-clip-text text-transparent font-sans font-semibold tracking-[-0.04em] leading-[0.8] tabular-nums text-[clamp(96px,22vw,320px)]"
            >
              <span ref={countRef}>000</span>
            </p>
            <div className="mt-[clamp(16px,2vw,28px)] h-px w-full bg-dim-mist/15">
              <div ref={barRef} className="h-full w-full origin-left bg-dim-turk" />
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
