export const cvProfile = {
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
    },
  ],
  experiences: [
    {
      title: 'Formateur Sylius 2',
      company: 'Indépendant',
      period: '2026',
      track: 'side',
      bullets: ['Conception d’une formation au framework Sylius version 2'],
    },
    {
      title: 'Formateur Magento 2',
      company: 'Indépendant',
      period: '2024',
      track: 'side',
      bullets: [
        "Conception d’un parcours personnalisé d'apprentissage du framework Magento version 2",
        `Formation de l'équipe de développement de "Matériel CHR PRO"`,
      ],
    },
    {
      title: 'Mentor Openclassrooms',
      company: 'Indépendant',
      period: "2018-aujourd'hui",
      track: 'side',
      bullets: [
        'Accompagnement individualisé des étudiants en formation sur les parcours développeur web, développeur PHP et Symfony',
        'Évaluation des projets des étudiants avant passage devant le jury',
      ],
    },
    {
      title: 'Lead Dev Architecte',
      company: 'Zoomalia',
      period: "2023-aujourd'hui",
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
        "Contribution aux évolutions d'architecture - automatisation de la chaîne logistique",
        "Evolution et maintenance du site e-commerce, de l'ERP et des outils internes logistique",
      ],
    },
    {
      title: 'Expert technique',
      company: "Armée de l'air, BA118 Mt-de-Marsan",
      period: '2016-2019',
      track: 'main',
      bullets: [],
    },
    {
      title: 'Instructeur Electronique - Informatique',
      company: "Armée de l'air, BA721 Rochefort",
      period: '2010-2016',
      track: 'main',
      bullets: [],
    },
    {
      title: 'Technicien systèmes de navigation',
      company: "Armée de l'air, BA128 Metz",
      period: '2002-2010',
      track: 'main',
      bullets: [],
    },
  ],
  skills: [
    { title: 'PHP', level: 95 },
    { title: 'MySQL', level: 90 },
    { title: 'Symfony', level: 90 },
    { title: 'Sylius', level: 88 },
    { title: 'Magento', level: 84 },
    { title: 'DevOps', level: 75 },
    { title: 'Infrastructure et réseau', level: 78 },
    { title: 'Performance Web', level: 82 },
    { title: 'Pédagogie', level: 97 },
  ],
  education: [
    {
      title: 'Formation autodidacte continue',
      detail: "54 certificats de 2016 à aujourd'hui (Développement, Gestion de projet, Systèmes & Réseaux)",
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
      detail: "2010 - Armée de l'air",
    },
    {
      title: 'BTS',
      detail: "2002 - Armée de l'air",
    },
  ],
} as const
