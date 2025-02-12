// Attendre que la page soit complètement chargée
window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('renderCanvas');
    const engine = new BABYLON.Engine(canvas, true);

    // Configuration de la grille
    const GRID_SIZE = 60;
    const CELL_SIZE = 1;
    const WALL_HEIGHT = 1;
    const WALL_PROBABILITY = 0.2;
    const BOMB_TIMER = 3000; // 3 secondes avant explosion
    const EXPLOSION_DURATION = 1000; // 1 seconde d'animation d'explosion
    const EXPLOSION_RANGE = 3; // Portée de l'explosion

    const createScene = () => {
        // Création de la scène
        const scene = new BABYLON.Scene(engine);
        scene.collisionsEnabled = true;
        scene.clearColor = new BABYLON.Color4(0.2, 0.2, 0.3, 1);

        // Création de la caméra
        const camera = new BABYLON.FollowCamera(
            "followCam",
            new BABYLON.Vector3(0, 0, 0),
            scene
        );
        
        // Configuration de la caméra
        camera.radius = 15;
        camera.heightOffset = 12;
        camera.rotationOffset = 180;
        camera.cameraAcceleration = 0.05;
        camera.maxCameraSpeed = 10;
        camera.inputs.clear();

        // Création de la lumière
        const light = new BABYLON.HemisphericLight(
            "light",
            new BABYLON.Vector3(1, 1, 0),
            scene
        );
        light.intensity = 0.7;

        // Création du sol
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

        // Matériaux pour les murs et les bombes
        const wallMaterial = new BABYLON.StandardMaterial("wallMaterial", scene);
        wallMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4);

        const indestructibleWallMaterial = new BABYLON.StandardMaterial("indestructibleWallMaterial", scene);
        indestructibleWallMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.6);

        const bombMaterial = new BABYLON.StandardMaterial("bombMaterial", scene);
        bombMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);

        // Structure pour stocker les murs
        const walls = new Map();

        // Création des murs
        for (let x = 0; x < GRID_SIZE; x++) {
            for (let z = 0; z < GRID_SIZE; z++) {
                // Murs invisibles sur les bords
                if (x === 0 || x === GRID_SIZE - 1 || z === 0 || z === GRID_SIZE - 1) {
                    const wall = BABYLON.MeshBuilder.CreateBox("wall", {
                        height: WALL_HEIGHT,
                        width: CELL_SIZE,
                        depth: CELL_SIZE
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
                // Murs indestructibles en damier
                else if (x % 2 === 0 && z % 2 === 0) {
                    const wall = BABYLON.MeshBuilder.CreateBox("wall", {
                        height: WALL_HEIGHT,
                        width: CELL_SIZE,
                        depth: CELL_SIZE
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
                // Murs destructibles aléatoires
                else if (Math.random() < WALL_PROBABILITY) {
                    const wall = BABYLON.MeshBuilder.CreateBox("wall", {
                        height: WALL_HEIGHT,
                        width: CELL_SIZE,
                        depth: CELL_SIZE
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

        // Création du joueur avec des faces colorées
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
        player.ellipsoid = new BABYLON.Vector3(0.4, 0.4, 0.4);
        player.ellipsoidOffset = new BABYLON.Vector3(0, 0.4, 0);

        // Attacher la caméra au joueur
        camera.lockedTarget = player;

        // Système de mouvement et bombes
        let inputMap = {};
        const ROTATION_SPEED = 0.05;
        const MOVEMENT_SPEED = 0.15;
        let canPlaceBomb = true;
        
        // Fonction pour obtenir les coordonnées de grille
        const getGridPosition = (position) => {
            const x = Math.round(position.x + GRID_SIZE/2 - CELL_SIZE/2);
            const z = Math.round(position.z + GRID_SIZE/2 - CELL_SIZE/2);
            return { x, z };
        };

        // Fonction pour créer une explosion
        const createExplosion = (position, range) => {
            // Créer l'animation d'explosion
            const explosion = BABYLON.MeshBuilder.CreateSphere("explosion", {
                diameter: 1
            }, scene);
            explosion.position = position;
            
            const explosionMaterial = new BABYLON.StandardMaterial("explosionMat", scene);
            explosionMaterial.emissiveColor = new BABYLON.Color3(1, 0.3, 0);
            explosion.material = explosionMaterial;

            // Animation de l'explosion
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

            // Démarrer l'animation
            scene.beginAnimation(explosion, 0, 60, false, 1, () => {
                explosion.dispose();
            });

            // Vérifier les collisions avec les murs
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

        // Fonction pour placer une bombe
        const placeBomb = () => {
            if (!canPlaceBomb) return;
            
            canPlaceBomb = false;
            const gridPos = getGridPosition(player.position);
            
            // Créer la bombe
            const bomb = BABYLON.MeshBuilder.CreateSphere("bomb", {
                diameter: 0.8
            }, scene);
            
            bomb.position = new BABYLON.Vector3(
                gridPos.x - GRID_SIZE/2 + CELL_SIZE/2,
                0.4,
                gridPos.z - GRID_SIZE/2 + CELL_SIZE/2
            );
            bomb.material = bombMaterial;

            // Animation de pulsation
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

            // Minuteur de la bombe
            setTimeout(() => {
                createExplosion(bomb.position, EXPLOSION_RANGE);
                bomb.dispose();
                
                // Réactiver la possibilité de poser une bombe
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

        // Mise à jour du mouvement
        scene.registerBeforeRender(() => {
            // Rotation
            if (inputMap["ArrowLeft"]) {
                player.rotation.y -= ROTATION_SPEED;
            }
            if (inputMap["ArrowRight"]) {
                player.rotation.y += ROTATION_SPEED;
            }

            // Mouvement avant/arrière
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

            // Poser une bombe avec la touche espace
            if (inputMap[" "]) {
                placeBomb();
                inputMap[" "] = false; // Éviter les poses multiples
            }

            // Maintenir la hauteur Y constante
            player.position.y = 0.4;
        });

        return scene;
    };

    const scene = createScene();

    // Boucle de rendu
    engine.runRenderLoop(() => {
        scene.render();
    });

    // Gestion du redimensionnement
    window.addEventListener('resize', () => {
        engine.resize();
    });
});
