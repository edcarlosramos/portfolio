import React, { useRef, useEffect } from 'react'
import gsap from 'gsap'
import styles from '../styles'
import { MOTION_OK, projects } from '../constants'
import SectionHeader from './SectionHeader'
import SpinText from './SpinText'

// Distância mínima (px) para um clique virar arrasto; abaixo disso o clique
// segue normal (ex.: o link "sobre" do card).
const DRAG_THRESHOLD = 6

// Com o mouse, clicar, segurar e arrastar para o lado move a fileira; ao soltar
// ela continua um pouco no embalo. No toque o trilho já desliza nativamente,
// então só o mouse (pointerType "mouse") passa por aqui.
const useDragScroll = (trackRef) => {
  useEffect(() => {
    const track = trackRef.current
    if (!track) return undefined

    let pointerId = null
    let startX = 0
    let startScroll = 0
    let dragged = false
    let lastX = 0
    let lastTime = 0
    let velocity = 0 // px por ms
    const reduceMotion = !window.matchMedia(MOTION_OK).matches

    const onPointerDown = (event) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return
      gsap.killTweensOf(track)
      pointerId = event.pointerId
      startX = lastX = event.clientX
      startScroll = track.scrollLeft
      lastTime = performance.now()
      velocity = 0
      dragged = false
    }

    const onPointerMove = (event) => {
      if (event.pointerId !== pointerId) return
      const dx = event.clientX - startX
      if (!dragged) {
        if (Math.abs(dx) < DRAG_THRESHOLD) return
        dragged = true
        track.setPointerCapture(pointerId)
        track.dataset.dragging = ''
      }
      track.scrollLeft = startScroll - dx
      const now = performance.now()
      const dt = now - lastTime
      if (dt > 0) velocity = 0.8 * ((event.clientX - lastX) / dt) + 0.2 * velocity
      lastX = event.clientX
      lastTime = now
    }

    const onPointerUp = (event) => {
      if (event.pointerId !== pointerId) return
      pointerId = null
      if (!dragged) return
      delete track.dataset.dragging
      if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId)
      // Embalo: segue na direção do arrasto e desacelera.
      const idle = performance.now() - lastTime > 80
      if (!reduceMotion && !idle && Math.abs(velocity) > 0.05) {
        gsap.to(track, {
          scrollLeft: track.scrollLeft - velocity * 350,
          duration: 0.9,
          ease: 'power3.out',
        })
      }
    }

    // Depois de um arrasto, o clique que o navegador dispara ao soltar não
    // deve abrir links dos cards.
    const onClick = (event) => {
      if (!dragged) return
      event.preventDefault()
      event.stopPropagation()
      dragged = false
    }

    // Arrasto nativo de imagens/links atrapalharia o arrasto da fileira.
    const onDragStart = (event) => event.preventDefault()

    track.addEventListener('pointerdown', onPointerDown)
    track.addEventListener('pointermove', onPointerMove)
    track.addEventListener('pointerup', onPointerUp)
    track.addEventListener('pointercancel', onPointerUp)
    track.addEventListener('click', onClick, true)
    track.addEventListener('dragstart', onDragStart)

    return () => {
      gsap.killTweensOf(track)
      track.removeEventListener('pointerdown', onPointerDown)
      track.removeEventListener('pointermove', onPointerMove)
      track.removeEventListener('pointerup', onPointerUp)
      track.removeEventListener('pointercancel', onPointerUp)
      track.removeEventListener('click', onClick, true)
      track.removeEventListener('dragstart', onDragStart)
    }
  }, [trackRef])
}

const ProjectCard = ({ project }) => (
  <article className="flex h-full flex-col rounded-[clamp(16px,2vw,28px)] p-[clamp(12px,1.7vw,24px)] bg-dim-white shadow-card">
    <div className="aspect-[415/390] overflow-hidden rounded-[clamp(10px,1.4vw,20px)]">
      {project.image ? (
        <img
          src={project.image}
          alt={`Prévia do projeto ${project.name}`}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex h-full w-full items-end p-[clamp(12px,1.6vw,22px)] bg-linear-to-br from-blueton-bg from-10% via-dim-bluestrong to-dim-turk"
        >
          <span className="font-sans font-semibold tracking-[-0.02em] leading-none text-dim-white/90 text-[clamp(28px,3.4vw,48px)]">
            {project.name}
          </span>
        </div>
      )}
    </div>

    <div className="mt-[clamp(14px,1.8vw,26px)] flex items-baseline justify-between gap-4">
      <h3 className="font-sans font-bold tracking-[-0.03em] leading-none text-dim-navy text-[clamp(20px,2vw,28px)]">
        {project.name}
      </h3>
      <a
        href={project.href ?? undefined}
        aria-label={`Sobre o projeto ${project.name}`}
        className={`${styles.focusRing} cursor-pointer font-sans font-medium text-dim-navy text-[clamp(12px,1vw,14px)]`}
      >
        <SpinText text="sobre" />
      </a>
    </div>

    <p className="mt-[clamp(8px,1vw,14px)] font-sans font-medium leading-tight text-dim-navy text-[clamp(14px,1.25vw,18px)]">
      {project.description}
    </p>
    <p className="mt-[clamp(4px,0.6vw,8px)] font-sans leading-tight text-dim-navy/60 text-[clamp(12px,1vw,14px)]">
      {project.roles.join(', ')}
    </p>
  </article>
)

// Deixa a fileira centralizada: se os cards cabem, o CSS (justify-center-safe)
// centra; se não cabem, ela começa rolada até o meio. Recentraliza quando a
// janela muda de tamanho, até a pessoa mexer na fileira.
const useCenteredTrack = (trackRef) => {
  useEffect(() => {
    const track = trackRef.current
    if (!track) return undefined
    let touched = false
    const center = () => {
      if (!touched) track.scrollLeft = (track.scrollWidth - track.clientWidth) / 2
    }
    const markTouched = () => {
      touched = true
    }
    center()
    const observer = new ResizeObserver(center)
    observer.observe(track)
    const events = ['pointerdown', 'wheel', 'touchstart', 'keydown']
    events.forEach((type) => track.addEventListener(type, markTouched, { passive: true }))
    return () => {
      observer.disconnect()
      events.forEach((type) => track.removeEventListener(type, markTouched))
    }
  }, [trackRef])
}

// A fileira de cards fica parada durante a rolagem da página; ela se move ao
// arrastar com o mouse, deslizar no toque, rolar na horizontal pelo trackpad
// ou pelas setas do teclado (o trilho é um scroll nativo).
const Projects = () => {
  const sectionRef = useRef(null)
  const trackRef = useRef(null)
  useDragScroll(trackRef)
  useCenteredTrack(trackRef)

  return (
    <section
      id="projetos"
      data-nav-theme="light"
      ref={sectionRef}
      className={styles.sectionY}
    >
      <div className={styles.container}>
        <SectionHeader title="Projetos" linkLabel="mais" />
      </div>

      {/* O trilho rola na horizontal, e `overflow-x: auto` também corta o que
          passa em cima e embaixo: o fundo precisa de espaço para a sombra
          inteira do card (~28px), senão ela termina numa linha dura. A margem
          negativa devolve esse espaço extra, mantendo o espaçamento da seção. */}
      <ul
        ref={trackRef}
        tabIndex={0}
        aria-label="Lista de projetos"
        className={`${styles.focusRing} no-scrollbar mt-[clamp(8px,1.6vw,24px)] flex justify-center-safe gap-[clamp(16px,4.4vw,64px)] overflow-x-auto cursor-grab select-none data-dragging:cursor-grabbing px-[clamp(20px,7vw,100px)] pt-[clamp(16px,2vw,32px)] pb-10 -mb-[calc(40px-clamp(16px,2vw,32px))]`}
      >
        {projects.map((project) => (
          <li
            key={project.id}
            data-reveal
            className="shrink-0 w-[clamp(260px,33vw,473px)]"
          >
            <ProjectCard project={project} />
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Projects
