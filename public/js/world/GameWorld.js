import { GRID_CONFIG, WALL_CONFIG, PLAYER_CONFIG } from '../config/gameConfig.js';
import { MazeGenerator } from './MazeGenerator.js';
import { MaterialFactory } from '../materials/MaterialFactory.js';

export class GameWorld {
    constructor(scene) {
        this.scene = scene;
        this.walls = [];
        this.materialFactory = new MaterialFactory(scene);
        this._setupLighting();
        this._createGround();
        this._createWalls();
    }

    _setupLighting() {
        // Lumière principale
        const mainLight = new BABYLON.HemisphericLight(
            "mainLight",
            new BABYLON.Vector3(1, 1, 0),
            this.scene
        );
        mainLight.intensity = 1;
        mainLight.groundColor = new BABYLON.Color3(0.2, 0.2, 0.25);
        mainLight.specular = new BABYLON.Color3(0.3, 0.3, 0.3);

        // Lumière directionnelle pour les ombres
        const dirLight = new BABYLON.DirectionalLight(
            "dirLight",
            new BABYLON.Vector3(-1, -2, -1),
            this.scene
        );
        dirLight.intensity = 0.7;
        dirLight.position = new BABYLON.Vector3(20, 40, 20);

        // Configuration des ombres
        const shadowGenerator = new BABYLON.ShadowGenerator(2048, dirLight);
        shadowGenerator.useBlurExponentialShadowMap = true;
        shadowGenerator.blurKernel = 32;
        shadowGenerator.setDarkness(0.2);
        shadowGenerator.bias = 0.01;
        this.shadowGenerator = shadowGenerator;

        // Lumière d'ambiance pour les recoins
        const pointLight = new BABYLON.PointLight(
            "pointLight",
            new BABYLON.Vector3(0, 10, 0),
            this.scene
        );
        pointLight.intensity = 0.3;
        pointLight.radius = 20;
    }

    _createGround() {
        const tiles = [];
        const blockSize = GRID_CONFIG.CELL_SIZE;

        // Créer deux niveaux de blocs pour le sol
        for (let level = 0; level < 2; level++) {
            for (let x = 0; x < GRID_CONFIG.SIZE; x++) {
                for (let z = 0; z < GRID_CONFIG.SIZE; z++) {
                    // Créer un bloc cubique parfait
                    const block = BABYLON.MeshBuilder.CreateBox(
                        `groundBlock_${level}_${x}_${z}`,
                        {
                            width: blockSize,
                            height: blockSize,
                            depth: blockSize,
                            updatable: true
                        },
                        this.scene
                    );

                    // Positionner le bloc avec le premier niveau à y=-0.5 et le deuxième à y=0.5
                    block.position = new BABYLON.Vector3(
                        x * blockSize + blockSize / 2,
                        level - 0.5,  
                        z * blockSize + blockSize / 2
                    );

                    // Créer les matériaux pour le bloc
                    if (level === 0) {
                        // Niveau inférieur : dirt sur toutes les faces
                        const material = this.materialFactory.createGroundMaterial();
                        block.material = material;
                    } else {
                        // Niveau supérieur : grass_block avec différentes textures
                        const material = this.materialFactory.createGroundMaterial();
                        block.material = material;
                    }

                    // Activer les collisions
                    block.checkCollisions = true;
                    block.receiveShadows = true;

                    tiles.push(block);
                }
            }
        }

        // Optimisation : fusionner tous les blocs du même niveau
        for (let level = 0; level < 2; level++) {
            const levelTiles = tiles.filter(tile => tile.position.y === (level - 0.5));
            const merged = BABYLON.Mesh.MergeMeshes(
                levelTiles,
                true,
                true,
                undefined,
                false,
                true
            );
            merged.name = `ground_level_${level}`;
            merged.checkCollisions = true;
            merged.receiveShadows = true;
        }
    }

    _createWalls() {
        const mazeGenerator = new MazeGenerator(GRID_CONFIG.SIZE, GRID_CONFIG.SIZE);
        const maze = mazeGenerator.generate();

        // Création des matériaux
        const indestructibleMaterial = this.materialFactory.createIndestructibleWallMaterial();
        const destructibleMaterial = this.materialFactory.createDestructibleWallMaterial();

        for (let x = 0; x < GRID_CONFIG.SIZE; x++) {
            for (let z = 0; z < GRID_CONFIG.SIZE; z++) {
                if (maze[x][z] === 1) {
                    // Créer le mur avec les bonnes dimensions
                    const wall = BABYLON.MeshBuilder.CreateBox(
                        `wall_${x}_${z}`,
                        {
                            width: WALL_CONFIG.WIDTH,
                            height: WALL_CONFIG.HEIGHT,
                            depth: WALL_CONFIG.DEPTH
                        },
                        this.scene
                    );

                    // Positionner le mur sur le sol (y = 1)
                    wall.position = new BABYLON.Vector3(
                        x * GRID_CONFIG.CELL_SIZE + GRID_CONFIG.CELL_SIZE / 2,
                        1,  
                        z * GRID_CONFIG.CELL_SIZE + GRID_CONFIG.CELL_SIZE / 2
                    );

                    wall.material = indestructibleMaterial;
                    wall.checkCollisions = true;
                    wall.receiveShadows = true;
                    
                    this.walls.push(wall);
                } else if (Math.random() < 0.2 && !this._isNearStart(x, z)) {
                    const wall = BABYLON.MeshBuilder.CreateBox(
                        `wall_${x}_${z}`,
                        {
                            width: WALL_CONFIG.WIDTH,
                            height: WALL_CONFIG.HEIGHT,
                            depth: WALL_CONFIG.DEPTH
                        },
                        this.scene
                    );

                    wall.position = new BABYLON.Vector3(
                        x * GRID_CONFIG.CELL_SIZE + GRID_CONFIG.CELL_SIZE / 2,
                        1,  
                        z * GRID_CONFIG.CELL_SIZE + GRID_CONFIG.CELL_SIZE / 2
                    );

                    wall.material = destructibleMaterial;
                    wall.checkCollisions = true;
                    wall.receiveShadows = true;
                    
                    this.walls.push(wall);
                }
            }
        }
    }

    _isNearStart(x, z) {
        // Empêche la création de murs destructibles près du point de départ
        return x <= 2 && z <= 2;
    }

    getWallAt(x, z) {
        return this.walls.find(wall => {
            const wallX = Math.floor(wall.position.x / GRID_CONFIG.CELL_SIZE);
            const wallZ = Math.floor(wall.position.z / GRID_CONFIG.CELL_SIZE);
            return wallX === x && wallZ === z;
        });
    }

    removeWall(x, z) {
        const wall = this.getWallAt(x, z);
        if (wall && wall.destructible) {
            const index = this.walls.indexOf(wall);
            if (index > -1) {
                this.walls.splice(index, 1);
            }
            wall.dispose();
        }
    }

    getGridPosition(position) {
        const x = Math.floor(position.x / GRID_CONFIG.CELL_SIZE);
        const z = Math.floor(position.z / GRID_CONFIG.CELL_SIZE);
        return { x, z };
    }
}
