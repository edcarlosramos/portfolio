// Conteúdo do site. Campos `href`/`image`/`photo` nulos são placeholders:
// basta preencher para o link ou a imagem passarem a ser usados.

export const MOTION_OK = '(prefers-reduced-motion: no-preference)';

export const navLinks = [
  { id: 'home', title: 'Home' },
  { id: 'sobre', title: 'Sobre mim' },
  { id: 'projetos', title: 'Projetos' },
  { id: 'contato', title: 'Contato' },
];

export const statement =
  'Transformo dados em decisões, ideias em interfaces e código em produtos funcionais.';

export const projects = [
  {
    id: 'twotalk-plataforma',
    name: 'twotalk',
    description: 'Plataforma de ensino de idiomas',
    roles: ['Co-founder', 'Product Manager', 'Desenvolvedor'],
    image: null,
    href: null,
  },
  {
    id: 'twotalk-checkin',
    name: 'twotalk',
    description: 'Plataforma de ensino de idiomas',
    roles: ['Co-founder', 'Product Manager', 'Desenvolvedor'],
    image: null,
    href: null,
  },
  {
    id: 'twotalk-podcast',
    name: 'twotalk',
    description: 'Plataforma de ensino de idiomas',
    roles: ['Co-founder', 'Product Manager', 'Desenvolvedor'],
    image: null,
    href: null,
  },
  {
    id: 'twotalk-diagrama',
    name: 'twotalk',
    description: 'Plataforma de ensino de idiomas',
    roles: ['Co-founder', 'Product Manager', 'Desenvolvedor'],
    image: null,
    href: null,
  },
];

export const about = {
  photo: null,
  photoAlt: 'Retrato de Edcarlos Ramos',
  paragraphs: [
    'Olá! Me chamo Edcarlos, sou bacharel em Ciência da Computação, Desenvolvedor Web e Analista de dados.',
    'Minha trajetória com números e resolução de problemas começou na minha graduação em Matemática em 2020, mas foi na computação que encontrei a combinação perfeita entre lógica, análise estratégica e criação de software. Migrei de área em 2022 e concluí a graduação em Ciência da Computação em 2026, construindo uma base sólida que une o rigor analítico ao desenvolvimento técnico.',
    'Minha atuação transita entre a análise de dados para geração de insights e o desenvolvimento web para construção de interfaces e sistemas. Além da experiência acadêmica e corporativa em dados, vivenciei na prática a criação de produtos como co-fundador da twotalk. Nessa iniciativa, atuei do conceito à execução, articulando código, experiência do usuário e estratégia.',
    'Acredito que o verdadeiro valor da tecnologia está em traduzir dores de negócio em soluções técnicas eficientes. Por conectar as pontas: dados e visão estratégica, tenho como objetivo de carreira ainda atuar na área de Product Management, liderando produtos que causem impacto real.',
    'Seja para analisar dados complexos, desenvolver aplicações web ou estruturar novos produtos, estou sempre aberto a novos desafios e conexões.',
  ],
};

export const skillGroups = [
  {
    id: 'dados',
    label: 'Dados',
    items: ['Python', 'NumPy', 'Pandas', 'PowerBI', 'SQL', 'PostgreSQL', 'AI', 'Machine Learning'],
  },
  {
    id: 'web',
    label: 'Web e design',
    items: ['VueJs', 'JavaScript', 'React', 'Tailwind CSS', 'Gsap', 'UI & UX', 'Figma'],
  },
];

export const softSkills = [
  'Empatia',
  'Comunicação',
  'Pensamento Analítico',
  'Rápido Aprendizado',
  'Escuta Ativa',
  'Trabalho em Equipe',
];

export const contacts = [
  {
    id: 'email',
    label: 'E-mail',
    value: 'contato@edcarlos.ramos.br',
    href: 'mailto:contato@edcarlos.ramos.br',
  },
  {
    id: 'linkedin',
    label: 'Linkedin',
    value: 'Edcarlos dos Santos Ramos',
    href: null,
  },
];

export const socialMedia = [
  { id: 'linkedin', label: 'LinkedIn', href: null },
  { id: 'x', label: 'X', href: null },
];
