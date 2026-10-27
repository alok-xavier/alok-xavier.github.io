import React, {useRef} from 'react';
import Signature from '@site/src/components/Signature';
import {useGsap} from '@site/src/lib/motion';
import styles from './styles.module.css';

/**
 * "A note from Alok": the words light up one by one as you scroll through,
 * and it's signed off at the end. Wrap a phrase in *asterisks* to highlight it.
 */
const NOTE =
  'I keep things running. Since 2021 that has meant *1,500 servers*, *23 AWS accounts* and incidents that never check the time. ' +
  'Now I’m teaching machines to help: *AI that shows its working* before anyone acts on it. ' +
  'Off the clock you’ll find me *watching F1*, *lifting*, or *riding into the rain*.';

function words(text) {
  const out = [];
  text.split(/(\*[^*]+\*)/).forEach((chunk) => {
    if (!chunk) return;
    const hot = chunk.startsWith('*');
    chunk
      .replace(/\*/g, '')
      .replace(/^([,.;:!?])/, ' $1')
      .split(/\s+/)
      .filter(Boolean)
      .forEach((w) => {
        // keep punctuation glued to the word before it ("servers," not "servers ,")
        if (/^[,.;:!?]+$/.test(w) && out.length) out[out.length - 1].w += w;
        else out.push({w, hot});
      });
  });
  return out;
}

const FACTS = [
  {k: 'Based in', v: 'Kochi, Kerala'},
  {k: 'Day job', v: 'SRE at Tata Consultancy Services'},
  {k: 'Learning', v: 'AIOps, AI agents and how to evaluate them'},
];

export default function Note() {
  const root = useRef(null);

  useGsap(root, (gsap, ScrollTrigger, reduced) => {
    const ws = root.current.querySelectorAll('[data-w]');
    if (reduced) {
      gsap.set(ws, {opacity: 1});
      return;
    }
    gsap.fromTo(
      ws,
      {opacity: 0.16},
      {
        opacity: 1,
        ease: 'none',
        stagger: 0.1,
        scrollTrigger: {trigger: root.current.querySelector('[data-text]'), start: 'top 78%', end: 'bottom 45%', scrub: true},
      },
    );
  });

  return (
    <section ref={root} className={styles.note} id="about" aria-labelledby="note-title">
      <div className={styles.wrap}>
        <h2 id="note-title" className={styles.label}>
          A note from Alok
        </h2>
        <p className={styles.text} data-text>
          {words(NOTE).map(({w, hot}, i) => (
            <React.Fragment key={i}>
              <span data-w className={hot ? styles.hot : undefined}>
                {w}
              </span>{' '}
            </React.Fragment>
          ))}
        </p>
        <div className={styles.foot}>
          <dl className={styles.facts}>
            {FACTS.map((f) => (
              <div key={f.k}>
                <dt>{f.k}</dt>
                <dd>{f.v}</dd>
              </div>
            ))}
          </dl>
          <div className={styles.sign}>
            <Signature trigger="view" duration={1.4} color="#161b33" strokeWidth={10} />
          </div>
        </div>
      </div>
    </section>
  );
}
