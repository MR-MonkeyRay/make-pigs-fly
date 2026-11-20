/** file for a photo at a size that suits this screen */
export function photoUrl(name: string): string {
  const big = Math.max(window.innerWidth, window.innerHeight) * Math.min(2, window.devicePixelRatio || 1) > 1000;
  return `${import.meta.env.BASE_URL}img/sky/${name}-${big ? 1600 : 900}.webp`;
}

/**
 * Real views for each altitude band, shown on demand (the "real view" button). Every file is from Wikimedia Commons;
 * licences were read from the Commons API (see README → Credits).
 * `sec` is the section the photo belongs to. The page background stays the
 * risograph sky; a photo only appears while the reader asks to see it.
 */
export interface SkyPhoto {
  sec: number;
  name: string;
  place: string;
  by: string;
  license: string;
  url: string;
  /** CSS object-position, for portrait crops */
  pos?: string;
  tone: 'light' | 'dark';
}

const C = 'https://commons.wikimedia.org/wiki/File:';

export const PHOTOS: SkyPhoto[] = [
  {
    sec: 1,
    name: 'field',
    place: 'Laaghalerveen, NL',
    by: 'Fons Heijnsbroek',
    license: 'CC0',
    url: `${C}Fields_and_large_barn_in_the_evening_set_on_Laaghalerveen,_landscape_Netherlands,_2012.jpg`,
    pos: '30% 50%',
    tone: 'light',
  },
  {
    sec: 2,
    name: 'canopy',
    place: 'Brown County, Indiana',
    by: 'Serge Melki',
    license: 'CC BY 2.0',
    url: `${C}Brown_County_forest_-_Canopy_view_(2982440687).jpg`,
    tone: 'light',
  },
  {
    sec: 3,
    name: 'rooftops',
    place: 'Copenhagen, from the Round Tower',
    by: 'Dietmar Rabich',
    license: 'CC BY-SA 4.0',
    url: `${C}Kopenhagen_(DK),_Blick_vom_Runden_Turm_--_2017_--_1622.jpg`,
    pos: '62% 50%',
    tone: 'light',
  },
  {
    sec: 4,
    name: 'river',
    place: 'Río Adaja, Ávila',
    by: 'smart-drone.es',
    license: 'CC BY 4.0',
    url: `${C}Adaja_01_by_smart-drone.es.JPG`,
    pos: '35% 50%',
    tone: 'light',
  },
  {
    sec: 5,
    name: 'cumulus',
    place: 'Cumulus over the East China Sea',
    by: '4300streetcar',
    license: 'CC BY 4.0',
    url: `${C}Clouds_and_plane_over_East_China_Sea_Sep_2023.jpg`,
    tone: 'light',
  },
  {
    sec: 6,
    name: 'himalaya',
    place: 'Makalu (8,463 m), Nepal',
    by: 'Hiroki Ogawa',
    license: 'CC BY 3.0',
    url: `${C}8.463m_Makalu_Himalaya_Mountain_Flights_Nepal_-_panoramio.jpg`,
    pos: '58% 50%',
    tone: 'light',
  },
  {
    sec: 7,
    name: 'cruise',
    place: 'Above scattered clouds',
    by: 'Harry Knight',
    license: 'CC0',
    url: `${C}In_flight_above_scattered_clouds_(Unsplash).jpg`,
    pos: '30% 50%',
    tone: 'light',
  },
  {
    sec: 8,
    name: 'stratosphere',
    place: 'RITCHIE-1 balloon, stratosphere',
    by: 'k2gxt (RIT)',
    license: 'CC BY 2.0',
    url: `${C}View_of_Earth_from_RITCHIE-1_high-altitude_balloon,_Rochester_Institute_of_Technology.jpg`,
    tone: 'dark',
  },
  {
    sec: 9,
    name: 'limb',
    place: 'Sunset from the ISS',
    by: 'NASA / ISS Expedition 23',
    license: 'Public domain',
    url: `${C}Sunset_from_the_ISS.JPG`,
    pos: '40% 50%',
    tone: 'dark',
  },
  {
    sec: 10,
    name: 'aurora',
    place: 'Aurora from the ISS',
    by: 'NASA / ISS Expedition 50',
    license: 'Public domain',
    url: `${C}ISS-50_Auroras,_sparkling_city_lights_and_stars_beyond.jpg`,
    pos: '70% 50%',
    tone: 'dark',
  },
  {
    sec: 11,
    name: 'earthrise',
    place: 'Earthrise, Apollo 8, 1968',
    by: 'NASA / Bill Anders',
    license: 'Public domain',
    url: `${C}NASA_Earthrise_AS08-14-2383_Apollo_8,_1968-12-24,_from_print.jpg`,
    tone: 'dark',
  },
  {
    sec: 12,
    name: 'cliffs',
    place: 'Cosmic Cliffs, Carina Nebula (JWST)',
    by: 'NASA, ESA, CSA, STScI',
    license: 'Public domain',
    url: `${C}NASA%E2%80%99s_Webb_Reveals_Cosmic_Cliffs,_Glittering_Landscape_of_Star_Birth.jpg`,
    pos: '50% 70%',
    tone: 'dark',
  },
];

const FADE = 0.12;

/** opacity of each photo for a continuous position x = section index + progress */
export function photoOpacity(x: number, out: number[]): number[] {
  for (let i = 0; i < PHOTOS.length; i++) {
    const s = PHOTOS[i].sec;
    out[i] = Math.min(1, Math.max(0, (x - (s - FADE)) / (2 * FADE)));
  }
  // a photo fully covered by the one above it does not need painting
  for (let i = 0; i < PHOTOS.length - 1; i++) if (out[i + 1] >= 1) out[i] = 0;
  return out;
}

/** index of the photo currently in charge (topmost at ≥ 50%), or -1 */
export function currentPhoto(op: number[]): number {
  for (let i = op.length - 1; i >= 0; i--) if (op[i] >= 0.5) return i;
  return -1;
}
