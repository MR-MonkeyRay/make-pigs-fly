// Living full-viewport atmospheric sky canvas behind the page.
// Daylight: sunlit golden-hour volumetric clouds + floating feathers + subtle pointer parallax.
// Night Flight: twinkling constellations + flowing aurora veil + occasional shooting stars.
// Clicking empty sky spawns a dreamy sparkle/cloud puff!
import { prefersReducedMotion } from './motion';

interface Cloud {
  x: number;
  y: number;
  scale: number;
  speed: number;
  depth: number;
  opacity: number;
}

interface Star {
  x: number;
  y: number;
  r: number;
  phase: number;
  speed: number;
  tint: string;
}

interface Feather {
  x: number;
  y: number;
  vy: number;
  sway: number;
  phase: number;
  size: number;
  rot: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

interface Puff {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  maxLife: number;
  isStar: boolean;
}

function isDarkTheme(): boolean {
  const t = document.documentElement.dataset.theme;
  if (t === 'dark') return true;
  if (t === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function mountAmbientSky(): () => void {
  const canvas = document.createElement('canvas');
  canvas.className = 'ambient-sky';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) return () => canvas.remove();

  let w = window.innerWidth;
  let h = window.innerHeight;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let dark = isDarkTheme();
  let reduced = prefersReducedMotion();
  let raf = 0;
  let last = performance.now();
  let time = 0;
  let nextShoot = 4 + Math.random() * 5;

  // Smooth pointer parallax
  let ptrX = 0;
  let ptrY = 0;
  let smoothX = 0;
  let smoothY = 0;

  const clouds: Cloud[] = Array.from({ length: 7 }, (_, i) => ({
    x: (i / 7) * (w + 360) - 180,
    y: 55 + ((i * 113) % Math.max(220, h * 0.52)),
    scale: 0.65 + (i % 4) * 0.28,
    speed: 6 + (i % 3) * 4.5,
    depth: 0.4 + (i % 3) * 0.35,
    opacity: 0.34 + (i % 3) * 0.16,
  }));

  const starTints = ['#ffffff', '#ffe9c6', '#c7e3ff', '#ffd6ec'];
  const stars: Star[] = Array.from({ length: 68 }, (_, i) => ({
    x: ((i * 137.5) % 100) / 100,
    y: ((i * 73.1) % 72) / 100,
    r: 0.8 + (i % 3) * 0.65,
    phase: i * 1.13,
    speed: 1.2 + (i % 4) * 0.55,
    tint: starTints[i % starTints.length]!,
  }));

  const feathers: Feather[] = Array.from({ length: 10 }, (_, i) => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vy: -10 - (i % 4) * 5,
    sway: 14 + (i % 3) * 10,
    phase: i * 0.9,
    size: 5 + (i % 3) * 2.5,
    rot: Math.random() * Math.PI * 2,
  }));

  const shoots: ShootingStar[] = [];
  const puffs: Puff[] = [];

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    if (reduced) render(0);
  };

  function drawCloud(x: number, y: number, s: number, alpha: number): void {
    if (!ctx) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.globalAlpha = alpha;
    const grad = ctx.createLinearGradient(0, -34, 0, 26);
    if (dark) {
      grad.addColorStop(0, 'rgba(130, 126, 200, 0.24)');
      grad.addColorStop(1, 'rgba(54, 48, 108, 0.04)');
    } else {
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.96)');
      grad.addColorStop(0.65, 'rgba(255, 250, 245, 0.82)');
      grad.addColorStop(1, 'rgba(224, 236, 255, 0.42)');
    }
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(-44, 4, 26, 0, Math.PI * 2);
    ctx.arc(-14, -12, 36, 0, Math.PI * 2);
    ctx.arc(24, -6, 30, 0, Math.PI * 2);
    ctx.arc(52, 6, 22, 0, Math.PI * 2);
    ctx.ellipse(4, 14, 62, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function render(dt: number): void {
    if (!ctx) return;
    time += dt;
    smoothX += (ptrX - smoothX) * Math.min(1, dt * 3.5);
    smoothY += (ptrY - smoothY) * Math.min(1, dt * 3.5);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    if (dark) {
      // Flowing ethereal aurora ribbons
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const auroras = [
        { y: h * 0.22, amp: 34, color0: 'rgba(84, 235, 195, 0.14)', color1: 'rgba(139, 92, 246, 0.0)' },
        { y: h * 0.3, amp: 28, color0: 'rgba(255, 118, 178, 0.12)', color1: 'rgba(96, 165, 250, 0.0)' },
      ];
      auroras.forEach((a, idx) => {
        const g = ctx.createLinearGradient(0, a.y - 90, 0, a.y + 90);
        g.addColorStop(0, a.color1);
        g.addColorStop(0.5, a.color0);
        g.addColorStop(1, a.color1);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(0, a.y + 90);
        for (let x = 0; x <= w + 40; x += 40) {
          const wave = Math.sin(x * 0.004 + time * (0.35 + idx * 0.15) + idx * 2) * a.amp;
          ctx.lineTo(x, a.y + wave + smoothY * 12);
        }
        ctx.lineTo(w, a.y + 120);
        ctx.lineTo(0, a.y + 120);
        ctx.closePath();
        ctx.fill();
      });
      ctx.restore();

      // Twinkling starfield
      for (const s of stars) {
        const sx = s.x * w + smoothX * (8 + s.r * 6);
        const sy = s.y * h + smoothY * (6 + s.r * 4);
        const twinkle = 0.28 + 0.72 * Math.abs(Math.sin(time * s.speed + s.phase));
        ctx.fillStyle = s.tint;
        ctx.globalAlpha = twinkle;
        ctx.beginPath();
        ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
        ctx.fill();
        if (s.r > 1.7 && twinkle > 0.78) {
          ctx.strokeStyle = s.tint;
          ctx.globalAlpha = twinkle * 0.45;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(sx - 5, sy);
          ctx.lineTo(sx + 5, sy);
          ctx.moveTo(sx, sy - 5);
          ctx.lineTo(sx, sy + 5);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;

      // Occasional shooting star
      if (!reduced) {
        nextShoot -= dt;
        if (nextShoot <= 0) {
          nextShoot = 5 + Math.random() * 8;
          shoots.push({
            x: w * (0.15 + Math.random() * 0.7),
            y: h * (0.04 + Math.random() * 0.22),
            vx: 420 + Math.random() * 220,
            vy: 150 + Math.random() * 110,
            life: 0,
            maxLife: 0.7 + Math.random() * 0.35,
          });
        }
        for (let i = shoots.length - 1; i >= 0; i--) {
          const sh = shoots[i]!;
          sh.life += dt;
          sh.x += sh.vx * dt;
          sh.y += sh.vy * dt;
          if (sh.life >= sh.maxLife) {
            shoots.splice(i, 1);
            continue;
          }
          const alpha = Math.sin((sh.life / sh.maxLife) * Math.PI);
          const grad = ctx.createLinearGradient(sh.x, sh.y, sh.x - sh.vx * 0.14, sh.y - sh.vy * 0.14);
          grad.addColorStop(0, `rgba(255, 250, 230, ${alpha * 0.95})`);
          grad.addColorStop(1, 'rgba(255, 250, 230, 0)');
          ctx.strokeStyle = grad;
          ctx.lineWidth = 2;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(sh.x, sh.y);
          ctx.lineTo(sh.x - sh.vx * 0.14, sh.y - sh.vy * 0.14);
          ctx.stroke();
        }
      }
    } else {
      // Daylight sunlit golden atmospheric glow in upper right
      const sunX = w * 0.84 + smoothX * 14;
      const sunY = Math.min(180, h * 0.16) + smoothY * 10;
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 12, sunX, sunY, Math.max(w, h) * 0.42);
      sunGlow.addColorStop(0, 'rgba(255, 245, 200, 0.55)');
      sunGlow.addColorStop(0.28, 'rgba(255, 214, 150, 0.22)');
      sunGlow.addColorStop(1, 'rgba(255, 214, 150, 0)');
      ctx.fillStyle = sunGlow;
      ctx.fillRect(0, 0, w, h);
    }

    // Soft drifting volumetric clouds
    const span = w + 380;
    for (const c of clouds) {
      if (!reduced) {
        c.x += c.speed * dt;
        if (c.x > w + 190) c.x = -190;
      }
      const cx = (((c.x + 190) % span) + span) % span - 190 + smoothX * 26 * c.depth;
      const cy = c.y + smoothY * 14 * c.depth;
      drawCloud(cx, cy, c.scale, dark ? c.opacity * 0.5 : c.opacity);
    }

    // Gentle floating sunlit feathers / glowing firefly motes
    if (!reduced) {
      for (const f of feathers) {
        f.y += f.vy * dt;
        if (f.y < -30) {
          f.y = h + 30;
          f.x = Math.random() * w;
        }
        const fx = f.x + Math.sin(time * 0.9 + f.phase) * f.sway + smoothX * 10;
        ctx.save();
        ctx.translate(fx, f.y);
        if (dark) {
          const glow = 0.25 + 0.55 * Math.abs(Math.sin(time * 1.8 + f.phase));
          ctx.fillStyle = `rgba(255, 224, 130, ${glow})`;
          ctx.beginPath();
          ctx.arc(0, 0, f.size * 0.3, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.rotate(f.rot + Math.sin(time * 1.2 + f.phase) * 0.35);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.62)';
          ctx.beginPath();
          ctx.ellipse(0, 0, f.size, f.size * 0.34, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    // Interactive sky-click sparkle puffs
    for (let i = puffs.length - 1; i >= 0; i--) {
      const p = puffs[i]!;
      p.life += dt;
      if (p.life >= p.maxLife) {
        puffs.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.96;
      p.vy *= 0.96;
      const alpha = 1 - p.life / p.maxLife;
      ctx.save();
      ctx.globalAlpha = alpha * 0.85;
      ctx.fillStyle = dark ? '#ffe680' : '#ffffff';
      if (p.isStar) {
        ctx.translate(p.x, p.y);
        ctx.beginPath();
        for (let k = 0; k < 8; k++) {
          const a = (k * Math.PI) / 4;
          const rad = k % 2 === 0 ? p.r : p.r * 0.35;
          if (k === 0) ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
          else ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
        }
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (0.7 + (p.life / p.maxLife) * 0.6), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  const loop = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!document.hidden) render(dt);
    if (!reduced) raf = requestAnimationFrame(loop);
  };

  const onMove = (e: PointerEvent) => {
    if (reduced) return;
    ptrX = (e.clientX / Math.max(1, w) - 0.5) * 2;
    ptrY = (e.clientY / Math.max(1, h) - 0.5) * 2;
  };

  const onClick = (e: MouseEvent) => {
    if (reduced) return;
    const target = e.target as Element | null;
    if (target && target.closest('button, a, input, select, .card, .stage, .run-box')) return;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.random() * 0.4;
      const spd = 35 + Math.random() * 65;
      puffs.push({
        x: e.clientX,
        y: e.clientY,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd - 12,
        r: 4 + Math.random() * 5,
        life: 0,
        maxLife: 0.75 + Math.random() * 0.45,
        isStar: i % 2 === 0,
      });
    }
  };

  const refreshTheme = () => {
    dark = isDarkTheme();
    if (reduced) render(0);
  };

  const mo = new MutationObserver(refreshTheme);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  const mqDark = window.matchMedia('(prefers-color-scheme: dark)');
  mqDark.addEventListener('change', refreshTheme);

  const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const onMotionChange = () => {
    reduced = prefersReducedMotion();
    cancelAnimationFrame(raf);
    if (reduced) render(0);
    else {
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }
  };
  mqMotion.addEventListener('change', onMotionChange);

  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('click', onClick);

  resize();
  if (reduced) render(0);
  else raf = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(raf);
    mo.disconnect();
    mqDark.removeEventListener('change', refreshTheme);
    mqMotion.removeEventListener('change', onMotionChange);
    window.removeEventListener('resize', resize);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('click', onClick);
    canvas.remove();
  };
}
