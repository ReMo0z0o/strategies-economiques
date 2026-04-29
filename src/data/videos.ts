export type Video = {
  id: string;
  slug: string;
  youtubeId: string;
  title: string;
  description: string;
};

export const videos: Video[] = [
  {
    id: "1",
    slug: "video-1",
    youtubeId: "CF_-fRjG5wo",
    title: "Ingarose — Celebrate Me",
    description: "Aperçu vidéo.",
  },
  {
    id: "2",
    slug: "video-2",
    youtubeId: "1NhHuBmHHhY",
    title: "Haven. — I Run",
    description: "Aperçu vidéo.",
  },
  {
    id: "3",
    slug: "video-3",
    youtubeId: "mXBo1Icb_4s",
    title: "Angèle — Saiyan (IA Cover)",
    description: "Aperçu vidéo.",
  },
  {
    id: "4",
    slug: "video-4",
    youtubeId: "rQssjhX31Z0",
    title: "Ghostwriter — Heart On My Sleeve",
    description: "Aperçu vidéo.",
  },
];

export const getVideoBySlug = (slug: string) =>
  videos.find((v) => v.slug === slug);
