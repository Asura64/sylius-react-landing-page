export type NavigationLink = {
  label: string
  href: string
  active: boolean
}

export type NavigationContent = {
  brand: string
  links: NavigationLink[]
  cta: {
    label: string
    href: string
  }
}

export type HeroContent = {
  eyebrow: string
  titlePrefix: string
  titleHighlight: string
  description: string
  primaryAction: {
    label: string
    href: string
  }
  secondaryAction: {
    label: string
    href: string
  }
  visualLabel: string
}

export type ModuleTheme = 'primary' | 'secondary' | 'tertiary' | 'danger'
export type ModuleLayout = 'left' | 'right'

export type ModuleContent = {
  id: string
  title: string
  description: string
  icon: string
  theme: ModuleTheme
  layout: ModuleLayout
  art: string
}

export type FeatureAction = {
  label: string
  href: string
  variant: 'light' | 'outline'
}

export type FeatureHighlight = {
  title: string
  description: string
  icon: string
  tone: 'primary' | 'secondary' | 'tertiary'
}

export type FeatureGridContent = {
  kicker: string
  title: string
  description: string
  actions: FeatureAction[]
  highlights: FeatureHighlight[]
}

export type FooterLink = {
  label: string
  href: string
}

export type FooterContent = {
  brand: string
  copy: string
  links: FooterLink[]
}

export type TrainingContent = {
  navigation: NavigationContent
  hero: HeroContent
  modules: ModuleContent[]
  featureGrid: FeatureGridContent
  footer: FooterContent
}
