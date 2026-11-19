import type { TranslationSchema } from '../i18n/types';

export interface PostcardOptions {
  promise: string;
  from: string;
  t: TranslationSchema;
}

/**
 * Renders a crisp, gallery-grade 1200x680 editorial proof postcard PNG
 * completely client-side via offscreen HTML5 Canvas.
 */
export function downloadPostcardPng({ promise, from, t }: PostcardOptions): void {
  const width = 1200;
  const height = 680;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const fontSerif = '"Instrument Serif", "Noto Serif SC", Georgia, serif';
  const fontSans = '"Plus Jakarta Sans", "Noto Sans SC", "Noto Sans JP", system-ui, sans-serif';
  const fontMono = '"JetBrains Mono", monospace';

  // Dreamy morning sky backdrop
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#EBF5FF');
  bgGrad.addColorStop(0.55, '#F6F2FF');
  bgGrad.addColorStop(1, '#FFF3EC');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Soft pastel sun halo
  const sunGrad = ctx.createRadialGradient(960, 120, 20, 960, 120, 340);
  sunGrad.addColorStop(0, 'rgba(255, 198, 217, 0.45)');
  sunGrad.addColorStop(1, 'rgba(255, 198, 217, 0)');
  ctx.fillStyle = sunGrad;
  ctx.fillRect(0, 0, width, height);

  // Cotton-paper Postcard Container
  const pad = 48;
  const cardW = width - pad * 2;
  const cardH = height - pad * 2;

  ctx.save();
  ctx.shadowColor = 'rgba(26, 38, 66, 0.12)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 18;
  ctx.fillStyle = '#FFFDF9';
  ctx.beginPath();
  ctx.roundRect(pad, pad, cardW, cardH, 32);
  ctx.fill();
  ctx.restore();

  // Crisp delicate hairline border
  ctx.strokeStyle = 'rgba(26, 38, 66, 0.14)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(pad, pad, cardW, cardH, 32);
  ctx.stroke();

  // Inner double-frame postcard accent
  ctx.strokeStyle = 'rgba(26, 38, 66, 0.06)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(pad + 18, pad + 18, cardW - 36, cardH - 36, 22);
  ctx.stroke();

  // Top Header Row
  const leftX = pad + 56;
  const rightX = pad + cardW - 56;
  ctx.fillStyle = '#3B6FE8';
  ctx.font = `600 13px ${fontMono}`;
  ctx.textAlign = 'left';
  ctx.fillText(t.proof.cardHeader, leftX, pad + 68);

  const today = new Date().toISOString().slice(0, 10);
  ctx.fillStyle = '#6E778B';
  ctx.textAlign = 'right';
  ctx.fillText(`${t.proof.cardDateLabel} ${today}`, rightX, pad + 68);

  // Subtle horizontal divider
  ctx.strokeStyle = 'rgba(26, 38, 66, 0.1)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(leftX, pad + 92);
  ctx.lineTo(rightX, pad + 92);
  ctx.stroke();

  // Left Column: Promise Quote
  ctx.fillStyle = '#7D8597';
  ctx.font = `600 13px ${fontMono}`;
  ctx.textAlign = 'left';
  ctx.fillText(t.proof.cardClauseLabel, leftX, pad + 150);

  const displayPromise = promise.trim() || t.proof.cardDefaultPromise;
  ctx.fillStyle = '#181E2E';
  ctx.font = `600 40px ${fontSerif}`;
  const lines = wrapText(ctx, `“${displayPromise}”`, 630).slice(0, 4);
  lines.forEach((line, idx) => {
    ctx.fillText(line, leftX, pad + 214 + idx * 54);
  });

  // Verdict Pill
  const pillY = pad + 448;
  ctx.fillStyle = '#FFF0F4';
  ctx.strokeStyle = 'rgba(229, 77, 126, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(leftX, pillY, 278, 40, 999);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#C93263';
  ctx.font = `600 13px ${fontMono}`;
  ctx.textAlign = 'left';
  ctx.fillText(`✓  ${t.proof.cardVerdict}`, leftX + 20, pillY + 25, 240);

  // Right Column: Minimalist Winged Pig Postage Stamp & Seal
  drawPostagePig(ctx, rightX - 132, pad + 240);

  // Angled Vermilion Ink Seal
  ctx.save();
  ctx.translate(rightX - 132, pad + 422);
  ctx.rotate(-0.12);
  ctx.strokeStyle = '#E0483E';
  ctx.lineWidth = 3.5;
  ctx.fillStyle = 'rgba(224, 72, 62, 0.06)';
  ctx.beginPath();
  ctx.roundRect(-105, -28, 210, 56, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#D93B32';
  ctx.font = `600 18px ${fontMono}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`★ ${t.proof.cardSeal} ★`, 0, 1);
  ctx.restore();

  // Footer Row
  ctx.strokeStyle = 'rgba(26, 38, 66, 0.1)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(leftX, pad + cardH - 86);
  ctx.lineTo(rightX, pad + cardH - 86);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#7D8597';
  ctx.font = `600 12px ${fontMono}`;
  ctx.fillText(
    `${t.proof.cardWitnessLabel}: ${from.trim() || t.proof.cardDefaultWitness}`,
    leftX,
    pad + cardH - 52
  );

  ctx.fillStyle = '#97A0B2';
  ctx.font = `500 12px ${fontSans}`;
  ctx.fillText(t.proof.cardDisclaimer, leftX, pad + cardH - 30);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#181E2E';
  ctx.font = `700 16px ${fontMono}`;
  ctx.fillText('makepigs.fly', rightX, pad + cardH - 42);

  const link = document.createElement('a');
  link.download = 'makepigs-fly-proof.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function drawPostagePig(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.save();
  ctx.translate(cx, cy);

  // Soft pastel sky circle frame
  const sky = ctx.createLinearGradient(0, -100, 0, 100);
  sky.addColorStop(0, '#CBE6FF');
  sky.addColorStop(1, '#FFF1F6');
  ctx.fillStyle = sky;
  ctx.beginPath();
  ctx.arc(0, 0, 96, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(59, 111, 232, 0.25)';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.arc(0, 0, 105, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Pearl white wings
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#333C52';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-26, -6);
  ctx.quadraticCurveTo(-76, -42, -68, -6);
  ctx.quadraticCurveTo(-56, 16, -24, 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(26, -6);
  ctx.quadraticCurveTo(76, -42, 68, -6);
  ctx.quadraticCurveTo(56, 16, 24, 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Pig face
  const body = ctx.createRadialGradient(-10, -14, 6, 0, 4, 46);
  body.addColorStop(0, '#FFD4E3');
  body.addColorStop(1, '#FF96BA');
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(0, 4, 38, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Happy closed-eye smile (^ ^)
  ctx.strokeStyle = '#2A2F42';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(-13, -3, 6, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(13, -3, 6, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();

  // Rosy cheeks
  ctx.fillStyle = 'rgba(255, 86, 140, 0.35)';
  ctx.beginPath();
  ctx.ellipse(-22, 8, 7, 4.5, 0, 0, Math.PI * 2);
  ctx.ellipse(22, 8, 7, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Snout
  ctx.fillStyle = '#FF7CA8';
  ctx.strokeStyle = '#333C52';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.ellipse(0, 14, 15, 10.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#7A2042';
  ctx.beginPath();
  ctx.ellipse(-5, 14, 2.5, 3.6, 0, 0, Math.PI * 2);
  ctx.ellipse(5, 14, 2.5, 3.6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let current = '';
  const hasSpaces = text.includes(' ');
  const tokens = hasSpaces ? text.split(/(\s+)/) : Array.from(text);

  for (const token of tokens) {
    const test = current + token;
    if (ctx.measureText(test).width > maxWidth && current.trim().length > 0) {
      lines.push(current.trim());
      current = token.trimStart();
    } else {
      current = test;
    }
  }
  if (current.trim().length > 0) {
    lines.push(current.trim());
  }
  return lines;
}
