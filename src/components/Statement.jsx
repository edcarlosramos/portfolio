import React, { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import styles from '../styles'
import { MOTION_OK, statement } from '../constants'

gsap.registerPlugin(ScrollTrigger, SplitText)

const Statement = () => {
  const textRef = useRef(null)

  // Cada palavra "acende" conforme a rolagem avança.
  useEffect(() => {
    const mm = gsap.matchMedia()

    mm.add(MOTION_OK, () => {
      const split = SplitText.create(textRef.current, { type: 'words' })

      gsap.fromTo(
        split.words,
        { opacity: 0.15 },
        {
          opacity: 1,
          ease: 'none',
          stagger: 0.1,
          scrollTrigger: {
            trigger: textRef.current,
            start: 'top 85%',
            end: 'bottom 55%',
            scrub: true,
          },
        },
      )

      return () => split.revert()
    })

    return () => mm.revert()
  }, [])

  return (
    <section
      aria-label="Apresentação"
      className="relative z-10 pt-[clamp(24px,5vw,72px)] pb-[clamp(8px,2vw,24px)]"
    >
      <div className={styles.container}>
        <div
          data-reveal
          data-nav-theme="light"
          className="mx-auto flex w-full max-w-[1237px] items-center justify-center min-h-[clamp(260px,41.5vw,598px)] rounded-[clamp(16px,2.4vw,32px)] px-[clamp(20px,5vw,72px)] py-[clamp(40px,6vw,80px)] bg-hugewhite-bg"
        >
          <p
            ref={textRef}
            className="max-w-[12.5em] text-center text-balance font-sans font-semibold tracking-[-0.02em] leading-[1.1] text-dim-navy text-[clamp(26px,4.4vw,64px)]"
          >
            {statement}
          </p>
        </div>
      </div>
    </section>
  )
}

export default Statement
