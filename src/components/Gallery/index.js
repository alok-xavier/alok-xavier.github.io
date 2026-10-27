import React, {useRef} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useGsap} from '@site/src/lib/motion';
import styles from './styles.module.css';

/**
 * A horizontal reel of photos and one-liners. On desktop the section pins
 * and vertical scrolling drives it sideways; on phones it's a swipeable row.
 *
 * To add a photo: drop it in static/img/photos/ as NAME-900.webp and
 * NAME-480.webp, then replace one of the {type: 'slot'} entries with
 * {type: 'photo', src: 'NAME', alt: '…', caption: '…', place: '…', year: '…'}.
 */
const REEL = [
  {type: 'photo', src: 'forest', alt: 'Alok smiling in a pine forest', caption: 'Among the pines', place: '', year: ''},
  {type: 'line', text: 'Curious about how things break, and how to stop them breaking again.'},
  {type: 'photo', src: 'ivy', alt: 'Alok outside an old ivy-covered house', caption: 'Old walls, new ideas', place: '', year: ''},
  {type: 'slot'},
  {type: 'line', text: 'Happiest on two wheels when the monsoon arrives.'},
  {type: 'photo', src: 'waterfall', alt: 'Alok in front of a waterfall', caption: 'Chasing waterfalls', place: '', year: ''},
  {type: 'slot'},
  {type: 'line', text: 'Five years of keeping the lights on. Next: teaching them to fix themselves.'},
  {type: 'slot'},
];

function Photo({item}) {
  const full = useBaseUrl(`/img/photos/${item.src}-900.webp`);
  const small = useBaseUrl(`/img/photos/${item.src}-480.webp`);
  const meta = [item.place, item.year].filter(Boolean).join(', ');
  return (
    <figure className={`${styles.tile} ${styles.photo}`}>
      <div className={styles.frame}>
        <img src={small} srcSet={`${small} 480w, ${full} 900w`} sizes="(max-width: 996px) 70vw, 30vw" alt={item.alt} loading="lazy" data-parallax />
      </div>
      <figcaption className={styles.caption}>
        <span>{item.caption}</span>
        {meta && <span className={styles.meta}>{meta}</span>}
      </figcaption>
    </figure>
  );
}

export default function Gallery() {
  const root = useRef(null);
  const track = useRef(null);

  useGsap(root, (gsap, ScrollTrigger, reduced) => {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 997px)', () => {
      if (reduced) return;
      const distance = () => track.current.scrollWidth - window.innerWidth + 48;
      const tween = gsap.to(track.current, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top+=64',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });
      // photos drift inside their frames as they cross the screen
      track.current.querySelectorAll('[data-parallax]').forEach((img) => {
        gsap.fromTo(
          img,
          {xPercent: -8},
          {xPercent: 8, ease: 'none', scrollTrigger: {trigger: img.parentElement, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true}},
        );
      });
    });
  });

  return (
    <section ref={root} className={styles.gallery} aria-label="Photos and notes">
      <div ref={track} className={styles.track}>
        <div className={`${styles.tile} ${styles.intro}`}>
          <p className={styles.introTitle}>Off the screen</p>
          <p className={styles.introText}>Where I go when the pager is quiet.</p>
        </div>
        {REEL.map((item, i) => {
          if (item.type === 'photo') return <Photo key={i} item={item} />;
          if (item.type === 'line')
            return (
              <div key={i} className={`${styles.tile} ${styles.line}`}>
                <p>{item.text}</p>
              </div>
            );
          return (
            <div key={i} className={`${styles.tile} ${styles.slot}`} aria-hidden="true">
              <span>Photo coming soon</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
