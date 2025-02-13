# Bomberman 3D

Un jeu Bomberman en 3D utilisant Babylon.js.

## Structure du Projet

```
bomberman/
├── public/
│   ├── js/
│   │   ├── config/
│   │   │   └── gameConfig.js       # Configuration du jeu (constantes, paramètres)
│   │   ├── controls/
│   │   │   ├── CameraController.js # Gestion des contrôles de caméra
│   │   │   └── InputController.js  # Gestion des entrées (clavier)
│   │   ├── entities/
│   │   │   ├── Player.js          # Classe du joueur
│   │   │   ├── Bomb.js           # Classe des bombes
│   │   │   └── Explosion.js      # Classe des explosions
│   │   ├── world/
│   │   │   ├── GameWorld.js      # Gestion du monde de jeu (terrain, murs)
│   │   │   └── MazeGenerator.js  # Générateur de labyrinthe
│   │   └── Game.js              # Classe principale du jeu
│   ├── css/
│   │   └── style.css            # Styles CSS
│   └── index.html               # Page HTML principale
├── server.js                    # Serveur Node.js simple
└── README.md                    # Documentation
```

## Fonctionnalités

- Génération procédurale de labyrinthe
- Contrôles de caméra avec le pavé tactile/souris
- Déplacement du joueur avec les flèches directionnelles
- Système de bombes et d'explosions
- Murs destructibles et indestructibles
- Collisions et physique de base

## Contrôles

### Joueur
- Flèches directionnelles : Déplacement
- Barre d'espace : Poser une bombe

### Caméra
- Cliquer-glisser haut/bas : Ajuster la hauteur de la caméra
- Cliquer-glisser gauche/droite : Rotation de la caméra
- Double-clic : Réinitialiser la vue

## Installation

1. Cloner le dépôt
2. Installer les dépendances : `npm install`
3. Démarrer le serveur : `node server.js`
4. Ouvrir un navigateur et aller à `http://localhost:3000`

## Technologies Utilisées

- Babylon.js : Moteur de jeu 3D
- Node.js : Serveur de développement
- JavaScript ES6+ : Programmation orientée objet moderne

## Github
https://github.com/ideva-SAS/bomberman.git