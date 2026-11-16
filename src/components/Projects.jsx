import React, { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from '../styles'
import { MOTION_OK, projects } from '../constants'
import SectionHeader from './SectionHeader'

gsap.registerPlugin(ScrollTrigger)

const ProjectCard = ({ project }) => (
  <article className="flex h-full flex-col rounded-[clamp(16px,2vw,28px)] p-[clamp(12px,1.7vw,24px)] bg-dim-white shadow-card">
    <div className="aspect-[422/294] overflow-hidden rounded-[clamp(10px,1.4vw,20px)]">
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
        className={`${styles.focusRing} font-sans font-medium text-dim-navy text-[clamp(12px,1vw,14px)] underline underline-offset-[0.2em] transition-colors duration-300 hover:text-dim-bluestrong`}
      >
        sobre
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

const Projects = () => {
  const sectionRef = useRef(null)
  const trackRef = useRef(null)

  // A fileira de cards desliza na horizontal acompanhando a rolagem vertical.
  // Como o trilho é um scroll nativo, arrastar/teclado continuam funcionando.
  useEffect(() => {
    const mm = gsap.matchMedia()

    mm.add(MOTION_OK, () => {
      const track = trackRef.current

      gsap.to(track, {
        scrollLeft: () => track.scrollWidth - track.clientWidth,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          invalidateOnRefresh: true,
        },
      })
    })

    return () => mm.revert()
  }, [])

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

      <ul
        ref={trackRef}
        tabIndex={0}
        aria-label="Lista de projetos"
        className={`${styles.focusRing} no-scrollbar mt-[clamp(8px,1.6vw,24px)] flex gap-[clamp(16px,4.4vw,64px)] overflow-x-auto px-[clamp(20px,7vw,100px)] py-[clamp(16px,2vw,32px)]`}
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
