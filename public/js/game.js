// Attendre que la page soit complètement chargée
window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('renderCanvas');
    const engine = new BABYLON.Engine(canvas, true);

    // Configuration de la grille
    const GRID_SIZE = 60; // Taille quadruplée
    const CELL_SIZE = 1;
    const WALL_HEIGHT = 1;
    const WALL_PROBABILITY = 0.2; // 20% de chance d'avoir un mur

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
        
        // Configuration de la caméra avec vue plus plongeante
        camera.radius = 15; // Distance augmentée
        camera.heightOffset = 12; // Hauteur augmentée
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

        // Matériaux pour les murs
        const wallMaterial = new BABYLON.StandardMaterial("wallMaterial", scene);
        wallMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4);

        const indestructibleWallMaterial = new BABYLON.StandardMaterial("indestructibleWallMaterial", scene);
        indestructibleWallMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.6);

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
                    wall.visibility = 0; // Mur invisible
                }
                // Murs aléatoires à l'intérieur
                else if (x % 2 === 0 && z % 2 === 0) {
                    // Garder les murs en damier comme dans le jeu original
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
                }
            }
        }

        // Création du joueur avec des faces colorées
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
        player.ellipsoid = new BABYLON.Vector3(0.4, 0.4, 0.4);
        player.ellipsoidOffset = new BABYLON.Vector3(0, 0.4, 0);

        // Attacher la caméra au joueur
        camera.lockedTarget = player;

        // Système de mouvement
        let inputMap = {};
        const ROTATION_SPEED = 0.05;
        const MOVEMENT_SPEED = 0.15;
        
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
