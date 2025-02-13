export class TerrainMaterials {
    constructor(scene) {
        this.scene = scene;
        this.materials = new Map();
        this._createMaterials();
    }

    _createMaterials() {
        // Herbe stylisée façon LoL
        const grassMaterial = new BABYLON.PBRMaterial("grass", this.scene);
        grassMaterial.albedoTexture = new BABYLON.Texture("/textures/grass/albedo.jpg", this.scene);
        grassMaterial.normalTexture = new BABYLON.Texture("/textures/grass/normal.jpg", this.scene);
        grassMaterial.roughnessTexture = new BABYLON.Texture("/textures/grass/roughness.jpg", this.scene);
        grassMaterial.useAmbientOcclusionFromMetallicTextureRed = true;
        grassMaterial.useRoughnessFromMetallicTextureGreen = true;
        grassMaterial.useMetallnessFromMetallicTextureBlue = true;
        grassMaterial.ambientColor = new BABYLON.Color3(0.2, 0.3, 0.1);
        this.materials.set('grass', grassMaterial);

        // Roche stylisée
        const rockMaterial = new BABYLON.PBRMaterial("rock", this.scene);
        rockMaterial.albedoTexture = new BABYLON.Texture("/textures/rock/albedo.jpg", this.scene);
        rockMaterial.bumpTexture = new BABYLON.Texture("/textures/rock/normal.jpg", this.scene);
        rockMaterial.metallicTexture = new BABYLON.Texture("/textures/rock/metallic.jpg", this.scene);
        rockMaterial.roughness = 0.8;
        rockMaterial.metallic = 0.1;
        this.materials.set('rock', rockMaterial);

        // Sable avec effet brillant
        const sandMaterial = new BABYLON.PBRMaterial("sand", this.scene);
        sandMaterial.albedoTexture = new BABYLON.Texture("/textures/sand/albedo.jpg", this.scene);
        sandMaterial.bumpTexture = new BABYLON.Texture("/textures/sand/normal.jpg", this.scene);
        sandMaterial.roughness = 0.6;
        sandMaterial.metallic = 0.1;
        this.materials.set('sand', sandMaterial);

        // Eau avec réflexions et réfractions
        const waterMaterial = new BABYLON.WaterMaterial("water", this.scene);
        waterMaterial.bumpTexture = new BABYLON.Texture("/textures/water/normal.jpg", this.scene);
        waterMaterial.windForce = 0.5;
        waterMaterial.waveHeight = 0.1;
        waterMaterial.bumpHeight = 0.3;
        waterMaterial.windDirection = new BABYLON.Vector2(1, 1);
        waterMaterial.waterColor = new BABYLON.Color3(0.1, 0.3, 0.5);
        waterMaterial.colorBlendFactor = 0.2;
        this.materials.set('water', waterMaterial);

        // Lave avec effet de glow
        const lavaMaterial = new BABYLON.PBRMaterial("lava", this.scene);
        lavaMaterial.albedoTexture = new BABYLON.Texture("/textures/lava/albedo.jpg", this.scene);
        lavaMaterial.emissiveTexture = new BABYLON.Texture("/textures/lava/emissive.jpg", this.scene);
        lavaMaterial.emissiveColor = new BABYLON.Color3(1, 0.3, 0);
        lavaMaterial.roughness = 1;
        this.materials.set('lava', lavaMaterial);
    }

    getMaterial(type) {
        return this.materials.get(type);
    }
}
