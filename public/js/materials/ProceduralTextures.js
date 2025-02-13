export class ProceduralTextures {
    constructor(scene) {
        this.scene = scene;
        this.textures = new Map();
        this._createTextures();
    }

    _createTextures() {
        // Texture d'herbe procédurale
        const grassTexture = new BABYLON.ProceduralTexture("grassProc", 512, "grass", this.scene);
        grassTexture.setFragment(`
            precision highp float;
            varying vec2 vPosition;
            varying vec2 vUV;
            uniform float time;

            float rand(vec2 n) { 
                return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
            }

            void main() {
                vec2 pos = vUV * 20.0;
                vec3 color = vec3(0.2, 0.5, 0.1);  // Base grass color
                
                // Add variation
                float noise = rand(pos);
                color += vec3(noise * 0.1);
                
                // Add darker patches
                float darkPatch = smoothstep(0.4, 0.6, noise);
                color *= 0.8 + (darkPatch * 0.4);
                
                // Add highlights
                float highlight = pow(noise, 10.0);
                color += vec3(highlight * 0.2);
                
                gl_FragColor = vec4(color, 1.0);
            }
        `);
        this.textures.set('grass', grassTexture);

        // Texture de roche procédurale
        const rockTexture = new BABYLON.ProceduralTexture("rockProc", 512, "custom", this.scene);
        rockTexture.setFragment(`
            precision highp float;
            varying vec2 vPosition;
            varying vec2 vUV;

            float noise(vec2 p) {
                return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
            }

            void main() {
                vec2 pos = vUV * 8.0;
                float n = noise(pos);
                
                // Create rock-like patterns
                float pattern = 0.0;
                for(float i = 1.0; i < 8.0; i++) {
                    pattern += noise(pos * i) / i;
                }
                
                vec3 color = vec3(0.5) + vec3(pattern * 0.3);
                gl_FragColor = vec4(color, 1.0);
            }
        `);
        this.textures.set('rock', rockTexture);

        // Texture de lave procédurale
        const lavaTexture = new BABYLON.ProceduralTexture("lavaProc", 512, "custom", this.scene);
        lavaTexture.setFragment(`
            precision highp float;
            varying vec2 vPosition;
            varying vec2 vUV;
            uniform float time;

            void main() {
                vec2 pos = vUV * 3.0;
                float t = time * 0.1;
                
                // Create flowing lava effect
                float pattern = sin(pos.x * 10.0 + t) * 0.5 + 0.5;
                pattern *= sin(pos.y * 8.0 - t * 2.0) * 0.5 + 0.5;
                
                vec3 color1 = vec3(1.0, 0.2, 0.0);  // Orange
                vec3 color2 = vec3(0.7, 0.0, 0.0);  // Dark red
                
                vec3 finalColor = mix(color2, color1, pattern);
                
                // Add glow
                finalColor += vec3(0.2, 0.0, 0.0) * sin(time * 2.0);
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `);
        this.textures.set('lava', lavaTexture);

        // Texture d'eau procédurale
        const waterTexture = new BABYLON.ProceduralTexture("waterProc", 512, "custom", this.scene);
        waterTexture.setFragment(`
            precision highp float;
            varying vec2 vPosition;
            varying vec2 vUV;
            uniform float time;

            void main() {
                vec2 pos = vUV * 5.0;
                float t = time * 0.05;
                
                // Create water waves
                float wave1 = sin(pos.x * 10.0 + t) * 0.5 + 0.5;
                float wave2 = sin(pos.y * 8.0 - t * 1.5) * 0.5 + 0.5;
                float waves = (wave1 + wave2) * 0.5;
                
                vec3 waterColor = vec3(0.0, 0.3, 0.5);
                vec3 highlight = vec3(0.3, 0.5, 0.7);
                
                vec3 finalColor = mix(waterColor, highlight, waves);
                
                // Add sparkles
                float sparkle = pow(waves, 8.0);
                finalColor += vec3(sparkle * 0.5);
                
                gl_FragColor = vec4(finalColor, 0.9);
            }
        `);
        this.textures.set('water', waterTexture);
    }

    getTexture(type) {
        return this.textures.get(type);
    }

    dispose() {
        this.textures.forEach(texture => texture.dispose());
    }
}
