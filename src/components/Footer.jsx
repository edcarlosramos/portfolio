import React, { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from '../styles'
import { MOTION_OK, socialMedia } from '../constants'

gsap.registerPlugin(ScrollTrigger)

const SOCIAL_ICON_PATHS = {
  linkedin:
    'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  x: 'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z',
}

const Footer = () => {
  const footerRef = useRef(null)
  const titleRef = useRef(null)

  // O letreiro sobe até a posição final conforme o rodapé entra na tela.
  useEffect(() => {
    const mm = gsap.matchMedia()

    mm.add(MOTION_OK, () => {
      gsap.from(titleRef.current, {
        yPercent: 45,
        ease: 'none',
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top bottom',
          end: 'bottom bottom',
          scrub: true,
        },
      })
    })

    return () => mm.revert()
  }, [])

  return (
    <footer
      ref={footerRef}
      className="relative -mt-px overflow-hidden bg-linear-to-b from-hugewhite-bg via-blueton-bg via-45% to-hugeblack-bg pt-[clamp(56px,9vw,130px)]"
    >
      <p
        ref={titleRef}
        aria-hidden="true"
        className={`${styles.fadetitle} select-none text-center font-sans font-semibold tracking-[-0.02em] leading-[0.82] text-[20vw] whitespace-nowrap`}
      >
        contato
      </p>

      <ul className="absolute right-[clamp(12px,2vw,36px)] bottom-[clamp(10px,1.4vw,20px)] flex items-center gap-[clamp(8px,1vw,14px)]">
        {socialMedia.map((social) => (
          <li key={social.id}>
            <a
              href={social.href ?? undefined}
              aria-label={social.label}
              className={`${styles.focusRing} block text-dim-blue transition-colors duration-300 hover:text-dim-white`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
                className="size-[clamp(20px,2.2vw,32px)]"
              >
                <path d={SOCIAL_ICON_PATHS[social.id]} />
              </svg>
            </a>
          </li>
        ))}
      </ul>
    </footer>
  )
}

export default Footer
