#!/bin/bash

# Activer le mode strict
set -euo pipefail

# Fonction pour afficher les messages
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Début du script principal
log "Début du téléchargement des textures..."

# Obtenir le chemin absolu du répertoire du projet
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Création des dossiers nécessaires
BASE_DIR="$PROJECT_DIR/public/assets/textures"
GROUND_DIR="$BASE_DIR/ground"
STONE_DIR="$BASE_DIR/walls/ancient_stone"
WOOD_DIR="$BASE_DIR/walls/wooden_barrier"
ENV_DIR="$BASE_DIR/environment/envmap"

# Nettoyage et création des dossiers
rm -rf "$GROUND_DIR" "$STONE_DIR" "$WOOD_DIR"
mkdir -p "$GROUND_DIR" "$STONE_DIR" "$WOOD_DIR" "$ENV_DIR"

# Fonction pour télécharger et extraire les textures
download_texture() {
    local name=$1
    local url=$2
    local target_dir=$3
    
    log "Téléchargement de $name dans $target_dir"
    log "Téléchargement depuis $url"
    
    # Créer le répertoire cible s'il n'existe pas
    mkdir -p "$target_dir"
    
    # Se déplacer dans le répertoire cible
    cd "$target_dir" || exit 1
    
    # Télécharger le fichier
    curl -L "$url" -o texture.zip
    
    log "Extraction des fichiers..."
    unzip -o texture.zip
    
    # Conversion des fichiers PNG en JPG
    log "Conversion de *_Color.png en diffuse.jpg"
    convert *_Color.png diffuse.jpg
    
    log "Conversion de *_NormalGL.png en normal.jpg"
    convert *_NormalGL.png normal.jpg
    
    log "Conversion de *_Roughness.png en roughness.jpg"
    convert *_Roughness.png roughness.jpg
    
    log "Conversion de *_AmbientOcclusion.png en ao.jpg"
    convert *_AmbientOcclusion.png ao.jpg
    
    # Nettoyage
    rm texture.zip
    rm *.png
    rm *.usdc
    rm *.mtlx
    
    # Retourner au répertoire du projet
    cd "$PROJECT_DIR" || exit 1
    
    log "Traitement de $name terminé"
}

# Sol - Ground texture (dessus)
download_texture "Ground Floor Top" \
    "https://ambientcg.com/get?file=Ground068_2K-PNG.zip" \
    "$GROUND_DIR/stone_tiles"

# Sol - Dirt texture (côtés)
download_texture "Ground Floor Sides" \
    "https://ambientcg.com/get?file=Ground037_2K-PNG.zip" \
    "$GROUND_DIR/dirt"

# Murs indestructibles - Rock texture
download_texture "Rock Wall" \
    "https://ambientcg.com/get?file=Rock035_2K-PNG.zip" \
    "$STONE_DIR"

# Murs destructibles - Wood texture
download_texture "Wood Wall" \
    "https://ambientcg.com/get?file=Wood077_2K-PNG.zip" \
    "$WOOD_DIR"

log "Téléchargement terminé !"
