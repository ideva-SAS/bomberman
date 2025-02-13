import { CAMERA_CONFIG } from '../config/gameConfig.js';

export class GameCamera {
    constructor(scene, canvas, target) {
        this.camera = new BABYLON.ArcRotateCamera(
            "gameCamera",
            CAMERA_CONFIG.DEFAULT_ALPHA,
            CAMERA_CONFIG.DEFAULT_BETA,
            CAMERA_CONFIG.RADIUS,
            target,
            scene
        );

        // Configuration de base de la caméra
        this.camera.setPosition(new BABYLON.Vector3(
            -CAMERA_CONFIG.RADIUS * Math.cos(CAMERA_CONFIG.DEFAULT_BETA) * Math.cos(CAMERA_CONFIG.DEFAULT_ALPHA),
            CAMERA_CONFIG.RADIUS * Math.sin(CAMERA_CONFIG.DEFAULT_BETA),
            -CAMERA_CONFIG.RADIUS * Math.cos(CAMERA_CONFIG.DEFAULT_BETA) * Math.sin(CAMERA_CONFIG.DEFAULT_ALPHA)
        ));

        // Paramètres de la caméra
        this.camera.lowerBetaLimit = CAMERA_CONFIG.LOWER_BETA_BOUND;
        this.camera.upperBetaLimit = CAMERA_CONFIG.UPPER_BETA_BOUND;
        this.camera.fov = CAMERA_CONFIG.FOV;
        this.camera.minZ = CAMERA_CONFIG.MIN_Z;
        this.camera.maxZ = CAMERA_CONFIG.MAX_Z;

        // Attacher la caméra au canvas
        this.camera.attachControl(canvas, true);

        // Désactiver le zoom de la molette
        this.camera.inputs.removeByType('ArcRotateCameraMouseWheelInput');

        // Désactiver le pan avec le clic droit
        this.camera.inputs.removeByType('ArcRotateCameraPointersInput');
        
        // Réactiver uniquement la rotation avec le clic gauche
        const pointerInput = new BABYLON.ArcRotateCameraPointersInput();
        pointerInput.buttons = [0]; // 0 = clic gauche uniquement
        this.camera.inputs.add(pointerInput);
    }

    setTarget(target) {
        this.camera.setTarget(target);
    }

    getPosition() {
        return this.camera.position;
    }

    dispose() {
        if (this.camera) {
            this.camera.dispose();
        }
    }
}
