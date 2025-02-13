export class Explosion {
    constructor(scene, position, range, onComplete) {
        this.scene = scene;
        this.position = position;
        this.range = range;
        this.onComplete = onComplete;
        this.mesh = this._createExplosionMesh();
        this._animate();
        this._processExplosionImmediately();
    }

    _createExplosionMesh() {
        const explosion = BABYLON.MeshBuilder.CreateSphere("explosion", {
            diameter: 1
        }, this.scene);
        
        explosion.position = this.position;
        const explosionMaterial = new BABYLON.StandardMaterial("explosionMat", this.scene);
        explosionMaterial.emissiveColor = new BABYLON.Color3(1, 0.3, 0);
        explosionMaterial.alpha = 0.8;
        explosion.material = explosionMaterial;
        
        return explosion;
    }

    _animate() {
        const anim = new BABYLON.Animation(
            "explosionAnim",
            "scaling",
            60,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        const keys = [
            { frame: 0, value: new BABYLON.Vector3(0.1, 0.1, 0.1) },
            { frame: 30, value: new BABYLON.Vector3(this.range, this.range, this.range) },
            { frame: 60, value: new BABYLON.Vector3(0.1, 0.1, 0.1) }
        ];

        anim.setKeys(keys);
        this.mesh.animations = [anim];

        this.scene.beginAnimation(this.mesh, 0, 60, false, 1, () => {
            this.mesh.dispose();
        });
    }

    _processExplosionImmediately() {
        if (this.onComplete) {
            this.onComplete();
        }
    }
}
