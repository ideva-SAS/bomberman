// [Le début du code reste identique jusqu'aux événements de la caméra]

        // Variables pour le contrôle de la caméra
        let isDragging = false;
        let lastX = 0;
        let lastY = 0;

        // Support pour les événements pointeur (fonctionne mieux sur Mac)
        canvas.addEventListener("pointerdown", (evt) => {
            isDragging = true;
            lastX = evt.clientX;
            lastY = evt.clientY;
            canvas.setPointerCapture(evt.pointerId);
        });

        canvas.addEventListener("pointermove", (evt) => {
            if (!isDragging) return;
            handleCameraMovement(evt.clientX, evt.clientY);
        });

        canvas.addEventListener("pointerup", (evt) => {
            isDragging = false;
            canvas.releasePointerCapture(evt.pointerId);
        });

        canvas.addEventListener("pointercancel", (evt) => {
            isDragging = false;
            canvas.releasePointerCapture(evt.pointerId);
        });

        // Fonction commune pour gérer le mouvement de la caméra
        function handleCameraMovement(currentX, currentY) {
            const deltaX = (currentX - lastX) * 0.5; // Réduit la sensibilité
            const deltaY = (currentY - lastY) * 0.5;

            // Ajuster la rotation horizontale (gauche/droite)
            camera.rotationOffset += deltaX * CAMERA_SENSITIVITY;
            camera.rotationOffset = Math.max(CAMERA_MIN_ROTATION, 
                                          Math.min(CAMERA_MAX_ROTATION, 
                                                 camera.rotationOffset));

            // Ajuster la hauteur (haut/bas)
            camera.heightOffset -= deltaY * CAMERA_SENSITIVITY;
            camera.heightOffset = Math.max(CAMERA_MIN_HEIGHT, 
                                        Math.min(CAMERA_MAX_HEIGHT, 
                                               camera.heightOffset));

            lastX = currentX;
            lastY = currentY;
        }

        // Double-clic/tap pour réinitialiser la vue
        let lastClickTime = 0;
        canvas.addEventListener("click", (evt) => {
            const currentTime = new Date().getTime();
            const clickLength = currentTime - lastClickTime;
            if (clickLength < 300 && clickLength > 0) {
                camera.heightOffset = CAMERA_DEFAULT_HEIGHT;
                camera.rotationOffset = CAMERA_DEFAULT_ROTATION;
                evt.preventDefault();
            }
            lastClickTime = currentTime;
        });

// [Le reste du code reste identique]
