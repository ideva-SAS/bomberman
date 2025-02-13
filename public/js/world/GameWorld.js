import { GRID_CONFIG, WALL_CONFIG } from '../config/gameConfig.js';
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
        mainLight.intensity = 0.7;
        mainLight.groundColor = new BABYLON.Color3(0.2, 0.2, 0.25);

        // Lumière directionnelle pour les ombres
        const dirLight = new BABYLON.DirectionalLight(
            "dirLight",
            new BABYLON.Vector3(-1, -2, -1),
            this.scene
        );
        dirLight.intensity = 0.5;
        dirLight.position = new BABYLON.Vector3(20, 40, 20);

        // Configuration des ombres
        const shadowGenerator = new BABYLON.ShadowGenerator(1024, dirLight);
        shadowGenerator.useBlurExponentialShadowMap = true;
        shadowGenerator.blurKernel = 32;
        this.shadowGenerator = shadowGenerator;
    }

    _createGround() {
        const groundSize = GRID_CONFIG.SIZE * GRID_CONFIG.CELL_SIZE;
        const ground = BABYLON.MeshBuilder.CreateGround(
            "ground",
            { 
                width: groundSize,
                height: groundSize,
                subdivisions: 1
            },
            this.scene
        );
        ground.receiveShadows = true;
        ground.material = this.materialFactory.createGroundMaterial();

        // Ajuster la position du sol
        ground.position = new BABYLON.Vector3(
            (groundSize/2) - GRID_CONFIG.CELL_SIZE,
            0,
            (groundSize/2) - GRID_CONFIG.CELL_SIZE
        );
    }

    _createWalls() {
        const mazeGenerator = new MazeGenerator(GRID_CONFIG.SIZE, GRID_CONFIG.SIZE);
        const maze = mazeGenerator.generate();

        // Création des matériaux
        const indestructibleMaterial = this.materialFactory.createIndestructibleWallMaterial();
        const destructibleMaterial = this.materialFactory.createDestructibleWallMaterial();
        const invisibleMaterial = new BABYLON.StandardMaterial("invisibleMat", this.scene);
        invisibleMaterial.alpha = 0;

        for (let x = 0; x < GRID_CONFIG.SIZE; x++) {
            for (let z = 0; z < GRID_CONFIG.SIZE; z++) {
                if (maze[x][z] === 1) {
                    // Si c'est un mur de bordure
                    const isBorder = x === 0 || x === GRID_CONFIG.SIZE - 1 || 
                                   z === 0 || z === GRID_CONFIG.SIZE - 1;
                    
                    if (isBorder) {
                        this._createWall(x, z, true, invisibleMaterial, WALL_CONFIG.BORDER_HEIGHT);
                    } else {
                        this._createWall(x, z, true, indestructibleMaterial, WALL_CONFIG.HEIGHT);
                    }
                } else if (Math.random() < 0.2 && !this._isNearStart(x, z)) {
                    this._createWall(x, z, false, destructibleMaterial, WALL_CONFIG.HEIGHT);
                }
            }
        }
    }

    _isNearStart(x, z) {
        // Empêche la création de murs destructibles près du point de départ
        return x <= 2 && z <= 2;
    }

    _createWall(x, z, indestructible, material, height) {
        const wallSize = GRID_CONFIG.CELL_SIZE;
        const wall = BABYLON.MeshBuilder.CreateBox(
            `wall_${x}_${z}`,
            { 
                height: height,
                width: WALL_CONFIG.WIDTH,
                depth: WALL_CONFIG.DEPTH
            },
            this.scene
        );

        wall.position = new BABYLON.Vector3(
            x * wallSize,
            height/2,
            z * wallSize
        );

        wall.material = material;
        wall.destructible = !indestructible;
        wall.checkCollisions = true;
        this.shadowGenerator.addShadowCaster(wall);
        this.walls.push(wall);
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
