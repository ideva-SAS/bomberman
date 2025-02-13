import { CAMERA_CONFIG } from '../config/gameConfig.js';

export class CameraController {
    constructor(scene, canvas) {
        this.scene = scene;
        this.canvas = canvas;
        this.isDragging = false;
        this.lastX = 0;
        this.lastY = 0;
        this.camera = this._createCamera();
        this.setupControls();
    }

    _createCamera() {
        const camera = new BABYLON.FollowCamera(
            "followCam",
            new BABYLON.Vector3(0, 0, 0),
            this.scene
        );
        
        camera.radius = CAMERA_CONFIG.RADIUS;
        camera.heightOffset = CAMERA_CONFIG.DEFAULT_HEIGHT;
        camera.rotationOffset = CAMERA_CONFIG.DEFAULT_ROTATION;
        camera.cameraAcceleration = CAMERA_CONFIG.ACCELERATION;
        camera.maxCameraSpeed = CAMERA_CONFIG.MAX_SPEED;

        return camera;
    }

    setupControls() {
        this.canvas.addEventListener("pointerdown", (evt) => {
            this.isDragging = true;
            this.lastX = evt.clientX;
            this.lastY = evt.clientY;
            this.canvas.setPointerCapture(evt.pointerId);
        });

        this.canvas.addEventListener("pointermove", (evt) => {
            if (!this.isDragging) return;
            this._handleCameraMovement(evt.clientX, evt.clientY);
        });

        this.canvas.addEventListener("pointerup", (evt) => {
            this.isDragging = false;
            this.canvas.releasePointerCapture(evt.pointerId);
        });

        this.canvas.addEventListener("pointercancel", (evt) => {
            this.isDragging = false;
            this.canvas.releasePointerCapture(evt.pointerId);
        });

        // Double-clic pour réinitialiser
        let lastClickTime = 0;
        this.canvas.addEventListener("click", (evt) => {
            const currentTime = new Date().getTime();
            const clickLength = currentTime - lastClickTime;
            if (clickLength < 300 && clickLength > 0) {
                this.resetCamera();
                evt.preventDefault();
            }
            lastClickTime = currentTime;
        });
    }

    _handleCameraMovement(currentX, currentY) {
        const deltaX = (currentX - this.lastX) * 0.5;
        const deltaY = (currentY - this.lastY) * 0.5;

        // Ajuster la rotation horizontale
        this.camera.rotationOffset += deltaX * CAMERA_CONFIG.SENSITIVITY;
        this.camera.rotationOffset = Math.max(
            CAMERA_CONFIG.MIN_ROTATION,
            Math.min(CAMERA_CONFIG.MAX_ROTATION, this.camera.rotationOffset)
        );

        // Ajuster la hauteur
        this.camera.heightOffset -= deltaY * CAMERA_CONFIG.SENSITIVITY;
        this.camera.heightOffset = Math.max(
            CAMERA_CONFIG.MIN_HEIGHT,
            Math.min(CAMERA_CONFIG.MAX_HEIGHT, this.camera.heightOffset)
        );

        this.lastX = currentX;
        this.lastY = currentY;
    }

    resetCamera() {
        this.camera.heightOffset = CAMERA_CONFIG.DEFAULT_HEIGHT;
        this.camera.rotationOffset = CAMERA_CONFIG.DEFAULT_ROTATION;
    }

    setTarget(target) {
        this.camera.lockedTarget = target;
    }

    getCamera() {
        return this.camera;
    }
}
