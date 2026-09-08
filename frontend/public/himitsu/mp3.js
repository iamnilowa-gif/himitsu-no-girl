/* ============ MP3 — playlist du mushaf (604 pages / 30 juz') ============ */

const JUZ = [
  { n: 1,  name: 'Alif Lām Mīm',        start: 1,   end: 21  },
  { n: 2,  name: 'Sayaqūlu',            start: 22,  end: 41  },
  { n: 3,  name: 'Tilka ar-Rusul',      start: 42,  end: 61  },
  { n: 4,  name: 'Lan Tanālū',          start: 62,  end: 81  },
  { n: 5,  name: 'Wa-l-Muḥṣanāt',       start: 82,  end: 101 },
  { n: 6,  name: 'Lā Yuḥibbu Allāh',    start: 102, end: 120 },
  { n: 7,  name: 'Wa Idhā Samiʿū',      start: 121, end: 141 },
  { n: 8,  name: 'Wa-law Annanā',       start: 142, end: 161 },
  { n: 9,  name: 'Qāla al-Malaʾ',       start: 162, end: 181 },
  { n: 10, name: 'Wa-Aʿlamū',           start: 182, end: 200 },
  { n: 11, name: 'Yaʿtadhirūna',        start: 201, end: 221 },
  { n: 12, name: 'Wa-mā min Dābbah',    start: 222, end: 241 },
  { n: 13, name: 'Wa-mā Ubarriʾu',      start: 242, end: 261 },
  { n: 14, name: 'Rubamā',              start: 262, end: 281 },
  { n: 15, name: 'Subḥāna Alladhī',     start: 282, end: 301 },
  { n: 16, name: 'Qāla a-lam',          start: 302, end: 321 },
  { n: 17, name: 'Iqtaraba li-n-Nās',   start: 322, end: 341 },
  { n: 18, name: 'Qad Aflaḥa',          start: 342, end: 361 },
  { n: 19, name: 'Wa-qāla Alladhīna',   start: 362, end: 381 },
  { n: 20, name: 'Amman Khalaqa',       start: 382, end: 401 },
  { n: 21, name: 'Utlu mā Ūḥiya',       start: 402, end: 421 },
  { n: 22, name: 'Wa-man Yaqnut',       start: 422, end: 441 },
  { n: 23, name: 'Wa-mā Liya',          start: 442, end: 461 },
  { n: 24, name: 'Fa-man Aẓlamu',       start: 462, end: 481 },
  { n: 25, name: 'Ilayhi Yuraddu',      start: 482, end: 501 },
  { n: 26, name: 'Ḥā Mīm',              start: 502, end: 521 },
  { n: 27, name: 'Qāla Fa-mā Khaṭbukum',start: 522, end: 541 },
  { n: 28, name: 'Qad Samiʿa Allāh',    start: 542, end: 561 },
  { n: 29, name: 'Tabāraka Alladhī',    start: 562, end: 581 },
  { n: 30, name: 'ʿAmma',               start: 582, end: 604 }
];

const MP3_KEY_LINKS = 'himitsu_mp3_links';
const MP3_KEY_COVERS = 'himitsu_mp3_covers';
const MP3_TEST_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

const mp3 = {
  juz: 1,
  version: 'coran',
  page: null,
  pageVersion: 'coran',
  loop: localStorage.getItem('himitsu_mp3_loop') === '1',
  links: loadMp3Links(),
  covers: loadMp3Covers()
};

function loadMp3Links() {
  try {
    const raw = localStorage.getItem(MP3_KEY_LINKS);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { coran: { 1: MP3_TEST_URL }, tajwid: {} };
}

function loadMp3Covers() {
  try {
    const raw = localStorage.getItem(MP3_KEY_COVERS);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {};
}

function saveMp3Links() { localStorage.setItem(MP3_KEY_LINKS, JSON.stringify(mp3.links)); }
function saveMp3Covers() { localStorage.setItem(MP3_KEY_COVERS, JSON.stringify(mp3.covers)); }

function juzOfPage(page) {
  return JUZ.find((j) => page >= j.start && page <= j.end) || JUZ[0];
}

function pad2(n) { return String(n).padStart(2, '0'); }

function normalizeAudioUrl(url) {
  const file = url.match(/drive\.google\.com\/file\/d\/([^/?#]+)/);
  if (file) return 'https://drive.google.com/uc?export=download&id=' + file[1];
  const open = url.match(/drive\.google\.com\/open\?id=([^&#]+)/);
  if (open) return 'https://drive.google.com/uc?export=download&id=' + open[1];
  return url;
}

/* ---------- rendu ---------- */

function renderJuzStrip() {
  const strip = document.getElementById('juz-strip');
  strip.innerHTML = JUZ.map((j) =>
    `<button class="juz-pill${j.n === mp3.juz ? ' active' : ''}" data-testid="juz-pill-${j.n}" data-juz="${j.n}">Juz' ${pad2(j.n)}</button>`
  ).join('');
  strip.querySelectorAll('.juz-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      mp3.juz = Number(btn.dataset.juz);
      renderAlbum();
    });
  });
}

function renderAlbum() {
  const j = JUZ[mp3.juz - 1];
  const count = j.end - j.start + 1;

  document.getElementById('album-title').textContent = `Juz' ${pad2(j.n)}`;
  document.getElementById('album-meta').textContent =
    `${j.name} · pages ${j.start}–${j.end} · ${count} pistes`;

  const jacket = document.getElementById('album-jacket');
  const cover = mp3.covers[j.n];
  if (cover) {
    jacket.style.backgroundImage = `url('${cover}')`;
    jacket.textContent = '';
    jacket.className = 'album-jacket has-cover';
  } else {
    jacket.style.backgroundImage = '';
    jacket.innerHTML = `<span class="jacket-num">${j.n}</span><span class="jacket-label">juz'</span>`;
    jacket.className = 'album-jacket jacket-g' + (j.n % 5);
  }

  document.getElementById('vbtn-coran').classList.toggle('active', mp3.version === 'coran');
  document.getElementById('vbtn-tajwid').classList.toggle('active', mp3.version === 'tajwid');

  renderTracks();
  renderJuzStrip();
}

function renderTracks() {
  const j = JUZ[mp3.juz - 1];
  const tbody = document.getElementById('track-list');
  const versionLabel = mp3.version === 'coran' ? 'Coran' : 'Tajwid';
  let rows = '';
  for (let p = j.start; p <= j.end; p++) {
    const hasLink = !!mp3.links[mp3.version][p];
    const isCurrent = mp3.page === p && mp3.pageVersion === mp3.version;
    rows += `
      <tr class="track-row${isCurrent ? ' active' : ''}${hasLink ? '' : ' no-link'}">
        <td class="col-num">${p}</td>
        <td class="col-title">Page ${p}<span class="track-sub">Juz' ${pad2(j.n)} · ${j.name}</span></td>
        <td class="col-ver">${versionLabel}${hasLink ? '' : ' · <em>sans lien</em>'}</td>
        <td class="col-play">
          <button class="row-play${isCurrent ? ' active' : ''}" data-testid="play-page-${p}" data-page="${p}" title="Écouter la page ${p}">
            ${isCurrent ? '♪' : '▶'}
          </button>
        </td>
      </tr>`;
  }
  tbody.innerHTML = rows;
  tbody.querySelectorAll('.row-play').forEach((btn) => {
    btn.addEventListener('click', () => playPage(Number(btn.dataset.page), mp3.version));
  });
}

/* ---------- lecteur ---------- */

const audio = document.getElementById('mp3-audio');

function playPage(page, version) {
  const url = mp3.links[version][page];
  const hint = document.getElementById('player-hint');
  if (!url) {
    mp3.page = page;
    mp3.pageVersion = version;
    updatePlayerInfo();
    hint.textContent = `aucun lien ${version === 'coran' ? 'Coran' : 'Tajwid'} pour la page ${page} — ajoute-le dans le panneau ci-dessous ♡`;
    renderTracks();
    return;
  }
  hint.textContent = '';
  mp3.page = page;
  mp3.pageVersion = version;
  audio.src = url;
  audio.play().catch(() => {
    hint.textContent = 'lecture impossible — vérifie que le lien est un streaming direct (mp3)';
  });
  updatePlayerInfo();
  renderTracks();
}

function updatePlayerInfo() {
  if (!mp3.page) return;
  const j = juzOfPage(mp3.page);
  const versionLabel = mp3.pageVersion === 'coran' ? 'Coran' : 'Tajwid';
  document.getElementById('player-track').textContent = `Page ${mp3.page}`;
  document.getElementById('player-sub').textContent = `Juz' ${pad2(j.n)} · ${j.name}`;
  document.getElementById('player-ver').textContent = `version ${versionLabel}`;
  const hasLink = !!mp3.links[mp3.pageVersion][mp3.page];
  document.getElementById('btn-play').textContent = hasLink && !audio.paused ? '❚❚' : '▶';
}

function stepTrack(dir) {
  if (!mp3.page) { playPage(JUZ[mp3.juz - 1].start, mp3.version); return; }
  const next = Math.min(604, Math.max(1, mp3.page + dir));
  const j = juzOfPage(next);
  if (j.n !== mp3.juz) mp3.juz = j.n;
  playPage(next, mp3.pageVersion);
  renderAlbum();
}

document.getElementById('btn-play').addEventListener('click', () => {
  if (!mp3.page) { playPage(JUZ[mp3.juz - 1].start, mp3.version); return; }
  if (!mp3.links[mp3.pageVersion][mp3.page]) { playPage(mp3.page, mp3.pageVersion); return; }
  if (audio.paused) audio.play(); else audio.pause();
  updatePlayerInfo();
});
document.getElementById('btn-prev').addEventListener('click', () => stepTrack(-1));
document.getElementById('btn-next').addEventListener('click', () => stepTrack(1));

const btnLoop = document.getElementById('btn-loop');
function renderLoop() {
  btnLoop.classList.toggle('active', mp3.loop);
  document.getElementById('lcd-loop').classList.toggle('on', mp3.loop);
  btnLoop.title = mp3.loop ? 'Boucle activée — la page recommence' : 'Lire la page en boucle';
}
btnLoop.addEventListener('click', () => {
  mp3.loop = !mp3.loop;
  localStorage.setItem('himitsu_mp3_loop', mp3.loop ? '1' : '0');
  renderLoop();
});
renderLoop();

document.getElementById('btn-center').addEventListener('click', () => {
  document.getElementById('btn-play').click();
});

function fmtTime(s) {
  if (!isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  return m + ':' + String(Math.floor(s % 60)).padStart(2, '0');
}

audio.addEventListener('timeupdate', () => {
  const fill = document.getElementById('player-fill');
  if (audio.duration) fill.style.width = (audio.currentTime / audio.duration * 100) + '%';
  document.getElementById('time-cur').textContent = fmtTime(audio.currentTime);
  document.getElementById('time-total').textContent = fmtTime(audio.duration);
});
audio.addEventListener('play', updatePlayerInfo);
audio.addEventListener('pause', updatePlayerInfo);
audio.addEventListener('ended', () => {
  if (mp3.loop && mp3.page) {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } else {
    stepTrack(1);
  }
});

document.getElementById('player-bar').addEventListener('click', (e) => {
  if (!audio.duration) return;
  const rect = e.currentTarget.getBoundingClientRect();
  audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
});

document.getElementById('vbtn-coran').addEventListener('click', () => { mp3.version = 'coran'; renderAlbum(); });
document.getElementById('vbtn-tajwid').addEventListener('click', () => { mp3.version = 'tajwid'; renderAlbum(); });

/* ---------- administration ---------- */

function fillJuzSelects() {
  const options = JUZ.map((j) => `<option value="${j.n}">Juz' ${pad2(j.n)} — ${j.name}</option>`).join('');
  document.getElementById('cover-juz').innerHTML = options;
  document.getElementById('bulk-juz').innerHTML = options;
}

function refreshCounts() {
  const c = Object.keys(mp3.links.coran).length;
  const t = Object.keys(mp3.links.tajwid).length;
  document.getElementById('links-count').textContent =
    `${c + t} lien(s) enregistré(s) · ${c} Coran · ${t} Tajwid`;
  document.getElementById('covers-count').textContent =
    `${Object.keys(mp3.covers).length} pochette(s) personnalisée(s)`;
}

document.getElementById('cover-save').addEventListener('click', () => {
  const juz = Number(document.getElementById('cover-juz').value);
  const url = document.getElementById('cover-url').value.trim();
  if (!url) return;
  mp3.covers[juz] = url;
  saveMp3Covers();
  document.getElementById('cover-url').value = '';
  refreshCounts();
  renderAlbum();
  updatePlayerInfo();
});
document.getElementById('cover-reset').addEventListener('click', () => {
  const juz = Number(document.getElementById('cover-juz').value);
  delete mp3.covers[juz];
  saveMp3Covers();
  refreshCounts();
  renderAlbum();
  updatePlayerInfo();
});

document.getElementById('link-save').addEventListener('click', () => {
  const version = document.getElementById('link-version').value;
  const page = Number(document.getElementById('link-page').value);
  const url = document.getElementById('link-url').value.trim();
  if (!url || page < 1 || page > 604) return;
  mp3.links[version][page] = normalizeAudioUrl(url);
  saveMp3Links();
  document.getElementById('link-url').value = '';
  refreshCounts();
  renderTracks();
  if (mp3.page === page) updatePlayerInfo();
});
document.getElementById('link-clear').addEventListener('click', () => {
  const version = document.getElementById('link-version').value;
  const page = Number(document.getElementById('link-page').value);
  delete mp3.links[version][page];
  saveMp3Links();
  refreshCounts();
  renderTracks();
  if (mp3.page === page) updatePlayerInfo();
});

document.getElementById('bulk-save').addEventListener('click', () => {
  const juz = Number(document.getElementById('bulk-juz').value);
  const version = document.getElementById('bulk-version').value;
  const template = document.getElementById('bulk-template').value.trim();
  if (!template.includes('{n}')) {
    document.getElementById('player-hint').textContent = 'le modèle doit contenir {n} (numéro de page)';
    return;
  }
  const j = JUZ[juz - 1];
  for (let p = j.start; p <= j.end; p++) {
    mp3.links[version][p] = normalizeAudioUrl(template.replaceAll('{n}', String(p)));
  }
  saveMp3Links();
  document.getElementById('bulk-template').value = '';
  refreshCounts();
  renderTracks();
});

document.getElementById('data-reset').addEventListener('click', () => {
  localStorage.removeItem(MP3_KEY_LINKS);
  localStorage.removeItem(MP3_KEY_COVERS);
  mp3.links = { coran: {}, tajwid: {} };
  mp3.covers = {};
  refreshCounts();
  renderAlbum();
});

/* ---------- init ---------- */
fillJuzSelects();
refreshCounts();
renderAlbum();
