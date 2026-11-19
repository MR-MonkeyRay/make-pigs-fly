import type { PigRenderParams } from './types';

const BALLOON_COLORS = [
  '#FF5E8A',
  '#FFD166',
  '#4CC9F0',
  '#72EFDD',
  '#FF9F1C',
  '#C77DFF',
  '#FF70A6',
  '#80ED99',
];

const RAINBOW_STRIPES = ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#007AFF', '#AF52DE'];

export function drawPig(ctx: CanvasRenderingContext2D, p: PigRenderParams): void {
  const {
    x,
    y,
    vx,
    vy,
    altitude,
    scale,
    time,
    lookX,
    lookY,
    blink,
    snoutSquish,
    blush,
    wingPhase,
    propulsion,
    isDragging,
    isGrounded,
    mach,
    scarfTrail,
    rainbowTrail,
  } = p;

  // 1. Rainbow Hyperdrive Trail (in world-screen space behind Wilbur)
  if (propulsion.rainbowMode && rainbowTrail.length > 2) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const stripeWidth = 6.5 * scale;
    RAINBOW_STRIPES.forEach((color, idx) => {
      const offset = (idx - 2.5) * stripeWidth;
      ctx.beginPath();
      for (let i = 0; i < rainbowTrail.length; i++) {
        const pt = rainbowTrail[i];
        const wave = Math.sin(time * 14 + i * 0.45) * 3.5 * scale;
        if (i === 0) ctx.moveTo(pt.x, pt.y + offset + wave);
        else ctx.lineTo(pt.x, pt.y + offset + wave);
      }
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.85;
      ctx.lineWidth = stripeWidth + 0.8;
      ctx.stroke();
    });
    ctx.restore();
  }

  // 2. Flowing Red Silk Aviator Scarf Trail (behind body)
  if (scarfTrail.length > 2) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    // Outline
    ctx.beginPath();
    for (let i = 0; i < scarfTrail.length; i++) {
      const pt = scarfTrail[i];
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.strokeStyle = '#161A24';
    ctx.lineWidth = 14 * scale;
    ctx.stroke();

    // Inner bright aviation orange-red
    ctx.strokeStyle = '#FF4D1C';
    ctx.lineWidth = 9.5 * scale;
    ctx.stroke();

    // Cream stripe accent
    ctx.setLineDash([6 * scale, 6 * scale]);
    ctx.strokeStyle = '#FFF2D6';
    ctx.lineWidth = 2.2 * scale;
    ctx.stroke();
    ctx.restore();
  }

  ctx.save();
  ctx.translate(x, y);

  // Dynamic tilt based on horizontal velocity + subtle flight pitch
  const tilt = Math.max(-0.42, Math.min(0.42, vx * 0.00055 - (isGrounded ? 0 : Math.min(0.18, Math.max(-0.18, vy * 0.00025)))));
  ctx.rotate(tilt);

  // Squash & stretch when flapping, poked, or blasting off
  const rocketStretch = propulsion.rocketsActive ? 0.06 + Math.sin(time * 40) * 0.025 : 0;
  const flapSquash = Math.sin(wingPhase * Math.PI) * 0.07;
  const pokeSquash = snoutSquish * 0.08;
  const sx = scale * (1 - rocketStretch - flapSquash + pokeSquash);
  const sy = scale * (1 + rocketStretch + flapSquash - pokeSquash);
  ctx.scale(sx, sy);

  // 3. Compliment Balloons (tied to Wilbur's leather harness!)
  if (propulsion.balloonCount > 0) {
    drawBalloons(ctx, propulsion.balloonCount, time, vx, vy);
  }

  // 4. Supersonic Mach Vapor Cone (when Mach >= 1)
  if (mach >= 1.0 && !isGrounded) {
    ctx.save();
    const coneAlpha = Math.min(0.65, (mach - 0.9) * 0.45);
    const grad = ctx.createLinearGradient(0, -68, 0, 58);
    grad.addColorStop(0, `rgba(255, 255, 255, ${coneAlpha})`);
    grad.addColorStop(0.55, `rgba(180, 232, 255, ${coneAlpha * 0.55})`);
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, -76);
    ctx.quadraticCurveTo(68, -6, 86, 62);
    ctx.quadraticCurveTo(0, 32, -86, 62);
    ctx.quadraticCurveTo(-68, -6, 0, -76);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // 5. Back Golden Angel Wing
  if (propulsion.wingsEquipped || propulsion.rainbowMode) {
    drawWing(ctx, -18, -12, -1, wingPhase, time, true);
  }

  // 6. Curly Spring Tail (on left/rear side)
  ctx.save();
  const tailSpin = isGrounded ? Math.sin(time * 4) * 0.12 : Math.sin(time * 18) * 0.35;
  ctx.translate(-46, 2);
  ctx.rotate(tailSpin);
  ctx.strokeStyle = '#161A24';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-16, -6, -20, -20, -8, -19);
  ctx.bezierCurveTo(1, -18, -3, -6, -15, -10);
  ctx.stroke();

  ctx.strokeStyle = '#FF8DB2';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();

  // 7. Back Trotters (hooves)
  const kickSpeed = isGrounded ? 0 : isDragging ? 24 : 15;
  const kickA = isGrounded ? 0 : Math.sin(time * kickSpeed) * 0.42;
  const kickB = isGrounded ? 0 : Math.sin(time * kickSpeed + Math.PI) * 0.42;
  drawHoof(ctx, -25, 26, kickB, '#E8769C');
  drawHoof(ctx, 18, 26, kickA, '#E8769C');

  // 8. Plump Pig Body
  ctx.save();
  const bodyGrad = ctx.createRadialGradient(-10, -14, 8, 0, 2, 54);
  bodyGrad.addColorStop(0, '#FFD0E0');
  bodyGrad.addColorStop(0.5, '#FFA4C2');
  bodyGrad.addColorStop(1, '#F27EA5');

  ctx.fillStyle = bodyGrad;
  ctx.strokeStyle = '#161A24';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, 2, 48, 36, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Subtle cream belly highlight
  ctx.fillStyle = 'rgba(255, 240, 246, 0.45)';
  ctx.beginPath();
  ctx.ellipse(-8, -11, 24, 12, -0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 9. Harness Belt (when balloons or rockets attached)
  if (propulsion.balloonCount > 0 || propulsion.rocketsActive) {
    ctx.save();
    ctx.strokeStyle = '#161A24';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(0, 2, 37, -Math.PI * 0.56, Math.PI * 0.56);
    ctx.stroke();

    ctx.strokeStyle = '#6A4329';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, 2, 37, -Math.PI * 0.56, Math.PI * 0.56);
    ctx.stroke();

    // Brass buckle
    ctx.fillStyle = '#E5A93C';
    ctx.strokeStyle = '#161A24';
    ctx.lineWidth = 2;
    ctx.fillRect(-10, -4, 10, 12);
    ctx.strokeRect(-10, -4, 10, 12);
    ctx.restore();
  }

  // 10. Front Trotters
  drawHoof(ctx, -15, 29, kickA, '#FF94B7');
  drawHoof(ctx, 26, 28, kickB, '#FF94B7');

  // 11. Twin Retro Booster Rockets (strapped to sides)
  if (propulsion.rocketsActive) {
    drawBoosterRocket(ctx, -20, 4, time);
    drawBoosterRocket(ctx, 6, 8, time + 0.35);
  }

  // 12. Front Golden Angel Wing
  if (propulsion.wingsEquipped || propulsion.rainbowMode) {
    drawWing(ctx, -6, -6, 1, wingPhase, time, false);
  }

  // 13. Neck Scarf Collar
  ctx.save();
  ctx.fillStyle = '#FF4D1C';
  ctx.strokeStyle = '#161A24';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.ellipse(24, 14, 17, 8.5, -0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 14. Ears (expressive floppiness)
  const earFlop = Math.max(-0.35, Math.min(0.45, -vy * 0.0005)) + Math.sin(time * 5) * 0.04;
  drawEar(ctx, 18, -28, -0.3 + earFlop);
  drawEar(ctx, 42, -24, 0.25 + earFlop);

  // 15. Head (slightly forward-right so Wilbur feels lively & three-quarter hero angle)
  ctx.save();
  ctx.translate(28, -6);

  const headGrad = ctx.createRadialGradient(-5, -10, 4, 0, 0, 29);
  headGrad.addColorStop(0, '#FFD4E3');
  headGrad.addColorStop(0.55, '#FFA8C6');
  headGrad.addColorStop(1, '#F383A9');

  ctx.fillStyle = headGrad;
  ctx.strokeStyle = '#161A24';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Rosy Blush Cheeks
  const blushAlpha = 0.28 + blush * 0.45 + (propulsion.balloonCount > 0 ? 0.22 : 0);
  ctx.fillStyle = `rgba(255, 77, 130, ${Math.min(0.8, blushAlpha)})`;
  ctx.beginPath();
  ctx.ellipse(-10, 8, 6.5, 4, 0, 0, Math.PI * 2);
  ctx.ellipse(17, 8, 5.5, 3.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Expression state
  const isPanicked = propulsion.rocketsActive || isDragging || vy < -700;
  const isJoyful = propulsion.rainbowMode || altitude > 35000 || blush > 0.35;

  // Eyes
  const eyePositions = [
    { ex: -5, ey: -4 },
    { ex: 13, ey: -4 },
  ];

  eyePositions.forEach(({ ex, ey }) => {
    if (blink > 0.7 && !isPanicked) {
      ctx.strokeStyle = '#161A24';
      ctx.lineWidth = 2.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(ex - 4, ey);
      ctx.quadraticCurveTo(ex, ey + 3, ex + 4, ey);
      ctx.stroke();
    } else if (isJoyful && !isPanicked) {
      // Happy ^ ^ eyes
      ctx.strokeStyle = '#161A24';
      ctx.lineWidth = 2.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(ex, ey + 2, 4.5, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
    } else {
      // Expressive tracking eyes
      const r = isPanicked ? 6.2 : 4.8;
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#161A24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ex, ey, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      const px = ex + lookX * (isPanicked ? 1.5 : 2.1);
      const py = ey + lookY * (isPanicked ? 1.5 : 2.1);
      ctx.fillStyle = '#161A24';
      ctx.beginPath();
      ctx.arc(px, py, isPanicked ? 2.1 : 2.7, 0, Math.PI * 2);
      ctx.fill();

      // Cute catchlight
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(px - 1, py - 1, 1.1, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Vintage Brass Aviator Goggles (slide down over eyes when airborne/fast!)
  const gogglesDown = altitude > 250 || propulsion.rocketsActive || propulsion.windLevel > 55 ? 1 : 0;
  const goggleY = -16 + gogglesDown * 12;

  // Leather goggle strap
  ctx.strokeStyle = '#4A3123';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-24, goggleY + 1);
  ctx.lineTo(22, goggleY + 1);
  ctx.stroke();

  // Goggle lenses
  [-5, 13].forEach((gx) => {
    ctx.save();
    ctx.fillStyle = gogglesDown ? 'rgba(176, 232, 255, 0.42)' : 'rgba(225, 245, 255, 0.82)';
    ctx.strokeStyle = '#E5A93C';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.arc(gx, goggleY, 7.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Outer thin dark outline
    ctx.strokeStyle = '#161A24';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(gx, goggleY, 9.2, 0, Math.PI * 2);
    ctx.stroke();

    // Lens glint
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(gx, goggleY, 4.5, Math.PI * 1.15, Math.PI * 1.55);
    ctx.stroke();
    ctx.restore();
  });

  // Snout (squishes when poked!)
  ctx.save();
  ctx.translate(6, 7);
  ctx.scale(1 + snoutSquish * 0.22, 1 - snoutSquish * 0.22);
  ctx.fillStyle = '#FF7CA8';
  ctx.strokeStyle = '#161A24';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.ellipse(0, 0, 12.5, 8.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Nostrils
  ctx.fillStyle = '#6B1836';
  ctx.beginPath();
  ctx.ellipse(-4.2, -0.5, 2.2, 3.2, -0.1, 0, Math.PI * 2);
  ctx.ellipse(4.2, -0.5, 2.2, 3.2, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Mouth (cute smile or open surprised "O" during high thrust)
  ctx.strokeStyle = '#161A24';
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  if (isPanicked) {
    ctx.fillStyle = '#7A1F40';
    ctx.beginPath();
    ctx.ellipse(6, 18.5, 4.5, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(5, 16, 4.8, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }

  // Tiny Golden Crown in Rainbow Hyperdrive Mode!
  if (propulsion.rainbowMode) {
    ctx.save();
    ctx.translate(2, -29);
    ctx.rotate(-0.08);
    ctx.fillStyle = '#FFD166';
    ctx.strokeStyle = '#161A24';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-11, 4);
    ctx.lineTo(-13, -9);
    ctx.lineTo(-5, -3);
    ctx.lineTo(0, -12);
    ctx.lineTo(5, -3);
    ctx.lineTo(13, -9);
    ctx.lineTo(11, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // Space Glass Bubble Helmet (smoothly appears above 25,000m!)
  if (altitude > 24000) {
    const helmetAlpha = Math.min(1, (altitude - 24000) / 8000);
    ctx.save();
    ctx.globalAlpha = helmetAlpha;

    // Glass dome
    const glassGrad = ctx.createRadialGradient(-10, -14, 6, 2, -2, 42);
    glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.42)');
    glassGrad.addColorStop(0.65, 'rgba(130, 215, 255, 0.12)');
    glassGrad.addColorStop(1, 'rgba(195, 240, 255, 0.36)');
    ctx.fillStyle = glassGrad;
    ctx.strokeStyle = 'rgba(220, 245, 255, 0.9)';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.arc(2, -2, 37, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Specular shine arc
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.82)';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(2, -2, 30, Math.PI * 1.12, Math.PI * 1.48);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore(); // end head
  ctx.restore(); // end pig transform
}

function drawHoof(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  legColor: string
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Leg
  ctx.fillStyle = legColor;
  ctx.strokeStyle = '#161A24';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.roundRect(-6, -4, 12, 17, 5);
  ctx.fill();
  ctx.stroke();

  // Dark trotter shoe
  ctx.fillStyle = '#3B2B33';
  ctx.beginPath();
  ctx.roundRect(-6.5, 9, 13, 6.5, [2, 2, 4, 4]);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawEar(ctx: CanvasRenderingContext2D, x: number, y: number, rot: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = '#FF8DB2';
  ctx.strokeStyle = '#161A24';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(-7, 6);
  ctx.quadraticCurveTo(-8, -14, 4, -14);
  ctx.quadraticCurveTo(14, -6, 8, 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inner ear pink
  ctx.fillStyle = '#E85D8A';
  ctx.beginPath();
  ctx.ellipse(1, -2, 3.5, 5.5, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawWing(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  side: number,
  wingPhase: number,
  time: number,
  isBack: boolean
): void {
  ctx.save();
  ctx.translate(x, y);
  const idleFlap = Math.sin(time * 6) * 0.12;
  const activeFlap = Math.sin(wingPhase * Math.PI) * 0.95;
  ctx.rotate((isBack ? -0.35 : -0.1) - activeFlap + idleFlap * side);

  ctx.fillStyle = isBack ? '#F4C44E' : '#FFE07D';
  ctx.strokeStyle = '#161A24';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-18, -26, -34, -22, -32, -8);
  ctx.bezierCurveTo(-36, -2, -26, 6, -20, 3);
  ctx.bezierCurveTo(-20, 10, -10, 11, -5, 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawBoosterRocket(ctx: CanvasRenderingContext2D, x: number, y: number, time: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(0.24);

  // Flickering plasma exhaust flame
  const flicker = 0.85 + Math.sin(time * 65 + x) * 0.25;
  ctx.save();
  ctx.translate(0, 26);

  // Outer orange flame
  ctx.fillStyle = '#FF551A';
  ctx.beginPath();
  ctx.moveTo(-9, 0);
  ctx.quadraticCurveTo(0, 44 * flicker, 9, 0);
  ctx.closePath();
  ctx.fill();

  // Mid yellow flame
  ctx.fillStyle = '#FFD166';
  ctx.beginPath();
  ctx.moveTo(-5.5, 0);
  ctx.quadraticCurveTo(0, 28 * flicker, 5.5, 0);
  ctx.closePath();
  ctx.fill();

  // White hot core
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(-2.5, 0);
  ctx.quadraticCurveTo(0, 14 * flicker, 2.5, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Rocket canister body
  ctx.fillStyle = '#E6ECF5';
  ctx.strokeStyle = '#161A24';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.roundRect(-10, -18, 20, 38, [10, 10, 3, 3]);
  ctx.fill();
  ctx.stroke();

  // Retro Orange Stripe
  ctx.fillStyle = '#FF4D1C';
  ctx.fillRect(-9, -4, 18, 9);

  // Nozzle
  ctx.fillStyle = '#2B3140';
  ctx.beginPath();
  ctx.moveTo(-7, 20);
  ctx.lineTo(-10, 27);
  ctx.lineTo(10, 27);
  ctx.lineTo(7, 20);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function drawBalloons(
  ctx: CanvasRenderingContext2D,
  count: number,
  time: number,
  vx: number,
  vy: number
): void {
  const anchorX = -2;
  const anchorY = -28;
  const swayBias = Math.max(-24, Math.min(24, -vx * 0.03));
  const stretchY = Math.max(-8, Math.min(14, -vy * 0.01));

  for (let i = 0; i < count; i++) {
    const spread = count === 1 ? 0 : (i / (count - 1) - 0.5) * Math.min(115, count * 13);
    const tier = (i % 3) * 18;
    const bx = anchorX + spread + swayBias + Math.sin(time * 2.8 + i * 1.3) * 5;
    const by = anchorY - 64 - tier - stretchY + Math.cos(time * 2.3 + i * 1.7) * 4;
    const color = BALLOON_COLORS[i % BALLOON_COLORS.length];

    // String
    ctx.save();
    ctx.strokeStyle = 'rgba(22, 26, 36, 0.55)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(anchorX, anchorY);
    ctx.quadraticCurveTo((anchorX + bx) * 0.5 + swayBias * 0.4, (anchorY + by) * 0.5, bx, by + 16);
    ctx.stroke();

    // Balloon body
    ctx.fillStyle = color;
    ctx.strokeStyle = '#161A24';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(bx, by, 14, 17, Math.sin(time * 2 + i) * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Gloss highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.beginPath();
    ctx.ellipse(bx - 4.5, by - 5.5, 3.2, 6, -0.35, 0, Math.PI * 2);
    ctx.fill();

    // Knot
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(bx - 3, by + 17);
    ctx.lineTo(bx + 3, by + 17);
    ctx.lineTo(bx, by + 20);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}
