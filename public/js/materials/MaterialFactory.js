export class MaterialFactory {
    constructor(scene) {
        this.scene = scene;
        this._loadTextures();
    }

    _loadTextures() {
        // Textures pour le dessus du sol (style pierre taillée)
        this.groundTopTextures = {
            albedo: new BABYLON.Texture("assets/textures/ground/stone_tiles/diffuse.jpg", this.scene),
            normal: new BABYLON.Texture("assets/textures/ground/stone_tiles/normal.jpg", this.scene),
            roughness: new BABYLON.Texture("assets/textures/ground/stone_tiles/roughness.jpg", this.scene),
            ao: new BABYLON.Texture("assets/textures/ground/stone_tiles/ao.jpg", this.scene)
        };

        // Textures pour les côtés du sol (style terre)
        this.groundSideTextures = {
            albedo: new BABYLON.Texture("assets/textures/ground/dirt/diffuse.jpg", this.scene),
            normal: new BABYLON.Texture("assets/textures/ground/dirt/normal.jpg", this.scene),
            roughness: new BABYLON.Texture("assets/textures/ground/dirt/roughness.jpg", this.scene),
            ao: new BABYLON.Texture("assets/textures/ground/dirt/ao.jpg", this.scene)
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
        [this.stoneTextures, this.woodTextures].forEach(textures => {
            Object.values(textures).forEach(texture => {
                texture.uScale = 1;  // Réduit pour éviter la répétition
                texture.vScale = 1;
            });
        });
    }

    createGroundMaterial() {
        const material = new BABYLON.StandardMaterial("groundMaterial", this.scene);
        material.diffuseColor = new BABYLON.Color3(0.4, 0.8, 0.4); // Vert pour l'herbe
        return material;
    }

    createIndestructibleWallMaterial() {
        const material = new BABYLON.StandardMaterial("indestructibleWallMaterial", this.scene);
        material.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2); // Gris foncé
        return material;
    }

    createDestructibleWallMaterial() {
        const material = new BABYLON.StandardMaterial("destructibleWallMaterial", this.scene);
        material.diffuseColor = new BABYLON.Color3(0.6, 0.4, 0.2); // Marron
        return material;
    }

    createInvisibleMaterial() {
        const material = new BABYLON.StandardMaterial("invisibleMat", this.scene);
        material.alpha = 0;
        material.backFaceCulling = false;
        return material;
    }
}
