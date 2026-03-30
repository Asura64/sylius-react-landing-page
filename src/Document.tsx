import type { PropsWithChildren } from 'react'

type DocumentProps = PropsWithChildren<{
  bootstrapModule: string
  description: string
  stylesheets: string[]
}>

export function Document({
  bootstrapModule,
  children,
  description,
  stylesheets,
}: DocumentProps) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Formation Sylius 2 pour les devs : architecture, personnalisation et mentorat expert</title>
        <meta name="description" content={description} />
        <meta name="robots" content="index,follow" />
        <meta name="theme-color" content="#1100bc" />
        <link rel="icon" type="image/x-icon" href="./favicon.ico" />
        <link rel="canonical" href="https://patxi.iparaguirre.fr/" />
        {stylesheets.map((stylesheet) => (
          <link key={stylesheet} rel="stylesheet" href={stylesheet} />
        ))}

        <meta property="og:type" content="website" />
        <meta property="og:locale" content="fr_FR" />
        <meta
          property="og:title"
          content="Formation Sylius 2 pour les devs : architecture, personnalisation et mentorat expert"
        />
        <meta
          property="og:description"
          content="Maîtrisez Sylius 2 avec un parcours complet, des modules avancés et un accompagnement sur mesure pour vos projets e-commerce."
        />
        <meta property="og:site_name" content="Formation Sylius 2" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Formation Sylius 2 pour les devs : architecture, personnalisation et mentorat expert"
        />
        <meta
          name="twitter:description"
          content="Installation, configuration, ResourceBundle, Twig Hooks, workflow, qualité et mentorat Sylius 2."
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
                    'Formation Sylius 2 orientée architecture, personnalisation, workflow, qualité et accompagnement sur mesure.',
                  provider: {
                    '@type': 'Organization',
                    name: 'Patxi Iparaguirre',
                  },
                  educationalLevel: 'Advanced',
                  teaches: [
                    'Installation de Sylius 2',
                    'Configuration Sylius',
                    'ResourceBundle',
                    'Grilles admin et front',
                    'Twig Hooks',
                    'Twig Components',
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

        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.axeptioSettings = {
                clientId: '69c7f3285160fc279643988b',
                cookiesVersion: '6a970aaa-e6a9-47ff-81e0-d3d0771dba6d',
              };

              function loadAxeptio() {
                if (window.__axeptioLoaded) return;

                window.__axeptioLoaded = true;

                var t = document.getElementsByTagName('script')[0];
                var e = document.createElement('script');
                e.async = true;
                e.src = '//static.axept.io/sdk.js';
                t.parentNode.insertBefore(e, t);
              }

              function scheduleAxeptio() {
                if ('requestIdleCallback' in window) {
                  window.requestIdleCallback(loadAxeptio, { timeout: 2500 });
                } else {
                  window.setTimeout(loadAxeptio, 1200);
                }
              }

              if (document.readyState === 'complete') {
                scheduleAxeptio();
              } else {
                window.addEventListener('load', scheduleAxeptio, { once: true });
              }
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              var TAWK_VENDOR_ID = 'tawk.to';
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

              window._axcb = window._axcb || [];
              window._axcb.push(function (sdk) {
                if (sdk.hasAcceptedVendor(TAWK_VENDOR_ID)) {
                  loadTawk();
                }

                sdk.on('cookies:complete', function (choices) {
                  if (choices && choices[TAWK_VENDOR_ID]) {
                    loadTawk();
                  }
                });
              });
            `,
          }}
        />
        <script type="module" src={bootstrapModule}></script>
      </body>
    </html>
  )
}
