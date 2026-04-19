import type { PropsWithChildren } from 'react'

type DocumentProps = PropsWithChildren<{
  assetBase: string
  bootstrapModule: string
  canonicalUrl: string
  description: string
  stylesheets: string[]
  title: string
}>

export function Document({
  assetBase,
  bootstrapModule,
  canonicalUrl,
  children,
  description,
  stylesheets,
  title,
}: DocumentProps) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="index,follow" />
        <meta name="theme-color" content="#1100bc" />
        <link rel="icon" type="image/x-icon" href={`${assetBase}favicon.ico`} />
        <link rel="canonical" href={canonicalUrl} />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@3.1.0/dist/cookieconsent.css"
        />
        {stylesheets.map((stylesheet) => (
          <link key={stylesheet} rel="stylesheet" href={stylesheet} />
        ))}

        <meta property="og:type" content="website" />
        <meta property="og:locale" content="fr_FR" />
        <meta
          property="og:title"
          content={title}
        />
        <meta
          property="og:description"
          content="Maîtrisez Sylius 2 avec un parcours progressif : installation, configuration de la boutique, personnalisations avancées, workflow et accompagnement sur mesure."
        />
        <meta property="og:site_name" content="Formation Sylius 2" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta
          name="twitter:description"
          content="Installation, configuration de la boutique, fixtures YAML, ResourceBundle, Live Components, workflow et qualité sur Sylius 2."
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Organization',
                  name: 'Patxi Iparaguirre',
                  description: 'Formateur, mentor et lead developer spécialisé sur Sylius 2.',
                  sameAs: [
                    'https://docs.sylius.com',
                    'https://sylius.com/slack',
                    'https://demo.sylius.com',
                  ],
                },
                {
                  '@type': 'Course',
                  name: 'Formation Sylius 2',
                  description:
                    'Formation Sylius 2 orientée installation, configuration métier de la boutique, personnalisation, workflow, qualité et accompagnement sur mesure.',
                  provider: {
                    '@type': 'Organization',
                    name: 'Patxi Iparaguirre',
                  },
                  educationalLevel: 'Advanced',
                  teaches: [
                    'Installation de Sylius 2',
                    'Configuration de la boutique Sylius',
                    'Fixtures YAML',
                    'ResourceBundle',
                    'Grilles admin et front',
                    'Twig Hooks',
                    'Symfony UX Live Components',
                    'Workflow',
                    'Qualité de code',
                  ],
                },
              ],
            }),
          }}
        />
      </head>
      <body>
        <div id="root">{children}</div>

        <script src="https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@3.1.0/dist/cookieconsent.umd.js"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              var Tawk_API = Tawk_API || {};
              var Tawk_LoadStart;
              var tawkLoaded = false;

              function loadTawk() {
                if (tawkLoaded) return;

                tawkLoaded = true;
                Tawk_LoadStart = new Date();

                var s1 = document.createElement('script');
                var s0 = document.getElementsByTagName('script')[0];
                s1.async = true;
                s1.src = 'https://embed.tawk.to/69c7f21bdaad591c3707daa3/1jkqgjf4j';
                s1.charset = 'UTF-8';
                s1.setAttribute('crossorigin', '*');
                s0.parentNode.insertBefore(s1, s0);
              }

              function updateSupportServices() {
                if (window.CookieConsent && window.CookieConsent.acceptedCategory('support')) {
                  loadTawk();
                }
              }

              CookieConsent.run({
                guiOptions: {
                  consentModal: {
                    layout: 'box',
                    position: 'bottom right',
                    equalWeightButtons: true,
                    flipButtons: false,
                  },
                  preferencesModal: {
                    layout: 'box',
                    position: 'right',
                    equalWeightButtons: true,
                    flipButtons: false,
                  },
                },
                categories: {
                  necessary: {
                    enabled: true,
                    readOnly: true,
                  },
                  support: {},
                },
                language: {
                  default: 'fr',
                  translations: {
                    fr: {
                      consentModal: {
                        title: 'Ce site utilise des cookies',
                        description: 'Nous utilisons des cookies necessaires au fonctionnement du site et, avec votre accord, un service de support par chat.',
                        acceptAllBtn: 'Tout accepter',
                        acceptNecessaryBtn: 'Tout refuser',
                        showPreferencesBtn: 'Personnaliser',
                      },
                      preferencesModal: {
                        title: 'Preferences de consentement',
                        acceptAllBtn: 'Tout accepter',
                        acceptNecessaryBtn: 'Tout refuser',
                        savePreferencesBtn: 'Enregistrer mes choix',
                        closeIconLabel: 'Fermer',
                        sections: [
                          {
                            title: 'Gestion des cookies',
                            description: 'Vous pouvez choisir les services actives sur ce site.',
                          },
                          {
                            title: 'Cookies strictement necessaires',
                            description: 'Ils sont indispensables au bon fonctionnement du site et ne peuvent pas etre desactives.',
                            linkedCategory: 'necessary',
                          },
                          {
                            title: 'Support et assistance',
                            description: 'Autorise le chargement du chat Tawk.to pour vous permettre de nous contacter rapidement.',
                            linkedCategory: 'support',
                          },
                        ],
                      },
                    },
                  },
                },
                onFirstConsent: updateSupportServices,
                onConsent: updateSupportServices,
                onChange: updateSupportServices,
              });
            `,
          }}
        />
        <script type="module" src={bootstrapModule}></script>
      </body>
    </html>
  )
}
