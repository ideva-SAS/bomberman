export const GRID_CONFIG = {
    SIZE: 15,
    CELL_SIZE: 1,  // Taille d'un bloc Minecraft
    size: 15,      // Pour la compatibilité avec le code existant
    cellSize: 1    // Pour la compatibilité avec le code existant
};

export const WALL_CONFIG = {
    HEIGHT: 1,    // Exactement 1 bloc de haut
    BORDER_HEIGHT: 1, // Les murs de bordure font aussi 1 bloc
    WIDTH: 1,     // 1 bloc de large
    DEPTH: 1,     // 1 bloc de profondeur
    height: 1,    // Pour la compatibilité avec le code existant
    width: 1,     // Pour la compatibilité avec le code existant
    depth: 1,     // Pour la compatibilité avec le code existant
    probability: 0.2  // Pour la compatibilité avec le code existant
};

export const PLAYER_CONFIG = {
    HEIGHT: 0.8,          // Un peu moins qu'un bloc pour que le joueur puisse passer sous les bombes
    WIDTH: 0.6,          // Largeur du joueur
    DEPTH: 0.6,          // Profondeur du joueur
    MOVEMENT_SPEED: 0.15,
    ROTATION_SPEED: 0.05,
    height: 0.8,         // Pour la compatibilité avec le code existant
    width: 0.6,         // Pour la compatibilité avec le code existant
    depth: 0.6          // Pour la compatibilité avec le code existant
};

export const BOMB_CONFIG = {
    FUSE_TIME: 2000,     // 2 secondes
    EXPLOSION_DURATION: 1000,
    EXPLOSION_RANGE: 2,
    timer: 2000,         // Pour la compatibilité avec le code existant
    explosionDuration: 1000,  // Pour la compatibilité avec le code existant
    explosionRange: 2        // Pour la compatibilité avec le code existant
};
