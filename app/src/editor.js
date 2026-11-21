// editor.js — the VELVET COAST editor: real photo upload, per-panel crop,
// editable captions, three designs, three grades, PNG export in three sizes.
// All photos are read on the user's own machine; nothing is uploaded.

import { drawPoster, renderPosterBlob, LAYOUTS } from './poster.js';

// Cast order: driver, boss, angler, fixer, insider, lookout.
// Two house-kit photos + four AI-generated portraits. Every panel holds a
// real face; captions are original, in place · time · hook form, and each
// design carries its own caption set.
const CAST = [
  {
    role: 'THE DRIVER', src: 'samples/boulevard.jpg', focusX: 0.5, focusY: 0.30,
    captions: {
      grid: 'VELVET BOULEVARD · 6:58 PM · WAITS FOR NO ONE',
      hero: 'BOULEVARD · 6:58 PM · NEVER WAITS',
      single: 'BOULEVARD · 6:58 PM',
    },
  },
  {
    role: 'THE BOSS', src: 'samples/boss.jpg', focusX: 0.5, focusY: 0.30,
    captions: {
      grid: 'NEON ROW · 9:41 PM · OWNS EVERY ROOM',
      hero: 'NEON ROW · 9:41 PM · RUNS THE COAST',
      single: 'NEON ROW · 9:41 PM',
    },
  },
  {
    role: 'THE ANGLER', src: 'samples/pier.jpg', focusX: 0.5, focusY: 0.28,
    captions: {
      grid: 'VELVET PIER · 5:12 AM · THE BIG ONE BITES',
      hero: 'THE PIER · 5:12 AM · PATIENT, THEN RICH',
      single: 'THE PIER · 5:12 AM',
    },
  },
  {
    role: 'THE FIXER', src: 'samples/fixer.jpg', focusX: 0.5, focusY: 0.28,
    captions: {
      grid: 'GREASE ALLEY · 7:03 PM · FIXES ANYTHING',
      hero: 'GREASE ALLEY · 7:03 PM · NO QUESTIONS',
      single: 'GREASE ALLEY · 7:03 PM',
    },
  },
  {
    role: 'THE INSIDER', src: 'samples/insider.jpg', focusX: 0.5, focusY: 0.30,
    captions: {
      grid: 'CLUB VELVET · 11:47 PM · KNOWS THE DOOR CODE',
      hero: 'CLUB VELVET · 11:47 PM · ON EVERY LIST',
      single: 'CLUB VELVET · 11:47 PM',
    },
  },
  {
    role: 'THE LOOKOUT', src: 'samples/lookout.jpg', focusX: 0.5, focusY: 0.28,
    captions: {
      grid: 'ROOFTOP 9 · 6:21 PM · SEES IT FIRST',
      hero: 'ROOFTOP 9 · 6:21 PM · NOTHING GETS PAST',
      single: 'ROOFTOP 9 · 6:21 PM',
    },
  },
];

const DESIGN_GRADES = { grid: 'sunset', hero: 'neon', single: 'violet' };

const state = {
  design: 'grid',
  grade: 'sunset',
  title: 'VELVET COAST',
  script: 'one last golden hour',
  panels: CAST.map((c) => ({
    role: c.role,
    src: c.src,
    img: null,
    captionByDesign: { ...c.captions },
    zoom: 1.2,
    ox: 0,
    oy: 0,
    focusX: c.focusX,
    focusY: c.focusY,
    userPhoto: false,
  })),
  vista: null,
  selected: 0,
};

function panelCaption(panel) {
  return panel.captionByDesign[state.design] || panel.captionByDesign.grid;
}

function posterState() {
  return {
    design: state.design,
    grade: state.grade,
    title: state.title,
    script: state.script,
    vista: state.vista,
    panels: state.panels.map((p) => ({
      img: p.img,
      role: p.role,
      caption: panelCaption(p),
      zoom: p.zoom,
      ox: p.ox,
      oy: p.oy,
      focusX: p.focusX,
      focusY: p.focusY,
    })),
  };
}

const canvas = document.getElementById('posterCanvas');
const statusLine = document.getElementById('statusLine');
const panelList = document.getElementById('panelList');
const captionInput = document.getElementById('captionInput');
const zoomSlider = document.getElementById('zoomSlider');
const zoomValue = document.getElementById('zoomValue');
const cropTitle = document.getElementById('cropTitle');

function setStatus(text) {
  statusLine.textContent = text;
}

function draw() {
  drawPoster(canvas, posterState());
}

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function loadDefaults() {
  const loaded = await Promise.all(state.panels.map((p) => loadImage(p.src)));
  loaded.forEach((img, i) => { state.panels[i].img = img; });
  state.vista = await loadImage('samples/boulevard.jpg');
  draw();
  refreshPanelList();
}

function refreshPanelList() {
  panelList.innerHTML = '';
  state.panels.forEach((panel, i) => {
    const li = document.createElement('li');
    if (i === state.selected) li.classList.add('selected');
    const thumb = document.createElement('img');
    thumb.alt = panel.role;
    thumb.src = panel.img ? panel.img.src : panel.src;
    const meta = document.createElement('div');
    const role = document.createElement('span');
    role.className = 'role';
    role.textContent = panel.role + (panel.userPhoto ? ' · YOUR PHOTO' : '');
    const cap = document.createElement('span');
    cap.className = 'cap';
    cap.textContent = panelCaption(panel);
    meta.append(role, cap);
    li.append(thumb, meta);
    li.addEventListener('click', () => selectPanel(i));
    panelList.appendChild(li);
  });
}

function selectPanel(i) {
  state.selected = i;
  const panel = state.panels[i];
  cropTitle.textContent = 'Selected: ' + panel.role;
  captionInput.value = panelCaption(panel);
  zoomSlider.value = String(panel.zoom);
  zoomValue.textContent = panel.zoom.toFixed(2) + '×';
  refreshPanelList();
}

function loadFileIntoPanel(file, index) {
  if (!file || !file.type.startsWith('image/')) {
    setStatus('That file is not an image — try a JPG or PNG photo.');
    return Promise.resolve(false);
  }
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const panel = state.panels[index];
        panel.img = img;
        panel.src = file.name;
        panel.userPhoto = true;
        panel.zoom = 1.2;
        panel.ox = 0;
        panel.oy = 0;
        panel.focusX = 0.5;
        panel.focusY = 0.34;
        draw();
        refreshPanelList();
        setStatus('Your photo is in ' + panel.role + ' — drag it in the preview to reposition, zoom to crop, then export.');
        resolve(true);
      };
      img.onerror = () => { setStatus('Could not read that photo — try another file.'); resolve(false); };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

async function addFiles(files) {
  const list = Array.from(files || []);
  if (!list.length) return;
  let index = state.selected;
  for (const file of list) {
    await loadFileIntoPanel(file, index);
    index = (index + 1) % state.panels.length;
  }
  selectPanel(state.selected);
}

// ---- Design + grade -------------------------------------------------------
function setDesign(design) {
  state.design = design;
  state.grade = DESIGN_GRADES[design] || state.grade;
  document.querySelectorAll('#designRow .choice').forEach((b) => {
    b.classList.toggle('active', b.dataset.design === design);
  });
  document.querySelectorAll('#gradeRow .choice').forEach((b) => {
    b.classList.toggle('active', b.dataset.grade === state.grade);
  });
  captionInput.value = panelCaption(state.panels[state.selected]);
  draw();
  refreshPanelList();
  setStatus('Design: ' + design + ' · grade: ' + state.grade + ' — all six faces still in the poster.');
}

function setGrade(grade) {
  state.grade = grade;
  document.querySelectorAll('#gradeRow .choice').forEach((b) => {
    b.classList.toggle('active', b.dataset.grade === grade);
  });
  draw();
  setStatus('Grade: ' + grade + '.');
}

document.querySelectorAll('#designRow .choice').forEach((b) => {
  b.addEventListener('click', () => setDesign(b.dataset.design));
});
document.querySelectorAll('#gradeRow .choice').forEach((b) => {
  b.addEventListener('click', () => setGrade(b.dataset.grade));
});

document.getElementById('titleInput').addEventListener('input', (e) => {
  state.title = e.target.value || 'VELVET COAST';
  draw();
});
document.getElementById('scriptInput').addEventListener('input', (e) => {
  state.script = e.target.value || 'one last golden hour';
  draw();
});
captionInput.addEventListener('input', (e) => {
  state.panels[state.selected].captionByDesign[state.design] = e.target.value;
  draw();
  refreshPanelList();
});
zoomSlider.addEventListener('input', (e) => {
  const panel = state.panels[state.selected];
  panel.zoom = Number(e.target.value);
  zoomValue.textContent = panel.zoom.toFixed(2) + '×';
  draw();
});
document.getElementById('resetCropBtn').addEventListener('click', () => {
  const panel = state.panels[state.selected];
  panel.zoom = 1.2;
  panel.ox = 0;
  panel.oy = 0;
  zoomSlider.value = '1.2';
  zoomValue.textContent = '1.20×';
  draw();
  setStatus('Crop reset for ' + panel.role + '.');
});

// ---- Uploads + drag-and-drop ----------------------------------------------
document.getElementById('photoInput').addEventListener('change', (e) => {
  addFiles(e.target.files);
  e.target.value = '';
});
document.getElementById('replaceInput').addEventListener('change', (e) => {
  if (e.target.files[0]) loadFileIntoPanel(e.target.files[0], state.selected);
  e.target.value = '';
});

function panelAtPoint(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const px = (clientX - rect.left) / rect.width;
  const py = (clientY - rect.top) / rect.height;
  const layout = LAYOUTS[state.design];
  for (let i = 0; i < layout.panels.length; i += 1) {
    const [rx, ry, rw, rh] = layout.panels[i].rect;
    if (px >= rx && px <= rx + rw && py >= ry && py <= ry + rh) return layout.panels[i].cast;
  }
  return -1;
}

canvas.addEventListener('dragover', (e) => {
  e.preventDefault();
  canvas.classList.add('drop-target');
});
canvas.addEventListener('dragleave', () => canvas.classList.remove('drop-target'));
canvas.addEventListener('drop', (e) => {
  e.preventDefault();
  canvas.classList.remove('drop-target');
  const index = panelAtPoint(e.clientX, e.clientY);
  if (index >= 0 && e.dataTransfer.files.length) {
    loadFileIntoPanel(e.dataTransfer.files[0], index);
  }
});

// Drag-to-crop: drag a face inside the preview to reposition its photo.
let drag = null;
canvas.addEventListener('pointerdown', (e) => {
  const index = panelAtPoint(e.clientX, e.clientY);
  if (index < 0) return;
  selectPanel(index);
  const rect = canvas.getBoundingClientRect();
  drag = {
    index,
    startX: e.clientX,
    startY: e.clientY,
    ox: state.panels[index].ox,
    oy: state.panels[index].oy,
    scaleX: canvas.width / rect.width,
    scaleY: canvas.height / rect.height,
    moved: false,
  };
  canvas.classList.add('dragging');
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const panel = state.panels[drag.index];
  panel.ox = drag.ox + (e.clientX - drag.startX) * drag.scaleX;
  panel.oy = drag.oy + (e.clientY - drag.startY) * drag.scaleY;
  if (Math.abs(e.clientX - drag.startX) + Math.abs(e.clientY - drag.startY) > 4) drag.moved = true;
  draw();
});
canvas.addEventListener('pointerup', () => {
  if (drag && drag.moved) {
    setStatus(state.panels[drag.index].role + ' repositioned — zoom or export when it looks right.');
  }
  drag = null;
  canvas.classList.remove('dragging');
});

// ---- Export ---------------------------------------------------------------
async function exportPNG(exportWidth, exportHeight, label) {
  setStatus('Exporting ' + label + '…');
  const blob = await renderPosterBlob(posterState(), exportWidth, exportHeight);
  if (!blob) {
    setStatus('Export failed — try again.');
    return null;
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'velvet-coast-' + exportWidth + 'x' + exportHeight + '.png';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  setStatus('Exported ' + label + ' PNG (' + exportWidth + ' × ' + exportHeight + ').');
  return blob;
}

document.getElementById('exportPortrait').addEventListener('click', () => exportPNG(1080, 1350, 'portrait'));
document.getElementById('exportWide').addEventListener('click', () => exportPNG(1920, 1080, 'widescreen'));
document.getElementById('exportSquare').addEventListener('click', () => exportPNG(1080, 1080, 'square'));

// ---- Shot mode for screenshots --------------------------------------------
// ?shot=cover&design=grid&grade=sunset shows the poster alone, full frame.
// ?shot=editor (or no param) shows the normal editor.
const params = new URLSearchParams(window.location.search);
if (params.get('design')) setDesign(params.get('design'));
if (params.get('grade')) setGrade(params.get('grade'));
if (params.get('title')) {
  state.title = params.get('title');
  document.getElementById('titleInput').value = state.title;
}
if (params.get('shot') === 'cover') {
  document.body.classList.add('shot');
  canvas.width = 1080;
  canvas.height = 1350;
}

// Test + automation hook: the app's own state and export, for screenshots.
window.VELVET = {
  state,
  draw,
  exportPNG,
  loadFileIntoPanel,
  selectPanel,
  panelCaption,
  ready: loadDefaults(),
};
