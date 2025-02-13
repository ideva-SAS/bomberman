import { PLAYER_CONFIG, GRID_CONFIG } from '../config/gameConfig.js';

export class Player {
    constructor(scene, startPosition = new BABYLON.Vector3(GRID_CONFIG.CELL_SIZE, PLAYER_CONFIG.HEIGHT/2, GRID_CONFIG.CELL_SIZE)) {
        this.scene = scene;
        this.mesh = this._createPlayerMesh();
        this.setupPhysics(startPosition);
    }

    _createPlayerMesh() {
        // Créer le cube du joueur
        const player = BABYLON.MeshBuilder.CreateBox("player", {
            height: PLAYER_CONFIG.HEIGHT,
            width: PLAYER_CONFIG.WIDTH,
            depth: PLAYER_CONFIG.DEPTH
        }, this.scene);

        // Créer un matériau pour le joueur
        const playerMaterial = new BABYLON.StandardMaterial("playerMaterial", this.scene);
        playerMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0); // Rouge
        playerMaterial.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        playerMaterial.emissiveColor = new BABYLON.Color3(0.2, 0, 0); // Légère lueur rouge
        player.material = playerMaterial;

        return player;
    }

    setupPhysics(startPosition) {
        // Position initiale
        this.mesh.position = startPosition;
        
        // Configuration des collisions
        this.mesh.checkCollisions = true;
        this.mesh.ellipsoid = new BABYLON.Vector3(0.2, 0.3, 0.2);
        this.mesh.ellipsoidOffset = new BABYLON.Vector3(0, PLAYER_CONFIG.HEIGHT/2, 0);
    }

    rotate(direction) {
        this.mesh.rotation.y += direction * PLAYER_CONFIG.ROTATION_SPEED;
    }

    move(direction) {
        const forwardVector = new BABYLON.Vector3(
            Math.sin(this.mesh.rotation.y),
            0,
            Math.cos(this.mesh.rotation.y)
        );
        
        // Déplacement avec gestion des collisions
        this.mesh.moveWithCollisions(forwardVector.scale(direction * PLAYER_CONFIG.MOVEMENT_SPEED));
        
        // Maintenir une hauteur constante
        this.mesh.position.y = PLAYER_CONFIG.HEIGHT/2;
    }

    getPosition() {
        return this.mesh.position;
    }

    dispose() {
        if (this.mesh) {
            this.mesh.dispose();
        }
    }
}
