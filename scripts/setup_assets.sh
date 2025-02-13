#!/bin/bash

# Création de la structure des dossiers
mkdir -p public/assets/textures/{ground/stone_tiles,walls/{ancient_stone,wooden_barrier},effects/explosion,environment/envmap}

# URLs des textures (à remplacer par les vraies URLs une fois choisies)
# Note: Ces URLs sont des exemples, il faudra les remplacer par les vraies URLs des textures choisies

# Téléchargement des textures
echo "Pour télécharger les textures :"
echo "1. Aller sur https://ambientcg.com/"
echo "2. Télécharger les packs suivants :"
echo "   - StoneFloor046 (Sol)"
echo "   - Rock030 (Murs indestructibles)"
echo "   - Planks012 (Murs destructibles)"
echo ""
echo "3. Extraire les fichiers dans les dossiers correspondants :"
echo "   public/assets/textures/ground/stone_tiles/"
echo "   public/assets/textures/walls/ancient_stone/"
echo "   public/assets/textures/walls/wooden_barrier/"
echo ""
echo "4. Renommer les fichiers selon la convention :"
echo "   - diffuse.jpg"
echo "   - normal.jpg"
echo "   - roughness.jpg"
echo "   - ao.jpg"
