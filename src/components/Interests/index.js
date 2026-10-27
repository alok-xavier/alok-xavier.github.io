import React from 'react';
import {motion} from 'framer-motion';
import F1Car from './F1Car';
import Barbell from './Barbell';
import RainRide from './RainRide';
import AimTrainer from './AimTrainer';
import styles from './styles.module.css';

const INTERESTS = [
  {
    id: 'f1',
    title: 'Formula 1',
    text: 'Race weekends are blocked out in my calendar. So I built my own car in my own colours. Fire it up, spin it round, or take it apart.',
    Toy: F1Car,
    wide: true,
  },
  {
    id: 'gym',
    title: 'The gym',
    text: 'Lifting is how I reset after a long shift. Load the bar and see what you’d lift.',
    Toy: Barbell,
  },
  {
    id: 'rain',
    title: 'Rides in the rain',
    text: 'Kerala monsoon, a Honda CB350RS and an empty road. The best rides are the wet ones.',
    Toy: RainRide,
  },
  {
    id: 'valorant',
    title: 'Valorant esports',
    text: 'I follow the pro scene. Watching it makes everyone think they can flick. Can you?',
    Toy: AimTrainer,
  },
];

export default function Interests() {
  return (
    <div className={styles.grid}>
      {INTERESTS.map(({id, title, text, Toy, wide}, i) => (
        <motion.article
          key={id}
          className={`${styles.panel} ${wide ? styles.wide : ''}`}
          initial={{opacity: 0, y: 28}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true, margin: '-60px'}}
          transition={{duration: 0.6, delay: wide ? 0 : ((i - 1) % 3) * 0.08, ease: [0.2, 0.7, 0.2, 1]}}>
          <h3 className={styles.panelTitle}>{title}</h3>
          <p className={styles.panelText}>{text}</p>
          <Toy />
        </motion.article>
      ))}
    </div>
  );
}
