// Attendre que la page soit complètement chargée
import { MaterialFactory } from './materials/MaterialFactory.js';
import { GRID_CONFIG, WALL_CONFIG, PLAYER_CONFIG, BOMB_CONFIG } from './config/gameConfig.js';
import { GameWorld } from './world/GameWorld.js';

window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('renderCanvas');
    const engine = new BABYLON.Engine(canvas, true);

    // Configuration de la grille
    const GRID_SIZE = GRID_CONFIG.size;
    const CELL_SIZE = GRID_CONFIG.cellSize;
    const WALL_HEIGHT = WALL_CONFIG.height;
    const WALL_WIDTH = WALL_CONFIG.width;
    const WALL_PROBABILITY = WALL_CONFIG.probability;
    const BOMB_TIMER = BOMB_CONFIG.timer;
    const EXPLOSION_DURATION = BOMB_CONFIG.explosionDuration;
    const EXPLOSION_RANGE = BOMB_CONFIG.explosionRange;

    // Configuration de la caméra
    const CAMERA_MIN_HEIGHT = 8;
    const CAMERA_MAX_HEIGHT = 16;
    const CAMERA_DEFAULT_HEIGHT = 12;
    const CAMERA_MIN_ROTATION = 150;
    const CAMERA_MAX_ROTATION = 210;
    const CAMERA_DEFAULT_ROTATION = 180;
    const CAMERA_SENSITIVITY = 0.1;

    // Fonction pour générer le labyrinthe
    function generateMaze(width, height) {
        const maze = Array(height).fill().map(() => Array(width).fill(1));
        
        function isValid(x, y) {
            return x >= 0 && x < width && y >= 0 && y < height && maze[y][x] === 1;
        }

        function carve(x, y) {
            maze[y][x] = 0;

            const directions = [
                [0, -2], [2, 0], [0, 2], [-2, 0]
            ].sort(() => Math.random() - 0.5);

            for (const [dx, dy] of directions) {
                const newX = x + dx;
                const newY = y + dy;

                if (isValid(newX, newY)) {
                    maze[y + dy/2][x + dx/2] = 0;
                    carve(newX, newY);
                }
            }
        }

        const startX = 1;
        const startY = 1;
        carve(startX, startY);

        // Garantir une zone de départ libre
        maze[1][1] = 0;
        maze[1][2] = 0;
        maze[2][1] = 0;
        maze[2][2] = 0;

        return maze;
    }

    const createScene = () => {
        const scene = new BABYLON.Scene(engine);
        scene.collisionsEnabled = true;
        scene.clearColor = new BABYLON.Color4(0.1, 0.1, 0.15, 1); // Ambiance plus sombre

        // Configuration de l'éclairage fantasy
        const mainLight = new BABYLON.HemisphericLight(
            "mainLight",
            new BABYLON.Vector3(0, 1, 0),
            scene
        );
        mainLight.intensity = 0.7;
        mainLight.groundColor = new BABYLON.Color3(0.1, 0.1, 0.2); // Teinte bleutée
        mainLight.specular = new BABYLON.Color3(0.3, 0.3, 0.4);

        // Lumière directionnelle pour les ombres
        const dirLight = new BABYLON.DirectionalLight(
            "dirLight",
            new BABYLON.Vector3(-1, -2, -1),
            scene
        );
        dirLight.intensity = 0.5;
        dirLight.shadowMinZ = 1;
        dirLight.shadowMaxZ = 20;

        // Activation des ombres
        const shadowGenerator = new BABYLON.ShadowGenerator(1024, dirLight);
        shadowGenerator.useBlurExponentialShadowMap = true;
        shadowGenerator.blurScale = 2;
        shadowGenerator.setDarkness(0.3);

        // Lumière ponctuelle pour l'ambiance
        const pointLight = new BABYLON.PointLight(
            "pointLight",
            new BABYLON.Vector3(0, 4, 0),
            scene
        );
        pointLight.intensity = 0.3;
        pointLight.radius = 10;
        pointLight.diffuse = new BABYLON.Color3(0.3, 0.2, 0.5); // Teinte violette

        // Initialisation de MaterialFactory
        const materialFactory = new MaterialFactory(scene);

        // Création de la caméra avec des paramètres ajustables
        const camera = new BABYLON.FollowCamera(
            "followCam",
            new BABYLON.Vector3(0, 0, 0),
            scene
        );
        
        // Configuration initiale de la caméra
        camera.radius = 15;
        camera.heightOffset = CAMERA_DEFAULT_HEIGHT;
        camera.rotationOffset = CAMERA_DEFAULT_ROTATION;
        camera.cameraAcceleration = 0.05;
        camera.maxCameraSpeed = 10;

        // Variables pour le contrôle de la caméra
        let isDragging = false;
        let lastX = 0;
        let lastY = 0;

        // Support pour les événements pointeur (fonctionne mieux sur Mac)
        canvas.addEventListener("pointerdown", (evt) => {
            isDragging = true;
            lastX = evt.clientX;
            lastY = evt.clientY;
            canvas.setPointerCapture(evt.pointerId);
        });

        canvas.addEventListener("pointermove", (evt) => {
            if (!isDragging) return;
            handleCameraMovement(evt.clientX, evt.clientY);
        });

        canvas.addEventListener("pointerup", (evt) => {
            isDragging = false;
            canvas.releasePointerCapture(evt.pointerId);
        });

        canvas.addEventListener("pointercancel", (evt) => {
            isDragging = false;
            canvas.releasePointerCapture(evt.pointerId);
        });

        // Fonction commune pour gérer le mouvement de la caméra
        function handleCameraMovement(currentX, currentY) {
            const deltaX = (currentX - lastX) * 0.5; // Réduit la sensibilité
            const deltaY = (currentY - lastY) * 0.5;

            // Ajuster la rotation horizontale (gauche/droite)
            camera.rotationOffset += deltaX * CAMERA_SENSITIVITY;
            camera.rotationOffset = Math.max(CAMERA_MIN_ROTATION, 
                                          Math.min(CAMERA_MAX_ROTATION, 
                                                 camera.rotationOffset));

            // Ajuster la hauteur (haut/bas)
            camera.heightOffset -= deltaY * CAMERA_SENSITIVITY;
            camera.heightOffset = Math.max(CAMERA_MIN_HEIGHT, 
                                        Math.min(CAMERA_MAX_HEIGHT, 
                                               camera.heightOffset));

            lastX = currentX;
            lastY = currentY;
        }

        // Double-clic/tap pour réinitialiser la vue
        let lastClickTime = 0;
        canvas.addEventListener("click", (evt) => {
            const currentTime = new Date().getTime();
            const clickLength = currentTime - lastClickTime;
            if (clickLength < 300 && clickLength > 0) {
                camera.heightOffset = CAMERA_DEFAULT_HEIGHT;
                camera.rotationOffset = CAMERA_DEFAULT_ROTATION;
                evt.preventDefault();
            }
            lastClickTime = currentTime;
        });

        // Création du monde de jeu
        const gameWorld = new GameWorld(scene);

        // Utilisation des matériaux de MaterialFactory
        const wallMaterial = materialFactory.createDestructibleWallMaterial();
        const indestructibleWallMaterial = materialFactory.createIndestructibleWallMaterial();
        const bombMaterial = new BABYLON.StandardMaterial("bombMaterial", scene);
        bombMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);

        const maze = generateMaze((GRID_SIZE-1)/2, (GRID_SIZE-1)/2);
        const walls = [];

        for (let x = 0; x < GRID_SIZE; x++) {
            for (let z = 0; z < GRID_SIZE; z++) {
                // Créer les murs de bordure
                if (x === 0 || x === GRID_SIZE - 1 || z === 0 || z === GRID_SIZE - 1) {
                    const borderWall = BABYLON.MeshBuilder.CreateBox(
                        `border_${x}_${z}`,
                        {
                            width: CELL_SIZE,
                            height: WALL_HEIGHT,
                            depth: CELL_SIZE
                        },
                        scene
                    );
                    borderWall.position = new BABYLON.Vector3(
                        x * CELL_SIZE + CELL_SIZE / 2,
                        WALL_HEIGHT / 2,  // Position le bas du mur à y=0
                        z * CELL_SIZE + CELL_SIZE / 2
                    );
                    borderWall.material = indestructibleWallMaterial;
                    borderWall.checkCollisions = true;
                    walls.push(borderWall);
                }
                // Créer les murs du labyrinthe
                else if (x % 2 === 1 && z % 2 === 1 && maze[Math.floor(x/2)] && maze[Math.floor(x/2)][Math.floor(z/2)] === 1) {
                    const wall = BABYLON.MeshBuilder.CreateBox(
                        `wall_${x}_${z}`,
                        {
                            width: CELL_SIZE,
                            height: WALL_HEIGHT,
                            depth: CELL_SIZE
                        },
                        scene
                    );
                    wall.position = new BABYLON.Vector3(
                        x * CELL_SIZE + CELL_SIZE / 2,
                        WALL_HEIGHT / 2,  // Position le bas du mur à y=0
                        z * CELL_SIZE + CELL_SIZE / 2
                    );
                    wall.material = indestructibleWallMaterial;
                    wall.checkCollisions = true;
                    walls.push(wall);
                }
                // Ajouter des murs destructibles aléatoirement
                else if (Math.random() < WALL_PROBABILITY && !(x <= 2 && z <= 2)) {
                    const wall = BABYLON.MeshBuilder.CreateBox(
                        `destructible_${x}_${z}`,
                        {
                            width: CELL_SIZE,
                            height: WALL_HEIGHT,
                            depth: CELL_SIZE
                        },
                        scene
                    );
                    wall.position = new BABYLON.Vector3(
                        x * CELL_SIZE + CELL_SIZE / 2,
                        WALL_HEIGHT / 2,  // Position le bas du mur à y=0
                        z * CELL_SIZE + CELL_SIZE / 2
                    );
                    wall.material = wallMaterial;
                    wall.checkCollisions = true;
                    wall.isDestructible = true;
                    walls.push(wall);
                }
            }
        }

        // Créer le joueur
        const player = BABYLON.MeshBuilder.CreateBox("player", {
            width: PLAYER_CONFIG.width,
            height: PLAYER_CONFIG.height,
            depth: PLAYER_CONFIG.depth
        }, scene);

        // Position initiale du joueur (coin supérieur gauche, mais pas dans un mur)
        player.position = new BABYLON.Vector3(
            GRID_CONFIG.cellSize * 1.5, // Position X : deuxième cellule
            PLAYER_CONFIG.height / 2,     // Position Y : moitié de la hauteur du joueur
            GRID_CONFIG.cellSize * 1.5   // Position Z : deuxième cellule
        );

        // Décaler toute la scène pour la centrer
        const mapSize = GRID_CONFIG.size * GRID_CONFIG.cellSize;
        const mapOffset = mapSize / 2;
        
        // Créer un parent pour tous les éléments de la map
        const mapParent = new BABYLON.TransformNode("mapParent", scene);
        
        // Déplacer tous les murs sous le parent
        walls.forEach(wall => {
            wall.parent = mapParent;
        });
        
        // Déplacer le joueur sous le parent
        player.parent = mapParent;
        
        // Décaler le parent pour centrer la map
        mapParent.position = new BABYLON.Vector3(-mapOffset, 0, -mapOffset);

        camera.lockedTarget = player;

        let inputMap = {};
        const ROTATION_SPEED = 0.05;
        const MOVEMENT_SPEED = 0.15;
        let canPlaceBomb = true;
        
        const getGridPosition = (position) => {
            const x = Math.round(position.x + GRID_SIZE/2 - CELL_SIZE/2);
            const z = Math.round(position.z + GRID_SIZE/2 - CELL_SIZE/2);
            return { x, z };
        };

        const createExplosion = (position, range) => {
            const explosion = BABYLON.MeshBuilder.CreateSphere("explosion", {
                diameter: 1
            }, scene);
            explosion.position = position;
            
            const explosionMaterial = new BABYLON.StandardMaterial("explosionMat", scene);
            explosionMaterial.emissiveColor = new BABYLON.Color3(1, 0.3, 0);
            explosion.material = explosionMaterial;

            const anim = new BABYLON.Animation(
                "explosionAnim",
                "scaling",
                60,
                BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
                BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
            );

            const keys = [
                { frame: 0, value: new BABYLON.Vector3(0.1, 0.1, 0.1) },
                { frame: 30, value: new BABYLON.Vector3(range, range, range) },
                { frame: 60, value: new BABYLON.Vector3(0.1, 0.1, 0.1) }
            ];

            anim.setKeys(keys);
            explosion.animations = [anim];

            scene.beginAnimation(explosion, 0, 60, false, 1, () => {
                explosion.dispose();
            });

            const gridPos = getGridPosition(position);
            const directions = [
                { x: 1, z: 0 }, { x: -1, z: 0 }, 
                { x: 0, z: 1 }, { x: 0, z: -1 }
            ];

            directions.forEach(dir => {
                for (let i = 1; i <= range; i++) {
                    const checkX = gridPos.x + (dir.x * i);
                    const checkZ = gridPos.z + (dir.z * i);
                    const wallIndex = walls.findIndex(wall => wall.name === `destructible_${checkX}_${checkZ}`);
                    
                    if (wallIndex !== -1) {
                        walls.splice(wallIndex, 1);
                        walls[wallIndex].dispose();
                    }
                }
            });
        };

        const placeBomb = () => {
            if (!canPlaceBomb) return;
            
            canPlaceBomb = false;
            const gridPos = getGridPosition(player.position);
            
            const bomb = BABYLON.MeshBuilder.CreateSphere("bomb", {
                diameter: 0.8
            }, scene);
            
            bomb.position = new BABYLON.Vector3(
                gridPos.x * CELL_SIZE + CELL_SIZE / 2,
                0.4,
                gridPos.z * CELL_SIZE + CELL_SIZE / 2
            );
            bomb.material = bombMaterial;

            const pulseAnimation = new BABYLON.Animation(
                "pulseAnimation",
                "scaling",
                30,
                BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
                BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
            );

            const keys = [
                { frame: 0, value: new BABYLON.Vector3(1, 1, 1) },
                { frame: 15, value: new BABYLON.Vector3(1.2, 1.2, 1.2) },
                { frame: 30, value: new BABYLON.Vector3(1, 1, 1) }
            ];

            pulseAnimation.setKeys(keys);
            bomb.animations = [pulseAnimation];
            scene.beginAnimation(bomb, 0, 30, true);

            setTimeout(() => {
                createExplosion(bomb.position, EXPLOSION_RANGE);
                bomb.dispose();
                
                setTimeout(() => {
                    canPlaceBomb = true;
                }, 1000);
            }, BOMB_TIMER);
        };

        scene.actionManager = new BABYLON.ActionManager(scene);
        
        scene.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                BABYLON.ActionManager.OnKeyDownTrigger,
                (evt) => inputMap[evt.sourceEvent.key] = true
            )
        );
        
        scene.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                BABYLON.ActionManager.OnKeyUpTrigger,
                (evt) => inputMap[evt.sourceEvent.key] = false
            )
        );

        scene.registerBeforeRender(() => {
            if (inputMap["ArrowLeft"]) {
                player.rotation.y -= ROTATION_SPEED;
            }
            if (inputMap["ArrowRight"]) {
                player.rotation.y += ROTATION_SPEED;
            }

            let forwardVector = new BABYLON.Vector3(
                Math.sin(player.rotation.y),
                0,
                Math.cos(player.rotation.y)
            );

            if (inputMap["ArrowUp"]) {
                player.moveWithCollisions(forwardVector.scale(MOVEMENT_SPEED));
            }
            if (inputMap["ArrowDown"]) {
                player.moveWithCollisions(forwardVector.scale(-MOVEMENT_SPEED));
            }

            if (inputMap[" "]) {
                placeBomb();
                inputMap[" "] = false;
            }

            player.position.y = 0.4;
        });

        return scene;
    };

    const scene = createScene();

    engine.runRenderLoop(() => {
        scene.render();
    });

    window.addEventListener('resize', () => {
        engine.resize();
    });
});
