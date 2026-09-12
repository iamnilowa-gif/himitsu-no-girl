/* ============ HIMITSU NO GIRL — routeur léger ============ */

// --- Initialisation de Supabase ---
const SUPABASE_URL = "https://nmdqjmopqermnemlnrcq.supabase.co/"; // Remplace par ton URL
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tZHFqbW9wcWVybW5lbWxucmNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwNTAwOTksImV4cCI6MjEwNDYyNjA5OX0.xz15S7CiPJMI2IdSTrYuT2VntLBjPTfwVlQOocnEbYc"; // Remplace par ta clé publique

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
