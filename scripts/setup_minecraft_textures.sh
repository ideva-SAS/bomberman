#!/bin/bash

# Création des dossiers nécessaires
mkdir -p public/assets/textures/ground
mkdir -p public/assets/textures/walls

# Téléchargement des textures Minecraft
# Note: Ces URLs sont des exemples, à remplacer par les vraies URLs des textures Minecraft
TEXTURE_URLS=(
    "https://raw.githubusercontent.com/minecraft/minecraft-assets/master/textures/block/dirt.png"
    "https://raw.githubusercontent.com/minecraft/minecraft-assets/master/textures/block/grass_block_top.png"
    "https://raw.githubusercontent.com/minecraft/minecraft-assets/master/textures/block/grass_block_side.png"
)

# Télécharger les textures
cd public/assets/textures/ground
for url in "${TEXTURE_URLS[@]}"; do
    curl -O "$url"
done

echo "Textures téléchargées avec succès !"
