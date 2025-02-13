export const GRID_CONFIG = {
    SIZE: 15,
    CELL_SIZE: 1
};

export const WALL_CONFIG = {
    HEIGHT: 0.8,          // Réduit la hauteur des murs
    BORDER_HEIGHT: 2,     // Murs de bordure plus hauts mais invisibles
    WIDTH: 1,
    DEPTH: 1
};

export const PLAYER_CONFIG = {
    HEIGHT: 0.6,          // Hauteur du joueur
    WIDTH: 0.4,          // Largeur du joueur
    DEPTH: 0.4,          // Profondeur du joueur
    MOVEMENT_SPEED: 0.15, // Vitesse de déplacement
    ROTATION_SPEED: 0.05  // Vitesse de rotation
};

export const BOMB_CONFIG = {
    FUSE_TIME: 2000,     // 2 secondes
    EXPLOSION_DURATION: 1000,
    EXPLOSION_RANGE: 2
};
