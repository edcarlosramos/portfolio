import React, { useRef, useEffect, useCallback } from 'react'
import gsap from 'gsap'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import styles from '../styles'
import MeshGradientBackground from './Meshgradientbackground'
import GlassTextGL from './GlassTextGL'

gsap.registerPlugin(ScrambleTextPlugin)

const ROLES = [
  'Analista de dados',
  'Desenvolvedor Web',
  'Product Manager',
  'Analista de dados'
]

const Hero = () => {
  const roleRef = useRef(null)
  const cardRef = useRef(null)
  const getLight = useCallback(() => cardRef.current?.querySelector('[data-hero-light]'), [])

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

  // O topo do card fica sempre logo abaixo da navbar fixa, em qualquer tela:
  // `--nav-bottom` (definido pela Navbar) mais o mesmo respiro que a navbar tem
  // até o topo da janela. O card não é centralizado na vertical (em telas altas
  // isso abria um vão grande entre a navbar e o card).
  return (
    <div id="home" data-nav-theme="dark" className="relative isolate flex w-full justify-center items-start px-2.5 pb-2.5 pt-[calc(var(--nav-bottom,64px)+clamp(10px,1.4vw,20px))] sm:min-h-screen">
      {/* Fundo escuro do hero numa peça só: sólido no topo e nas laterais, com
          a base arredondada (elíptica) que transborda para a seção seguinte e
          se dissolve no fundo claro, sem quebras na transição. */}
      <div
        aria-hidden="true"
        className="bg-abyss-ellipse pointer-events-none absolute inset-x-0 top-0 -z-10 h-[135%]"
      />

      <div ref={cardRef} data-hero-card className="relative isolate @container flex w-full max-w-[1345px] h-[clamp(440px,130vw,700px)] sm:h-[clamp(700px,calc(14.6cqw+641.6px),838px)] rounded-[clamp(16px,3cqw,32px)] justify-start items-center overflow-hidden py-[6cqw] 
      bg-linear-to-t from-hugeblack-bg from-0% to-blueton-bg to-100% shadow-inner-light">
        <MeshGradientBackground />

        <div className="relative z-10 flex flex-col w-full pl-[1cqw]">
          <h1 data-hero-item className={`${styles.fadetitle} font-sans font-semibold tracking-[-0.02em] leading-[0.75] text-[clamp(32px,22.3cqw,300px)] pr-[3cqw] h-fit whitespace-nowrap`}>
            Edcarlos
          </h1>

          <div className="flex flex-col-reverse sm:flex-row items-start sm:items-center ml- sm:ml-[clamp(6px,1.5cqw,15px)] gap-[clamp(10px,2.5cqw,12px)] sm:gap-0 mt-[2cqw] sm:mt-3">
            
            <div data-hero-item className="w-[clamp(230px,28cqw,440px)] shrink-0 h-fit flex justify-start items-center self-start">
              
              
              <div className="inline-flex items-center h-fit rounded-[clamp(14px,3cqw,24px)] p-[clamp(10px,2.2cqw,14px)] bg-linear-to-r from-dim-bluestrong/25 from-0% to-dim-turk/25 to-100% backdrop-blur-3xl shadow-inner-lightcard drop-shadow-[3px_4px_5px_rgba(255,255,255,0.15)] transition-all duration-300">
                <h1
                  ref={roleRef}
                  className="font-sans font-medium tracking-[-0.02em] leading-none text-dim-white text-[clamp(15px,2.97cqw,40px)] whitespace-nowrap"
                >
                  {ROLES[0]}
                </h1>
              </div>

            </div>
            {/* "Ramos." em liquid glass (WebGL), refletindo a luz clara do fundo.
                Sem WebGL, volta ao estilo anterior (fallbackClassName). */}
            <h1 data-hero-item className="font-sans font-semibold tracking-[-0.02em] leading-[0.75] text-[clamp(32px,22.3cqw,300px)] pr-[3cqw] h-fit whitespace-nowrap">
              <GlassTextGL
                text="Ramos."
                getLight={getLight}
                fallbackClassName="opacity-18 [text-shadow:1px_1px_0_rgba(255,255,255,1)] text-fake-transparent/95 drop-shadow-[3px_4px_8px_rgba(255,255,255,0.14)]"
              />
            </h1>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero