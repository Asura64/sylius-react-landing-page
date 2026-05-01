import { useEffect, type CSSProperties } from 'react'
import { Globe, MapPin, Printer, Phone } from 'lucide-react'
import './style.scss'

const contactIconMap = {
  globe: Globe,
  mapPin: MapPin,
  phone: Phone
}

const cvProfile = {
  name: 'Patxi Iparaguirre',
  title: 'Lead Developer / Architecte',
  summary:
    "Lead developer avec une solide expérience en conception de plateformes e-commerce, architecture applicative, accompagnement d'équipes et transmission technique. J'ai régulièrement travaillé au plus près du CTO sur des sujets structurants, avec l'objectif d'évoluer vers un poste de CTO ou Assistant CTO.",
  contact: [
    {
      icon: 'globe',
      value: 'patxi.iparaguirre.fr',
      href: 'https://patxi.iparaguirre.fr',
    },
    {
      icon: 'phone',
      value: '0664001683',
      href: 'tel:0664001683',
    },
    {
      icon: 'mapPin',
      value: "6 chemin d'Etxeberria, 64480 Ustaritz",
    }
  ],
  experiences: [
    {
      title: 'Formateur Sylius 2',
      company: 'Indépendant',
      period: "2026",
      track: 'side',
      bullets: [
        'Conception d’une formation au framework Sylius version 2',
      ],
    },
    {
      title: 'Formateur Magento 2',
      company: 'Indépendant',
      period: "2024",
      track: 'side',
      bullets: [
        'Conception d’un parcours personnalisé d\'apprentissage du framework Magento version 2',
        'Formation de l\'équipe de développement de "Matériel CHR PRO"',
      ],
    },
    {
      title: 'Mentor Openclassrooms',
      company: 'Indépendant',
      period: "2018-aujourd'hui",
      track: 'side',
      bullets: [
        'Accompagnement individualisé des étudiants en formation sur les parcours développeur web, développeur PHP et Symfony',
        'Évaluation des projets des étudiants avant passage devant le jury'
      ],
    },
    {
      title: 'Lead Dev Architecte',
      company: 'Zoomalia',
      period: '2023-aujourd\'hui',
      track: 'main',
      bullets: [
        'Conception CRM internalisé',
        'Conception de services IA',
        'Migration majeure du code et des serveurs (PHP 5.6 -> 8.4 & MySQL 5.6 -> 8.0)',
        'Refonte complète des outils DevOps',
        'Ateliers de formation',
        'Assistance au CTO',
      ],
    },
    {
      title: 'Lead Developer',
      company: 'Calliweb',
      period: '2021-2023',
      track: 'main',
      bullets: [
        'Conception de projets sous Magento ou Sylius',
        'Soutien technique des projets à haute complexité',
        'Assistance au CTO',
      ],
    },
    {
      title: 'Développeur fullstack',
      company: 'Zoomalia',
      period: '2019-2021',
      track: 'main',
      bullets: [
        'Contribution aux évolutions d\'architecture - automatisation de la chaîne logistique',
        'Evolution et maintenance du site e-commerce, de l\'ERP et des outils internes logistique',
      ],
    },
    {
      title: 'Expert technique',
      company: 'Armée de l\'air, BA118 Mt-de-Marsan',
      period: '2016-2019',
      track: 'main',
      bullets: [],
    },
    {
      title: 'Instructeur Electronique - Informatique',
      company: 'Armée de l\'air, BA721 Rochefort',
      period: '2010-2016',
      track: 'main',
      bullets: [],
    },
    {
      title: 'Technicien systèmes de navigation',
      company: 'Armée de l\'air, BA128 Metz',
      period: '2002-2010',
      track: 'main',
      bullets: [],
    }
  ],
  skills: [
    {
      title: 'PHP',
      level: 95,
    },
    {
      title: 'MySQL',
      level: 90,
    },
    {
      title: 'Symfony',
      level: 90,
    },
    {
      title: 'Sylius',
      level: 88,
    },
    {
      title: 'Magento',
      level: 84,
    },
    {
      title: 'DevOps',
      level: 75,
    },
    {
      title: 'Infrastructure et réseau',
      level: 78,
    },
    {
      title: 'Performance Web',
      level: 82,
    },
    {
      title: 'Pédagogie',
      level: 97,
    }
  ],
  education: [
    {
      title: 'Formation autodidacte continue',
      detail: '54 certificats de 2016 à aujourd\'hui (Développement, Gestion de projet, Systèmes & Réseaux)' ,
    },
    {
      title: 'Certificat - Manager DevOps',
      detail: '2025 - Openclassrooms',
    },
    {
      title: 'Certificat - Symfony',
      detail: '2017 - Openclassrooms',
    },
    {
      title: 'Certificat - Formateur',
      detail: '2010 - Armée de l\'air',
    },
    {
      title: 'BTS',
      detail: '2002 - Armée de l\'air',
    },
  ],
}

export function CvPage() {
  const mainExperiences = cvProfile.experiences.filter((experience) => experience.track === 'main')
  const sideExperiences = cvProfile.experiences.filter((experience) => experience.track === 'side')

  useEffect(() => {
    document.title = 'CV | Patxi Iparaguirre'

    let metaDescription = document.querySelector('meta[name="description"]')

    if (!metaDescription) {
      metaDescription = document.createElement('meta')
      metaDescription.setAttribute('name', 'description')
      document.head.appendChild(metaDescription)
    }

    metaDescription.setAttribute(
      'content',
      'CV de Patxi Iparaguirre, développeur Symfony et Sylius spécialisé en e-commerce, architecture applicative et accompagnement technique.',
    )

    let canonicalLink = document.querySelector('link[rel="canonical"]')

    if (!canonicalLink) {
      canonicalLink = document.createElement('link')
      canonicalLink.setAttribute('rel', 'canonical')
      document.head.appendChild(canonicalLink)
    }

    canonicalLink.setAttribute('href', 'https://patxi.iparaguirre.fr/cv/')
  }, [])

  return (
    <main className="cv-page">
      <article className="cv-page__sheet">
        <div className="cv-page__actions">
          <button
            className="cv-page__print-button"
            type="button"
            onClick={() => window.print()}
          >
            <Printer size={16} strokeWidth={2.1} aria-hidden="true" />
            Imprimer
          </button>
        </div>

        <header className="cv-page__header">
          <img
            className="cv-page__avatar"
            src="/resource/avatar/patxi_real.jpeg"
            alt="Portrait de Patxi Iparaguirre"
          />

          <div className="cv-page__intro">
            <ul className="cv-page__contact-list" aria-label="Informations de contact">
              {cvProfile.contact.map((item) => (
                <li key={item.value} className="cv-page__contact-item">
                  <span className="cv-page__contact-icon" aria-hidden="true">
                    {(() => {
                      const Icon = contactIconMap[item.icon as keyof typeof contactIconMap]

                      return Icon ? <Icon size={15} strokeWidth={2.1} /> : null
                    })()}
                  </span>
                  {item.href ? (
                    <a className="cv-page__contact-link" href={item.href} target="_blank" rel="noreferrer">
                      {item.value}
                    </a>
                  ) : (
                    <span className="cv-page__contact-value">{item.value}</span>
                  )}
                </li>
              ))}
            </ul>

            <div className="cv-page__identity">
              <h1 className="cv-page__name">{cvProfile.name}</h1>
              <p className="cv-page__title">{cvProfile.title}</p>
            </div>
          </div>
        </header>

        <section className="cv-page__section">
          <div className="cv-page__section-label">
            <h2>À propos</h2>
          </div>

          <div className="cv-page__section-content">
            <p className="cv-page__summary">{cvProfile.summary}</p>
          </div>
        </section>

        <section className="cv-page__section">
          <div className="cv-page__section-label">
            <h2>Expériences</h2>
          </div>

          <div className="cv-page__section-content cv-page__section-content--experience">
            <div className="cv-page__experience-split">
              <div className="cv-page__experience-column">
                <p className="cv-page__column-title">Parcours principal</p>

                {mainExperiences.map((experience) => (
                  <article key={`${experience.title}-${experience.period}`} className="cv-page__entry">
                    <div className="cv-page__entry-heading">
                      <div>
                        <h3 className="cv-page__entry-title">{experience.title}</h3>
                        <div className="cv-page__entry-meta">
                          <p className="cv-page__entry-subtitle">{experience.company}</p>
                          <p className="cv-page__entry-period">{experience.period}</p>
                        </div>
                      </div>
                    </div>

                    <ul className="cv-page__entry-list">
                      {experience.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>

              <div className="cv-page__experience-column cv-page__experience-column--side">
                <p className="cv-page__column-title">Activités freelance</p>

                {sideExperiences.map((experience) => (
                  <article key={`${experience.title}-${experience.period}`} className="cv-page__entry">
                    <div className="cv-page__entry-heading">
                      <div>
                        <h3 className="cv-page__entry-title">{experience.title}</h3>
                        <div className="cv-page__entry-meta cv-page__entry-meta--side">
                          <p className="cv-page__entry-subtitle">{experience.company}</p>
                          <p className="cv-page__entry-period">{experience.period}</p>
                        </div>
                      </div>
                    </div>

                    <ul className="cv-page__entry-list">
                      {experience.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="cv-page__section">
          <div className="cv-page__section-label">
            <h2>Compétences</h2>
          </div>

          <div className="cv-page__section-content cv-page__section-content--grid">
            {cvProfile.skills.map((skill) => (
              <article key={skill.title} className="cv-page__skill-group">
                <div className="cv-page__skill-heading">
                  <h3 className="cv-page__skill-title">{skill.title}</h3>
                </div>
                <div
                  className="cv-page__skill-bar"
                  aria-hidden="true"
                  style={{ '--skill-level': `${skill.level}%` } as CSSProperties}
                >
                  <span className="cv-page__skill-bar-fill" />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="cv-page__section">
          <div className="cv-page__section-label">
            <h2>Formation</h2>
          </div>

          <div className="cv-page__section-content">
            <ul className="cv-page__education-list">
              {cvProfile.education.map((education) => (
                <li key={`${education.title}-${education.detail}`} className="cv-page__education-item">
                  <span className="cv-page__education-title">{education.title}</span>
                  <span className="cv-page__education-detail">{education.detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </article>
    </main>
  )
}
