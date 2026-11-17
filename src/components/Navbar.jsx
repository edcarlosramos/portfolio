import React, { useRef, useState, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollSmoother } from 'gsap/ScrollSmoother'
import styles from '../styles'
import { MOTION_OK, navLinks } from '../constants'
import { scrollToSection } from '../utils/scroll'

gsap.registerPlugin(ScrollTrigger)

// Cores fixas do Figma, mudando só a opacidade. Sobre fundo escuro: #E5EBF1
// a 25%; sobre fundo claro: navy mais opaco, para manter o contraste.
// O contorno de 0,5px é uma sombra inset (`shadow-nav-pill`) para não
// alterar o tamanho das pílulas.
const THEMES = {
  dark: {
    list: 'bg-dim-mist/25',
    pill: 'bg-dim-mist/25 hover:bg-dim-mist/40',
  },
  light: {
    list: 'bg-dim-navy/10',
    pill: 'bg-dim-navy/60 hover:bg-dim-navy/75',
  },
}

const DEFAULT_THEME = 'dark'

// Elementos com `data-nav-theme="dark|light"` definem o tema a partir do
// momento em que seu topo passa pela altura da navbar; o tema vale até o
// próximo marcador (na rolagem para cima, volta ao marcador anterior).
const useNavTheme = (navRef) => {
  const [theme, setTheme] = useState(DEFAULT_THEME)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const markers = gsap.utils.toArray('[data-nav-theme]')
      const navCenter = () => {
        const rect = navRef.current.getBoundingClientRect()
        return rect.top + rect.height / 2
      }

      // O tema é calculado pela posição da rolagem (último marcador cujo
      // início já passou), e não pela ordem dos callbacks, que não é
      // garantida quando vários triggers disparam num salto de rolagem.
      const triggers = []
      const update = () => {
        // Posição suavizada (a que está na tela) quando o smoother está ativo.
        const smoother = ScrollSmoother.get()
        const scroll = smoother ? smoother.scrollTop() : window.scrollY
        const current = triggers.findLast((t) => t.start <= scroll)
        setTheme(current?.trigger.dataset.navTheme ?? DEFAULT_THEME)
      }

      markers.forEach((marker) => {
        triggers.push(
          ScrollTrigger.create({
            trigger: marker,
            start: () => `top ${navCenter()}px`,
            end: 'max',
            onToggle: update,
          }),
        )
      })

      ScrollTrigger.addEventListener('refresh', update)
      update()

      return () => ScrollTrigger.removeEventListener('refresh', update)
    })

    return () => ctx.revert()
  }, [navRef])

  return theme
}

// Enquanto a página rola, as pílulas recolhem para a direita dentro de um
// ícone; quando a rolagem (suavizada) para, elas voltam. Usa o `onUpdate` de
// um ScrollTrigger, que acompanha a posição suavizada do ScrollSmoother.
const IDLE_DELAY = 0.35

const useCollapseOnScroll = (listRef, iconRef) => {
  useEffect(() => {
    const mm = gsap.matchMedia()

    mm.add(MOTION_OK, () => {
      const list = listRef.current
      const icon = iconRef.current
      const items = gsap.utils.toArray(list.children)
      let collapsed = false

      gsap.set(icon, { autoAlpha: 0, scale: 0.5, rotate: -90 })
      gsap.set(list, { clipPath: 'inset(0px 0px 0px 0px round 12px)' })

      const collapse = () => {
        if (collapsed) return
        collapsed = true
        const width = list.offsetWidth
        const height = list.offsetHeight
        const target = width - height / 2

        gsap.to(list, {
          clipPath: `inset(0px 0px 0px ${width - height}px round 12px)`,
          duration: 0.5,
          ease: 'power3.inOut',
          overwrite: 'auto',
        })
        gsap.to(items, {
          x: (_, el) => target - (el.offsetLeft + el.offsetWidth / 2),
          scale: 0.3,
          autoAlpha: 0,
          duration: 0.4,
          ease: 'power2.in',
          stagger: { each: 0.04, from: 'end' },
          overwrite: 'auto',
        })
        gsap.to(icon, {
          autoAlpha: 1,
          scale: 1,
          rotate: 0,
          duration: 0.35,
          delay: 0.25,
          ease: 'back.out(2)',
          overwrite: 'auto',
        })
      }

      const expand = () => {
        if (!collapsed) return
        collapsed = false

        gsap.to(icon, {
          autoAlpha: 0,
          scale: 0.5,
          rotate: -90,
          duration: 0.25,
          ease: 'power2.in',
          overwrite: 'auto',
        })
        gsap.to(list, {
          clipPath: 'inset(0px 0px 0px 0px round 12px)',
          duration: 0.55,
          delay: 0.1,
          ease: 'power3.out',
          overwrite: 'auto',
        })
        gsap.to(items, {
          x: 0,
          scale: 1,
          autoAlpha: 1,
          duration: 0.5,
          delay: 0.1,
          ease: 'power3.out',
          stagger: { each: 0.04, from: 'end' },
          overwrite: 'auto',
        })
      }

      const idle = gsap.delayedCall(IDLE_DELAY, expand).pause()

      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: () => {
          collapse()
          idle.restart(true)
        },
      })

      return () => {
        idle.kill()
        gsap.set([list, ...items, icon], { clearProps: 'all' })
      }
    })

    return () => mm.revert()
  }, [listRef, iconRef])
}

const Navbar = () => {
  const navRef = useRef(null)
  const listRef = useRef(null)
  const iconRef = useRef(null)
  const theme = THEMES[useNavTheme(navRef)]
  useCollapseOnScroll(listRef, iconRef)

  const handleClick = (event, id) => {
    event.preventDefault()
    scrollToSection(id)
  }

  return (
    <nav
      ref={navRef}
      aria-label="Navegação principal"
      className="fixed z-50 top-[clamp(10px,1.4vw,20px)] right-[clamp(10px,2vw,36px)]"
    >
      <ul
        ref={listRef}
        className={`relative flex items-center gap-[4px] rounded-[10px] p-[4px] sm:gap-[clamp(6px,1.1vw,15px)] sm:rounded-[12px] sm:p-[6px] transition-colors duration-500 ${theme.list}`}
      >
        {navLinks.map((link) => (
          <li key={link.id}>
            <a
              href={`#${link.id}`}
              onClick={(event) => handleClick(event, link.id)}
              className={`${styles.focusRing} inline-flex items-center rounded-[7px] px-[8px] py-[4px] font-sans font-semibold tracking-[-0.02em] leading-[22px] text-dim-white text-[13px] sm:rounded-[9px] sm:px-[13px] sm:py-[7px] sm:leading-[24px] sm:text-[clamp(14px,1.35vw,18px)] whitespace-nowrap shadow-nav-pill transition-colors duration-500 ${theme.pill}`}
            >
              {link.title}
            </a>
          </li>
        ))}
      </ul>

      {/* Ícone que aparece com as pílulas recolhidas (só visual). */}
      <span
        ref={iconRef}
        aria-hidden="true"
        className={`pointer-events-none invisible absolute inset-y-[4px] right-[4px] flex aspect-square flex-col items-center justify-center gap-[4px] rounded-[7px] sm:inset-y-[6px] sm:right-[6px] sm:rounded-[9px] shadow-nav-pill transition-colors duration-500 ${theme.pill}`}
      >
        <span className="h-[2px] w-[16px] rounded-full bg-dim-white" />
        <span className="h-[2px] w-[16px] rounded-full bg-dim-white" />
        <span className="h-[2px] w-[16px] rounded-full bg-dim-white" />
      </span>
    </nav>
  )
}

export default Navbar
