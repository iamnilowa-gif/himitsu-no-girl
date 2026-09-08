# PRD — Himitsu no Girl (Whimsigoth / Vintage Pastel)

## Problème initial (résumé)
Application web personnelle mobile-first d'inspiration blogs/dashboards Y2K whimsigoth (rose poudré, blush, pêche, crème, or, scintillements). Titre cursive rose, métadonnées police machine à écrire, boutons pilule, structure blog 3 colonnes (gauche : widgets / centre : contenu / droite : widgets-Spotify), image de fond fournie (blog.webp), routeur JS léger avec vues placeholders.

## Architecture
- Base volontairement en **HTML/CSS/JS vanilla** : `/app/frontend/public/himitsu/` (index.html, styles.css, app.js, blog.webp)
- Coquille React minimale (`src/App.js`) = iframe plein écran vers `/himitsu/index.html` pour l'affichage dans l'environnement
- Pas de backend/base de données pour l'instant (site statique)
- Routeur : hash-based (`#/route`), classes `.active`, `popstate` géré, 11 routes

## Personas
- Propriétaire unique du blog (usage personnel, mobile/iPad)

## Implémenté (2026-07 / étape 2 — en cours)
- Page d'accueil complète : titre « Himitsu no Girl » cursif rose, sous-titre machine à écrire
- Nav pilule : Welcome! / MP3 / Daily Hifdh / Hifdh Planner
- Grille de 7 breloques cliquables avec effet glow au survol (Loft, Ville, Diary, Media Player rose, Games, Projects Ideas, Manga)
- Structure 3 colonnes (latérales visibles ≥1024px) sous header global sticky
- Routeur léger + 11 vues
- Vue MP3 complète : 30 albums Juz' (répartition officielle 604 pages), bascule Coran/Tajwid, table de pistes (#/Title/Version/lecture), lecteur audio persistant (play/pause/prev/next/barre de progression rose/seek/auto-next), pochettes personnalisables par Juz', panneau d'admin (lien par page, conversion Google Drive auto, remplissage en masse par modèle {n}, pochettes, réinitialisation), persistance localStorage, lien de test pré-rempli (page 1 · Coran)
- Vérifié : lecture audio réelle, prev/next, hint sans lien, admin (lien + pochette), comptage, mobile 390px et desktop

## Implémenté (2026-07 / étape 3 — Daily Hifdh)
- Vue Daily Hifdh : couverture aléatoire (bibliothèque d'uploads multiple, localStorage), nuage download.png avec titre, bouton « Commencer la session d'aujourd'hui » (contour rose, fond blanc)
- Overlay plein écran : champ titre sur la couverture, tablette image-19.png avec canvas HTML5 intégré dans la zone blanche, dessin stylet/doigt (pointer events), barre d'outils (5 couleurs, 3 épaisseurs, gomme, annuler/refaire)
- 10 cœurs pixel art gris→rouge (1 récitation par cœur), bouton « Terminer » visible uniquement à 10/10
- Brouillon auto-sauvegardé : quitter l'overlay ne perd ni traits ni cœurs ni titre
- Archive : date en cursive, couverture + titre, bande « sealed on [date] » + compteur de commentaires, réouverture en lecture/modification, ajout de commentaires
- Vérifié : dessin, gomme (pixel-level), undo/redo, persistance brouillon, cycle complet session→archive→commentaire
- Optimisation stylet iPad : événements coalescés, lissage quadratique, sensibilité pression

## Implémenté (2026-07 / étape 4 — Diary)
- Vue Diary : bouton ticker Y2K glossy avec phrase défilante quotidienne (10 phrases, rotation par date), ligne de date majuscule, entrée de journal (numéro 3 chiffres, « Dear Diary, » cursif, corps machine à écrire, polaroid optionnel), « Read more » avec troncature, méta (date + commentaires), labels
- Commentaires par entrée (compteur « No comments: » dynamique)
- Éditeur de nouvelle entrée (corps, labels, polaroid upload), numérotation auto
- Widget calendrier « POST ARCHIVAL! » rose rétro dans la colonne gauche : navigation mois/année, jours avec entrées en rose cliquables, aujourd'hui mint, entrée affichée en mint plein — cliquer un jour charge l'entrée (bascule vers Diary si ailleurs)
- Persistance localStorage (diary_entries), entrée de bienvenue semée
- Vérifié : publication 012, commentaire, calendrier (nav mois, clic jour, état sélection), mobile + desktop
- Diary v2 : 10 dernières entrées défilables, édition (formulaire pré-rempli), suppression avec confirmation, sélection menthe + scroll depuis le calendrier

## Implémenté (2026-07 / étape 5 — Games)
- Page Games : widget PS Vita « VITA ARCADE! » grand et centré (console mini dessinée en CSS pur, l'image imgur d'origine était morte)
- Overlay plein écran : console PS Vita blanche en CSS (D-pad, boutons △○□✕, sticks, logo PS) avec écran tactile rose
- Bibliothèque : grille 4x3 scrollable de 12 jeux par défaut (Bratz, Barbie, My Scene...), « + Add Game » (titre/pochette/URL, localStorage vitaFlashGames)
- Lecteur : vue iframe avec barre ← BACK / titre / ×, fermeture qui coupe le son
- Vérifié : ouverture overlay, 12 jeux, lancement iframe, retour grille, ajout d'un jeu (13), fermeture — desktop + mobile
- LIMITATION : les URLs de jeux fournies pointent toutes vers une page générique ; certains sites refusent l'intégration iframe
- Games v2 : vraie image PSP rose (IMG_0608) intégrée telle quelle avec fond détouré transparent, zone écran noire remplacée par la grille de jeux, loading page rose pâle « loading ... » avec BACK/✕ en coins, grille façon exemple (cartes blanches bord rose, titres typewriter roses, contour rose à la sélection), fond chambre exact sur la page Games

## Backlog priorisé
- P0 : Page Diary (journal intime, entrées datées)
- P1 : Daily Hifdh (suivi quotidien mémorisation) + Hifdh Planner (planning)
- P1 : Media Player rose (lecteur audio)
- P2 : MP3 (archive), Loft, Ville, Games, Projects Ideas, Lecture Japonaise (Manga)
- P2 : Widgets latéraux réels (profil, Spotify embed, liens)
- P2 : Vraies icônes breloques (remplacer glyphes placeholders)
- P2 : Persistance (localStorage ou MongoDB si besoin de sync)

## Prochaines tâches
1. Coder la section Diary en détail
2. Coder Daily Hifdh / Hifdh Planner
3. Remplacer les icônes placeholders par de vraies breloques images
