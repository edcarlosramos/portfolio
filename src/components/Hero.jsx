import React, { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import styles from '../styles'
import MeshGradientBackground from './Meshgradientbackground'

gsap.registerPlugin(ScrambleTextPlugin)

const ROLES = [
  'Analista de dados',
  'Desenvolvedor Web',
  'Product Manager',
  'Analista de dados'
]

const Hero = () => {
  const roleRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1 })

      ROLES.forEach((role, index) => {
        if (index === 0) {
          tl.to({}, { duration: 2.5 })
        } else {
          tl.to(roleRef.current, {
            duration: 1.2,
            scrambleText: {
              text: role,
              chars: ' ',
              revealDelay: 0.2,
              speed: 0.4,
            },
            ease: 'power2.inOut',
          }).to({}, { duration: 2 })
        }
      })
    }, roleRef)

    return () => ctx.revert()
  }, [])

  return (
    <div className="flex w-full justify-center items-center min-h-screen px-2.5 py-2.5 bg-hugeblack-bg">
      <div className="relative isolate @container flex w-full max-w-[1345px] h-[clamp(700px,calc(14.6cqw+641.6px),838px)] rounded-[clamp(16px,3cqw,32px)] justify-start items-center overflow-hidden py-[6cqw] 
      bg-linear-to-t from-hugeblack-bg from-0% to-blueton-bg to-100% shadow-inner-light">
        <MeshGradientBackground />

        <div className="relative z-10 flex flex-col w-full pl-[1cqw]">
          <h1 className={`${styles.fadetitle} font-sans font-semibold tracking-[-0.02em] leading-[0.75] text-[clamp(32px,22.3cqw,300px)] pr-[3cqw] h-fit whitespace-nowrap`}>
            Edcarlos
          </h1>

          <div className="flex flex-col-reverse sm:flex-row items-start sm:items-center ml- sm:ml-[clamp(6px,1.5cqw,15px)] gap-[clamp(10px,2.5cqw,12px)] sm:gap-0 mt-[2cqw] sm:mt-3">
            
            <div className="w-[clamp(230px,28cqw,440px)] shrink-0 h-fit flex justify-start items-center self-start">
              
              
              <div className="inline-flex items-center h-fit rounded-[clamp(14px,3cqw,24px)] p-[clamp(10px,2.2cqw,14px)] bg-linear-to-r from-dim-bluestrong/25 from-0% to-dim-turk/25 to-100% backdrop-blur-3xl shadow-inner-lightcard drop-shadow-[3px_4px_5px_rgba(255,255,255,0.15)] transition-all duration-300">
                <h1
                  ref={roleRef}
                  className="font-sans font-medium tracking-[-0.02em] leading-none text-dim-white text-[clamp(15px,2.97cqw,40px)] whitespace-nowrap"
                >
                  {ROLES[0]}
                </h1>
              </div>

            </div>
            <div className ="opacity-18">            
              <h1 className="[text-shadow:1px_1px_0_rgba(255,255,255,1)] font-sans font-semibold tracking-[-0.02em] leading-[0.75] text-fake-transparent/95 text-[clamp(32px,22.3cqw,300px)] pr-[3cqw] h-fit whitespace-nowrap drop-shadow-[3px_4px_8px_rgba(255,255,255,0.14)] ">
              Ramos.
            </h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero