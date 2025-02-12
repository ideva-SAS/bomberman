// Attendre que la page soit complètement chargée
window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('renderCanvas');
    const engine = new BABYLON.Engine(canvas, true);

    // Configuration de la grille
    const GRID_SIZE = 61;
    const CELL_SIZE = 1;
    const WALL_HEIGHT = 1;
    const WALL_WIDTH = 0.7;
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

        const light = new BABYLON.HemisphericLight(
            "light",
            new BABYLON.Vector3(1, 1, 0),
            scene
        );
        light.intensity = 0.7;

        const ground = BABYLON.MeshBuilder.CreateGround(
            "ground",
            { width: GRID_SIZE, height: GRID_SIZE, subdivisions: GRID_SIZE },
            scene
        );
        const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
        groundMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        groundMaterial.wireframe = true;
        ground.material = groundMaterial;
        ground.checkCollisions = true;

        const wallMaterial = new BABYLON.StandardMaterial("wallMaterial", scene);
        wallMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4);

        const indestructibleWallMaterial = new BABYLON.StandardMaterial("indestructibleWallMaterial", scene);
        indestructibleWallMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.6);

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
                new BABYLON.Color4(1, 0, 0, 1),
                new BABYLON.Color4(0, 1, 0, 1),
                new BABYLON.Color4(0, 0, 1, 1),
                new BABYLON.Color4(1, 1, 0, 1),
                new BABYLON.Color4(1, 0, 1, 1),
                new BABYLON.Color4(0, 1, 1, 1)
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
