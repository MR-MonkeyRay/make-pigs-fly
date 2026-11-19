# 🐷✈️ makepigs.fly — Porcine Aviation Administration (P.A.A.)

> Turning **"When Pigs Fly"** into **"Cleared for Takeoff"** — a 100% client-side, multi-language, mobile & desktop friendly aerospace flight lab and impossible-promise certifier built for `makepigs.fly` and ready for GitHub Pages.

## Highlights

- **60fps Interactive Flight Lab (HTML5 Canvas)**
  - **Captain Wilbur** responds to your cursor with eye-tracking, blinking, blushing, sliding brass aviator goggles, a dynamic trailing silk scarf, space helmet above 25,000m, and live witty speech bubbles.
  - **4 Stackable Propulsion Systems**:
    1. **Startup Hype Vent (风口鼓风机)** — Crank VC buzzwords (`AI`, `SYNERGY`, `风口`, `赋能`) up to 100% to lift Wilbur on pure hype.
    2. **Compliment Balloons (彩虹屁气球)** — Pump up to 15 pastel balloons filled with localized compliments (or pop them all dramatically).
    3. **Zero-Bacon Booster Rockets (零培根固体火箭)** — Ignite twin retro thrusters with plasma flames, screen shake, and supersonic Mach cone to break past 40,000m (Space) and 100,000m (Deep Space Miracle).
    4. **Tiny Angel Wings (天使迷你翅)** — Tap the button or press `SPACE` to flap stubbornly against gravity.
  - **Direct Touch & Mouse Physics**: Poke Wilbur's snout (`OINK!`) or grab and fling him across the sky without hijacking mobile page scroll.
- **Live Split-Flap "Impossible Departures" Board** — Click any impossible flight (e.g. *Friday Deploy With Zero Bugs*, *甲方爸爸一稿直接过*) to pre-fill the certifier.
- **"When Pigs Fly" Promise Certifier** — Stamp an official Boarding Pass Certificate, download a **high-resolution 1200×680 PNG card**, or copy a **shareable proof URL** (`?promise=...&alt=...&lang=...`) that greets the recipient with an official P.A.A. delivery modal!
- **Procedural Web Audio Synthesizer** — Zero external audio files; synthesized pig oinks, balloon squeaks, pops, rocket rumbles, wind whooshes, rubber stamp *thunks*, and fanfare (with instant mute toggle).
- **4-Language Cultural i18n** — English (`en`), 简体中文 (`zh`), 日本語 (`ja`), and Español (`es`) with browser language auto-detection, `?lang=` support, and `localStorage` persistence.
- **Hidden Easter Eggs** — Try the Konami Code (`↑↑↓↓←→←→BA`), click the **P.A.A.** logo 5 times rapidly for **🌈 Nyan-Pig Hyperdrive Mode**, or inspect the browser DevTools console!

## Local Development

```bash
pnpm install
pnpm dev
```

## Build & GitHub Pages Deployment

The Vite config uses `base: './'`, so the static output in `dist/` works seamlessly on both a custom domain (`https://makepigs.fly/`) and a GitHub Pages repository subpath (`https://<user>.github.io/<repo>/`).

```bash
pnpm build
```

A GitHub Actions workflow is included at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml):
1. In your GitHub repository, go to **Settings → Pages → Build and deployment** and set **Source** to **GitHub Actions**.
2. Push this branch (or merge it into `main`), and GitHub Actions will automatically build and publish `./dist`.
3. To bind your custom domain (`makepigs.fly`), configure it under **Settings → Pages → Custom domain** (or add a `public/CNAME` file containing your domain).
