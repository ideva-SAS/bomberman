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
GROUND_DIR="$BASE_DIR/ground/stone_tiles"
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
    
    # Créer un dossier temporaire pour l'extraction
    local temp_dir=$(mktemp -d)
    cd "$temp_dir"
    
    # Télécharger le fichier ZIP avec vérification
    log "Téléchargement depuis $url"
    if ! curl -L --fail "$url" -o texture.zip; then
        log "ERREUR: Impossible de télécharger $url"
        cd - > /dev/null
        rm -rf "$temp_dir"
        return 1
    fi
    
    # Vérifier que le fichier ZIP existe et n'est pas vide
    if [ ! -s texture.zip ]; then
        log "ERREUR: Le fichier téléchargé est vide"
        cd - > /dev/null
        rm -rf "$temp_dir"
        return 1
    fi
    
    # Extraire les fichiers avec vérification
    log "Extraction des fichiers..."
    if ! unzip -o texture.zip; then
        log "ERREUR: Impossible d'extraire texture.zip"
        cd - > /dev/null
        rm -rf "$temp_dir"
        return 1
    fi
    
    # Renommer et déplacer les fichiers vers le dossier cible
    for f in *Color.png; do
        if [ -f "$f" ]; then
            log "Conversion de $f en diffuse.jpg"
            magick "$f" "$target_dir/diffuse.jpg"
        fi
    done
    
    for f in *NormalGL.png; do
        if [ -f "$f" ]; then
            log "Conversion de $f en normal.jpg"
            magick "$f" "$target_dir/normal.jpg"
        fi
    done
    
    for f in *Roughness.png; do
        if [ -f "$f" ]; then
            log "Conversion de $f en roughness.jpg"
            magick "$f" "$target_dir/roughness.jpg"
        fi
    done
    
    for f in *AmbientOcclusion.png; do
        if [ -f "$f" ]; then
            log "Conversion de $f en ao.jpg"
            magick "$f" "$target_dir/ao.jpg"
        fi
    done
    
    # Nettoyage
    cd - > /dev/null
    rm -rf "$temp_dir"
    
    log "Traitement de $name terminé"
}

# Sol - Ground texture
download_texture "Ground Floor" \
    "https://ambientcg.com/get?file=Ground068_2K-PNG.zip" \
    "$GROUND_DIR"

# Murs indestructibles - Rock texture
download_texture "Rock Wall" \
    "https://ambientcg.com/get?file=Rock035_2K-PNG.zip" \
    "$STONE_DIR"

# Murs destructibles - Wood texture
download_texture "Wood Wall" \
    "https://ambientcg.com/get?file=Wood077_2K-PNG.zip" \
    "$WOOD_DIR"

log "Téléchargement terminé !"
