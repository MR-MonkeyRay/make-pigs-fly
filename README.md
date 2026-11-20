# makepigs.fly

**Everyone said "when pigs fly." So we built a runway.**

A homepage you scroll **up**. It loads at the bottom, in the mud, and the only way out is up. One pig with googly eyes climbs from 0 m to the Moon and beyond. The world falls past him while he changes outfits, gets interviewed, and finally realises he has no idea how to get down.

Static frontend only: Vite + React + TypeScript, no backend. It deploys to GitHub Pages as-is.

## What's in it

- **13 altitude bands, 13 presentation styles.** The bands run from a mud runway to a free-body diagram, an intercepted bird group chat, a buzzword updraft, a museum of real pig-flight precedents, a breaking-news broadcast, a split-flap departures board, a horizontally scrolling summit of impossible animals, the Kármán line, an ISS radio log, a lunar hoof-print and a constellation.
- **Paged flight.** One wheel notch, trackpad flick, swipe or arrow key moves exactly one "floor"; the page then glides there on its own (`src/engine/pager.ts`). Scrolling up climbs. Home/End jump to the Moon or the mud.
- **Real views, on request.** The page keeps its risograph sky. A small "real view from about this high" button (bottom right) hides the words and shows a real photo taken from about that height: farm field → treetops → rooftops → drone → clouds → Himalaya → airliner → stratosphere → ISS → Earthrise → JWST. The photo is credited on screen; moving to another floor or pressing Esc brings the words back. Photos are only downloaded after the first click.
- **One persistent pig actor**: an original chibi cartoon pig, built as a layered, cel-shaded SVG and driven by a single rAF scroll engine.
  - Wing flap, propeller tail and ears follow climb speed.
  - The big glossy eyes slosh with spring physics; moods change the face (smug, thrilled, panic, dizzy…).
  - Costumes follow altitude: cardboard wings, feather wings, goggles, scarf, neck pillow, then past the Kármán line a fishbowl helmet and borrowed rocket boots whose flames grow with climb speed.
- **11 languages** (en, 简体中文, 繁體中文, 日本語, 한국어, es, fr, de, pt-BR, it, ru) behind one globe button.
- **A finale and a fall.** "Bring him home" drops the whole page in free fall, followed by an underpants parachute, mud splat and judges' scorecards.
- **Easter eggs**:
  - Type `oink`.
  - Triple-click the logo.
  - Switch tabs, open the console, or print the page.
  - Visit any missing URL.
- **Personal links.** `?to=Kevin&said=pay+me+back&lang=en` names Kevin and his promise on the loader, the hero, the departures board and the finale. The finale also has a form that builds these links.
- **Four hand-localised languages**: English, 简体中文, 日本語 and Español. The jokes are rewritten for each language rather than translated. The language comes from `?lang=`, then `localStorage`, then the browser. Switching language plays an ink-wipe View Transition.
- **Accessibility.**
  - DOM order is story order.
  - Decorative art is `aria-hidden`.
  - Live boards carry text labels.
  - `prefers-reduced-motion` disables the fall and long animations ("the pig has taken the elevator").
  - Sound is synthesised with WebAudio and muted by default.

## Develop

```bash
pnpm install
pnpm dev          # http://localhost:5173
pnpm typecheck
pnpm build        # → dist/
pnpm preview
```

`index.html` contains a `%SITE%` placeholder for absolute `og:image` URLs. Set `VITE_SITE_URL=https://example.com/` when building to fill it in; it defaults to `./`. The Pages workflow sets it automatically from `actions/configure-pages`.

## Layout

```
src/
  engine/     scroll engine, section specs (altitude bands + pig poses), store, fall director, sound, URL params
  components/ PigActor, Sky, Altimeter, TopBar, Loader, SplitFlap, Fx (fall, splat, flock, tab title)
  sections/   Lower (ground → birds), Middle (updraft → cruise), Upper (summit → deep space)
  art/        hand-drawn SVG: pig, scenery, delegates, mission patch …
  i18n/       provider + locales (en.ts is the schema)
  styles/     tokens, base, print certificate
public/       favicon, 404.html (self-contained), og.jpg, img/*.webp, img/sky/*.webp, img/noise.png
scripts/      riso.py — asset pipeline
```

## Asset pipeline

The framed prints are public-domain NASA images, converted into a two-ink (fluorescent pink and riso blue) halftone to match the risograph look. The real-view backgrounds are only resized:

```bash
python3 -I scripts/riso.py photos <raw_dir> public/img   # limb, iss, bootprint, moon → .webp
python3 -I scripts/riso.py sky <raw_dir> public/img/sky  # a1 … l2 → <name>-1600.webp + <name>-900.webp
python3 -I scripts/riso.py noise public/img/noise.png    # paper grain tile
python3 -I scripts/riso.py ogpack <shot.png> public/og.jpg
```

- For `photos`, `<raw_dir>` must contain `limb.jpg`, `iss.jpg`, `bootprint.jpg` and `moon.jpg`. For `sky`, it must contain the files keyed `a1`, `b3`, `c2`, `d1`, `g2`, `f2`, `g1`, `h1`, `i3`, `j1`, `k1`, `l2` (see `SKY` in the script and the Credits table). Download them from the sources listed below. Raw files are not committed.
- `og.jpg` is a 1600×840 screenshot of the landing scene, with the HUD hidden, downscaled to 1200×630.
- The script needs Pillow and numpy.

## Deploy

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds and publishes on every push to `main` or `pigs-can-fly`. In the repository, set **Settings → Pages → Source** to **GitHub Actions**. `base: './'` keeps the build working both on a custom domain and under `/<repo>/`.

## Facts (yes, really)

- **1909:** J. T. C. Moore-Brabazon flew a small pig in a wicker wastepaper basket tied to a strut of his biplane, about 3.5 miles, on 4 November 1909.
- **1976:** On 3 December, a 12-metre helium pig made for an album cover broke its tether over London. Pilots reported it at around 30,000 ft, and it came down on a farm in Kent.
- **"站在风口上，猪也能飞起来"** ("stand in the updraft and even a pig can fly"): a 2013 remark by a well-known founder, who later said he had been misquoted.
- **豚もおだてりゃ木に登る** ("flatter a pig and it will climb a tree"): a Japanese proverb, popularised by *Yatterman*.
- **The summit idioms** (*quand les poules auront des dents*, *cuando las ranas críen pelo*, *когда рак на горе свистнет* and the rest) were checked against Wiktionary.

## Credits

**Risograph prints** (halftoned by `scripts/riso.py photos`). All are public domain (`{{PD-USGov-NASA}}`) via Wikimedia Commons:
- Earth's limb from the ISS, iss064e002941: [File:Iss064e002941 …](https://commons.wikimedia.org/wiki/File:Iss064e002941_(Nov_1,_2020)_---_The_Earth%27s_limb,_or_horizon,_is_pictured_as_the_International_Space_Station_orbited_above_the_north_Pacific_near_Alaska%27s_Aleutian_Islands.jpg)
- Apollo 11 bootprint, AS11-40-5878 (NARA scan): [File:AS11-40-5878 … NARA - 16685061.jpg](https://commons.wikimedia.org/wiki/File:AS11-40-5878_-_Apollo_11_-_Apollo_11_Mission_image_-_Astronaut_bootprint_on_the_lunar_surface_-_NARA_-_16685061.jpg)
- International Space Station after STS-132 undocking: [File:International Space Station after undocking of STS-132.jpg](https://commons.wikimedia.org/wiki/File:International_Space_Station_after_undocking_of_STS-132.jpg)
- Full Moon, Apollo 17: [File:Full disc of the moon was photographed by the Apollo 17 crewmen.jpg](https://commons.wikimedia.org/wiki/File:Full_disc_of_the_moon_was_photographed_by_the_Apollo_17_crewmen.jpg)

**Real views** (the photos behind the "real view" button, resized by `scripts/riso.py sky`, colours untouched). All are from Wikimedia Commons; the licence and author of each come from the Commons API. CC BY / CC BY-SA images are shown with their credit on the page, and the resized copies keep the same licence.

| Band | Photo | Author | Licence |
|---|---|---|---|
| 0–10 m | [Fields and large barn in the evening, Laaghalerveen](https://commons.wikimedia.org/wiki/File:Fields_and_large_barn_in_the_evening_set_on_Laaghalerveen,_landscape_Netherlands,_2012.jpg) (cropped) | Fons Heijnsbroek | CC0 |
| 10–30 m | [Brown County forest – Canopy view](https://commons.wikimedia.org/wiki/File:Brown_County_forest_-_Canopy_view_(2982440687).jpg) | Serge Melki | CC BY 2.0 |
| 30–150 m | [Kopenhagen, Blick vom Runden Turm](https://commons.wikimedia.org/wiki/File:Kopenhagen_(DK),_Blick_vom_Runden_Turm_--_2017_--_1622.jpg) | Dietmar Rabich | CC BY-SA 4.0 |
| 150–800 m | [Adaja 01 by smart-drone.es](https://commons.wikimedia.org/wiki/File:Adaja_01_by_smart-drone.es.JPG) | smart-drone.es | CC BY 4.0 |
| 0.8–2 km | [Clouds and plane over East China Sea](https://commons.wikimedia.org/wiki/File:Clouds_and_plane_over_East_China_Sea_Sep_2023.jpg) | 4300streetcar | CC BY 4.0 |
| 2–8 km | [8.463m Makalu, Himalaya Mountain Flights, Nepal](https://commons.wikimedia.org/wiki/File:8.463m_Makalu_Himalaya_Mountain_Flights_Nepal_-_panoramio.jpg) | Hiroki Ogawa | CC BY 3.0 |
| 8–12 km | [In flight above scattered clouds](https://commons.wikimedia.org/wiki/File:In_flight_above_scattered_clouds_(Unsplash).jpg) | Harry Knight | CC0 |
| 12–50 km | [View of Earth from RITCHIE-1 high-altitude balloon](https://commons.wikimedia.org/wiki/File:View_of_Earth_from_RITCHIE-1_high-altitude_balloon,_Rochester_Institute_of_Technology.jpg) | k2gxt (RIT) | CC BY 2.0 |
| 50–150 km | [Sunset from the ISS](https://commons.wikimedia.org/wiki/File:Sunset_from_the_ISS.JPG) | NASA, ISS Expedition 23 | Public domain |
| 150–1000 km | [ISS-50 Auroras, sparkling city lights and stars beyond](https://commons.wikimedia.org/wiki/File:ISS-50_Auroras,_sparkling_city_lights_and_stars_beyond.jpg) | NASA | Public domain |
| Moon | [Earthrise, AS08-14-2383, Apollo 8](https://commons.wikimedia.org/wiki/File:NASA_Earthrise_AS08-14-2383_Apollo_8,_1968-12-24,_from_print.jpg) | NASA | Public domain |
| Deep space | [Webb reveals Cosmic Cliffs](https://commons.wikimedia.org/wiki/File:NASA%E2%80%99s_Webb_Reveals_Cosmic_Cliffs,_Glittering_Landscape_of_Star_Birth.jpg) | NASA, ESA, CSA, STScI | Public domain |

NASA does not endorse this pig.

**Fonts.** All are from Google Fonts, under the SIL Open Font License: Fraunces, Bricolage Grotesque, Space Mono, Rubik, ZCOOL QingKe HuangYou, Mochiy Pop One, Jua and Chiron GoRound TC.

**Everything else** (illustrations, copy, sounds) is original to this project.

No pigs were harmed. One was mildly embarrassed.
