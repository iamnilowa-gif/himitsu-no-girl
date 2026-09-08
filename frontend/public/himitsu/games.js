/* ============ GAMES — PS Vita flash games arcade ============ */

const defaultVitaGames = [
    { title: "L'Apprentie Sorcière", cover: "cover-sorciere.jpg", url: "https://encycloupedie.fr/jeu-flash/l-apprentie-sorciere/" }
];

const VITA_PER_PAGE = 9;

function vitaAllGames() {
    return JSON.parse(localStorage.getItem('vitaFlashGamesV2')) || defaultVitaGames;
}

function renderVitaGames() {
    const box = document.getElementById('vitaPages');
    box.innerHTML = '';
    const allGames = vitaAllGames();
    const totalPages = Math.max(1, Math.ceil(allGames.length / VITA_PER_PAGE));
    for (let p = 0; p < totalPages; p++) {
        const pageEl = document.createElement('div');
        pageEl.className = 'vita-page';
        pageEl.setAttribute('data-testid', 'vita-page-' + p);
        allGames.slice(p * VITA_PER_PAGE, p * VITA_PER_PAGE + VITA_PER_PAGE).forEach((game, i) => {
            const card = document.createElement('div');
            card.className = 'vita-game-card';
            card.setAttribute('data-testid', 'vita-game-' + (p * VITA_PER_PAGE + i));
            card.innerHTML = `<img src="${game.cover}" alt="${game.title}"><span>${game.title}</span>`;
            card.addEventListener('click', () => launchGame(game));
            pageEl.appendChild(card);
        });
        box.appendChild(pageEl);
    }
}

function launchGame(game) {
    window.open(game.url, '_blank', 'noopener');
}

function vitaCloseAll() {
    document.getElementById('vitaOverlay').style.display = 'none';
}

document.getElementById('openVitaOverlay').addEventListener('click', () => {
    document.getElementById('vitaOverlay').style.display = 'flex';
    renderVitaGames();
});
document.getElementById('closeVitaOverlay').addEventListener('click', vitaCloseAll);

const addModal = document.getElementById('vitaAddModal');
document.getElementById('openAddGameModal').addEventListener('click', () => addModal.style.display = 'flex');
document.getElementById('cancelAddGameBtn').addEventListener('click', () => addModal.style.display = 'none');
document.getElementById('saveNewGameBtn').addEventListener('click', () => {
    const title = document.getElementById('inputGameTitle').value;
    const cover = document.getElementById('inputGameCover').value;
    const url = document.getElementById('inputGameUrl').value;
    if (!title || !url) { alert("Please enter a title and a URL! 🤍"); return; }
    const allGames = JSON.parse(localStorage.getItem('vitaFlashGamesV2')) || defaultVitaGames.slice();
    allGames.push({ title, cover: cover || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=300&q=80', url });
    localStorage.setItem('vitaFlashGamesV2', JSON.stringify(allGames));
    document.getElementById('inputGameTitle').value = '';
    document.getElementById('inputGameCover').value = '';
    document.getElementById('inputGameUrl').value = '';
    addModal.style.display = 'none';
    renderVitaGames();
});
