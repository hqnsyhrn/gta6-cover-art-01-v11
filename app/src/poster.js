// poster.js — draws the VELVET COAST poster on any canvas.
// Three full-strength layouts (grid / hero / single), three colour grades
// (sunset / neon / violet). Every layout shows six real faces, a giant
// striped-chrome title, bold role labels and place-time-hook captions.

export const TITLE_FONT = '"Arial Black", "Segoe UI", Arial, sans-serif';
export const BODY_FONT = 'Arial, Helvetica, sans-serif';
export const SCRIPT_FONT = 'Georgia, "Times New Roman", serif';

// Fractions of the poster (x, y, w, h) for each layout's panels.
// Cast order is always: driver, boss, angler, fixer, insider, lookout.
export const LAYOUTS = {
  grid: {
    band: [0, 0.345, 1, 0.31],
    panels: [
      { cast: 0, rect: [0.02, 0.02, 0.313, 0.315] },
      { cast: 1, rect: [0.343, 0.02, 0.313, 0.315] },
      { cast: 2, rect: [0.667, 0.02, 0.313, 0.315] },
      { cast: 3, rect: [0.02, 0.665, 0.313, 0.265] },
      { cast: 4, rect: [0.343, 0.665, 0.313, 0.265] },
      { cast: 5, rect: [0.667, 0.665, 0.313, 0.265] },
    ],
  },
  hero: {
    // Big hero on top, then the title in its own dark band, then 2 + 3.
    // The hero is a wide-fit panel: a blurred backdrop plus the sharp photo
    // at reduced scale, so the whole face reads instead of one giant crop.
    panels: [
      { cast: 1, rect: [0.02, 0.02, 0.96, 0.32], wide: true },
      { cast: 0, rect: [0.02, 0.62, 0.475, 0.14] },
      { cast: 2, rect: [0.505, 0.62, 0.475, 0.14] },
      { cast: 3, rect: [0.02, 0.78, 0.313, 0.15] },
      { cast: 4, rect: [0.343, 0.78, 0.313, 0.15] },
      { cast: 5, rect: [0.667, 0.78, 0.313, 0.15] },
    ],
  },
  single: {
    // One dominant hero, title band, then a strip of five faces.
    panels: [
      { cast: 5, rect: [0.02, 0.02, 0.96, 0.34], wide: true },
      { cast: 0, rect: [0.02, 0.62, 0.188, 0.31] },
      { cast: 1, rect: [0.212, 0.62, 0.188, 0.31] },
      { cast: 2, rect: [0.404, 0.62, 0.188, 0.31] },
      { cast: 3, rect: [0.596, 0.62, 0.188, 0.31] },
      { cast: 4, rect: [0.788, 0.62, 0.188, 0.31] },
    ],
  },
};

// Where the big title and the script line live, per layout (fractions of H).
// The grid's title sits on its vista band; hero/single carry the title in a
// dedicated dark band between the hero and the rows below, so the title never
// covers a face or a role label.
export const TITLE_ZONES = {
  grid: { titleTop: 0.355, titleHeight: 0.225, scriptTop: 0.592, scriptHeight: 0.052 },
  hero: { titleTop: 0.35, titleHeight: 0.20, scriptTop: 0.555, scriptHeight: 0.05 },
  single: { titleTop: 0.37, titleHeight: 0.20, scriptTop: 0.575, scriptHeight: 0.05 },
};

export function splitTitle(title) {
  const words = String(title || 'VELVET COAST').trim().split(/\s+/);
  if (words.length === 1) {
    const w = words[0];
    const cut = Math.ceil(w.length / 2);
    return [w.slice(0, cut), w.slice(cut)];
  }
  const half = Math.ceil(words.length / 2);
  return [words.slice(0, half).join(' '), words.slice(half).join(' ')];
}

function wrapText(ctx, text, maxWidth) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width <= maxWidth || !line) line = test;
    else { lines.push(line); line = word; }
  }
  if (line) lines.push(line);
  return lines;
}

function drawCoverPhoto(ctx, img, rect, panel) {
  const [fx, fy, fw, fh] = rect;
  if (!img || !img.naturalWidth) {
    ctx.fillStyle = '#3a1a5e';
    ctx.fillRect(fx, fy, fw, fh);
    return;
  }
  ctx.save();
  ctx.beginPath();
  ctx.rect(fx, fy, fw, fh);
  ctx.clip();
  const base = Math.max(fw / img.naturalWidth, fh / img.naturalHeight);
  if (panel.wide) {
    // Wide hero panel: a blurred, darkened cover fills the panel, then the
    // sharp photo sits smaller on top, centred on the face — the whole head
    // and shoulders read instead of one giant cropped forehead.
    ctx.save();
    try { ctx.filter = 'blur(18px) brightness(0.55) saturate(1.5)'; } catch (e) { /* no filter */ }
    const bw = img.naturalWidth * base;
    const bh = img.naturalHeight * base;
    ctx.drawImage(img, fx + fw / 2 - bw / 2, fy + fh / 2 - bh / 2, bw, bh);
    ctx.restore();
    ctx.fillStyle = 'rgba(28, 11, 46, 0.18)';
    ctx.fillRect(fx, fy, fw, fh);
    const scale = base * 0.62;
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    const dx = fx + fw / 2 - (panel.focusX ?? 0.5) * dw;
    const dy = fy + fh / 2 - (panel.focusY ?? 0.34) * dh;
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.restore();
    return;
  }
  const scale = base * (panel.zoom || 1);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  let dx = fx + fw / 2 - (panel.focusX ?? 0.5) * dw + (panel.ox || 0);
  let dy = fy + fh / 2 - (panel.focusY ?? 0.34) * dh + (panel.oy || 0);
  dx = Math.min(fx, Math.max(fx + fw - dw, dx));
  dy = Math.min(fy, Math.max(fy + fh - dh, dy));
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}

function gradePhoto(ctx, rect, grade) {
  const [fx, fy, fw, fh] = rect;
  ctx.save();
  ctx.beginPath();
  ctx.rect(fx, fy, fw, fh);
  ctx.clip();
  if (grade === 'sunset') {
    const g = ctx.createLinearGradient(fx, fy, fx, fy + fh);
    g.addColorStop(0, 'rgba(255, 150, 60, 0.14)');
    g.addColorStop(0.55, 'rgba(255, 110, 90, 0.10)');
    g.addColorStop(1, 'rgba(255, 60, 150, 0.22)');
    ctx.fillStyle = g;
    ctx.fillRect(fx, fy, fw, fh);
  } else if (grade === 'neon') {
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = 'rgba(217, 70, 239, 0.30)';
    ctx.fillRect(fx, fy, fw, fh);
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = 'rgba(255, 0, 150, 0.35)';
    ctx.fillRect(fx, fy, fw, fh);
    ctx.globalCompositeOperation = 'source-over';
    const g = ctx.createLinearGradient(fx, fy, fx, fy + fh);
    g.addColorStop(0, 'rgba(120, 20, 180, 0.10)');
    g.addColorStop(1, 'rgba(255, 40, 160, 0.18)');
    ctx.fillStyle = g;
    ctx.fillRect(fx, fy, fw, fh);
  } else {
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = 'rgba(124, 58, 237, 0.38)';
    ctx.fillRect(fx, fy, fw, fh);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(40, 8, 80, 0.16)';
    ctx.fillRect(fx, fy, fw, fh);
  }
  ctx.restore();
}

function drawRoleStrip(ctx, rect, panel, width) {
  const [fx, fy, fw, fh] = rect;
  // Left-aligned on purpose: the title pass leaves textAlign at 'center'
  // on this shared context, and a centred role label would spill off the
  // panel's left edge on every redraw after the first.
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  const stripH = Math.max(fh * 0.26, width * 0.045);
  const sy = fy + fh - stripH;
  const g = ctx.createLinearGradient(0, sy, 0, fy + fh);
  g.addColorStop(0, 'rgba(12, 2, 24, 0)');
  g.addColorStop(0.35, 'rgba(12, 2, 24, 0.82)');
  g.addColorStop(1, 'rgba(12, 2, 24, 0.94)');
  ctx.fillStyle = g;
  ctx.fillRect(fx, sy, fw, stripH);
  const pad = Math.max(fw * 0.045, 6);
  const caption = panel.caption || '';
  // Role label: bold, shrunk to fit the panel width.
  let roleSize = Math.min(stripH * 0.42, fw * 0.115);
  ctx.font = '900 ' + roleSize + 'px ' + TITLE_FONT;
  ctx.textBaseline = 'alphabetic';
  while (roleSize > 8 && ctx.measureText(panel.role).width > fw - pad * 2) {
    roleSize -= 1;
    ctx.font = '900 ' + roleSize + 'px ' + TITLE_FONT;
  }
  ctx.fillStyle = '#ffffff';
  ctx.fillText(panel.role, fx + pad, sy + stripH * 0.44);
  // Caption: place-time-hook, wrapped to at most two lines.
  let capSize = Math.min(stripH * 0.26, fw * 0.052, roleSize * 0.62);
  if (capSize < 7) capSize = 7;
  ctx.font = '700 ' + capSize + 'px ' + BODY_FONT;
  const lines = wrapText(ctx, caption, fw - pad * 2).slice(0, 2);
  ctx.fillStyle = '#ffd166';
  lines.forEach((line, i) => {
    ctx.fillText(line, fx + pad, sy + stripH * (0.44 + 0.26 + i * 0.26));
  });
}

function paintChromeTitle(ctx, lines, zone, width, height) {
  const top = zone.titleTop * height;
  const zoneH = zone.titleHeight * height;
  const lineH = zoneH / lines.length;
  let fontSize = lineH * 0.92;
  // Fit the widest line to 95% of the frame width.
  const measure = (size) => {
    ctx.font = '900 ' + size + 'px ' + TITLE_FONT;
    return Math.max(...lines.map((l) => ctx.measureText(l).width));
  };
  while (fontSize > 20 && measure(fontSize) > width * 0.95) fontSize -= 2;
  ctx.font = '900 ' + fontSize + 'px ' + TITLE_FONT;
  try { ctx.letterSpacing = '2px'; } catch (e) { /* older canvas */ }

  // Offscreen pass: gradient fill + chrome stripes, clipped to the letters.
  const off = document.createElement('canvas');
  off.width = Math.max(2, Math.round(width));
  off.height = Math.max(2, Math.round(zoneH));
  const o = off.getContext('2d');
  o.font = '900 ' + fontSize + 'px ' + TITLE_FONT;
  try { o.letterSpacing = '2px'; } catch (e) { /* older canvas */ }
  o.textAlign = 'center';
  o.textBaseline = 'middle';
  o.shadowColor = 'rgba(255, 60, 180, 0.9)';
  o.shadowBlur = fontSize * 0.22;
  const grad = o.createLinearGradient(0, 0, 0, zoneH);
  grad.addColorStop(0, '#ff7ab8');
  grad.addColorStop(0.32, '#ffd166');
  grad.addColorStop(0.55, '#ff5fa2');
  grad.addColorStop(0.8, '#c084fc');
  grad.addColorStop(1, '#8b5cf6');
  o.fillStyle = grad;
  lines.forEach((line, i) => {
    o.fillText(line, width / 2, lineH * (i + 0.5));
  });
  o.shadowBlur = 0;
  o.globalCompositeOperation = 'source-atop';
  o.fillStyle = 'rgba(255, 255, 255, 0.30)';
  lines.forEach((_, i) => {
    const cy = lineH * (i + 0.5);
    o.fillRect(0, cy - fontSize * 0.30, width, fontSize * 0.07);
    o.fillRect(0, cy + fontSize * 0.10, width, fontSize * 0.05);
  });
  o.fillStyle = 'rgba(20, 4, 40, 0.28)';
  lines.forEach((_, i) => {
    const cy = lineH * (i + 0.5);
    o.fillRect(0, cy - fontSize * 0.05, width, fontSize * 0.06);
  });
  o.globalCompositeOperation = 'source-over';

  ctx.save();
  ctx.translate(width / 2, top + zoneH / 2);
  ctx.rotate(-0.018);
  ctx.drawImage(off, -width / 2, -zoneH / 2, width, zoneH);
  ctx.restore();

  // Crisp dark outline around the letters, drawn on the main canvas.
  ctx.save();
  ctx.translate(width / 2, top + zoneH / 2);
  ctx.rotate(-0.018);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#150422';
  ctx.lineWidth = Math.max(3, fontSize * 0.075);
  lines.forEach((line, i) => {
    ctx.strokeText(line, 0, lineH * (i + 0.5) - zoneH / 2);
  });
  ctx.restore();
  try { ctx.letterSpacing = '0px'; } catch (e) { /* older canvas */ }
}

function drawScriptBand(ctx, script, zone, width, height) {
  const top = zone.scriptTop * height;
  const bandH = zone.scriptHeight * height;
  ctx.fillStyle = '#160a26';
  ctx.fillRect(width * 0.06, top, width * 0.88, bandH);
  ctx.strokeStyle = 'rgba(255, 209, 102, 0.55)';
  ctx.lineWidth = Math.max(1, height * 0.0012);
  ctx.strokeRect(width * 0.06, top, width * 0.88, bandH);
  const size = Math.min(bandH * 0.52, width * 0.032);
  ctx.font = 'italic 900 ' + size + 'px ' + SCRIPT_FONT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#ff2e9a';
  ctx.shadowBlur = size * 0.55;
  ctx.lineWidth = Math.max(2, size * 0.16);
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#1c0630';
  ctx.strokeText(script, width / 2, top + bandH / 2);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(script, width / 2, top + bandH / 2);
  ctx.shadowBlur = 0;
}

function drawWantedPill(ctx, width, height) {
  const pw = width * 0.135;
  const ph = Math.max(height * 0.026, 20);
  const cx = width * 0.895;
  const cy = height * 0.038;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(0.10);
  ctx.fillStyle = '#f8f4ff';
  ctx.strokeStyle = '#c81e3a';
  ctx.lineWidth = Math.max(2, height * 0.002);
  ctx.beginPath();
  ctx.roundRect(-pw / 2, -ph / 2, pw, ph, ph / 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#c81e3a';
  ctx.font = '900 ' + (ph * 0.58) + 'px ' + TITLE_FONT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('WANTED', 0, ph * 0.04);
  ctx.restore();
}

function drawGoldSeal(ctx, width, height) {
  // Top-left corner: the bottom corners hold role labels, so the seal lives
  // up here where it covers only sky, never a face or a label.
  const r = width * 0.052;
  const cx = width * 0.085;
  const cy = height * 0.045;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.12);
  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
  g.addColorStop(0, '#fff3c4');
  g.addColorStop(0.5, '#ffd166');
  g.addColorStop(1, '#b8860b');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#7a5b00';
  ctx.lineWidth = Math.max(2, r * 0.06);
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.82, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#3a2500';
  ctx.font = '900 ' + (r * 0.24) + 'px ' + TITLE_FONT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ORIGINAL', 0, -r * 0.22);
  ctx.fillText('COVER ART', 0, r * 0.24);
  ctx.restore();
}

function drawBottomStrips(ctx, width, height) {
  // COMING SOON strip.
  const stripTop = height * 0.935;
  const stripH = height * 0.028;
  ctx.fillStyle = '#160a26';
  ctx.fillRect(0, stripTop, width, stripH);
  ctx.fillStyle = '#ffd166';
  ctx.font = '900 ' + (stripH * 0.58) + 'px ' + TITLE_FONT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  try { ctx.letterSpacing = '4px'; } catch (e) { /* older canvas */ }
  ctx.fillText('COMING SOON  ·  VOL. 01', width / 2, stripTop + stripH / 2);
  try { ctx.letterSpacing = '0px'; } catch (e) { /* older canvas */ }
  // One small credit line at the very edge.
  ctx.fillStyle = 'rgba(230, 210, 255, 0.75)';
  ctx.font = '400 ' + Math.max(9, height * 0.009) + 'px ' + BODY_FONT;
  ctx.fillText(
    'AN ORIGINAL FAN-MADE COVER  ·  ALL FACES AI-GENERATED  ·  VELVET COAST',
    width / 2,
    height * 0.978,
  );
}

// Draw the whole poster. state: { design, grade, title, script, panels, vista }.
// panels are in cast order; each has { img, role, caption, zoom, ox, oy, focusX, focusY }.
export function drawPoster(canvas, state) {
  const width = canvas.width;
  const height = canvas.height;
  const ctx = canvas.getContext('2d');
  // Reset text state: the context is shared across redraws, and the title
  // pass leaves textAlign at 'center'.
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  const design = state.design || 'grid';
  const grade = state.grade || 'sunset';
  const layout = LAYOUTS[design] || LAYOUTS.grid;
  const zone = TITLE_ZONES[design] || TITLE_ZONES.grid;

  // Dark purple frame fills the whole poster first.
  ctx.fillStyle = '#1c0b2e';
  ctx.fillRect(0, 0, width, height);

  // Vista band behind the title (grid design): a sunset street photo, darkened purple.
  if (design === 'grid' && state.vista) {
    const band = layout.band;
    const rect = [0, band[1] * height, width, band[3] * height];
    drawCoverPhoto(ctx, state.vista, rect, { zoom: 1.15, focusX: 0.5, focusY: 0.55 });
    const g = ctx.createLinearGradient(0, rect[1], 0, rect[1] + rect[3]);
    g.addColorStop(0, 'rgba(28, 11, 46, 0.55)');
    g.addColorStop(0.5, 'rgba(120, 30, 160, 0.28)');
    g.addColorStop(1, 'rgba(28, 11, 46, 0.72)');
    ctx.fillStyle = g;
    ctx.fillRect(rect[0], rect[1], rect[2], rect[3]);
  }

  // Dark title band for hero/single: solid purple gradient with thin gold
  // rules, so the giant title has a home that covers no face and no label.
  if (design !== 'grid') {
    const bandTop = (zone.titleTop - 0.012) * height;
    const bandBottom = (zone.scriptTop + zone.scriptHeight + 0.012) * height;
    const bg = ctx.createLinearGradient(0, bandTop, 0, bandBottom);
    bg.addColorStop(0, '#2c0c50');
    bg.addColorStop(0.5, '#1c0b2e');
    bg.addColorStop(1, '#2c0c50');
    ctx.fillStyle = bg;
    ctx.fillRect(0, bandTop, width, bandBottom - bandTop);
    ctx.fillStyle = 'rgba(255, 209, 102, 0.7)';
    ctx.fillRect(0, bandTop, width, Math.max(2, height * 0.002));
    ctx.fillRect(0, bandBottom - Math.max(2, height * 0.002), width, Math.max(2, height * 0.002));
  }

  // Panels: photo, grade, role strip.
  for (const slot of layout.panels) {
    const panel = state.panels[slot.cast];
    if (!panel) continue;
    const [rx, ry, rw, rh] = slot.rect;
    const rect = [rx * width, ry * height, rw * width, rh * height];
    drawCoverPhoto(ctx, panel.img, rect, slot.wide ? { ...panel, wide: true } : panel);
    gradePhoto(ctx, rect, grade);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.lineWidth = Math.max(1, width * 0.002);
    ctx.strokeRect(rect[0], rect[1], rect[2], rect[3]);
    drawRoleStrip(ctx, rect, panel, width);
  }

  // Whole-poster purple wash + vignette, so purple/magenta own the poster.
  ctx.save();
  ctx.globalCompositeOperation = 'soft-light';
  ctx.fillStyle = '#a855f7';
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
  const vig = ctx.createRadialGradient(
    width / 2, height / 2, Math.min(width, height) * 0.42,
    width / 2, height / 2, Math.max(width, height) * 0.72,
  );
  vig.addColorStop(0, 'rgba(20, 4, 40, 0)');
  vig.addColorStop(1, 'rgba(20, 4, 40, 0.38)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, width, height);

  // Giant title + bold script line on its solid dark band.
  paintChromeTitle(ctx, splitTitle(state.title), zone, width, height);
  drawScriptBand(ctx, state.script || 'one last golden hour', zone, width, height);

  // Thin gold inner frame line.
  ctx.strokeStyle = 'rgba(255, 209, 102, 0.65)';
  ctx.lineWidth = Math.max(2, width * 0.003);
  ctx.strokeRect(width * 0.012, height * 0.008, width * 0.976, height * 0.984);

  drawWantedPill(ctx, width, height);
  drawGoldSeal(ctx, width, height);
  drawBottomStrips(ctx, width, height);
}

// Render the same poster at export size and return a PNG blob.
export function renderPosterBlob(state, exportWidth, exportHeight) {
  const canvas = document.createElement('canvas');
  canvas.width = exportWidth;
  canvas.height = exportHeight;
  drawPoster(canvas, state);
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}
