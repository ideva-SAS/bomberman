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

    // ... [Le reste du code jusqu'à la création de la caméra reste identique] ...

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
        let lastMouseX = 0;
        let lastMouseY = 0;

        // Gestionnaires d'événements de la souris
        canvas.addEventListener("mousedown", (evt) => {
            isDragging = true;
            lastMouseX = evt.clientX;
            lastMouseY = evt.clientY;
        });

        canvas.addEventListener("mousemove", (evt) => {
            if (!isDragging) return;

            const deltaX = evt.clientX - lastMouseX;
            const deltaY = evt.clientY - lastMouseY;

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

            lastMouseX = evt.clientX;
            lastMouseY = evt.clientY;
        });

        canvas.addEventListener("mouseup", () => {
            isDragging = false;
        });

        canvas.addEventListener("mouseleave", () => {
            isDragging = false;
        });

        // Double-clic pour réinitialiser la vue
        canvas.addEventListener("dblclick", () => {
            camera.heightOffset = CAMERA_DEFAULT_HEIGHT;
            camera.rotationOffset = CAMERA_DEFAULT_ROTATION;
        });

        // ... [Le reste du code reste identique] ...

        const light = new BABYLON.HemisphericLight(
            "light",
            new BABYLON.Vector3(1, 1, 0),
            scene
        );
        light.intensity = 0.7;

        // ... [Le reste du code reste identique jusqu'à la fin] ...

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
