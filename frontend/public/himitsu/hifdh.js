/* ============ DAILY HIFDH — session annotée au stylet + cœurs + archive ============ */

const H_COVERS = 'hifdh_covers';
const H_SESSIONS = 'hifdh_sessions';
const H_DRAFT = 'hifdh_draft';
const CW = 795;
const CH = 1178;

function hLoad(key, fallback) {
  try { const r = localStorage.getItem(key); if (r) return JSON.parse(r); } catch (e) {}
  return fallback;
}
function hSave(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
}
function escHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function fmtLong(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
function fmtShort(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

let hCovers = hLoad(H_COVERS, ['cover-campus.png']);
if (!Array.isArray(hCovers) || !hCovers.length) hCovers = ['cover-campus.png'];
let hSessions = hLoad(H_SESSIONS, []);
let hPreviewIdx = Math.floor(Math.random() * hCovers.length);

let ed = null;
let redoStack = [];
const tool = { color: '#4a3540', size: 5, eraser: false };
let drawing = false;
let curStroke = null;

const overlay = document.getElementById('hifdh-overlay');
const canvas = document.getElementById('hifdh-canvas');
const ctx = canvas.getContext('2d');
canvas.width = CW;
canvas.height = CH;

/* ---------- dessin ---------- */

function drawStroke(s) {
  ctx.strokeStyle = s.c;
  ctx.fillStyle = s.c;
  ctx.lineWidth = s.w;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  const pts = s.pts;
  if (pts.length < 2) {
    ctx.beginPath();
    ctx.arc(pts[0][0] * CW, pts[0][1] * CH, s.w / 2, 0, 7);
    ctx.fill();
    return;
  }
  ctx.beginPath();
  ctx.moveTo(pts[0][0] * CW, pts[0][1] * CH);
  if (pts.length < 3) {
    ctx.lineTo(pts[1][0] * CW, pts[1][1] * CH);
  } else {
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = ((pts[i][0] + pts[i + 1][0]) / 2) * CW;
      const my = ((pts[i][1] + pts[i + 1][1]) / 2) * CH;
      ctx.quadraticCurveTo(pts[i][0] * CW, pts[i][1] * CH, mx, my);
    }
    ctx.lineTo(pts[pts.length - 1][0] * CW, pts[pts.length - 1][1] * CH);
  }
  ctx.stroke();
}

function redrawAll() {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, CW, CH);
  if (ed) ed.strokes.forEach(drawStroke);
}

function canvasPos(e) {
  const r = canvas.getBoundingClientRect();
  return [
    Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)),
    Math.min(1, Math.max(0, (e.clientY - r.top) / r.height))
  ];
}

canvas.addEventListener('pointerdown', (e) => {
  if (!ed) return;
  e.preventDefault();
  canvas.setPointerCapture(e.pointerId);
  drawing = true;
  const p = canvasPos(e);
  curStroke = { c: tool.eraser ? '#ffffff' : tool.color, w: tool.eraser ? tool.size * 4 : tool.size, pts: [p], mid: p };
  ed.strokes.push(curStroke);
  redoStack = [];
  drawStroke(curStroke);
});
canvas.addEventListener('pointermove', (e) => {
  if (!drawing || !curStroke) return;
  e.preventDefault();
  const evs = (e.getCoalescedEvents && e.getCoalescedEvents().length) ? e.getCoalescedEvents() : [e];
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = curStroke.c;
  for (const ev of evs) {
    const p = canvasPos(ev);
    const prev = curStroke.pts[curStroke.pts.length - 1];
    const mid = [(prev[0] + p[0]) / 2, (prev[1] + p[1]) / 2];
    ctx.lineWidth = curStroke.w * (ev.pointerType === 'pen' && ev.pressure > 0 ? 0.6 + 0.8 * ev.pressure : 1);
    ctx.beginPath();
    ctx.moveTo(curStroke.mid[0] * CW, curStroke.mid[1] * CH);
    ctx.quadraticCurveTo(prev[0] * CW, prev[1] * CH, mid[0] * CW, mid[1] * CH);
    ctx.stroke();
    curStroke.mid = mid;
    curStroke.pts.push(p);
  }
});
function endStroke() {
  if (!drawing) return;
  drawing = false;
  curStroke = null;
  persistEditor();
}
canvas.addEventListener('pointerup', endStroke);
canvas.addEventListener('pointercancel', endStroke);

/* ---------- outils ---------- */

document.querySelectorAll('.swatch').forEach((b) => {
  b.addEventListener('click', () => {
    tool.color = b.dataset.color;
    tool.eraser = false;
    document.querySelectorAll('.swatch').forEach((x) => x.classList.toggle('active', x === b));
    document.getElementById('tool-eraser').classList.remove('active');
  });
});
document.querySelectorAll('.size-btn').forEach((b) => {
  b.addEventListener('click', () => {
    tool.size = Number(b.dataset.size);
    document.querySelectorAll('.size-btn').forEach((x) => x.classList.toggle('active', x === b));
  });
});
document.getElementById('tool-eraser').addEventListener('click', () => {
  tool.eraser = !tool.eraser;
  document.getElementById('tool-eraser').classList.toggle('active', tool.eraser);
});
document.getElementById('tool-undo').addEventListener('click', () => {
  if (!ed || !ed.strokes.length) return;
  redoStack.push(ed.strokes.pop());
  redrawAll();
  persistEditor();
});
document.getElementById('tool-redo').addEventListener('click', () => {
  if (!ed || !redoStack.length) return;
  ed.strokes.push(redoStack.pop());
  redrawAll();
  persistEditor();
});

/* ---------- cœurs pixel ---------- */

function heartSVG(filled) {
  const M = ['0110110', '1111111', '1111111', '0111110', '0011100', '0001000'];
  let rects = '';
  M.forEach((row, y) => {
    [...row].forEach((v, x) => { if (v === '1') rects += `<rect x="${x}" y="${y}" width="1.02" height="1.02"/>`; });
  });
  return `<svg viewBox="0 0 7 6" shape-rendering="crispEdges" fill="${filled ? '#d8204f' : '#d9ccd1'}">${rects}</svg>`;
}

function renderHearts() {
  const row = document.getElementById('hearts-row');
  row.innerHTML = ed.hearts.map((h, i) =>
    `<button class="pix-heart${h ? ' on' : ''}" data-testid="heart-${i + 1}" data-i="${i}" title="récitation ${i + 1}">${heartSVG(h)}</button>`
  ).join('');
  row.querySelectorAll('.pix-heart').forEach((b) => {
    b.addEventListener('click', () => {
      const i = Number(b.dataset.i);
      ed.hearts[i] = !ed.hearts[i];
      renderHearts();
      updateFinish();
      persistEditor();
    });
  });
  const n = ed.hearts.filter(Boolean).length;
  document.getElementById('hearts-count').textContent = `${n} / 10 récitations par cœur`;
}

function updateFinish() {
  if (!ed.sessionId) document.getElementById('btn-finish').hidden = !ed.hearts.every(Boolean);
}

/* ---------- persistance ---------- */

function persistEditor() {
  if (!ed) return;
  if (ed.sessionId) {
    const s = hSessions.find((x) => x.id === ed.sessionId);
    if (s) {
      s.title = ed.title;
      s.coverIdx = ed.coverIdx;
      s.strokes = ed.strokes;
      s.hearts = ed.hearts;
      s.comments = ed.comments;
      hSave(H_SESSIONS, hSessions);
      renderArchive();
    }
  } else {
    hSave(H_DRAFT, { title: ed.title, coverIdx: ed.coverIdx, strokes: ed.strokes, hearts: ed.hearts, startedAt: ed.startedAt });
  }
}

/* ---------- ouverture / fermeture ---------- */

function openEditor(fromSession) {
  if (fromSession) {
    ed = {
      sessionId: fromSession.id,
      title: fromSession.title,
      coverIdx: fromSession.coverIdx,
      strokes: fromSession.strokes,
      hearts: fromSession.hearts.slice(),
      comments: fromSession.comments || [],
      startedAt: fromSession.date
    };
  } else {
    const draft = hLoad(H_DRAFT, null);
    if (draft) {
      ed = { sessionId: null, title: draft.title, coverIdx: draft.coverIdx, strokes: draft.strokes, hearts: draft.hearts, comments: [], startedAt: draft.startedAt };
    } else {
      ed = { sessionId: null, title: '', coverIdx: Math.floor(Math.random() * hCovers.length), strokes: [], hearts: Array(10).fill(false), comments: [], startedAt: new Date().toISOString() };
    }
  }
  redoStack = [];
  document.getElementById('ov-cover-img').src = hCovers[ed.coverIdx] || 'cover-campus.png';
  document.getElementById('session-title').value = ed.title;
  redrawAll();
  renderHearts();
  renderComments();
  document.getElementById('comments-area').hidden = !ed.sessionId;
  updateFinish();
  if (ed.sessionId) document.getElementById('btn-finish').hidden = true;
  overlay.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeEditor() {
  persistEditor();
  overlay.hidden = true;
  document.body.style.overflow = '';
  renderCoverStage();
}

document.getElementById('btn-start-session').addEventListener('click', () => openEditor(null));
document.getElementById('ov-close').addEventListener('click', closeEditor);

document.getElementById('session-title').addEventListener('input', (e) => {
  if (!ed) return;
  ed.title = e.target.value;
  persistEditor();
});

/* ---------- fin de session ---------- */

document.getElementById('btn-finish').addEventListener('click', () => {
  hSessions.unshift({
    id: Date.now(),
    date: new Date().toISOString(),
    title: ed.title.trim() || 'session sans titre',
    coverIdx: ed.coverIdx,
    strokes: ed.strokes,
    hearts: ed.hearts,
    comments: []
  });
  hSave(H_SESSIONS, hSessions);
  localStorage.removeItem(H_DRAFT);
  ed = null;
  overlay.hidden = true;
  document.body.style.overflow = '';
  hPreviewIdx = Math.floor(Math.random() * hCovers.length);
  renderArchive();
  renderCoverStage();
});

/* ---------- commentaires ---------- */

function renderComments() {
  const list = document.getElementById('comments-list');
  if (!ed || !ed.comments.length) {
    list.innerHTML = '<p class="admin-hint">aucun commentaire pour l\'instant</p>';
    return;
  }
  list.innerHTML = ed.comments.map((c) =>
    `<p class="comment"><span class="comment-date">${fmtShort(c.date)}</span>${escHtml(c.text)}</p>`
  ).join('');
}

document.getElementById('comment-add').addEventListener('click', () => {
  const inp = document.getElementById('comment-input');
  const t = inp.value.trim();
  if (!t || !ed || !ed.sessionId) return;
  ed.comments.push({ text: t, date: new Date().toISOString() });
  inp.value = '';
  persistEditor();
  renderComments();
});

/* ---------- couvertures ---------- */

function renderCoverStage() {
  const draft = hLoad(H_DRAFT, null);
  const idx = draft ? draft.coverIdx : hPreviewIdx;
  document.getElementById('cover-img').src = hCovers[idx] || 'cover-campus.png';
  document.getElementById('cover-title').textContent = draft ? (draft.title || 'session en cours...') : 'nouvelle session';
}

function renderThumbs() {
  const box = document.getElementById('cover-thumbs');
  box.innerHTML = hCovers.map((c, i) =>
    `<div class="lib-thumb"><img src="${c}" alt="couverture ${i + 1}" />${i > 0 ? `<button class="thumb-del" data-testid="cover-del-${i}" data-i="${i}" title="retirer">✕</button>` : ''}</div>`
  ).join('');
  box.querySelectorAll('.thumb-del').forEach((b) => {
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      hCovers.splice(Number(b.dataset.i), 1);
      hSave(H_COVERS, hCovers);
      renderThumbs();
      renderCoverStage();
    });
  });
}

document.getElementById('cover-upload').addEventListener('change', (e) => {
  [...e.target.files].forEach((f) => {
    const r = new FileReader();
    r.onload = () => {
      hCovers.push(r.result);
      hSave(H_COVERS, hCovers);
      renderThumbs();
      renderCoverStage();
    };
    r.readAsDataURL(f);
  });
  e.target.value = '';
});

/* ---------- archive ---------- */

function renderArchive() {
  const box = document.getElementById('hifdh-archive');
  if (!hSessions.length) {
    box.innerHTML = '<p class="admin-hint archive-empty">aucune session scellée pour l\'instant — tes journées de hifdh apparaîtront ici ♡</p>';
    return;
  }
  box.innerHTML = '<p class="lib-title">✧ archives ✧</p>' + hSessions.map((s) => `
    <article class="arch-entry" data-testid="archive-entry-${s.id}" data-id="${s.id}">
      <p class="arch-date">${fmtLong(s.date)}</p>
      <div class="cover-frame arch-cover">
        <img class="cover-img" src="${hCovers[s.coverIdx] || 'cover-campus.png'}" alt="couverture" />
        <div class="cover-cloud"><img src="download.png" class="cloud-img" alt="" draggable="false" /><span class="cloud-title">${escHtml(s.title)}</span></div>
      </div>
      <div class="sealed-band"><span class="sealed-heart">♡</span> sealed on ${fmtShort(s.date)} <span class="sealed-sep">|</span> <span class="sealed-com">❝ ${s.comments.length}</span></div>
    </article>`
  ).join('');
  box.querySelectorAll('.arch-entry').forEach((el) => {
    el.addEventListener('click', () => {
      const s = hSessions.find((x) => x.id === Number(el.dataset.id));
      if (s) openEditor(s);
    });
  });
}

/* ---------- init ---------- */
renderThumbs();
renderCoverStage();
renderArchive();
