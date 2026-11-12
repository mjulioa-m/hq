export const STAGES = {
  youtube: ["idea", "guion", "miniaturas_titulos", "grabado", "edicion", "recursos", "publicado"],
  instagram: ["idea", "guion", "grabado", "edicion", "copy_hashtags", "publicado"],
  tiktok: ["idea", "guion", "grabado", "edicion", "copy_hashtags", "publicado"],
  linkedin: ["idea", "borrador", "revision", "publicado"],
  facebook: ["idea", "borrador", "revision", "publicado"],
} as const;

export type Platform = keyof typeof STAGES;

export const STAGE_LABELS: Record<string, string> = {
  idea: "Idea",
  guion: "Guion",
  miniaturas_titulos: "Miniaturas y títulos",
  grabado: "Grabado",
  edicion: "Edición",
  recursos: "Recursos",
  copy_hashtags: "Copy y hashtags",
  borrador: "Borrador",
  revision: "Revisión",
  publicado: "Final / Publicado",
};

export const PLATFORMS: {
  slug: Platform;
  name: string;
  blurb: string;
  available: boolean;
}[] = [
  {
    slug: "youtube",
    name: "YouTube",
    blurb: "Vídeos: de la idea al vídeo publicado, con sus números.",
    available: true,
  },
  {
    slug: "linkedin",
    name: "LinkedIn",
    blurb: "Posts de cada semana: borradores, publicados y reserva.",
    available: true,
  },
  {
    slug: "instagram",
    name: "Instagram",
    blurb: "Reels para Instagram.",
    available: true,
  },
  {
    slug: "tiktok",
    name: "TikTok",
    blurb: "Vídeos cortos, del gancho al publicado.",
    available: true,
  },
  {
    slug: "facebook",
    name: "Facebook",
    blurb: "Publicaciones para Facebook.",
    available: false,
  },
];

export const REFERENCE_TAGS = [
  { id: "competencia", label: "Lo que peta en la competencia" },
  { id: "busqueda", label: "Búsquedas" },
  { id: "audiencia", label: "Tu audiencia" },
  { id: "inspiracion", label: "Inspiración" },
] as const;

export const PIECE_STATUSES = [
  { id: "en_marcha", label: "En marcha" },
  { id: "terminado", label: "Terminado" },
  { id: "publicado", label: "Publicados" },
  { id: "archivado", label: "Archivados" },
] as const;

export function stagesFor(platform: string): string[] {
  if (platform in STAGES) return [...STAGES[platform as Platform]];
  return [...STAGES.youtube];
}

export function nextStage(platform: string, stage: string): string | null {
  const stages = stagesFor(platform);
  const i = stages.indexOf(stage);
  if (i < 0 || i >= stages.length - 1) return null;
  return stages[i + 1];
}

export function isPlatform(value: string): value is Platform {
  return value in STAGES;
}
