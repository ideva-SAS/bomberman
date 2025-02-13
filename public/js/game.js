// Attendre que la page soit complètement chargée
import { MaterialFactory } from './materials/MaterialFactory.js';

window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('renderCanvas');
    const engine = new BABYLON.Engine(canvas, true);

    // Configuration de la grille
    const GRID_SIZE = 21; // Réduit de 61 à 21 pour une carte plus petite
    const CELL_SIZE = 1;
    const WALL_HEIGHT = 1;
    const WALL_WIDTH = 1; // Murs cubiques de 1x1x1
    const WALL_PROBABILITY = 0.3;
    const BOMB_TIMER = 3000;
    const EXPLOSION_DURATION = 1000;
    const EXPLOSION_RANGE = 3;

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
        scene.clearColor = new BABYLON.Color4(0.2, 0.2, 0.3, 1);

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

        // Création du sol avec 4 niveaux de cubes
        const groundBlocks = [];
        const GROUND_LEVELS = 4; // Nombre de niveaux pour le sol

        // Créer les niveaux de sol
        for (let level = 0; level < GROUND_LEVELS; level++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                for (let z = 0; z < GRID_SIZE; z++) {
                    const groundBlock = BABYLON.MeshBuilder.CreateBox(
                        `ground_${level}_${x}_${z}`,
                        {
                            height: 1,
                            width: 1,
                            depth: 1
                        },
                        scene
                    );
                    groundBlock.position = new BABYLON.Vector3(
                        x - GRID_SIZE/2 + 0.5,
                        -level - 0.5, // Commence à y=-0.5 et descend
                        z - GRID_SIZE/2 + 0.5
                    );
                    groundBlock.material = materialFactory.createGroundMaterial();
                    groundBlock.checkCollisions = true;
                    groundBlocks.push(groundBlock);
                }
            }
        }

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
        let lastPointerX = 0;
        let lastPointerY = 0;
        let lastClickTime = 0;
        let lastCameraMove = Date.now();
        let cameraResetTimeout = null;
        const CAMERA_RESET_DELAY = 10000; // 10 secondes

        // Fonction pour réinitialiser la rotation horizontale de la caméra
        const resetCameraRotation = () => {
            // Animation de retour à la position d'origine
            const currentRotation = camera.rotationOffset;
            const duration = 1000; // 1 seconde pour l'animation
            const fps = 60;
            const totalFrames = duration * fps / 1000;
            let frame = 0;

            const animate = () => {
                if (frame >= totalFrames) {
                    camera.rotationOffset = CAMERA_DEFAULT_ROTATION;
                    return;
                }

                frame++;
                const progress = frame / totalFrames;
                // Utiliser une fonction d'easing pour une animation plus fluide
                const easeProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
                
                camera.rotationOffset = currentRotation + (CAMERA_DEFAULT_ROTATION - currentRotation) * easeProgress;
                requestAnimationFrame(animate);
            };

            animate();
        };

        // Gestionnaires d'événements pointeur (fonctionne avec souris et pavé tactile)
        canvas.addEventListener("pointerdown", (evt) => {
            isDragging = true;
            lastPointerX = evt.clientX;
            lastPointerY = evt.clientY;
            
            // Annuler le timeout de réinitialisation si on commence à bouger la caméra
            if (cameraResetTimeout) {
                clearTimeout(cameraResetTimeout);
                cameraResetTimeout = null;
            }
        });

        canvas.addEventListener("pointermove", (evt) => {
            if (!isDragging) return;

            const deltaX = evt.clientX - lastPointerX;
            const deltaY = evt.clientY - lastPointerY;

            // Ajuster la rotation horizontale (gauche/droite)
            if (deltaX !== 0) {
                camera.rotationOffset += deltaX * CAMERA_SENSITIVITY;
                camera.rotationOffset = Math.max(CAMERA_MIN_ROTATION, 
                                            Math.min(CAMERA_MAX_ROTATION, 
                                                    camera.rotationOffset));
                lastCameraMove = Date.now();
                
                // Réinitialiser le timeout à chaque mouvement horizontal
                if (cameraResetTimeout) {
                    clearTimeout(cameraResetTimeout);
                }
                cameraResetTimeout = setTimeout(resetCameraRotation, CAMERA_RESET_DELAY);
            }

            // Ajuster la hauteur (haut/bas)
            camera.heightOffset -= deltaY * CAMERA_SENSITIVITY;
            camera.heightOffset = Math.max(CAMERA_MIN_HEIGHT, 
                                        Math.min(CAMERA_MAX_HEIGHT, 
                                               camera.heightOffset));

            lastPointerX = evt.clientX;
            lastPointerY = evt.clientY;
        });

        canvas.addEventListener("pointerup", () => {
            isDragging = false;
        });

        canvas.addEventListener("pointerleave", () => {
            isDragging = false;
        });

        // Double-clic pour réinitialiser la vue immédiatement
        canvas.addEventListener("click", (evt) => {
            const currentTime = Date.now();
            if (currentTime - lastClickTime < 300) { // Double-clic détecté
                if (cameraResetTimeout) {
                    clearTimeout(cameraResetTimeout);
                    cameraResetTimeout = null;
                }
                resetCameraRotation();
            }
            lastClickTime = currentTime;
        });

        // Utilisation des matériaux de MaterialFactory
        const wallMaterial = materialFactory.createDestructibleWallMaterial();
        const indestructibleWallMaterial = materialFactory.createIndestructibleWallMaterial();
        const bombMaterial = new BABYLON.StandardMaterial("bombMaterial", scene);
        bombMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);

        const maze = generateMaze((GRID_SIZE-1)/2, (GRID_SIZE-1)/2);
        const walls = new Map();

        // Création des murs selon le labyrinthe
        for (let x = 0; x < GRID_SIZE; x++) {
            for (let z = 0; z < GRID_SIZE; z++) {
                if (x === 0 || x === GRID_SIZE - 1 || z === 0 || z === GRID_SIZE - 1) {
                    const wall = BABYLON.MeshBuilder.CreateBox("wall", {
                        height: WALL_HEIGHT,
                        width: WALL_WIDTH,
                        depth: WALL_WIDTH
                    }, scene);
                    wall.position = new BABYLON.Vector3(
                        x - GRID_SIZE/2 + CELL_SIZE/2,
                        WALL_HEIGHT/2,
                        z - GRID_SIZE/2 + CELL_SIZE/2
                    );
                    wall.checkCollisions = true;
                    wall.visibility = 0;
                    wall.destructible = false;
                    walls.set(`${x},${z}`, wall);
                }
                else {
                    const mazeX = Math.floor(x/2);
                    const mazeZ = Math.floor(z/2);
                    
                    // Ne pas placer de murs dans la zone de départ
                    if (x <= 3 && z <= 3) continue;

                    if (maze[mazeZ] && maze[mazeZ][mazeX] === 1) {
                        const wall = BABYLON.MeshBuilder.CreateBox("wall", {
                            height: WALL_HEIGHT,
                            width: WALL_WIDTH,
                            depth: WALL_WIDTH
                        }, scene);
                        wall.position = new BABYLON.Vector3(
                            x - GRID_SIZE/2 + CELL_SIZE/2,
                            WALL_HEIGHT/2,
                            z - GRID_SIZE/2 + CELL_SIZE/2
                        );
                        wall.material = indestructibleWallMaterial;
                        wall.checkCollisions = true;
                        wall.destructible = false;
                        walls.set(`${x},${z}`, wall);
                    }
                    else if (maze[mazeZ] && maze[mazeZ][mazeX] === 0 && Math.random() < WALL_PROBABILITY) {
                        const wall = BABYLON.MeshBuilder.CreateBox("wall", {
                            height: WALL_HEIGHT,
                            width: WALL_WIDTH,
                            depth: WALL_WIDTH
                        }, scene);
                        wall.position = new BABYLON.Vector3(
                            x - GRID_SIZE/2 + CELL_SIZE/2,
                            WALL_HEIGHT/2,
                            z - GRID_SIZE/2 + CELL_SIZE/2
                        );
                        wall.material = wallMaterial;
                        wall.checkCollisions = true;
                        wall.destructible = true;
                        walls.set(`${x},${z}`, wall);
                    }
                }
            }
        }

        const player = BABYLON.MeshBuilder.CreateBox("player", { 
            height: 0.8,
            width: 0.8,
            depth: 0.8,
            faceColors: [
                new BABYLON.Color4(1, 0, 0, 1),   // face avant (rouge)
                new BABYLON.Color4(0, 1, 0, 1),   // face arrière (vert)
                new BABYLON.Color4(0, 0, 1, 1),   // face droite (bleu)
                new BABYLON.Color4(1, 1, 0, 1),   // face gauche (jaune)
                new BABYLON.Color4(1, 0, 1, 1),   // face dessus (magenta)
                new BABYLON.Color4(0, 1, 1, 1)    // face dessous (cyan)
            ]
        }, scene);
        
        player.position = new BABYLON.Vector3(-GRID_SIZE/2 + 1.5, 0.4, -GRID_SIZE/2 + 1.5);
        player.checkCollisions = true;
        player.ellipsoid = new BABYLON.Vector3(0.35, 0.35, 0.35);
        player.ellipsoidOffset = new BABYLON.Vector3(0, 0.4, 0);

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
                    const wall = walls.get(`${checkX},${checkZ}`);
                    
                    if (wall) {
                        if (wall.destructible) {
                            walls.delete(`${checkX},${checkZ}`);
                            wall.dispose();
                        }
                        break;
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
                gridPos.x - GRID_SIZE/2 + CELL_SIZE/2,
                0.4,
                gridPos.z - GRID_SIZE/2 + CELL_SIZE/2
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
