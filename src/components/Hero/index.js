import React, {useRef} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Signature from '@site/src/components/Signature';
import {scrollToId, useGsap} from '@site/src/lib/motion';
import styles from './styles.module.css';

/**
 * Story hero: a full-height photo, the name set huge across it, and the
 * signature signing itself once the intro has lifted. On scroll the two
 * lines of the name drift apart and the photo slides away slower than the page.
 */

// The Intro component sets this flag in its effect, which runs before ours.
function introPlaying() {
  return typeof window !== 'undefined' && window.__axIntroPlaying === true;
}

const signDelay = () => (introPlaying() ? 3.4 : 0.4);

export default function Hero({resumeUrl, email, onOpenPalette}) {
  const root = useRef(null);
  const photo = useBaseUrl('/img/photos/hills-900.webp');
  const photoSmall = useBaseUrl('/img/photos/hills-480.webp');

  useGsap(root, (gsap, ScrollTrigger, reduced) => {
    const q = gsap.utils.selector(root);
    if (reduced) return;

    // Entrance only plays behind the intro curtain; otherwise the page is already visible, so no flash.
    if (introPlaying()) {
      const tl = gsap.timeline({delay: 2.45});
      tl.from(q('[data-photo]'), {clipPath: 'inset(100% 0% 0% 0%)', duration: 1.1, ease: 'power4.inOut'})
      .from(q('[data-photo] img'), {scale: 1.25, duration: 1.6, ease: 'power3.out'}, '<')
      .from(q('[data-char]'), {yPercent: 115, duration: 0.9, ease: 'power4.out', stagger: 0.035}, '-=0.9')
      .from(q('[data-fade]'), {autoAlpha: 0, y: 16, duration: 0.6, stagger: 0.08}, '-=0.5');
    }

    // scroll: lines drift apart, photo lags behind
    const st = {trigger: root.current, start: 'top top', end: 'bottom top', scrub: true};
    gsap.to(q('[data-line="1"]'), {xPercent: -18, ease: 'none', scrollTrigger: st});
    gsap.to(q('[data-line="2"]'), {xPercent: 12, ease: 'none', scrollTrigger: st});
    gsap.to(q('[data-photo]'), {yPercent: 18, ease: 'none', scrollTrigger: st});
    gsap.to(q('[data-cue]'), {autoAlpha: 0, ease: 'none', scrollTrigger: {...st, end: '20% top'}});
  });

  const line = (word, n) => (
    <span className={styles.line} data-line={n}>
      {word.split('').map((c, i) => (
        <span key={i} className={styles.charWrap}>
          <span className={styles.char} data-char>
            {c}
          </span>
        </span>
      ))}
    </span>
  );

  return (
    <header ref={root} className={styles.hero}>
      <div className={styles.photo} data-photo>
        <img
          src={photo}
          srcSet={`${photoSmall} 480w, ${photo} 846w`}
          sizes="(max-width: 996px) 100vw, 42vw"
          alt="Alok Xavier on a hilltop in Kerala, with mist rolling over the forest behind him"
          width="846"
          height="1859"
          fetchpriority="high"
        />
      </div>

      <div className={styles.inner}>
        <div className={styles.top}>
          <p className={styles.kicker} data-fade>
            SRE moving into AIOps
            <br />
            <span>Kochi, Kerala</span>
          </p>
          <button type="button" className={styles.latest} data-fade onClick={() => scrollToId('builds')}>
            <span className={styles.latestLabel}>Latest</span>
            <span className={styles.latestText}>Covenant Radar made the national final of an AI hackathon</span>
          </button>
        </div>

        <h1 className={styles.name} aria-label="Alok Xavier">
          {line('Alok', 1)}
          {line('Xavier', 2)}
        </h1>

        <div className={styles.bottom}>
          <div className={styles.actions} data-fade>
            <a className={styles.btnPrimary} href={resumeUrl} download>
              Résumé (PDF)
            </a>
            <a className={styles.btnGhost} href={`mailto:${email}`}>
              Email me
            </a>
            <button type="button" className={styles.kbd} onClick={onOpenPalette}>
              <kbd>Ctrl</kbd> <kbd>K</kbd>
            </button>
          </div>
          <p className={styles.cue} data-cue data-fade>
            Scroll <span className={styles.cueLine} aria-hidden="true" />
          </p>
        </div>
      </div>

      <div className={styles.sign}>
        <Signature trigger="load" delay={signDelay} duration={1.5} color="#f5b544" strokeWidth={13} />
      </div>
    </header>
  );
}
