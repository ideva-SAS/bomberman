import { TerrainMaterials } from '../materials/TerrainMaterials.js';
import { CustomShaders } from '../shaders/CustomShaders.js';

export class TerrainGenerator {
    constructor(scene) {
        this.scene = scene;
        this.materials = new TerrainMaterials(scene);
        CustomShaders.registerShaders(scene);
        this.grassMaterial = CustomShaders.createGrassMaterial(scene);
        this.waterMaterial = CustomShaders.createWaterMaterial(scene);
    }

    createGround(width, height) {
        // Création du terrain de base avec une heightmap procédurale
        const ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap("ground", 
            "heightmap", {
                width: width,
                height: height,
                subdivisions: 100,
                minHeight: 0,
                maxHeight: 2,
                onReady: (mesh) => {
                    this._applyTerrainMaterials(mesh);
                }
            },
            this.scene
        );

        return ground;
    }

    _applyTerrainMaterials(ground) {
        // Création d'une texture de mélange pour les différents matériaux
        const blendTexture = new BABYLON.DynamicTexture("blendTexture", {width: 1024, height: 1024}, this.scene);
        const blendContext = blendTexture.getContext();

        // Génération procédurale de la texture de mélange
        const imageData = blendContext.createImageData(1024, 1024);
        for (let i = 0; i < imageData.data.length; i += 4) {
            const x = (i/4) % 1024;
            const y = Math.floor((i/4) / 1024);
            
            // Utilisation de bruit de Perlin pour créer des transitions naturelles
            const noise = this._perlinNoise(x/100, y/100);
            const noise2 = this._perlinNoise((x+50)/150, (y+50)/150);
            
            imageData.data[i] = noise * 255;     // Canal R pour l'herbe
            imageData.data[i+1] = noise2 * 255;  // Canal G pour la roche
            imageData.data[i+2] = 0;             // Canal B pour le sable
            imageData.data[i+3] = 255;           // Alpha
        }
        
        blendContext.putImageData(imageData, 0, 0);
        blendTexture.update();

        // Application des matériaux avec mélange
        const terrainMaterial = new BABYLON.StandardMaterial("terrainMat", this.scene);
        terrainMaterial.diffuseTexture = blendTexture;
        terrainMaterial.bumpTexture = new BABYLON.Texture("textures/terrain_normal.jpg", this.scene);
        terrainMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

        ground.material = terrainMaterial;

        // Ajout d'effets de post-processing pour un rendu plus stylisé
        const pipeline = new BABYLON.DefaultRenderingPipeline(
            "defaultPipeline", 
            true, 
            this.scene,
            [this.scene.activeCamera]
        );

        // Configuration des effets
        pipeline.imageProcessing.contrast = 1.2;
        pipeline.imageProcessing.exposure = 1.1;
        pipeline.bloom.enabled = true;
        pipeline.bloom.threshold = 0.8;
        pipeline.bloom.weight = 0.3;
        pipeline.bloom.kernel = 64;

        // Ajout d'un effet de profondeur de champ subtil
        pipeline.depthOfField.enabled = true;
        pipeline.depthOfField.focalLength = 150;
        pipeline.depthOfField.fStop = 1.4;
        pipeline.depthOfField.focusDistance = 2000;
    }

    _perlinNoise(x, y) {
        // Implémentation simplifiée du bruit de Perlin
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        
        x -= Math.floor(x);
        y -= Math.floor(y);
        
        const u = this._fade(x);
        const v = this._fade(y);
        
        const A = this._p[X] + Y;
        const B = this._p[X + 1] + Y;
        
        return this._lerp(v,
            this._lerp(u, 
                this._grad(this._p[A], x, y),
                this._grad(this._p[B], x-1, y)
            ),
            this._lerp(u,
                this._grad(this._p[A+1], x, y-1),
                this._grad(this._p[B+1], x-1, y-1)
            )
        );
    }

    _fade(t) { 
        return t * t * t * (t * (t * 6 - 15) + 10); 
    }

    _lerp(t, a, b) { 
        return a + t * (b - a); 
    }

    _grad(hash, x, y) {
        const h = hash & 15;
        const grad = 1 + (h & 7);
        return ((h & 8) ? -grad : grad) * x + ((h & 4) ? -grad : grad) * y;
    }

    // Table de permutation pour le bruit de Perlin
    _p = new Array(512);
    _initPermutation() {
        for(let i=0; i < 256 ; i++) {
            this._p[i] = this._p[256+i] = Math.floor(Math.random() * 256);
        }
    }
}
