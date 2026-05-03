function attrsToString(attributes: Record<string, string | number | undefined>) {
  return Object.entries(attributes)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}="${String(value)}"`)
    .join(' ')
}

function renderSvg(
  innerHtml: string,
  {
    className,
    size = 24,
    strokeWidth = 2,
  }: {
    className?: string
    size?: number
    strokeWidth?: number
  } = {},
) {
  return `
    <svg
      ${attrsToString({
        class: className,
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': strokeWidth,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'aria-hidden': 'true',
      })}
    >
      ${innerHtml}
    </svg>
  `
}

const moduleIconPaths: Record<string, string> = {
  package: `
    <path d="M16.5 9.4 7.5 4.21"></path>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <path d="M3.29 7 12 12l8.71-5"></path>
    <path d="M12 22V12"></path>
  `,
  settings: `
    <path d="M12 3v3"></path>
    <path d="M18.36 5.64l-2.12 2.12"></path>
    <path d="M21 12h-3"></path>
    <path d="M18.36 18.36l-2.12-2.12"></path>
    <path d="M12 21v-3"></path>
    <path d="M5.64 18.36l2.12-2.12"></path>
    <path d="M3 12h3"></path>
    <path d="M5.64 5.64l2.12 2.12"></path>
    <circle cx="12" cy="12" r="3"></circle>
  `,
  blocks: `
    <rect x="3" y="3" width="7" height="7" rx="1"></rect>
    <rect x="14" y="3" width="7" height="7" rx="1"></rect>
    <rect x="14" y="14" width="7" height="7" rx="1"></rect>
    <rect x="3" y="14" width="7" height="7" rx="1"></rect>
  `,
  grid: `
    <rect x="3" y="3" width="8" height="8" rx="1"></rect>
    <rect x="13" y="3" width="8" height="8" rx="1"></rect>
    <rect x="3" y="13" width="8" height="8" rx="1"></rect>
    <rect x="13" y="13" width="8" height="8" rx="1"></rect>
  `,
  webhook: `
    <path d="M18 16.98h-5.99"></path>
    <path d="M6 16.98H4a2 2 0 0 1-2-2v-1.99a2 2 0 0 1 2-2h3"></path>
    <path d="m9 12 3 3-3 3"></path>
    <path d="M16 7a2 2 0 1 1 4 0v3"></path>
    <path d="M20 10 17 7l-3 3"></path>
  `,
  workflow: `
    <circle cx="6" cy="6" r="3"></circle>
    <circle cx="18" cy="6" r="3"></circle>
    <circle cx="12" cy="18" r="3"></circle>
    <path d="M8.59 7.51 10.42 15"></path>
    <path d="M15.41 7.51 13.58 15"></path>
  `,
  check: `
    <path d="m9 11 3 3L22 4"></path>
    <path d="m9 17 3 3L22 10"></path>
    <path d="M2 12h4"></path>
    <path d="M2 18h4"></path>
  `,
  component: `
    <path d="M15.5 8.5 19 12l-3.5 3.5"></path>
    <path d="M8.5 8.5 5 12l3.5 3.5"></path>
    <path d="M13 5h-2"></path>
    <path d="M13 19h-2"></path>
    <path d="M19 13v-2"></path>
    <path d="M5 13v-2"></path>
    <rect x="8" y="8" width="8" height="8" rx="2"></rect>
  `,
}

const featureIconPaths: Record<string, string> = {
  'Sessions de mentorat': `
    <path d="M7 10h10"></path>
    <path d="M7 14h6"></path>
    <path d="M12 3C7.03 3 3 6.58 3 11c0 2.12.94 4.05 2.47 5.5L5 21l4.05-1.72A11 11 0 0 0 12 19c4.97 0 9-3.58 9-8s-4.03-8-9-8z"></path>
  `,
  'Format flexible': `
    <path d="M4 6h16"></path>
    <path d="M7 12h10"></path>
    <path d="M10 18h4"></path>
    <circle cx="8" cy="6" r="2"></circle>
    <circle cx="15" cy="12" r="2"></circle>
    <circle cx="12" cy="18" r="2"></circle>
  `,
  'Méthodologie active': `
    <path d="m16 18 6-6-6-6"></path>
    <path d="m8 6-6 6 6 6"></path>
  `,
  'Flexibilité totale': `
    <path d="M3 2v6h6"></path>
    <path d="M21 12A9 9 0 0 0 6 5.3L3 8"></path>
    <path d="M21 22v-6h-6"></path>
    <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"></path>
  `,
  'Support GitLab': `
    <path d="m12 3 1.8 5.2h5.4l-4.4 3.2 1.7 5.3L12 13.5 7.5 16.7l1.7-5.3-4.4-3.2h5.4z"></path>
  `,
}

export function renderModuleIconSvg(
  name: string,
  options: { className?: string; size?: number; strokeWidth?: number } = {},
) {
  return renderSvg(moduleIconPaths[name] ?? moduleIconPaths.package, options)
}

export function renderFeatureIconSvg(
  name: string,
  options: { className?: string; size?: number; strokeWidth?: number } = {},
) {
  return renderSvg(featureIconPaths[name] ?? featureIconPaths['Sessions de mentorat'], options)
}
