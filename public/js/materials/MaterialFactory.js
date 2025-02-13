export class MaterialFactory {
    constructor(scene) {
        this.scene = scene;
        this._loadTextures();
    }

    _loadTextures() {
        // Textures pour le sol (style arène fantasy)
        this.groundTextures = {
            albedo: new BABYLON.Texture("assets/textures/ground/stone_tiles/diffuse.jpg", this.scene),
            normal: new BABYLON.Texture("assets/textures/ground/stone_tiles/normal.jpg", this.scene),
            roughness: new BABYLON.Texture("assets/textures/ground/stone_tiles/roughness.jpg", this.scene),
            ao: new BABYLON.Texture("assets/textures/ground/stone_tiles/ao.jpg", this.scene)
        };

        // Textures pour les murs indestructibles (pierre ancienne)
        this.stoneTextures = {
            albedo: new BABYLON.Texture("assets/textures/walls/ancient_stone/diffuse.jpg", this.scene),
            normal: new BABYLON.Texture("assets/textures/walls/ancient_stone/normal.jpg", this.scene),
            roughness: new BABYLON.Texture("assets/textures/walls/ancient_stone/roughness.jpg", this.scene),
            ao: new BABYLON.Texture("assets/textures/walls/ancient_stone/ao.jpg", this.scene)
        };

        // Textures pour les murs destructibles (bois)
        this.woodTextures = {
            albedo: new BABYLON.Texture("assets/textures/walls/wooden_barrier/diffuse.jpg", this.scene),
            normal: new BABYLON.Texture("assets/textures/walls/wooden_barrier/normal.jpg", this.scene),
            roughness: new BABYLON.Texture("assets/textures/walls/wooden_barrier/roughness.jpg", this.scene),
            ao: new BABYLON.Texture("assets/textures/walls/wooden_barrier/ao.jpg", this.scene)
        };

        // Configuration des textures
        [this.groundTextures, this.stoneTextures, this.woodTextures].forEach(textures => {
            Object.values(textures).forEach(texture => {
                texture.uScale = 1;  // Réduit pour éviter la répétition
                texture.vScale = 1;
            });
        });
    }

    createGroundMaterial() {
        const material = new BABYLON.PBRMaterial("groundMat", this.scene);
        
        // Application des textures du sol
        material.albedoTexture = this.groundTextures.albedo;
        material.bumpTexture = this.groundTextures.normal;
        material.ambientOcclusionTexture = this.groundTextures.ao;
        material.roughnessTexture = this.groundTextures.roughness;
        
        material.metallic = 0;
        material.roughness = 1;
        material.useAmbientOcclusionFromMetallicTextureRed = true;
        material.useRoughnessFromMetallicTextureGreen = true;
        material.useMetallnessFromMetallicTextureBlue = true;
        
        material.backFaceCulling = false;
        return material;
    }

    createIndestructibleWallMaterial() {
        const material = new BABYLON.PBRMaterial("indestructibleWallMat", this.scene);
        
        // Application des textures des murs indestructibles
        material.albedoTexture = this.stoneTextures.albedo;
        material.bumpTexture = this.stoneTextures.normal;
        material.ambientOcclusionTexture = this.stoneTextures.ao;
        material.roughnessTexture = this.stoneTextures.roughness;
        
        material.metallic = 0;
        material.roughness = 0.9;
        material.useAmbientOcclusionFromMetallicTextureRed = true;
        material.useRoughnessFromMetallicTextureGreen = true;
        material.useMetallnessFromMetallicTextureBlue = true;
        
        // Ajout d'une teinte légèrement bleutée pour un aspect plus froid
        material.albedoColor = new BABYLON.Color3(0.9, 0.9, 1.0);
        
        material.backFaceCulling = false;
        return material;
    }

    createDestructibleWallMaterial() {
        const material = new BABYLON.PBRMaterial("destructibleWallMat", this.scene);
        
        // Application des textures des murs destructibles
        material.albedoTexture = this.woodTextures.albedo;
        material.bumpTexture = this.woodTextures.normal;
        material.ambientOcclusionTexture = this.woodTextures.ao;
        material.roughnessTexture = this.woodTextures.roughness;
        
        material.metallic = 0;
        material.roughness = 0.8;
        material.useAmbientOcclusionFromMetallicTextureRed = true;
        material.useRoughnessFromMetallicTextureGreen = true;
        material.useMetallnessFromMetallicTextureBlue = true;
        
        // Ajout d'une teinte légèrement chaude pour le bois
        material.albedoColor = new BABYLON.Color3(1.0, 0.95, 0.9);
        
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
