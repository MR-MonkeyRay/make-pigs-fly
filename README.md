# 🐷✨ makepigs.fly — Yes, Pigs Actually Fly Now.

> A minimalist, luminous, deadpan-hilarious homepage for **`makepigs.fly`**. Pure frontend, multi-language, responsive for mobile & desktop, and ready for GitHub Pages.

## Features

- **Luminous Editorial Sky Hero**: Handcrafted animated SVG winged pig floating over volumetric clouds with subtle mouse parallax, blinking eyes, rippling red silk scarf, and articulated wingbeats.
- **Delightful Micro-Interactions (Zero Game Clutter)**:
  - Tap/click the pig for a joyful hop, sparkle burst, soft synthesized *oink*, and rotating witty captions.
  - Click **Watch It Soar** or switch sky atmospheres between **Morning Sky**, **Golden Hour**, and **Midnight Aurora**.
- **Three Unscientific Theories of Porcine Flight**: Clean 3-card editorial parody (*Aerodynamic Compliments*, *Standing on the Wind Vent*, *Pure Spite Against Gravity*) with gentle hover animations.
- **Official Proof Postcard Generator**: Type any *"when pigs fly"* promise, copy a personalized share link (`?promise=...&from=...&lang=...`) that greets your friend right in the hero, or download a high-resolution **1200×680 PNG postcard**.
- **4-Language Cultural i18n**: English (`en`), 简体中文 (`zh`), 日本語 (`ja`), and Español (`es`) with automatic browser detection, `?lang=` override, and `localStorage` persistence.

## Local Development

```bash
pnpm install
pnpm dev
```

## Build & Deploy to GitHub Pages

[vite.config.ts](vite.config.ts) uses `base: './'` so static output in `dist/` works on both custom domains (`makepigs.fly`) and GitHub Pages subpaths.

```bash
pnpm build
```

Push to GitHub and set **Settings → Pages → Build and deployment → Source** to **GitHub Actions** (workflow included in [.github/workflows/deploy.yml](.github/workflows/deploy.yml)).
