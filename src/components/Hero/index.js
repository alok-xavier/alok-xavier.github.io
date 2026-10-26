import React, {Suspense, useEffect, useRef, useState} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {motion, useMotionValue, useSpring, useTransform} from 'framer-motion';
import FleetMap from '@site/src/components/FleetMap';
import {hasWebGL, useInView, useReducedMotion} from '@site/src/lib/hooks';
import styles from './styles.module.css';

const CityScene = React.lazy(() => import('./CityScene'));

function Portrait() {
  const src = useBaseUrl('/img/alok-portrait.webp');
  const fallback = useBaseUrl('/img/alok-portrait.jpg');
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const sx = useSpring(rx, {stiffness: 160, damping: 18});
  const sy = useSpring(ry, {stiffness: 160, damping: 18});
  const glareX = useTransform(sy, [-10, 10], ['20%', '80%']);

  function onMove(e) {
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    ry.set(x * 16);
    rx.set(-y * 16);
  }
  function onLeave() {
    rx.set(0);
    ry.set(0);
  }

  return (
    <motion.figure
      className={styles.portrait}
      style={{rotateX: sx, rotateY: sy, transformPerspective: 900}}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      initial={{opacity: 0, y: 24, scale: 0.97}}
      animate={{opacity: 1, y: 0, scale: 1}}
      transition={{duration: 0.8, delay: 0.15, ease: [0.2, 0.7, 0.2, 1]}}>
      <picture>
        <source srcSet={src} type="image/webp" />
        <img
          src={fallback}
          alt="Alok Xavier smiling in front of a waterfall in Kerala"
          width="640"
          height="800"
          className={styles.portraitImg}
        />
      </picture>
      <motion.span className={styles.glare} style={{left: glareX}} aria-hidden="true" />
    </motion.figure>
  );
}

export default function Hero({resumeUrl, email, onOpenPalette}) {
  const section = useRef(null);
  const pointer = useRef({x: 0, y: 0, active: false});
  const reduced = useReducedMotion();
  const inView = useInView(section);
  const [webgl, setWebgl] = useState(true);

  useEffect(() => setWebgl(hasWebGL()), []);

  function onPointerMove(e) {
    const r = section.current.getBoundingClientRect();
    pointer.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.current.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
    pointer.current.active = true;
  }

  return (
    <header
      ref={section}
      className={styles.hero}
      onPointerMove={onPointerMove}
      onPointerLeave={() => (pointer.current.active = false)}>
      <div className={styles.scene} aria-hidden="true">
        {webgl ? (
          <BrowserOnly fallback={null}>
            {() => (
              <Suspense fallback={null}>
                <CityScene pointer={pointer} reduced={reduced} running={inView} />
              </Suspense>
            )}
          </BrowserOnly>
        ) : (
          <div className={styles.flatFallback}>
            <FleetMap />
          </div>
        )}
      </div>

      <div className={styles.inner}>
        <div className={styles.copy}>
          <motion.p
            className={styles.hello}
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{duration: 0.6}}>
            Hi, I'm
          </motion.p>
          <h1 className={styles.name}>
            {['Alok', 'Xavier'].map((word, i) => (
              <span key={word} className={styles.word}>
                <motion.span
                  className={styles.wordInner}
                  initial={{y: '105%'}}
                  animate={{y: 0}}
                  transition={{duration: 0.9, delay: 0.1 + i * 0.12, ease: [0.2, 0.75, 0.15, 1]}}>
                  {word}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p
            className={styles.lede}
            initial={{opacity: 0, y: 12}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.7, delay: 0.45}}>
            SRE moving into AIOps. I keep production running, and I build AI that shows its working.
          </motion.p>
          <motion.div
            className={styles.actions}
            initial={{opacity: 0, y: 12}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.7, delay: 0.6}}>
            <a className={styles.btnPrimary} href="#builds">
              See what I've built
            </a>
            <a className={styles.btnGhost} href={resumeUrl} download>
              Résumé (PDF)
            </a>
            <a className={styles.btnGhost} href={`mailto:${email}`}>
              Email me
            </a>
          </motion.div>
        </div>

        <Portrait />
      </div>

      <div className={styles.footnote}>
        <p>
          <span className={styles.dot} aria-hidden="true" />
          Each light below is one of the 1,500 servers I help run. Move your pointer or finger across them.
        </p>
        <button type="button" className={styles.kbd} onClick={onOpenPalette}>
          <kbd>Ctrl</kbd> <kbd>K</kbd> to jump anywhere
        </button>
      </div>
    </header>
  );
}
