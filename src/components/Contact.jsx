import React from 'react'
import styles from '../styles'
import { contacts } from '../constants'
import SpinText from './SpinText'

const Contact = () => (
  <section id="contato" data-nav-theme="light" className={styles.sectionY}>
    <div className={styles.container}>
      <h2 data-reveal className={styles.sectionTitle}>
        Vamos trabalhar juntos ?
      </h2>

      <dl className="mt-[clamp(24px,3vw,44px)] flex flex-col gap-[clamp(12px,1.6vw,24px)] font-sans font-medium tracking-[-0.01em] text-dim-navy text-[clamp(16px,2.1vw,30px)]">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            data-reveal
            className="flex flex-wrap items-baseline gap-x-[1.1em] gap-y-1"
          >
            <dt>{contact.label}:</dt>
            <dd>
              <a
                href={contact.href ?? undefined}
                className={`${styles.focusRing} cursor-pointer`}
              >
                <SpinText text={contact.value} />
              </a>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  </section>
)

export default Contact
