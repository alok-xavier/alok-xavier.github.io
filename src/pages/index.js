import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">Alok Xavier</h1>
        <p className="hero__subtitle" style={{fontSize: '1.5rem'}}>DevOps & SRE Engineer</p>
        <p style={{fontSize: '1.1rem', marginTop: '1rem', maxWidth: '800px', margin: '1rem auto'}}>
          4+ years managing enterprise-scale cloud infrastructure | 16+ production applications across 23+ AWS accounts | 
          1500+ servers | Learning in public and documenting my DevOps journey
        </p>
        
        <div className={styles.buttons} style={{marginTop: '2rem'}}>
          <Link className="button button--secondary button--lg" to="/blog">
            📖 Weekly Learning Log
          </Link>
          &nbsp;&nbsp;
          <Link className="button button--outline button--secondary button--lg" to="/docs/intro">
            🛠️ Infrastructure Deep Dives
          </Link>
          &nbsp;&nbsp;
          <a className="button button--primary button--lg" href={require('/static/files/resume.pdf').default} download>
            📄 Download Resume
          </a>
        </div>
      </div>
    </header>
  );
}

function ExperienceSection() {
  return (
    <section style={{padding: '4rem 0', backgroundColor: '#f8f9fa'}}>
      <div className="container">
        <h2 style={{textAlign: 'center', marginBottom: '3rem'}}>Professional Experience</h2>
        
        <div style={{maxWidth: '900px', margin: '0 auto'}}>
          <div style={{padding: '2rem', background: 'white', borderRadius: '8px', borderLeft: '4px solid #0066cc'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap'}}>
              <div>
                <h3 style={{marginBottom: '0.5rem'}}>Systems Engineer (SRE/DevOps)</h3>
                <p style={{color: '#666', marginBottom: '1rem'}}>Tata Consultancy Services</p>
              </div>
              <p style={{color: '#666', fontStyle: 'italic'}}>Aug 2021 - Present</p>
            </div>
            
            <ul style={{marginTop: '1rem', lineHeight: '1.8'}}>
              <li>Global SRE team managing 16+ enterprise applications across 23+ AWS accounts for Avis Budget Group</li>
              <li>Administer 1500+ servers with Terraform-based IaC, Jenkins, ArgoCD, and AWS services</li>
              <li>Manage 500+ SSL certificates and coordinate monthly OS patching across multi-account environments</li>
              <li>Primary POC for deployment support, pipeline failures, and P1 incident response</li>
              <li>Built observability dashboards with CloudWatch, Splunk, Dynatrace, and Grafana</li>
              <li>Implemented AI-driven cost optimization with Sedai, achieving 20% cost savings</li>
              <li>Key contributor to securing AWS Resilience Services Competency certification</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function CertificationsSection() {
  const certifications = [
    {
      name: 'AWS Solutions Architect - Associate',
      badge: 'https://images.credly.com/size/340x340/images/0e284c3f-5164-4b21-8660-0d84737941bc/image.png',
      credly: 'https://www.credly.com/badges/3004091e-e1ce-47e1-b428-b7f7fe857532/public_url'
    },
    {
      name: 'AWS AI Practitioner',
      badge: 'https://images.credly.com/size/340x340/images/61542181-3d9c-4725-8a33-c7a4e2f8d943/image.png',
      credly: 'https://www.credly.com/badges/74e72ad3-9c24-4c0f-8cf0-5d99fd319da0/public_url'
    },
    {
      name: 'Google Cloud Associate Engineer',
      badge: 'https://templates.images.credential.net/16590187933301617801540872729153.png',
      credly: 'https://www.credly.com/badges/ff335805-8b73-4bed-bf12-1f036c9e113e/public_url'
    },
    {
      name: 'AWS AI Practitioner Early Adopter',
      badge: 'https://images.credly.com/size/340x340/images/f8c89d84-c7e3-4f84-8e48-f2f27ee5c6a7/image.png',
      credly: 'https://www.credly.com/badges/e71667d2-e11c-4f22-b3dd-83952bb8cf1b/public_url'
    }
  ];

  return (
    <section style={{padding: '4rem 0', textAlign: 'center'}}>
      <div className="container">
        <h2 style={{marginBottom: '3rem'}}>Certifications</h2>
        <div style={{display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', maxWidth: '1000px', margin: '0 auto'}}>
          {certifications.map((cert, idx) => (
            <a 
              key={idx} 
              href={cert.credly} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{textDecoration: 'none', color: 'inherit'}}
            >
              <div style={{
                padding: '1.5rem',
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s',
                cursor: 'pointer',
                maxWidth: '200px'
              }}>
                <img src={cert.badge} alt={cert.name} style={{width: '120px', height: '120px', marginBottom: '1rem'}} />
                <p style={{fontSize: '0.9rem', fontWeight: '500'}}>{cert.name}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function SkillsSection() {
  const skills = [
    { 
      category: 'Cloud Platforms', 
      items: ['AWS (Expert)', 'GCP', 'Multi-Account Management'] 
    },
    { 
      category: 'Infrastructure as Code', 
      items: ['Terraform', 'CloudFormation', 'Ansible'] 
    },
    { 
      category: 'Containers & Orchestration', 
      items: ['Docker', 'Kubernetes', 'EKS', 'ArgoCD'] 
    },
    { 
      category: 'CI/CD & GitOps', 
      items: ['Jenkins', 'GitHub Actions', 'BitBucket Pipelines', 'ArgoCD'] 
    },
    { 
      category: 'Monitoring & Observability', 
      items: ['Grafana', 'Prometheus', 'Dynatrace', 'CloudWatch', 'Splunk'] 
    },
    { 
      category: 'Version Control & SCM', 
      items: ['Git', 'BitBucket', 'CodeCommit', 'GitHub'] 
    },
    { 
      category: 'Scripting & Automation', 
      items: ['Bash', 'Python', 'PowerShell'] 
    },
    { 
      category: 'Tools & Platforms', 
      items: ['Jira', 'ServiceNow', 'Confluence', 'Sedai'] 
    }
  ];

  return (
    <section style={{padding: '4rem 0', backgroundColor: '#f8f9fa'}}>
      <div className="container">
        <h2 style={{textAlign: 'center', marginBottom: '3rem'}}>Technical Skills</h2>
        <div style={{
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '2rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {skills.map((skill, idx) => (
            <div key={idx} style={{
              padding: '2rem', 
              background: 'white',
              border: '1px solid #e0e0e0', 
              borderRadius: '12px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <h3 style={{marginBottom: '1rem', fontSize: '1.1rem', color: '#0066cc'}}>{skill.category}</h3>
              <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
                {skill.items.map((item, i) => (
                  <li key={i} style={{padding: '0.4rem 0', fontSize: '0.95rem'}}>
                    <span style={{color: '#0066cc', marginRight: '0.5rem'}}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectsSection() {
  return (
    <section style={{padding: '4rem 0'}}>
      <div className="container">
        <h2 style={{textAlign: 'center', marginBottom: '3rem'}}>Featured Projects</h2>
        
        <div style={{maxWidth: '900px', margin: '0 auto'}}>
          <div style={{
            padding: '2rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            color: 'white'
          }}>
            <h3 style={{color: 'white', marginBottom: '1rem'}}>EKS GitOps DevOps Pipeline</h3>
            <p style={{marginBottom: '1.5rem', opacity: 0.9}}>
              End-to-end GitOps implementation with AWS EKS, Terraform, and ArgoCD
            </p>
            <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem'}}>
              <span style={{padding: '0.3rem 0.8rem', background: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '0.85rem'}}>
                AWS EKS
              </span>
              <span style={{padding: '0.3rem 0.8rem', background: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '0.85rem'}}>
                Terraform
              </span>
              <span style={{padding: '0.3rem 0.8rem', background: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '0.85rem'}}>
                Kubernetes
              </span>
              <span style={{padding: '0.3rem 0.8rem', background: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '0.85rem'}}>
                ArgoCD
              </span>
              <span style={{padding: '0.3rem 0.8rem', background: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '0.85rem'}}>
                GitHub Actions
              </span>
            </div>
            <div style={{marginBottom: '1.5rem', lineHeight: '1.8', opacity: 0.95}}>
              <p>• Provisioned AWS EKS clusters using Terraform with reusable modules and remote state management</p>
              <p>• Built CI pipelines to automate Docker image builds and application packaging</p>
              <p>• Implemented continuous delivery using ArgoCD for declarative Kubernetes deployments</p>
            </div>
            <Link 
              to="https://github.com/alok-xavier" 
              target="_blank"
              style={{
                display: 'inline-block',
                marginTop: '1rem',
                padding: '0.7rem 1.5rem',
                background: 'white',
                color: '#667eea',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600'
              }}
            >
              View on GitHub →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section style={{padding: '4rem 0', backgroundColor: '#1a1a2e', color: 'white', textAlign: 'center'}}>
      <div className="container">
        <h2 style={{color: 'white', marginBottom: '1rem'}}>Let's Connect</h2>
        <p style={{opacity: 0.8, marginBottom: '2rem'}}>
          Open to discussing DevOps, cloud infrastructure, and SRE practices
        </p>
        <div style={{display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap'}}>
          <Link 
            className="button button--lg"
            to="https://github.com/alok-xavier" 
            target="_blank"
            style={{background: '#333', color: 'white'}}
          >
            🐙 GitHub
          </Link>
          <Link 
            className="button button--lg"
            to="https://linkedin.com/in/alok-xavier" 
            target="_blank"
            style={{background: '#0077b5', color: 'white'}}
          >
            💼 LinkedIn
          </Link>
          <Link 
            className="button button--lg"
            to="mailto:alokx6@gmail.com"
            style={{background: '#ea4335', color: 'white'}}
          >
            ✉️ Email
          </Link>
          <a 
            className="button button--lg"
            href={require('/static/files/resume.pdf').default}
            download
            style={{background: '#16a34a', color: 'white'}}
          >
            📄 Resume
          </a>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <Layout
      title="Home"
      description="Alok Xavier - DevOps & SRE Engineer with 4+ years managing enterprise cloud infrastructure">
      <HomepageHeader />
      <main>
        <ExperienceSection />
        <CertificationsSection />
        <SkillsSection />
        <ProjectsSection />
        <ContactSection />
      </main>
    </Layout>
  );
}