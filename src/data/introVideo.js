import { BASE } from "./productos";

/** Poster al cargar: referencia de cosechadora + tractor en campo (archivo en /public). */
export const INTRO_VIDEO_POSTER = `${BASE}/video-intro-poster-cosecha.png`;

/**
 * Metraje de cosechadoras trabajando en campo (Pexels / Pixabay, libre de regalías).
 * El primero es toma aérea de varias cosechadoras cosechando en un paisaje amplio (muy cercano a “así”).
 * Para tu video propio (p. ej. IA con marca Vassalli / escena exacta), subí el .mp4 a
 * `public/videos/intro-cosechadora.mp4` y anteponé `${BASE}/videos/intro-cosechadora.mp4` al array.
 */
export const INTRO_VIDEO_SOURCES = [
  "https://videos.pexels.com/video-files/9408312/9408312-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/28930279/12520232_2560_1440_30fps.mp4",
  "https://cdn.pixabay.com/video/2017/01/18/7412-200092441_large.mp4",
];
