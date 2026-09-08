/* ============ DIARY — entrées de journal + calendrier d'archives ============ */

const D_KEY = 'diary_entries';

function dEsc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function dLoad() {
  try { const r = localStorage.getItem(D_KEY); if (r) return JSON.parse(r); } catch (e) {}
  return null;
}
function dSave() { try { localStorage.setItem(D_KEY, JSON.stringify(dEntries)); } catch (e) {} }

const D_SEED = [{
  id: 1,
  num: '011',
  date: new Date().toISOString(),
  body: "Wow... je n'arrive pas y croire... mon petit blog prend enfin vie. Chaque page que je code est comme une lettre glissée dans une bouteille pastel.\n\nIci je collectionne mes souvenirs comme des polaroids rares : mes récitations, mes playlists, mes sessions de hifdh et mes rêves. Un espace doux, rien qu'à moi, loin du bruit.\n\nMerci d'exister, petit coin secret. <3",
  img: '',
  labels: ['dearest diary'],
  comments: []
}];

let dEntries = dLoad() || D_SEED;
let currentId = dEntries[dEntries.length - 1].id;
let expandedIds = new Set();
let pendingImg = '';
let editingId = null;
const cal = { y: new Date().getFullYear(), m: new Date().getMonth() };

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const TRUNC_WORDS = 80;

function dateKey(iso) { return iso.slice(0, 10); }
function longDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
}
function shortDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
function curEntry() { return dEntries.find((e) => e.id === currentId) || dEntries[dEntries.length - 1]; }

/* ---------- entrées (10 dernières, défilement) ---------- */

function commentsHtml(e) {
  return e.comments.length
    ? e.comments.map((c) => `<p class="comment"><span class="comment-date">${shortDate(c.date)}</span>${dEsc(c.text)}</p>`).join('')
    : '<p class="admin-hint">aucun commentaire pour l\'instant</p>';
}

function entryHtml(e) {
  const open = expandedIds.has(e.id);
  const paras = e.body.split(/\n\s*\n/);
  const words = e.body.split(/\s+/).length;
  let bodyHtml;
  let moreBtn = '';
  if (!open && words > TRUNC_WORDS) {
    let count = 0;
    const out = [];
    for (const p of paras) {
      const w = p.split(/\s+/);
      if (count + w.length > TRUNC_WORDS) {
        out.push(w.slice(0, TRUNC_WORDS - count).join(' ') + ' ...');
        break;
      }
      out.push(p);
      count += w.length;
    }
    bodyHtml = out.map((p) => `<p>${dEsc(p)}</p>`).join('');
    moreBtn = `<button class="diary-more-link" data-act="more" data-testid="diary-more-${e.id}">♡ Read more »</button>`;
  } else {
    bodyHtml = paras.map((p) => `<p>${dEsc(p)}</p>`).join('');
    if (words > TRUNC_WORDS) moreBtn = `<button class="diary-more-link" data-act="more" data-testid="diary-more-${e.id}">« refermer ♡</button>`;
  }
  const n = e.comments.length;
  return `
    <p class="diary-date-line">${longDate(e.date)}</p>
    <article class="diary-card${e.id === currentId ? ' diary-sel' : ''}" data-id="${e.id}" data-testid="diary-card-${e.id}">
      <p class="diary-num">${e.num}</p>
      <h2 class="diary-greet">Dear Diary,</h2>
      <div class="diary-body">${bodyHtml}</div>
      ${e.img ? `<figure class="diary-polaroid"><img src="${e.img}" alt="photo du jour" /></figure>` : ''}
      ${moreBtn ? `<p class="diary-more">${moreBtn}</p>` : ''}
      <div class="diary-meta">
        <span class="diary-meta-date">at ${shortDate(e.date)}</span>
        <button class="diary-comments-link" data-act="comments" data-testid="diary-comments-${e.id}">${n ? n + ' commentaire(s):' : 'No comments:'}</button>
        <button class="diary-edit" data-act="edit" data-testid="diary-edit-${e.id}" title="modifier l'entrée">✎</button>
        <button class="diary-del" data-act="del" data-testid="diary-del-${e.id}" title="supprimer l'entrée">✕</button>
      </div>
      <p class="diary-labels">Labels: ${e.labels.join(', ')}</p>
      <div class="diary-comments" hidden>
        <div class="diary-comments-list">${commentsHtml(e)}</div>
        <div class="comment-form">
          <input class="diary-comment-input" placeholder="laisse un petit mot..." maxlength="200" autocomplete="off" />
          <button class="pill-mini" data-act="add-comment">ajouter</button>
        </div>
      </div>
    </article>`;
}

function renderEntries(scrollToCurrent) {
  const list = document.getElementById('diary-list');
  list.innerHTML = dEntries.slice(-10).reverse().map(entryHtml).join('');
  if (scrollToCurrent) {
    const card = list.querySelector(`.diary-card[data-id="${currentId}"]`);
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

document.getElementById('diary-list').addEventListener('click', (ev) => {
  const btn = ev.target.closest('[data-act]');
  if (!btn) return;
  const card = btn.closest('.diary-card');
  const id = Number(card.dataset.id);
  const e = dEntries.find((x) => x.id === id);
  if (!e) return;
  const act = btn.dataset.act;
  if (act === 'more') {
    if (expandedIds.has(id)) expandedIds.delete(id); else expandedIds.add(id);
    renderEntries(false);
  } else if (act === 'comments') {
    const area = card.querySelector('.diary-comments');
    area.hidden = !area.hidden;
  } else if (act === 'add-comment') {
    const inp = card.querySelector('.diary-comment-input');
    const t = inp.value.trim();
    if (!t) return;
    e.comments.push({ text: t, date: new Date().toISOString() });
    dSave();
    card.querySelector('.diary-comments-list').innerHTML = commentsHtml(e);
    card.querySelector('.diary-comments-link').textContent = `${e.comments.length} commentaire(s):`;
    inp.value = '';
  } else if (act === 'edit') {
    openEditorFor(e);
  } else if (act === 'del') {
    if (!window.confirm(`Supprimer définitivement l'entrée ${e.num} ?`)) return;
    dEntries = dEntries.filter((x) => x.id !== id);
    if (!dEntries.length) dEntries = D_SEED.map((s) => ({ ...s, id: Date.now() }));
    if (currentId === id) currentId = dEntries[dEntries.length - 1].id;
    dSave();
    renderEntries(false);
    renderCalendar();
  }
});

/* ---------- nouvelle entrée / édition ---------- */

function resetEditor() {
  editingId = null;
  pendingImg = '';
  document.getElementById('diary-new-body').value = '';
  document.getElementById('diary-new-labels').value = 'dearest diary';
  document.getElementById('diary-img-name').textContent = '';
}

function openEditorFor(e) {
  editingId = e.id;
  pendingImg = e.img || '';
  document.getElementById('diary-new-body').value = e.body;
  document.getElementById('diary-new-labels').value = e.labels.join(', ');
  document.getElementById('diary-img-name').textContent = e.img ? 'photo conservée' : '';
  const ed = document.getElementById('diary-editor');
  ed.hidden = false;
  ed.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

document.getElementById('diary-new-btn').addEventListener('click', () => {
  const ed = document.getElementById('diary-editor');
  if (ed.hidden) { resetEditor(); ed.hidden = false; } else { ed.hidden = true; }
});
document.getElementById('diary-cancel').addEventListener('click', () => {
  resetEditor();
  document.getElementById('diary-editor').hidden = true;
});
document.getElementById('diary-new-img').addEventListener('change', (ev) => {
  const f = ev.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    pendingImg = r.result;
    document.getElementById('diary-img-name').textContent = f.name;
  };
  r.readAsDataURL(f);
});
document.getElementById('diary-save').addEventListener('click', () => {
  const body = document.getElementById('diary-new-body').value.trim();
  if (!body) return;
  const labels = document.getElementById('diary-new-labels').value.split(',').map((s) => s.trim()).filter(Boolean);
  const cleanLabels = labels.length ? labels : ['dearest diary'];
  if (editingId) {
    const e = dEntries.find((x) => x.id === editingId);
    if (e) {
      e.body = body;
      e.labels = cleanLabels;
      e.img = pendingImg;
      currentId = e.id;
      dSave();
    }
  } else {
    const nextNum = String(Math.max(...dEntries.map((x) => Number(x.num))) + 1).padStart(3, '0');
    const entry = {
      id: Date.now(),
      num: nextNum,
      date: new Date().toISOString(),
      body,
      img: pendingImg,
      labels: cleanLabels,
      comments: []
    };
    dEntries.push(entry);
    currentId = entry.id;
    dSave();
  }
  resetEditor();
  document.getElementById('diary-editor').hidden = true;
  renderEntries(false);
  renderCalendar();
});

/* ---------- calendrier POST ARCHIVAL! ---------- */

function renderCalendar() {
  const box = document.getElementById('diary-calendar');
  const { y, m } = cal;
  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const now = new Date();
  const entryDates = {};
  dEntries.forEach((en) => { entryDates[dateKey(en.date)] = en.id; });

  let cells = '';
  for (let i = 0; i < first; i++) cells += '<span class="cal-cell cal-empty"></span>';
  for (let d = 1; d <= days; d++) {
    const key = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const has = entryDates[key] !== undefined;
    const isToday = now.getFullYear() === y && now.getMonth() === m && now.getDate() === d;
    const isSel = has && entryDates[key] === currentId;
    cells += `<button class="cal-cell${has ? ' has-entry' : ''}${isToday ? ' cal-today' : ''}${isSel ? ' cal-sel' : ''}" data-date="${key}" data-testid="cal-day-${d}"${has ? '' : ' disabled'}>${d}</button>`;
  }

  box.innerHTML = `
    <div class="cal-scale">
      <div class="cal">
        <div class="cal-head"><span class="cal-star">★</span> POST ARCHIVAL!<span class="cal-win"><i>—</i><i>✕</i></span></div>
        <div class="cal-nav">
          <button class="cal-arrow" id="cal-prev" data-testid="cal-prev">‹</button>
          <span class="cal-month" data-testid="cal-month">${MONTHS[m]}</span>
          <span class="cal-year" data-testid="cal-year">${y}</span>
          <button class="cal-arrow" id="cal-next" data-testid="cal-next">›</button>
        </div>
        <div class="cal-grid">
          <span class="cal-wd">S</span><span class="cal-wd">M</span><span class="cal-wd">T</span><span class="cal-wd">W</span><span class="cal-wd">T</span><span class="cal-wd">F</span><span class="cal-wd">S</span>
          ${cells}
        </div>
        <div class="cal-foot"><span class="cal-dot">●</span> POST ♡ <em>click to view past post!</em></div>
      </div>
    </div>`;

  box.querySelector('#cal-prev').addEventListener('click', () => {
    cal.m--;
    if (cal.m < 0) { cal.m = 11; cal.y--; }
    renderCalendar();
  });
  box.querySelector('#cal-next').addEventListener('click', () => {
    cal.m++;
    if (cal.m > 11) { cal.m = 0; cal.y++; }
    renderCalendar();
  });
  box.querySelectorAll('.cal-cell.has-entry').forEach((b) => {
    b.addEventListener('click', () => {
      currentId = entryDates[b.dataset.date];
      if (!document.getElementById('view-diary').classList.contains('active') && typeof window.navigate === 'function') window.navigate('diary');
      renderEntries(true);
      renderCalendar();
    });
  });
}

/* ---------- ticker Y2K (phrase du jour) ---------- */

const tickerPhrases = [
  "Tell your dear diary... 🤍",
  "spill your secrets to the stars ✨",
  "working on some new tabs! xoxo",
  "a quiet mind is a peaceful soul 📖",
  "collecting memories like rare polaroids 🌸",
  "steeping tea and memorizing ayats 🍵",
  "soft aesthetic, strong heart ☁️",
  "rewinding tapes of yesterday... 📼",
  "locked in a pastel daydream 💭",
  "dear diary, today felt like magic. 🦋"
];
document.getElementById('tickerText').innerText =
  tickerPhrases[Math.floor(Date.now() / 86400000) % tickerPhrases.length];

/* ---------- init ---------- */
renderEntries(false);
renderCalendar();
