import React from 'react'
import styles from '../styles'
import { about } from '../constants'
import { scrollToSection } from '../utils/scroll'
import SectionHeader from './SectionHeader'

const About = () => {
  const handleContactClick = (event) => {
    event.preventDefault()
    scrollToSection('contato')
  }

  return (
    <section id="sobre" data-nav-theme="light" className={styles.sectionY}>
      <div className={styles.container}>
        <SectionHeader title="Sobre mim" linkLabel="mais" />

        <div className="mt-[clamp(24px,3vw,44px)] grid items-start gap-[clamp(28px,4vw,56px)] sm:grid-cols-[minmax(0,773fr)_minmax(0,394fr)]">
          <div>
            <div className="flex flex-col gap-[1.2em] font-sans leading-[1.45] text-dim-navy text-[clamp(15px,1.4vw,20px)] sm:text-justify">
              {about.paragraphs.map((paragraph) => (
                <p key={paragraph} data-reveal>
                  {paragraph}
                </p>
              ))}
            </div>

            <a
              data-reveal
              href="#contato"
              onClick={handleContactClick}
              className={`${styles.focusRing} mt-[clamp(20px,2vw,28px)] inline-flex items-center rounded-[clamp(8px,0.8vw,12px)] px-[1.1em] py-[0.6em] font-sans font-medium leading-none text-dim-white text-[clamp(14px,1.25vw,18px)] bg-dim-bluestrong shadow-inner-lightcard transition-colors duration-300 hover:bg-blueton-bg`}
            >
              Contato
            </a>
          </div>

          <figure
            data-reveal
            className="order-first w-full max-w-[394px] aspect-[394/555] overflow-hidden rounded-[clamp(16px,2vw,28px)] shadow-card sm:order-none sm:justify-self-end"
          >
            {about.photo ? (
              <img
                src={about.photo}
                alt={about.photoAlt}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                role="img"
                aria-label={about.photoAlt}
                className="flex h-full w-full items-center justify-center bg-linear-to-b from-dim-blue to-dim-sky"
              >
                <span className="font-sans font-semibold tracking-[-0.02em] text-dim-white/80 text-[clamp(64px,9vw,128px)]">
                  ER
                </span>
              </div>
            )}
          </figure>
        </div>
      </div>
    </section>
  )
}

export default About
