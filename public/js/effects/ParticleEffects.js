export class ParticleEffects {
    constructor(scene) {
        this.scene = scene;
        this.systems = new Map();
    }

    createExplosionEffect(position) {
        const explosionSystem = new BABYLON.ParticleSystem("explosion", 2000, this.scene);
        explosionSystem.particleTexture = new BABYLON.Texture("textures/flare.png", this.scene);
        
        // Position
        explosionSystem.emitter = position;
        
        // Propriétés des particules
        explosionSystem.color1 = new BABYLON.Color4(1, 0.5, 0, 1.0);
        explosionSystem.color2 = new BABYLON.Color4(1, 0.2, 0, 1.0);
        explosionSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0.0);
        
        explosionSystem.minSize = 0.3;
        explosionSystem.maxSize = 0.8;
        
        explosionSystem.minLifeTime = 0.2;
        explosionSystem.maxLifeTime = 0.4;
        
        explosionSystem.emitRate = 2000;
        
        explosionSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
        
        explosionSystem.gravity = new BABYLON.Vector3(0, 8, 0);
        explosionSystem.direction1 = new BABYLON.Vector3(-1, 8, -1);
        explosionSystem.direction2 = new BABYLON.Vector3(1, 8, 1);
        
        explosionSystem.minAngularSpeed = 0;
        explosionSystem.maxAngularSpeed = Math.PI;
        
        explosionSystem.minEmitPower = 1;
        explosionSystem.maxEmitPower = 3;
        explosionSystem.updateSpeed = 0.02;
        
        // Démarrer l'effet
        explosionSystem.start();
        
        // Arrêter après 0.2 secondes
        setTimeout(() => {
            explosionSystem.stop();
            setTimeout(() => explosionSystem.dispose(), 1000);
        }, 200);
    }

    createLavaEffect(position) {
        const lavaSystem = new BABYLON.ParticleSystem("lava", 1000, this.scene);
        lavaSystem.particleTexture = new BABYLON.Texture("textures/flare.png", this.scene);
        
        lavaSystem.emitter = position;
        
        lavaSystem.color1 = new BABYLON.Color4(1, 0.3, 0, 1.0);
        lavaSystem.color2 = new BABYLON.Color4(0.7, 0.1, 0, 1.0);
        lavaSystem.colorDead = new BABYLON.Color4(0.2, 0, 0, 0.0);
        
        lavaSystem.minSize = 0.1;
        lavaSystem.maxSize = 0.3;
        
        lavaSystem.minLifeTime = 1;
        lavaSystem.maxLifeTime = 2;
        
        lavaSystem.emitRate = 100;
        
        lavaSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
        
        lavaSystem.gravity = new BABYLON.Vector3(0, 1, 0);
        
        lavaSystem.minAngularSpeed = 0;
        lavaSystem.maxAngularSpeed = Math.PI;
        
        lavaSystem.minEmitPower = 0.5;
        lavaSystem.maxEmitPower = 1;
        
        lavaSystem.start();
        
        return lavaSystem;
    }

    createWaterEffect(position) {
        const waterSystem = new BABYLON.ParticleSystem("water", 1000, this.scene);
        waterSystem.particleTexture = new BABYLON.Texture("textures/flare.png", this.scene);
        
        waterSystem.emitter = position;
        
        waterSystem.color1 = new BABYLON.Color4(0.3, 0.5, 1.0, 0.8);
        waterSystem.color2 = new BABYLON.Color4(0.4, 0.6, 1.0, 0.8);
        waterSystem.colorDead = new BABYLON.Color4(0.3, 0.4, 0.7, 0.0);
        
        waterSystem.minSize = 0.05;
        waterSystem.maxSize = 0.2;
        
        waterSystem.minLifeTime = 1;
        waterSystem.maxLifeTime = 2;
        
        waterSystem.emitRate = 100;
        
        waterSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
        
        waterSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);
        waterSystem.direction1 = new BABYLON.Vector3(-0.5, 1, -0.5);
        waterSystem.direction2 = new BABYLON.Vector3(0.5, 1, 0.5);
        
        waterSystem.minAngularSpeed = 0;
        waterSystem.maxAngularSpeed = Math.PI;
        
        waterSystem.minEmitPower = 1;
        waterSystem.maxEmitPower = 2;
        
        waterSystem.start();
        
        return waterSystem;
    }

    createMagicEffect(position) {
        const magicSystem = new BABYLON.ParticleSystem("magic", 1000, this.scene);
        magicSystem.particleTexture = new BABYLON.Texture("textures/flare.png", this.scene);
        
        magicSystem.emitter = position;
        
        magicSystem.color1 = new BABYLON.Color4(0.8, 0.3, 1.0, 1.0);
        magicSystem.color2 = new BABYLON.Color4(0.4, 0.2, 1.0, 1.0);
        magicSystem.colorDead = new BABYLON.Color4(0.1, 0.1, 0.4, 0.0);
        
        magicSystem.minSize = 0.1;
        magicSystem.maxSize = 0.3;
        
        magicSystem.minLifeTime = 0.5;
        magicSystem.maxLifeTime = 1;
        
        magicSystem.emitRate = 100;
        
        magicSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
        
        magicSystem.gravity = new BABYLON.Vector3(0, 0, 0);
        
        magicSystem.minAngularSpeed = 0;
        magicSystem.maxAngularSpeed = Math.PI * 2;
        
        // Mouvement en spirale
        magicSystem.updateFunction = function(particles) {
            for (var index = 0; index < particles.length; index++) {
                var particle = particles[index];
                particle.age += this._scaledUpdateSpeed;
                
                if (particle.age >= particle.lifeTime) {
                    particles.splice(index, 1);
                    index--;
                    continue;
                }
                
                const scale = particle.age / particle.lifeTime;
                const radius = 1 - scale;
                const angle = scale * Math.PI * 4;
                
                particle.position.x = Math.cos(angle) * radius;
                particle.position.z = Math.sin(angle) * radius;
                particle.position.y += 0.01;
                
                particle.color.r *= 0.99;
                particle.color.g *= 0.99;
                particle.color.b *= 0.99;
            }
        };
        
        magicSystem.start();
        
        return magicSystem;
    }
}
