import React, {useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useHistory} from '@docusaurus/router';
import {AnimatePresence, motion} from 'framer-motion';
import Hero from '@site/src/components/Hero';
import Intro from '@site/src/components/Intro';
import Note from '@site/src/components/Note';
import Gallery from '@site/src/components/Gallery';
import Signature from '@site/src/components/Signature';
import {ChapterCards, OffClockIntro, OnCallIntro} from '@site/src/components/Chapters';
import {scrollToId, useSmoothScroll} from '@site/src/lib/motion';
import Interests from '@site/src/components/Interests';
import Projects from '@site/src/components/Projects';
import CommandPalette from '@site/src/components/CommandPalette';
import Repos from '@site/src/components/Repos';
import TechBackground from '@site/src/components/TechBackground';
import styles from './index.module.css';

const EMAIL = 'alokx6@gmail.com';
const LINKEDIN = 'https://www.linkedin.com/in/alok-xavier';
const GITHUB = 'https://github.com/alok-xavier';

/* ------------------------------------------------------------------ */
/* Content: edit here                                                  */
/* ------------------------------------------------------------------ */

const dayJobFacts = [
  {value: '16+', label: 'enterprise applications'},
  {value: '500+', label: 'SSL certificates'},
  {value: '20%', label: 'cloud cost saved'},
  {value: '2021', label: 'on the team since'},
];

const dayJobDetail = [
  {
    title: 'Keep production healthy',
    items: [
      'Run 1,500+ servers and the AWS infrastructure under them, with Terraform for infrastructure and Bitbucket, Jenkins, Argo CD and CodeCommit for delivery.',
      'Renew and track 500+ SSL certificates across CloudFront, ALB and NLB.',
      'Coordinate monthly OS patching, AMI upgrades and security updates across a multi-account estate.',
    ],
  },
  {
    title: 'Ship and recover',
    items: [
      'First contact for deployment support, pipeline failures and P1 incidents.',
      'Built observability dashboards with app teams in CloudWatch, Splunk, Dynatrace and Grafana.',
    ],
  },
  {
    title: 'Spend less',
    items: ['Onboarded Sedai with FinOps for AI-driven cost anomaly detection, moved gp2 to gp3 and right-sized EC2 and EKS: 20% saved.'],
  },
  {
    title: 'Recognition',
    items: ['Helped secure the AWS Resilience Services Competency, and received a Service and Commitment Award for it.'],
  },
];

const certifications = [
  {
    name: 'AWS Certified Solutions Architect – Associate',
    badge: 'https://images.credly.com/images/0e284c3f-5164-4b21-8660-0d84737941bc/image.png',
    url: 'https://www.credly.com/badges/3004091e-e1ce-47e1-b428-b7f7fe857532/public_url',
  },
  {
    name: 'AWS Certified AI Practitioner',
    badge: 'https://images.credly.com/images/4d4693bb-530e-4bca-9327-de07f3aa2348/image.png',
    url: 'https://www.credly.com/badges/74e72ad3-9c24-4c0f-8cf0-5d99fd319da0/public_url',
  },
  {
    name: 'Google Cloud Associate Cloud Engineer',
    badge: 'https://images.credly.com/images/08096465-cbfc-4c3e-93e5-93c5aa61f23e/image.png',
    url: 'https://www.credly.com/badges/ff335805-8b73-4bed-bf12-1f036c9e113e/public_url',
  },
  {
    name: 'AWS AI Practitioner Early Adopter',
    badge: 'https://images.credly.com/images/834f2c8d-2d2c-4ce7-9580-02a351c31626/image.png',
    url: 'https://www.credly.com/badges/e71667d2-e11c-4f22-b3dd-83952bb8cf1b/public_url',
  },
];

const toolbox = [
  {group: 'Cloud', items: ['AWS', 'GCP']},
  {group: 'Infrastructure as code', items: ['Terraform', 'CloudFormation', 'Ansible']},
  {group: 'Containers', items: ['Docker', 'Kubernetes', 'Amazon EKS']},
  {group: 'CI/CD and GitOps', items: ['Jenkins', 'GitHub Actions', 'Bitbucket Pipelines', 'Argo CD']},
  {group: 'Observability', items: ['Grafana', 'Prometheus', 'Dynatrace', 'CloudWatch', 'Splunk']},
  {group: 'AI', items: ['Gemini', 'LiteLLM', 'scikit-learn', 'Agent guardrails']},
  {group: 'Scripting', items: ['Bash', 'Python', 'PowerShell']},
  {group: 'Ways of working', items: ['Jira', 'ServiceNow', 'Confluence', 'Spec-driven development']},
];

/* ------------------------------------------------------------------ */

function SectionHead({id, title, intro, dark}) {
  return (
    <div className={styles.head}>
      <motion.h2
        id={id}
        className={`${styles.title} ${dark ? styles.titleDark : ''}`}
        initial={{opacity: 0, x: -16}}
        whileInView={{opacity: 1, x: 0}}
        viewport={{once: true, margin: '-60px'}}
        transition={{duration: 0.6, ease: [0.2, 0.7, 0.2, 1]}}>
        {title}
      </motion.h2>
      {intro && <p className={`${styles.intro} ${dark ? styles.introDark : ''}`}>{intro}</p>}
    </div>
  );
}

function OffTheClock() {
  return (
    <section className={`${styles.section} ${styles.dark} ${styles.flush}`} id="interests" aria-label="Interests you can play with">
      <div className={styles.wrap}>
        <p className={styles.introDark}>Four things I’d rather be doing. Each one is playable.</p>
        <Interests />
      </div>
    </section>
  );
}

function Builds() {
  return (
    <section className={styles.section} id="builds" aria-labelledby="builds-title">
      <div className={styles.wrap}>
        <SectionHead
          id="builds-title"
          title="Hackathon builds"
          intro="Two AI systems I built with Aravind S in 2026 using spec-driven development: write the spec first, then build and test against it. Both reached the finals."
        />
        <Projects />
      </div>
    </section>
  );
}

function Shelf() {
  return (
    <section className={styles.section} id="shelf" aria-labelledby="shelf-title">
      <div className={styles.wrap}>
        <SectionHead
          id="shelf-title"
          title="On my shelf"
          intro="Open-source projects I use, and the repos I learn from. Star counts are live from GitHub."
        />
        <Repos />
      </div>
    </section>
  );
}

function DayJob() {
  const [open, setOpen] = useState(false);
  return (
    <section className={`${styles.section} ${styles.surface}`} id="work" aria-labelledby="work-title">
      <div className={`${styles.wrap} ${styles.split}`}>
        <div>
          <SectionHead id="work-title" title="Day job" />
          <p className={styles.role}>
            <strong>Systems Engineer, SRE and DevOps</strong>
            <br />
            Tata Consultancy Services, Kochi. Aug 2021 to present.
          </p>
        </div>
        <div>
          <p className={styles.jobLede}>
            I'm on the global SRE team for Avis Budget Group, looking after reliability, CI/CD and platform
            infrastructure across their AWS estate.
          </p>
          <dl className={styles.jobFacts}>
            {dayJobFacts.map((f) => (
              <div key={f.label}>
                <dd>{f.value}</dd>
                <dt>{f.label}</dt>
              </div>
            ))}
          </dl>
          <button
            type="button"
            className={styles.expand}
            aria-expanded={open}
            aria-controls="work-detail"
            onClick={() => setOpen((o) => !o)}>
            {open ? 'Hide the details' : 'Show the details'}
            <motion.span className={styles.chev} animate={{rotate: open ? 180 : 0}} aria-hidden="true">
              ▾
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                id="work-detail"
                key="detail"
                initial={{height: 0, opacity: 0}}
                animate={{height: 'auto', opacity: 1}}
                exit={{height: 0, opacity: 0}}
                transition={{duration: 0.35, ease: [0.2, 0.7, 0.2, 1]}}
                style={{overflow: 'hidden'}}>
                <div className={styles.groups}>
                  {dayJobDetail.map((g) => (
                    <div key={g.title}>
                      <h3 className={styles.groupTitle}>{g.title}</h3>
                      <ul className={styles.groupList}>
                        {g.items.map((it) => (
                          <li key={it}>{it}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <div>
                    <h3 className={styles.groupTitle}>Education</h3>
                    <p className={styles.muted}>B.Tech, Federal Institute of Science and Technology, Angamaly. 2017 to 2021.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function Credentials() {
  return (
    <section className={styles.section} id="credentials" aria-labelledby="creds-title">
      <div className={`${styles.wrap} ${styles.split}`}>
        <SectionHead id="creds-title" title="Certified" intro="Each badge opens its Credly verification page." />
        <div>
          <ul className={styles.certs}>
            {certifications.map((c) => (
              <motion.li key={c.name} whileHover={{y: -4}} transition={{type: 'spring', stiffness: 400, damping: 20}}>
                <a className={styles.cert} href={c.url} target="_blank" rel="noopener noreferrer">
                  <img src={c.badge} alt="" width="80" height="80" loading="lazy" className={styles.certBadge} />
                  <span>{c.name}</span>
                </a>
              </motion.li>
            ))}
          </ul>

          <h3 className={styles.subTitle}>Toolbox</h3>
          <div className={styles.toolbox}>
            {toolbox.map((t) => (
              <div key={t.group} className={styles.toolGroup}>
                <p className={styles.toolName}>{t.group}</p>
                <ul className={styles.chips}>
                  {t.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MagneticLink({href, children, className}) {
  const [pos, setPos] = useState({x: 0, y: 0});
  return (
    <motion.a
      href={href}
      className={className}
      animate={{x: pos.x, y: pos.y}}
      transition={{type: 'spring', stiffness: 250, damping: 18, mass: 0.6}}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setPos({x: (e.clientX - r.left - r.width / 2) * 0.12, y: (e.clientY - r.top - r.height / 2) * 0.25});
      }}
      onPointerLeave={() => setPos({x: 0, y: 0})}>
      {children}
    </motion.a>
  );
}

function Contact({resumeUrl}) {
  const [copied, setCopied] = useState(false);
  return (
    <section className={`${styles.section} ${styles.dark} ${styles.contact}`} id="contact" aria-labelledby="contact-title">
      <div className={styles.wrap}>
        <SectionHead
          id="contact-title"
          title="Say hello"
          intro="Happy to talk about SRE, platform engineering, AIOps, or last Sunday's race. Email is the quickest way to reach me."
          dark
        />
        <MagneticLink href={`mailto:${EMAIL}`} className={styles.email}>
          {EMAIL}
        </MagneticLink>
        <div className={styles.contactRow}>
          <button
            type="button"
            className={styles.copy}
            onClick={() => {
              navigator.clipboard?.writeText(EMAIL).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1800);
              });
            }}>
            {copied ? 'Copied' : 'Copy address'}
          </button>
          <ul className={styles.contactLinks}>
            <li>
              <a href={LINKEDIN}>LinkedIn</a>
            </li>
            <li>
              <a href={GITHUB}>GitHub</a>
            </li>
            <li>
              <a href={resumeUrl} download>
                Résumé (PDF)
              </a>
            </li>
          </ul>
        </div>
        <div className={styles.contactSign}>
          <Signature trigger="view" duration={1.6} color="#f5b544" strokeWidth={11} />
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const resumeUrl = useBaseUrl('/files/resume.pdf');
  const blogUrl = useBaseUrl('/blog');
  const history = useHistory();
  const [palette, setPalette] = useState(false);
  useSmoothScroll();

  const commands = useMemo(() => {
    const go = (id) => () => scrollToId(id);
    return [
      {id: 'about', label: 'A note from Alok', group: 'Section', keywords: 'about me', run: go('about')},
      {id: 'oncall', label: 'On call', group: 'Chapter', keywords: 'work', run: go('on-call')},
      {id: 'interests', label: 'Off the clock', group: 'Chapter', keywords: 'f1 car gym rain valorant', run: go('off-the-clock')},
      {id: 'builds', label: 'Hackathon builds', group: 'Section', keywords: 'projects ai', run: go('builds')},
      {id: 'covenant', label: 'Covenant Radar', group: 'Project', run: go('covenant-radar')},
      {id: 'sentinel', label: 'SentinelIQ', group: 'Project', run: go('sentineliq')},
      {id: 'shelf', label: 'On my shelf', group: 'Section', keywords: 'repos github study learning', run: go('shelf')},
      {id: 'work', label: 'Day job', group: 'Section', keywords: 'tcs experience', run: go('work')},
      {id: 'creds', label: 'Certifications and toolbox', group: 'Section', keywords: 'skills', run: go('credentials')},
      {id: 'contact', label: 'Say hello', group: 'Section', keywords: 'contact', run: go('contact')},
      {id: 'resume', label: 'Download résumé', group: 'File', keywords: 'cv pdf', run: () => window.open(resumeUrl, '_blank')},
      {id: 'email', label: 'Email Alok', group: 'Link', keywords: 'mail', run: () => (window.location.href = `mailto:${EMAIL}`)},
      {id: 'linkedin', label: 'LinkedIn', group: 'Link', run: () => window.open(LINKEDIN, '_blank')},
      {id: 'github', label: 'GitHub', group: 'Link', run: () => window.open(GITHUB, '_blank')},
      {id: 'blog', label: 'Weekly learning log', group: 'Page', keywords: 'blog', run: () => history.push(blogUrl)},
    ];
  }, [resumeUrl, blogUrl, history]);

  return (
    <Layout
      title="SRE moving into AIOps"
      description="Alok Xavier is an SRE from Kerala moving into AIOps. Two AI hackathon finals, 1,500+ servers kept running, and a soft spot for F1.">
      <main className={styles.page}>
        <TechBackground />
        <Hero resumeUrl={resumeUrl} email={EMAIL} onOpenPalette={() => setPalette(true)} />
        <Note />
        <Gallery />
        <ChapterCards />
        <OnCallIntro />
        <Builds />
        <DayJob />
        <Shelf />
        <Credentials />
        <OffClockIntro />
        <OffTheClock />
        <Contact resumeUrl={resumeUrl} />
      </main>
      <Intro />
      <CommandPalette open={palette} setOpen={setPalette} commands={commands} />
    </Layout>
  );
}
