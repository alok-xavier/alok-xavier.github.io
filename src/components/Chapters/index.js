import React, {Suspense, useEffect, useRef, useState} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import FleetMap from '@site/src/components/FleetMap';
import {hasWebGL, useInView, useReducedMotion} from '@site/src/lib/hooks';
import {scrollToId, useGsap} from '@site/src/lib/motion';
import styles from './styles.module.css';

const CityScene = React.lazy(() => import('@site/src/components/Hero/CityScene'));

/** Two big doors into the rest of the page. */
export function ChapterCards() {
  return (
    <section className={styles.cards} aria-label="Chapters">
      <div className={styles.cardsWrap}>
        <button type="button" className={`${styles.card} ${styles.cardOn}`} onClick={() => scrollToId('on-call')}>
          <span className={styles.cardBg} aria-hidden="true">
            <FleetMap />
          </span>
          <span className={styles.cardWord}>On</span>
          <span className={styles.cardWord}>call</span>
          <span className={styles.cardSub}>The work: AI builds, the day job, what I study</span>
        </button>
        <button type="button" className={`${styles.card} ${styles.cardOff}`} onClick={() => scrollToId('off-the-clock')}>
          <span className={styles.cardWord}>Off the</span>
          <span className={styles.cardWord}>clock</span>
          <span className={styles.cardSub}>F1, the gym, rainy rides and Valorant</span>
        </button>
      </div>
    </section>
  );
}

/** Pinned opener: the night city lights up under giant type. */
export function OnCallIntro() {
  const root = useRef(null);
  const pointer = useRef({x: 0, y: 0, active: false});
  const reduced = useReducedMotion();
  const inView = useInView(root, '200px');
  const [webgl, setWebgl] = useState(true);
  useEffect(() => setWebgl(hasWebGL()), []);

  useGsap(root, (gsap, ScrollTrigger, r) => {
    if (r) return;
    const q = gsap.utils.selector(root);
    const tl = gsap.timeline({
      scrollTrigger: {trigger: root.current, start: 'top top+=64', end: '+=120%', pin: true, scrub: 0.6},
    });
    // the two words slide in from opposite sides and settle into place
    const [w1, w2] = q('[data-word]');
    tl.fromTo(w1, {xPercent: -70, autoAlpha: 0.2}, {xPercent: 0, autoAlpha: 1, ease: 'power3.out'})
      .fromTo(w2, {xPercent: 55, autoAlpha: 0.2}, {xPercent: 0, autoAlpha: 1, ease: 'power3.out'}, '<')
      .from(q('[data-stat]'), {autoAlpha: 0, y: 30, stagger: 0.15, ease: 'power2.out'}, '-=0.2');
  });

  function onMove(e) {
    const r = root.current.getBoundingClientRect();
    pointer.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.current.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
    pointer.current.active = true;
  }

  return (
    <section
      ref={root}
      id="on-call"
      className={styles.onCall}
      aria-labelledby="on-call-title"
      onPointerMove={onMove}
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
          <div className={styles.flat}>
            <FleetMap />
          </div>
        )}
      </div>
      <div className={styles.onCallInner}>
        <h2 id="on-call-title" className={styles.giant}>
          <span data-word>On</span> <span data-word>call</span>
        </h2>
        <dl className={styles.stats}>
          <div data-stat>
            <dd>1,500+</dd>
            <dt>servers I help run, one light each</dt>
          </div>
          <div data-stat>
            <dd>23+</dd>
            <dt>AWS accounts</dt>
          </div>
          <div data-stat>
            <dd>2</dd>
            <dt>AI hackathon finals in 2026</dt>
          </div>
        </dl>
        <p className={styles.hint}>Move your pointer over the city.</p>
      </div>
    </section>
  );
}

const TICKER = ['Formula 1', 'The gym', 'Rides in the rain', 'Valorant esports', 'Waterfalls', 'Pine forests'];

/** Opener for the personal half: giant words and a ticker that speeds up with your scroll. */
export function OffClockIntro() {
  const root = useRef(null);

  useGsap(root, (gsap, ScrollTrigger, reduced) => {
    if (reduced) return;
    const q = gsap.utils.selector(root);
    gsap.from(q('[data-word]'), {
      yPercent: 100,
      ease: 'power4.out',
      duration: 1,
      stagger: 0.08,
      scrollTrigger: {trigger: root.current, start: 'top 70%'},
    });
    // ticker: constant drift, nudged by scroll velocity
    const rows = q('[data-row]');
    const loops = rows.map((row, i) =>
      gsap.to(row, {xPercent: i % 2 ? 0 : -50, startAt: {xPercent: i % 2 ? -50 : 0}, duration: 28, ease: 'none', repeat: -1}),
    );
    ScrollTrigger.create({
      trigger: root.current,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        const boost = 1 + Math.min(4, Math.abs(self.getVelocity()) / 600);
        loops.forEach((l) => gsap.to(l, {timeScale: boost, duration: 0.2, overwrite: true}));
        gsap.delayedCall(0.35, () => loops.forEach((l) => gsap.to(l, {timeScale: 1, duration: 0.8})));
      },
      onToggle: (self) => loops.forEach((l) => (self.isActive ? l.play() : l.pause())),
    });
  });

  const row = (n) => (
    <div className={styles.row} data-row aria-hidden={n > 0 ? 'true' : undefined}>
      {[...TICKER, ...TICKER].map((t, i) => (
        <span key={i}>
          {t}
          <i className={styles.sep} aria-hidden="true" />
        </span>
      ))}
    </div>
  );

  return (
    <section ref={root} id="off-the-clock" className={styles.offClock} aria-labelledby="off-title">
      <h2 id="off-title" className={styles.giantDark}>
        <span className={styles.clip}>
          <span data-word>Off the</span>
        </span>
        <span className={styles.clip}>
          <span data-word>clock</span>
        </span>
      </h2>
      <div className={styles.ticker}>
        {row(0)}
        {row(1)}
      </div>
    </section>
  );
}
