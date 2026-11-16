import { ScrollSmoother } from 'gsap/ScrollSmoother'

// Rola até uma seção usando o ScrollSmoother quando ele está ativo;
// sem ele (ex.: prefers-reduced-motion) cai no scroll nativo.
export const scrollToSection = (id) => {
  const target = document.getElementById(id)
  if (!target) return

  const smoother = ScrollSmoother.get()
  if (smoother) smoother.scrollTo(target, true, 'top top')
  else target.scrollIntoView()
}
