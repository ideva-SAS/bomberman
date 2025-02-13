export class CustomShaders {
    static registerShaders(scene) {
        // Shader pour l'herbe animée
        BABYLON.Effect.ShadersStore["grassVertexShader"] = `
            precision highp float;

            // Attributes
            attribute vec3 position;
            attribute vec2 uv;
            attribute vec3 normal;

            // Uniforms
            uniform mat4 worldViewProjection;
            uniform float time;
            uniform float windStrength;

            // Varying
            varying vec2 vUV;
            varying vec3 vNormal;

            void main(void) {
                vec3 pos = position;
                
                // Animation de l'herbe basée sur la hauteur
                if(pos.y > 0.0) {
                    float windEffect = sin(time * 2.0 + position.x * 0.5) * windStrength;
                    pos.x += windEffect * (pos.y / 2.0);
                    pos.z += windEffect * (pos.y / 2.0);
                }

                gl_Position = worldViewProjection * vec4(pos, 1.0);
                vUV = uv;
                vNormal = normal;
            }
        `;

        BABYLON.Effect.ShadersStore["grassFragmentShader"] = `
            precision highp float;

            // Varying
            varying vec2 vUV;
            varying vec3 vNormal;

            // Uniforms
            uniform sampler2D textureSampler;
            uniform vec3 lightDirection;
            uniform vec3 baseColor;

            void main(void) {
                // Échantillonnage de base de la texture
                vec4 textureColor = texture2D(textureSampler, vUV);
                
                // Calcul de l'éclairage de base
                float light = max(dot(vNormal, lightDirection), 0.2);
                
                // Ajout d'une teinte stylisée
                vec3 toonColor = baseColor * textureColor.rgb;
                vec3 finalColor = toonColor * light;
                
                // Ajout d'un contour subtil
                float edge = max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.4);
                finalColor *= edge;

                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;

        // Shader pour l'eau stylisée
        BABYLON.Effect.ShadersStore["waterVertexShader"] = `
            precision highp float;

            // Attributes
            attribute vec3 position;
            attribute vec2 uv;
            attribute vec3 normal;

            // Uniforms
            uniform mat4 worldViewProjection;
            uniform float time;

            // Varying
            varying vec2 vUV;
            varying vec3 vPosition;
            varying vec3 vNormal;

            void main(void) {
                vec3 pos = position;
                
                // Animation des vagues
                float wave = sin(time * 2.0 + position.x * 4.0 + position.z * 4.0) * 0.05;
                pos.y += wave;

                gl_Position = worldViewProjection * vec4(pos, 1.0);
                vUV = uv;
                vPosition = pos;
                vNormal = normal;
            }
        `;

        BABYLON.Effect.ShadersStore["waterFragmentShader"] = `
            precision highp float;

            // Varying
            varying vec2 vUV;
            varying vec3 vPosition;
            varying vec3 vNormal;

            // Uniforms
            uniform float time;
            uniform vec3 waterColor;
            uniform sampler2D reflectionSampler;
            uniform sampler2D refractionSampler;

            void main(void) {
                // Effet de distorsion des vagues
                vec2 distortion = vec2(
                    sin(vPosition.x * 0.02 + time * 0.1) * 0.1,
                    cos(vPosition.z * 0.02 + time * 0.1) * 0.1
                );

                // Mélange des textures de réflexion et réfraction
                vec2 reflectionUV = vUV + distortion;
                vec2 refractionUV = vUV - distortion;
                
                vec4 reflection = texture2D(reflectionSampler, reflectionUV);
                vec4 refraction = texture2D(refractionSampler, refractionUV);

                // Calcul de l'effet Fresnel
                float fresnel = pow(1.0 - max(dot(vNormal, vec3(0.0, 1.0, 0.0)), 0.0), 3.0);

                // Couleur finale
                vec3 finalColor = mix(refraction.rgb, reflection.rgb, fresnel);
                finalColor = mix(finalColor, waterColor, 0.3);

                gl_FragColor = vec4(finalColor, 0.9);
            }
        `;
    }

    static createGrassMaterial(scene) {
        const material = new BABYLON.ShaderMaterial(
            "grassMat",
            scene,
            {
                vertex: "grass",
                fragment: "grass",
            },
            {
                attributes: ["position", "normal", "uv"],
                uniforms: ["world", "worldView", "worldViewProjection", "view", "projection", "time", "windStrength", "baseColor", "lightDirection"]
            }
        );

        // Configuration des paramètres par défaut
        material.setFloat("time", 0);
        material.setFloat("windStrength", 0.1);
        material.setColor3("baseColor", new BABYLON.Color3(0.4, 0.8, 0.3));
        material.setVector3("lightDirection", new BABYLON.Vector3(0.1, 1, 0.3));

        // Animation du temps pour le mouvement de l'herbe
        scene.registerBeforeRender(() => {
            material.setFloat("time", performance.now() * 0.001);
        });

        return material;
    }

    static createWaterMaterial(scene) {
        const material = new BABYLON.ShaderMaterial(
            "waterMat",
            scene,
            {
                vertex: "water",
                fragment: "water",
            },
            {
                attributes: ["position", "normal", "uv"],
                uniforms: ["world", "worldView", "worldViewProjection", "view", "projection", "time", "waterColor"]
            }
        );

        // Configuration des paramètres par défaut
        material.setFloat("time", 0);
        material.setColor3("waterColor", new BABYLON.Color3(0.1, 0.3, 0.5));

        // Animation du temps pour les vagues
        scene.registerBeforeRender(() => {
            material.setFloat("time", performance.now() * 0.001);
        });

        return material;
    }
}
