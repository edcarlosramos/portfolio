import React from 'react'
import styles from '../styles'

// Título da seção à esquerda e, opcionalmente, um link de ação à direita.
// Sem `linkHref` o link fica como placeholder (âncora sem destino).
const SectionHeader = ({ title, linkLabel, linkHref }) => (
  <div className="flex items-end justify-between gap-6">
    <h2 data-reveal className={styles.sectionTitle}>
      {title}
    </h2>

    {linkLabel && (
      <a
        data-reveal
        href={linkHref ?? undefined}
        className={`${styles.sectionLink} ${styles.focusRing}`}
      >
        {linkLabel}
      </a>
    )}
  </div>
)

export default SectionHeader
