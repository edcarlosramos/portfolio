import React, { useRef, useEffect } from 'react'
import gsap from 'gsap'
import styles from '../styles'
import { MOTION_OK, skillGroups, softSkills } from '../constants'

// Cópias da lista no letreiro: garante que ele cubra telas largas e que o
// loop (deslocar exatamente uma cópia) não tenha emenda visível.
const MARQUEE_COPIES = 4

const pillBase =
  'font-sans font-medium leading-none whitespace-nowrap text-dim-white text-[clamp(13px,1.6vw,23px)] rounded-[clamp(8px,1.1vw,16px)] px-[0.9em] py-[0.5em] shadow-inner-lightcard'

const Skills = () => {
  const marqueeRef = useRef(null)

  useEffect(() => {
    const mm = gsap.matchMedia()

    mm.add(MOTION_OK, () => {
      gsap.to(marqueeRef.current, {
        xPercent: -100 / MARQUEE_COPIES,
        duration: 26,
        ease: 'none',
        repeat: -1,
      })
    })

    return () => mm.revert()
  }, [])

  return (
    <section
      aria-labelledby="skills-title"
      data-nav-theme="light"
      className={`overflow-hidden ${styles.sectionY}`}
    >
      <h2 id="skills-title" className="sr-only">
        Habilidades
      </h2>

      <div className={`${styles.container} flex flex-col items-center gap-[clamp(10px,1.2vw,16px)]`}>
        {skillGroups.map((group) => (
          <ul
            key={group.id}
            data-reveal
            aria-label={group.label}
            className="flex flex-wrap justify-center gap-[clamp(6px,0.9vw,12px)] rounded-[clamp(14px,1.8vw,24px)] border-2 border-blueton-bg/70 bg-dim-sky/45 p-[clamp(6px,0.7vw,10px)]"
          >
            {group.items.map((skill) => (
              <li key={skill} className={`${pillBase} bg-dim-bluestrong`}>
                {skill}
              </li>
            ))}
          </ul>
        ))}
      </div>

      <div data-reveal className="mt-[clamp(10px,1.2vw,16px)]">
        <div ref={marqueeRef} className="flex w-max will-change-transform">
          {Array.from({ length: MARQUEE_COPIES }, (_, copy) => (
            <ul
              key={copy}
              aria-hidden={copy > 0}
              aria-label={copy === 0 ? 'Habilidades interpessoais' : undefined}
              className="flex shrink-0 gap-[clamp(8px,1.2vw,16px)] pr-[clamp(8px,1.2vw,16px)]"
            >
              {softSkills.map((skill) => (
                <li key={skill} className={`${pillBase} bg-blueton-bg`}>
                  {skill}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Skills
