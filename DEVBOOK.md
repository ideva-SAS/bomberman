# Carnet de Développement - BomberMan 3D

## Phase 1 : Setup & Architecture 
- [x] Mise en place de l'environnement de développement
- [x] Configuration du projet Babylon.js
- [x] Setup du serveur Node.js
- [ ] Configuration de la base de données MongoDB
- [x] Système de build de base

## Phase 2 : Core Engine 
- [x] Implémentation de la grille de jeu 3D
- [x] Système de caméra isométrique
- [x] Gestion des collisions
- [x] Système de physique de base
- [x] Système d'input (clavier/souris)

## Phase 3 : Gameplay de Base 
- [x] Déplacement du joueur
- [x] Système de pose de bombes
- [x] Système d'explosion et destruction
- [x] Génération procédurale du labyrinthe
- [x] Murs destructibles et indestructibles

## Phase 4 : Networking (À venir)
- [ ] Implémentation WebSocket
- [ ] Synchronisation des joueurs
- [ ] Gestion de la latence
- [ ] Système de rooms
- [ ] Matchmaking de base

## Phase 5 : Intégration des textures et style visuel

### 5.1 Style visuel
Le jeu adopte maintenant un style fantasy/heroic inspiré de League of Legends et Diablo 4 :
- Ambiance sombre et mystique
- Éclairage dynamique avec des touches de magie
- Textures stylisées de haute qualité
- Effets visuels fantasy (brume, lueurs magiques)

### 5.2 Textures
Toutes les textures sont maintenant hébergées localement et proviennent de Poly Haven (licence CC0) :
- **Sol** : "Stylized Stone Floor 02" - pavés de pierre avec motifs géométriques
- **Murs indestructibles** : "Stylized Bricks 01" - briques anciennes avec détails fantasy
- **Murs destructibles** : "Wooden Planks 012" - planches de bois usées
- **Environment Map** : "Sunset Ruins" - ambiance de ruines au coucher du soleil

### 5.3 Gestion des assets
- Structure de dossiers organisée dans `public/assets/`
- Scripts d'automatisation :
  - `scripts/setup_assets.sh` : Crée la structure de dossiers
  - `scripts/download_textures.sh` : Télécharge et installe les textures

### 5.4 Améliorations techniques
- Utilisation du PBR (Physically Based Rendering)
- Éclairage optimisé avec lumière hémisphérique
- Effets post-traitement simplifiés pour la performance
- Textures 2K (2048x2048) pour l'équilibre qualité/performance

### 5.5 Prochaines étapes
- [ ] Ajouter des effets de particules pour les explosions
- [ ] Intégrer des effets de brume au niveau du sol
- [ ] Optimiser les performances de rendu
- [ ] Ajouter des animations pour les transitions

## Phase 6 : UI/UX (À venir)
- [ ] Menu principal
- [ ] Interface en jeu
- [ ] Système de lobby
- [ ] Chat système
- [ ] Écrans de fin de partie
- [ ] UI/UX Design finalisé

## Phase 7 : Audio (À venir)
- [ ] Implémentation du système audio
- [ ] Musique de fond
- [ ] Effets sonores
- [ ] Voix des personnages
- [ ] Sons spatialisés

## Notes de Développement

### 13/02/2025
- Version stable commitée avec :
  - Déplacements fluides du joueur (ZQSD/WASD)
  - Caméra isométrique avec contrôles à la souris
  - Système de bombes et explosions
  - Génération de labyrinthe avec murs destructibles
  - Collisions et physique de base
- Début de la Phase 5 : Intégration des textures
  - Mise à jour du MaterialFactory pour supporter les textures PBR
  - Ajout des textures de sol (herbe) depuis Poly Haven
  - Utilisation du système PBR de Babylon.js pour un rendu réaliste

### 13 Février 2025

### Modifications du terrain
- Réduction de la taille de la carte de 61x61 à 21x21 pour un gameplay plus compact
- Remplacement du sol plat par 4 niveaux de cubes de 1x1x1
- Ajustement des murs à des dimensions de 1x1x1 pour un style plus cubique (Minecraft-like)
- Ajustement du personnage à 0.8x0.8x0.8 pour passer facilement entre les murs

### Améliorations de la caméra
- Ajout d'un système de réinitialisation automatique de la rotation horizontale
  - La caméra revient automatiquement derrière le joueur après 10 secondes d'inactivité
  - Animation fluide de 1 seconde pour le retour à la position d'origine
  - Ne réinitialise que la rotation horizontale, pas la hauteur
  - Le timer se réinitialise à chaque mouvement de la caméra
  - Double-clic toujours disponible pour réinitialisation immédiate

### Points d'attention
- Maintenir la jouabilité comme priorité lors de l'ajout des graphismes
- Tester chaque nouvelle texture individuellement
- Garder un point de restauration Git pour la version de base fonctionnelle
- Optimiser les textures pour les performances
