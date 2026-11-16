import React, { useRef, useState, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollSmoother } from 'gsap/ScrollSmoother'
import styles from '../styles'
import { navLinks } from '../constants'
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

const Navbar = () => {
  const navRef = useRef(null)
  const theme = THEMES[useNavTheme(navRef)]

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
      <ul className={`flex items-center gap-[clamp(6px,1.1vw,15px)] rounded-[10px] p-[5px] transition-colors duration-500 ${theme.list}`}>
        {navLinks.map((link) => (
          <li key={link.id}>
            <a
              href={`#${link.id}`}
              onClick={(event) => handleClick(event, link.id)}
              className={`${styles.focusRing} inline-flex items-center rounded-[8px] px-[10px] py-[5px] font-sans font-semibold tracking-[-0.02em] leading-[22px] text-dim-white text-[clamp(12px,1.05vw,15px)] whitespace-nowrap shadow-nav-pill transition-colors duration-500 ${theme.pill}`}
            >
              {link.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default Navbar
