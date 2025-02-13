import { BOMB_CONFIG, GRID_CONFIG } from '../config/gameConfig.js';

export class Bomb {
    constructor(scene, position, onExplode) {
        this.scene = scene;
        this.position = position;
        this.onExplode = onExplode;
        this.mesh = this._createBombMesh();
        this._startTimer();
        this._animatePulse();
    }

    _createBombMesh() {
        const bomb = BABYLON.MeshBuilder.CreateSphere("bomb", {
            diameter: BOMB_CONFIG.DIAMETER
        }, this.scene);
        
        bomb.position = this.position;
        const bombMaterial = new BABYLON.StandardMaterial("bombMaterial", this.scene);
        bombMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        bomb.material = bombMaterial;
        
        return bomb;
    }

    _animatePulse() {
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
        this.mesh.animations = [pulseAnimation];
        this.scene.beginAnimation(this.mesh, 0, 30, true);
    }

    _startTimer() {
        setTimeout(() => {
            this.explode();
        }, BOMB_CONFIG.TIMER);
    }

    explode() {
        this.onExplode(this.position, BOMB_CONFIG.EXPLOSION_RANGE);
        this.mesh.dispose();
    }
}
