import React from 'react'
import styles from '../styles'
import { skillGroups, softSkills } from '../constants'

// Mesmo padrão das pílulas da navbar (raio, espaçamento, peso e contorno
// inset de 0,5px), só que com fundo branco translúcido sobre o fade da linha.
const pill =
  'inline-block align-middle mx-[calc(var(--gap)/2)] my-[calc(var(--pad)+var(--line-gap)/2)] rounded-[clamp(8px,0.85vw,12px)] px-[0.7em] py-[0.35em] font-sans font-semibold tracking-[-0.02em] leading-[1.45] whitespace-nowrap text-dim-white text-(length:--fs) bg-dim-mist/25 shadow-nav-pill'

// Cada linha é um elemento inline com `box-decoration-clone`: quando as
// pílulas quebram de linha (telas menores), o fundo vira um bloco por linha,
// abraçando só as pílulas daquela linha em vez de ocupar a largura toda.
// Com fonte 0px a caixa inline não tem altura própria; a altura do fundo vem
// do padding vertical (meia pílula + respiro), centralizado na pílula.
// Altura da pílula = 1.45 (leading) + 0.7 (py) = 2.15 × --fs.
const rowBox =
  '[--fs:clamp(15px,1.6vw,23px)] [--pad:clamp(5px,0.55vw,8px)] [--gap:clamp(6px,0.9vw,12px)] [--line-gap:clamp(4px,0.5vw,8px)] inline box-decoration-clone text-[length:0px] rounded-[clamp(10px,1.1vw,16px)] px-[calc(var(--pad)-var(--gap)/2)] py-[calc(var(--fs)*1.075+var(--pad))]'

// O que diferencia cada linha é o fade azul do fundo.
const rows = [
  { ...skillGroups[0], fade: 'from-blueton-bg to-dim-bluestrong' },
  { ...skillGroups[1], fade: 'from-dim-bluestrong to-dim-sky' },
  { id: 'interpessoais', label: 'Habilidades interpessoais', items: softSkills, fade: 'from-dim-navy to-blueton-bg' },
]

const Skills = () => (
  <section
    aria-labelledby="skills-title"
    data-nav-theme="light"
    className={styles.sectionY}
  >
    <h2 id="skills-title" className="sr-only">
      Habilidades
    </h2>

    <div className={`${styles.container} flex flex-col items-center gap-[clamp(10px,1.2vw,16px)]`}>
      {rows.map((row) => (
        <div key={row.id} data-reveal className="text-center">
          <ul
            aria-label={row.label}
            className={`${rowBox} bg-linear-to-r ${row.fade}`}
          >
            {row.items.map((skill) => (
              <li key={skill} className={pill}>
                {skill}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </section>
)

export default Skills
