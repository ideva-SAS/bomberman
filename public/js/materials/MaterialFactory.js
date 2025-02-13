export class MaterialFactory {
    constructor(scene) {
        this.scene = scene;
    }

    createGroundMaterial() {
        const material = new BABYLON.StandardMaterial("groundMat", this.scene);
        material.diffuseColor = new BABYLON.Color3(0.2, 0.5, 0.1);
        material.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        material.specularPower = 64;
        material.backFaceCulling = false;
        return material;
    }

    createIndestructibleWallMaterial() {
        const material = new BABYLON.StandardMaterial("indestructibleWallMat", this.scene);
        material.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.45);
        material.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        material.specularPower = 32;
        material.backFaceCulling = false;
        return material;
    }

    createDestructibleWallMaterial() {
        const material = new BABYLON.StandardMaterial("destructibleWallMat", this.scene);
        material.diffuseColor = new BABYLON.Color3(0.6, 0.3, 0.1);
        material.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        material.specularPower = 16;
        material.backFaceCulling = false;
        return material;
    }

    createInvisibleMaterial() {
        const material = new BABYLON.StandardMaterial("invisibleMat", this.scene);
        material.alpha = 0;
        material.backFaceCulling = false;
        return material;
    }
}
