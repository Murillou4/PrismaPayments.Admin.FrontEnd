export type VisualRepositoryCategory =
  | 'shader'
  | 'glass'
  | 'logo'
  | 'three'
  | 'motion'
  | 'generative';

export type VisualRepositoryFit = 'direct' | 'adapter-needed' | 'reference-only';

export interface VisualRepository {
  id: string;
  name: string;
  github: string;
  category: VisualRepositoryCategory;
  fit: VisualRepositoryFit;
  priority: 'requested' | 'recommended';
  installHint?: string;
  whenToSuggest: string;
  notes: string;
}

export const requestedVisualRepositories: VisualRepository[] = [
  {
    id: 'shadergradient',
    name: 'ShaderGradient',
    github: 'https://github.com/ruucm/shadergradient',
    category: 'shader',
    fit: 'adapter-needed',
    priority: 'requested',
    installHint: 'Avaliar se o uso entra via pacote React isolado ou via shader portado para Svelte.',
    whenToSuggest: 'Quando a tela precisar de um fundo 3D vivo com gradiente fluido, parecido com hero de SaaS premium.',
    notes: 'Bom para referencia de gradientes WebGL em movimento. Neste app Svelte, precisa de adaptacao.'
  },
  {
    id: 'liquid-logo',
    name: 'liquid-logo',
    github: 'https://github.com/paper-design/liquid-logo',
    category: 'logo',
    fit: 'reference-only',
    priority: 'requested',
    whenToSuggest: 'Quando o logo Prisma precisar ganhar uma animacao de abertura ou estado especial de loading.',
    notes: 'Referencia visual para efeito liquid metal; usar com cuidado para nao distorcer marca em telas funcionais.'
  },
  {
    id: 'liquid-glass-js',
    name: 'liquid-glass-js',
    github: 'https://github.com/dashersw/liquid-glass-js',
    category: 'glass',
    fit: 'direct',
    priority: 'requested',
    installHint: 'Validar performance em Chrome/Edge antes de usar em telas densas.',
    whenToSuggest: 'Quando cards, modais ou barras precisarem de vidro mais fisico que blur CSS comum.',
    notes: 'Candidato bom para efeitos de glassmorphism pontuais, principalmente em superficies pequenas.'
  },
  {
    id: 'react-three-fiber',
    name: 'react-three-fiber',
    github: 'https://github.com/pmndrs/react-three-fiber',
    category: 'three',
    fit: 'reference-only',
    priority: 'requested',
    installHint: 'Este projeto e Svelte; para runtime real, comparar com Threlte antes de trazer React.',
    whenToSuggest: 'Quando uma experiencia React/Three.js for criada fora deste frontend Svelte.',
    notes: 'Excelente ecossistema Three.js para React, mas aqui serve mais como referencia arquitetural.'
  }
];

export const suggestedVisualRepositories: VisualRepository[] = [
  {
    id: 'threlte',
    name: 'Threlte',
    github: 'https://github.com/threlte/threlte',
    category: 'three',
    fit: 'direct',
    priority: 'recommended',
    installHint: 'npm install three @threlte/core @threlte/extras',
    whenToSuggest: 'Quando formos colocar 3D de verdade neste frontend Svelte.',
    notes: 'Alternativa Svelte-native ao react-three-fiber; deve ser a primeira opcao para este repo.'
  },
  {
    id: 'drei',
    name: 'drei',
    github: 'https://github.com/pmndrs/drei',
    category: 'three',
    fit: 'reference-only',
    priority: 'recommended',
    whenToSuggest: 'Quando precisarmos copiar padroes de cameras, controles, loaders e helpers para cenas Three.js.',
    notes: 'Helpers excelentes para R3F; em Svelte funciona melhor como referencia de composicao.'
  },
  {
    id: 'postprocessing',
    name: 'postprocessing',
    github: 'https://github.com/pmndrs/postprocessing',
    category: 'three',
    fit: 'direct',
    priority: 'recommended',
    installHint: 'npm install postprocessing',
    whenToSuggest: 'Quando a cena 3D precisar de bloom, depth of field, glitch ou passes de composicao.',
    notes: 'Biblioteca agnostica para Three.js, boa para dar acabamento visual sem depender de React.'
  },
  {
    id: 'maath',
    name: 'maath',
    github: 'https://github.com/pmndrs/maath',
    category: 'motion',
    fit: 'direct',
    priority: 'recommended',
    installHint: 'npm install maath',
    whenToSuggest: 'Quando animacoes precisarem de easing, damping e interpolacao com comportamento fisico.',
    notes: 'Pequena e util para animacoes suaves em canvas ou Three.js.'
  },
  {
    id: 'motion',
    name: 'Motion',
    github: 'https://github.com/motiondivision/motion',
    category: 'motion',
    fit: 'adapter-needed',
    priority: 'recommended',
    installHint: 'Avaliar Motion One ou animacoes Svelte nativas antes de trazer para paginas simples.',
    whenToSuggest: 'Quando uma interacao precisar de timeline, gesto ou microanimacao mais refinada.',
    notes: 'Otima referencia para motion de produto; nem toda tela precisa carregar a biblioteca.'
  },
  {
    id: 'canvas-sketch',
    name: 'canvas-sketch',
    github: 'https://github.com/mattdesl/canvas-sketch',
    category: 'generative',
    fit: 'reference-only',
    priority: 'recommended',
    whenToSuggest: 'Quando quisermos prototipar backgrounds generativos, noise fields ou assets experimentais.',
    notes: 'Bom laboratorio criativo; para producao, portar apenas o resultado necessario.'
  }
];

export const visualRepositories = [
  ...requestedVisualRepositories,
  ...suggestedVisualRepositories
] satisfies VisualRepository[];

export function getVisualRepositorySuggestions(category?: VisualRepositoryCategory) {
  if (!category) {
    return visualRepositories;
  }

  return visualRepositories.filter((repository) => repository.category === category);
}
