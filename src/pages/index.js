import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import useBaseUrl from '@docusaurus/useBaseUrl';
import FleetMap from '@site/src/components/FleetMap';
import styles from './index.module.css';

const EMAIL = 'alokx6@gmail.com';
const LINKEDIN = 'https://www.linkedin.com/in/alok-xavier';
const GITHUB = 'https://github.com/alok-xavier';
const PROJECT_REPO = 'https://github.com/alok-xavier/EKS-GitOps-DevOps-Project';

/* ------------------------------------------------------------------ */
/* Content — edit here                                                 */
/* ------------------------------------------------------------------ */

const fleetFacts = [
  {value: '16+', label: 'enterprise applications'},
  {value: '23+', label: 'AWS accounts'},
  {value: '1,500+', label: 'servers'},
  {value: '500+', label: 'SSL certificates'},
];

const workGroups = [
  {
    title: 'Keep production healthy',
    items: [
      'Administer 1,500+ servers and the core AWS IaaS under them, with Terraform for infrastructure and Bitbucket, Jenkins, Argo CD and CodeCommit for delivery.',
      'Renew and track 500+ SSL certificates across CloudFront, ALB and NLB.',
      'Coordinate monthly OS patching, AMI upgrades and security updates across a multi-account estate.',
    ],
  },
  {
    title: 'Ship and recover',
    items: [
      'Primary contact for deployment support, pipeline failures and P1 incidents, pulling in application, platform and network teams to restore service.',
      'Built observability dashboards with application teams in CloudWatch, Splunk, Dynatrace and Grafana, and handle alerts escalated from L1.',
    ],
  },
  {
    title: 'Spend less',
    figure: '20%',
    figureLabel: 'cloud cost saved',
    items: [
      'Partnered with FinOps to onboard Sedai for AI-driven cost anomaly detection, moved storage from gp2 to gp3, and right-sized EC2 and EKS workloads.',
    ],
  },
  {
    title: 'Recognition',
    items: [
      'Represented the team with AWS through assessment and validation for the AWS Resilience Services Competency.',
      'Received a Service and Commitment Award for that work.',
    ],
  },
];

const pipeline = [
  {
    tool: 'Terraform',
    text: 'Provisions the VPC and EKS cluster from reusable modules. State lives in S3, locked with DynamoDB.',
  },
  {
    tool: 'GitHub Actions',
    text: 'On each pull request: build, unit tests and lint, then a Docker image tagged with the run ID.',
  },
  {
    tool: 'Git',
    text: 'CI writes the new image tag into the Kubernetes manifest, so Git is the record of what should be running.',
  },
  {
    tool: 'Argo CD',
    text: 'Watches the manifests and syncs every change into EKS. Rollback is a git revert.',
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
  {group: 'Cloud', items: 'AWS, GCP, multi-account management'},
  {group: 'Infrastructure as code', items: 'Terraform, CloudFormation, Ansible'},
  {group: 'Containers', items: 'Docker, Kubernetes, Amazon EKS'},
  {group: 'CI/CD and GitOps', items: 'Jenkins, GitHub Actions, Bitbucket Pipelines, Argo CD'},
  {group: 'Observability', items: 'Grafana, Prometheus, Dynatrace, CloudWatch, Splunk'},
  {group: 'Source control', items: 'Git, GitHub, Bitbucket, CodeCommit'},
  {group: 'Scripting', items: 'Bash, Python, PowerShell'},
  {group: 'Ways of working', items: 'Jira, ServiceNow, Confluence, Sedai'},
];

/* ------------------------------------------------------------------ */

function Hero({resumeUrl}) {
  return (
    <header className={styles.hero}>
      <div className={styles.wrap}>
        <p className={styles.heroIntro}>Alok Xavier, SRE and DevOps engineer in Kochi, India</p>
        <h1 className={styles.heroTitle}>I keep the lights on.</h1>
        <p className={styles.heroLede}>
          I'm on the global SRE team for Avis Budget Group at Tata Consultancy Services. I look after
          deployments, pipelines and production incidents for applications that run around the clock,
          and I'm moving that work towards AIOps.
        </p>
        <div className={styles.heroActions}>
          <a className={styles.btnPrimary} href={resumeUrl} download>
            Download résumé (PDF)
          </a>
          <a className={styles.btnGhost} href={`mailto:${EMAIL}`}>
            Email me
          </a>
        </div>

        <div className={styles.fleet}>
          <FleetMap />
          <div className={styles.legend}>
            <p className={styles.legendKey}>
              <span className={styles.legendDot} aria-hidden="true" />
              One light per server I help run, grouped by AWS account
            </p>
            <dl className={styles.facts}>
              {fleetFacts.map((f) => (
                <div key={f.label} className={styles.fact}>
                  <dt className={styles.factLabel}>{f.label}</dt>
                  <dd className={styles.factValue}>{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </header>
  );
}

function Work() {
  return (
    <section className={styles.section} id="work" aria-labelledby="work-title">
      <div className={`${styles.wrap} ${styles.split}`}>
        <div className={styles.rail}>
          <h2 id="work-title" className={styles.sectionTitle}>Work</h2>
          <div className={styles.role}>
            <p className={styles.roleTitle}>Systems Engineer, SRE and DevOps</p>
            <p className={styles.roleMeta}>Tata Consultancy Services, Kochi</p>
            <p className={styles.roleMeta}>
              <time dateTime="2021-08">Aug 2021</time> to present
            </p>
            <p className={styles.roleClient}>
              Global SRE team for Avis Budget Group, responsible for reliability, CI/CD and platform
              infrastructure.
            </p>
          </div>
        </div>

        <div className={styles.groups}>
          {workGroups.map((g) => (
            <div key={g.title} className={styles.group}>
              <h3 className={styles.groupTitle}>{g.title}</h3>
              {g.figure && (
                <p className={styles.figure}>
                  <span className={styles.figureValue}>{g.figure}</span>
                  <span className={styles.figureLabel}>{g.figureLabel}</span>
                </p>
              )}
              <ul className={styles.groupList}>
                {g.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}

          <div className={styles.education}>
            <h3 className={styles.groupTitle}>Education</h3>
            <p>
              B.Tech in Engineering, Federal Institute of Science and Technology, Angamaly
              <br />
              <span className={styles.muted}>2017 to 2021</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Project() {
  return (
    <section className={`${styles.section} ${styles.sectionAlt}`} id="project" aria-labelledby="project-title">
      <div className={styles.wrap}>
        <div className={styles.projectHead}>
          <h2 id="project-title" className={styles.sectionTitle}>
            GitOps on Amazon EKS
          </h2>
          <p className={styles.projectLede}>
            A side project that runs the OpenTelemetry demo shop, a set of microservices, on EKS. Every
            layer is declared in Git, from the cluster to the image tag, and nothing reaches the cluster
            by hand.
          </p>
        </div>

        <ol className={styles.pipeline}>
          {pipeline.map((step) => (
            <li key={step.tool} className={styles.stage}>
              <span className={styles.stageNode} aria-hidden="true" />
              <h3 className={styles.stageTool}>{step.tool}</h3>
              <p className={styles.stageText}>{step.text}</p>
            </li>
          ))}
        </ol>

        <p className={styles.projectLinks}>
          <a href={PROJECT_REPO}>Source on GitHub</a>
          <Link to="/docs/eks-gitops-pipeline">Read the walk-through</Link>
        </p>
      </div>
    </section>
  );
}

function Certifications() {
  return (
    <section className={styles.section} id="certifications" aria-labelledby="certs-title">
      <div className={`${styles.wrap} ${styles.split}`}>
        <div className={styles.rail}>
          <h2 id="certs-title" className={styles.sectionTitle}>Certifications</h2>
          <p className={styles.muted}>Each badge opens its Credly verification page.</p>
        </div>
        <ul className={styles.certs}>
          {certifications.map((c) => (
            <li key={c.name}>
              <a className={styles.cert} href={c.url} target="_blank" rel="noopener noreferrer">
                <img
                  src={c.badge}
                  alt=""
                  width="88"
                  height="88"
                  loading="lazy"
                  className={styles.certBadge}
                />
                <span className={styles.certName}>{c.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Toolbox() {
  return (
    <section className={`${styles.section} ${styles.sectionTight}`} id="toolbox" aria-labelledby="toolbox-title">
      <div className={`${styles.wrap} ${styles.split}`}>
        <div className={styles.rail}>
          <h2 id="toolbox-title" className={styles.sectionTitle}>Toolbox</h2>
        </div>
        <dl className={styles.toolbox}>
          {toolbox.map((t) => (
            <div key={t.group} className={styles.tool}>
              <dt>{t.group}</dt>
              <dd>{t.items}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function Writing() {
  return (
    <section className={`${styles.section} ${styles.sectionTight}`} id="writing" aria-labelledby="writing-title">
      <div className={`${styles.wrap} ${styles.split}`}>
        <div className={styles.rail}>
          <h2 id="writing-title" className={styles.sectionTitle}>Writing</h2>
        </div>
        <div className={styles.writing}>
          <Link to="/blog" className={styles.writingLink}>
            <span className={styles.writingTitle}>Weekly learning log</span>
            <span className={styles.writingText}>Short notes on what I picked up each week, in public.</span>
          </Link>
          <Link to="/docs/intro" className={styles.writingLink}>
            <span className={styles.writingTitle}>Infrastructure deep dives</span>
            <span className={styles.writingText}>Longer walk-throughs of how a system is put together and why.</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function Contact({resumeUrl}) {
  return (
    <section className={styles.contact} id="contact" aria-labelledby="contact-title">
      <div className={styles.wrap}>
        <h2 id="contact-title" className={styles.contactTitle}>
          Get in touch
        </h2>
        <p className={styles.contactLede}>
          Happy to talk about SRE, platform engineering and AIOps. Email is the quickest way to reach me.
        </p>
        <a className={styles.contactEmail} href={`mailto:${EMAIL}`}>
          {EMAIL}
        </a>
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
    </section>
  );
}

export default function Home() {
  const resumeUrl = useBaseUrl('/files/resume.pdf');
  return (
    <Layout
      title="SRE and DevOps engineer"
      description="Alok Xavier is an SRE and DevOps engineer running 1,500+ servers across 23+ AWS accounts for Avis Budget Group at TCS.">
      <main className={styles.page}>
        <Hero resumeUrl={resumeUrl} />
        <Work />
        <Project />
        <Certifications />
        <Toolbox />
        <Writing />
        <Contact resumeUrl={resumeUrl} />
      </main>
    </Layout>
  );
}
