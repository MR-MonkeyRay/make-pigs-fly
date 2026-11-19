import type { TranslationSchema } from '../i18n/types';

export interface CertificateOptions {
  promise: string;
  from: string;
  altitude: number;
  flightNo: string;
  t: TranslationSchema;
}

/**
 * Generates a high-resolution (1200x680) vintage aviation Boarding Pass PNG
 * completely client-side via offscreen Canvas and triggers a download.
 */
export function downloadCertificatePng(opts: CertificateOptions): void {
  const { promise, from, altitude, flightNo, t } = opts;
  const width = 1200;
  const height = 680;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const fontSans = '"Space Grotesk", "Noto Sans SC", "Noto Sans JP", system-ui, sans-serif';
  const fontMono = '"JetBrains Mono", monospace';
  const fontDisplay = '"Syne", "Space Grotesk", "Noto Sans SC", "Noto Sans JP", sans-serif';

  // Background paper canvas
  ctx.fillStyle = '#EFE7D6';
  ctx.fillRect(0, 0, width, height);

  // Subtle diagonal blueprint grid pattern
  ctx.strokeStyle = 'rgba(22, 26, 36, 0.045)';
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 28) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += 28) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Boarding Pass Card
  const pad = 44;
  const cardW = width - pad * 2;
  const cardH = height - pad * 2;
  const stubX = pad + Math.round(cardW * 0.72);

  // Drop shadow
  ctx.fillStyle = 'rgba(22, 26, 36, 0.16)';
  ctx.beginPath();
  ctx.roundRect(pad + 10, pad + 12, cardW, cardH, 28);
  ctx.fill();

  // Main warm-paper card body
  ctx.fillStyle = '#FAF6EE';
  ctx.strokeStyle = '#161A24';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(pad, pad, cardW, cardH, 28);
  ctx.fill();
  ctx.stroke();

  // Top Header Strip (Aviation Cobalt)
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(pad, pad, cardW, 112, [28, 28, 0, 0]);
  ctx.clip();
  ctx.fillStyle = '#161A24';
  ctx.fillRect(pad, pad, cardW, 112);

  // International Orange accent bar
  ctx.fillStyle = '#FF4D1C';
  ctx.fillRect(pad, pad + 100, cardW, 12);
  ctx.restore();

  // Header text
  ctx.fillStyle = '#FAF6EE';
  ctx.font = `800 28px ${fontDisplay}`;
  ctx.textAlign = 'left';
  ctx.fillText(t.certifier.certHeader, pad + 42, pad + 52);

  ctx.fillStyle = '#FFD166';
  ctx.font = `700 14px ${fontMono}`;
  ctx.fillText(t.certifier.certSubheader, pad + 42, pad + 82);

  // Right stub header badge
  ctx.fillStyle = '#FF9EBB';
  ctx.font = `800 24px ${fontMono}`;
  ctx.textAlign = 'right';
  ctx.fillText(flightNo, pad + cardW - 38, pad + 64);

  // Tear-off dashed perforation line
  ctx.save();
  ctx.strokeStyle = 'rgba(22, 26, 36, 0.25)';
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(stubX, pad + 114);
  ctx.lineTo(stubX, pad + cardH - 4);
  ctx.stroke();
  ctx.restore();

  // Semi-circle ticket notches on perforation
  [pad + 112, pad + cardH].forEach((ny) => {
    ctx.fillStyle = '#EFE7D6';
    ctx.beginPath();
    ctx.arc(stubX, ny, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#161A24';
    ctx.lineWidth = 3;
    ctx.stroke();
  });

  // LEFT SECTION: Main Promise & Flight Details
  const leftX = pad + 42;
  const contentW = stubX - leftX - 42;

  // Row 1: Flight metadata
  drawMetaField(ctx, leftX, pad + 150, t.certifier.certPassenger, t.certifier.certPassengerName, fontMono, fontSans, '#161A24', 220);
  drawMetaField(
    ctx,
    leftX + 240,
    pad + 150,
    t.certifier.certAltLabel,
    `${Math.max(1200, Math.round(altitude)).toLocaleString()} m`,
    fontMono,
    fontMono,
    '#1D6FE2',
    220
  );
  drawMetaField(
    ctx,
    leftX + 475,
    pad + 150,
    t.certifier.certStatusLabel,
    t.certifier.certStatusVerified,
    fontMono,
    fontSans,
    '#D63612',
    250
  );

  // Divider hairline
  ctx.strokeStyle = 'rgba(22, 26, 36, 0.14)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(leftX, pad + 216);
  ctx.lineTo(stubX - 34, pad + 216);
  ctx.stroke();

  // Promise Clause Box
  ctx.fillStyle = '#737988';
  ctx.font = `700 13px ${fontMono}`;
  ctx.textAlign = 'left';
  ctx.fillText(t.certifier.certClauseLabel, leftX, pad + 252);

  ctx.fillStyle = '#FFFDF8';
  ctx.strokeStyle = '#161A24';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(leftX, pad + 268, contentW, 178, 16);
  ctx.fill();
  ctx.stroke();

  // Wrap promise text cleanly inside box
  const displayPromise = promise.trim() || t.certifier.certDefaultPromise;
  ctx.fillStyle = '#161A24';
  ctx.font = `700 28px ${fontSans}`;
  const lines = wrapCanvasText(ctx, `“${displayPromise}”`, contentW - 44).slice(0, 4);
  lines.forEach((line, idx) => {
    ctx.fillText(line, leftX + 22, pad + 314 + idx * 38);
  });

  // Footer signatures row
  const footY = pad + 492;
  drawMetaField(
    ctx,
    leftX,
    footY,
    t.certifier.certIssuedBy,
    from.trim() || 'P.A.A. RADAR CONTROL',
    fontMono,
    fontSans
  );
  drawMetaField(
    ctx,
    leftX + 340,
    footY,
    new Date().toISOString().slice(0, 10),
    t.certifier.certSignature,
    fontMono,
    fontSans
  );

  // Disclaimer
  ctx.fillStyle = '#737988';
  ctx.font = `500 12px ${fontSans}`;
  ctx.fillText(t.certifier.certDisclaimer, leftX, pad + cardH - 22);

  // RIGHT STUB: Official Rubber Stamp + Cute Pig Seal + Barcode
  const stubCenterX = stubX + (pad + cardW - stubX) * 0.5;

  // Cute mini winged pig emblem on stub
  drawMiniPigSeal(ctx, stubCenterX, pad + 220);

  // Official Angled Rubber Stamp ("PIGS HAVE FLOWN")
  ctx.save();
  ctx.translate(stubCenterX, pad + 368);
  ctx.rotate(-0.14);
  ctx.strokeStyle = '#D63612';
  ctx.lineWidth = 4;
  ctx.fillStyle = 'rgba(255, 77, 28, 0.08)';
  ctx.beginPath();
  ctx.roundRect(-108, -32, 216, 64, 10);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = 'rgba(214, 54, 18, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(-101, -25, 202, 50, 6);
  ctx.stroke();

  ctx.fillStyle = '#D63612';
  ctx.font = `800 17px ${fontMono}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(t.certifier.stampApproved, 0, 0);
  ctx.restore();

  // Decorative Aviation Barcode
  const barX = stubX + 36;
  const barY = pad + 458;
  const barW = pad + cardW - stubX - 72;
  ctx.fillStyle = '#161A24';
  let cx = barX;
  let seed = flightNo.charCodeAt(0) + displayPromise.length * 13;
  while (cx < barX + barW - 6) {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    const w = 2 + (seed % 5);
    const gap = 2 + ((seed >> 3) % 4);
    ctx.fillRect(cx, barY, w, 66);
    cx += w + gap;
  }

  ctx.fillStyle = '#161A24';
  ctx.font = `700 13px ${fontMono}`;
  ctx.textAlign = 'center';
  ctx.fillText(t.certifier.certFooterUrl, stubCenterX, pad + 548);

  // Trigger download
  const link = document.createElement('a');
  link.download = `makepigs-fly-${flightNo.toLowerCase()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function drawMetaField(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
  value: string,
  labelFont: string,
  valueFont: string,
  valueColor = '#161A24',
  maxWidth = 310
): void {
  ctx.textAlign = 'left';
  ctx.fillStyle = '#737988';
  ctx.font = `700 12px ${labelFont}`;
  ctx.fillText(label, x, y, maxWidth);

  ctx.fillStyle = valueColor;
  ctx.font = `800 20px ${valueFont}`;
  ctx.fillText(value, x, y + 28, maxWidth);
}

function drawMiniPigSeal(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.save();
  ctx.translate(cx, cy);

  // Outer dashed circle seal
  ctx.strokeStyle = '#1D6FE2';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 62, 0, Math.PI * 2);
  ctx.stroke();

  ctx.setLineDash([5, 5]);
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(0, 0, 54, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Wings
  ctx.fillStyle = '#FFD166';
  ctx.strokeStyle = '#161A24';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-24, -4);
  ctx.quadraticCurveTo(-48, -24, -44, -2);
  ctx.quadraticCurveTo(-36, 12, -22, 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(24, -4);
  ctx.quadraticCurveTo(48, -24, 44, -2);
  ctx.quadraticCurveTo(36, 12, 22, 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Pig face
  ctx.fillStyle = '#FFA6C4';
  ctx.beginPath();
  ctx.arc(0, 4, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Goggles
  ctx.fillStyle = '#DFF5FF';
  ctx.strokeStyle = '#E5A93C';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(-9, -8, 7, 0, Math.PI * 2);
  ctx.arc(9, -8, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Eyes
  ctx.fillStyle = '#161A24';
  ctx.beginPath();
  ctx.arc(-9, 3, 2.5, 0, Math.PI * 2);
  ctx.arc(9, 3, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Snout
  ctx.fillStyle = '#FF7CA8';
  ctx.strokeStyle = '#161A24';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 12, 10, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#6B1836';
  ctx.beginPath();
  ctx.arc(-3.5, 12, 1.8, 0, Math.PI * 2);
  ctx.arc(3.5, 12, 1.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function wrapCanvasText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
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
