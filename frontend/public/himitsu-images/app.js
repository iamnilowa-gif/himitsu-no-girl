/* ============ HIMITSU NO GIRL — routeur léger ============ */

const ROUTES = [
  'welcome', 'mp3', 'daily-hifdh', 'hifdh-planner',
  'loft', 'ville', 'diary', 'media-player',
  'games', 'projects', 'manga'
];

const DEFAULT_ROUTE = 'welcome';

function isValidRoute(route) {
  return ROUTES.includes(route);
}

function getRouteFromHash() {
  const hash = window.location.hash.replace('#/', '').replace('#', '');
  return isValidRoute(hash) ? hash : DEFAULT_ROUTE;
}

function navigate(route) {
  if (!isValidRoute(route)) route = DEFAULT_ROUTE;

  // Bascule des vues
  document.querySelectorAll('.view').forEach((view) => {
    view.classList.toggle('active', view.id === 'view-' + route);
  });

  // États actifs : boutons pilule
  document.querySelectorAll('.pill-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.route === route);
  });

  // États actifs : breloques
  document.querySelectorAll('.charm').forEach((charm) => {
    charm.classList.toggle('active', charm.dataset.route === route);
  });

  // Hash URL (partage / bouton retour)
  if (window.location.hash !== '#/' + route) {
    history.pushState(null, '', '#/' + route);
  }

  // Remonte en haut du contenu
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Clics : tout élément avec data-route
document.querySelectorAll('[data-route]').forEach((el) => {
  el.addEventListener('click', () => navigate(el.dataset.route));
});

// Bouton retour / avance du navigateur
window.addEventListener('popstate', () => navigate(getRouteFromHash()));

// Route initiale
navigate(getRouteFromHash());
