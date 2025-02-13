# Assets nécessaires pour le style Fantasy/Heroic

## Structure des dossiers
```
public/
  assets/
    textures/
      ground/
        stone_tiles/         # Sol style donjon/arène
          diffuse.jpg       # Texture de base
          normal.jpg        # Relief
          roughness.jpg     # Rugosité
          ao.jpg           # Occlusion ambiante
      walls/
        ancient_stone/      # Murs indestructibles style ruines anciennes
          diffuse.jpg
          normal.jpg
          roughness.jpg
          ao.jpg
        wooden_barrier/     # Murs destructibles style barricades en bois
          diffuse.jpg
          normal.jpg
          roughness.jpg
          ao.jpg
      effects/
        explosion/          # Textures pour les explosions style magique
          fire_diffuse.png
          smoke.png
      environment/
        envmap/            # Carte d'environnement style donjon/arène
          px.jpg           # Cubemap: droite
          nx.jpg           # Cubemap: gauche
          py.jpg           # Cubemap: haut
          ny.jpg           # Cubemap: bas
          pz.jpg           # Cubemap: avant
          nz.jpg           # Cubemap: arrière

## Textures sélectionnées (Poly Haven)

### Sol (Stone Tiles)
- **Texture**: "Stylized Stone Floor 02"
- **URL**: https://polyhaven.com/a/stylized_stone_floor_02
- **Style**: Pavés de pierre stylisés avec motifs géométriques
- **Utilisation**: Sol de l'arène
- **Résolution recommandée**: 2K (2048x2048)

### Murs indestructibles (Ancient Stone)
- **Texture**: "Stylized Bricks 01"
- **URL**: https://polyhaven.com/a/stylized_bricks_01
- **Style**: Briques anciennes avec détails fantasy
- **Utilisation**: Murs indestructibles
- **Résolution recommandée**: 2K (2048x2048)

### Murs destructibles (Wooden Barrier)
- **Texture**: "Wooden Planks 012"
- **URL**: https://polyhaven.com/a/wooden_planks_012
- **Style**: Planches de bois usées avec caractère
- **Utilisation**: Murs destructibles
- **Résolution recommandée**: 2K (2048x2048)

### Environment Map
- **Texture**: "Sunset Ruins"
- **URL**: https://polyhaven.com/a/sunset_ruins
- **Style**: Ruines au coucher du soleil pour l'ambiance fantasy
- **Utilisation**: Éclairage ambiant et reflets
- **Format**: HDR

## Autres ressources de textures

### Textures (AmbientCG - CC0 License)

#### Environment Maps
- Day Sky HDRI: https://ambientcg.com/view?id=DaySkyHDRI046B
- Night Environment HDRI: https://ambientcg.com/view?id=NightEnvironmentHDRI008

#### Ground Textures
- Grass 005: https://ambientcg.com/get?file=Grass005_2K-PNG.zip
- Grass 004: https://ambientcg.com/get?file=Grass004_2K-PNG.zip
- Ground 068: https://ambientcg.com/get?file=Ground068_2K-PNG.zip
- Ground 082S: https://ambientcg.com/get?file=Ground082S_2K-PNG.zip
- Ground 062S: https://ambientcg.com/get?file=Ground062S_2K-PNG.zip
- Ground 047: https://ambientcg.com/get?file=Ground047_2K-PNG.zip
- Asphalt 026C: https://ambientcg.com/get?file=Asphalt026C_2K-PNG.zip
- Tiles 130: https://ambientcg.com/get?file=Tiles130_2K-PNG.zip

#### Rock/Stone Textures
- Rock 035: https://ambientcg.com/get?file=Rock035_2K-PNG.zip
- Rock 030: https://ambientcg.com/get?file=Rock030_2K-PNG.zip
- Rock 029: https://ambientcg.com/get?file=Rock029_2K-PNG.zip
- Rock 028: https://ambientcg.com/get?file=Rock028_2K-PNG.zip
- Rock 053: https://ambientcg.com/get?file=Rock053_2K-PNG.zip
- Rock 056: https://ambientcg.com/get?file=Rock056_2K-PNG.zip
- Gravel 022: https://ambientcg.com/get?file=Gravel022_2K-PNG.zip

#### Wood Textures
- Wood 077: https://ambientcg.com/get?file=Wood077_2K-PNG.zip

### Parcourir plus
- Atlas Textures: https://ambientcg.com/list?type=atlas&sort=popular
- Material Textures: https://ambientcg.com/list?type=material&sort=popular

## Notes d'implémentation
1. Toutes les textures sont gratuites et libres de droits (licence CC0)
2. Les textures sont optimisées pour le PBR (Physically Based Rendering)
3. Conversion nécessaire :
   - Textures albedo/diffuse : JPG
   - Normales : PNG (format OpenGL)
   - Roughness/Metallic/AO : JPG
4. Redimensionner en 2K pour optimiser les performances

## Effets visuels
1. Éclairage ambiant bleuté pour l'atmosphère fantasy
2. Points de lumière magiques autour des murs
3. Brume légère au niveau du sol
4. Effets de particules pour les explosions

## Installation
1. Exécuter `./scripts/setup_assets.sh` pour créer la structure
2. Exécuter `./scripts/download_textures.sh` pour télécharger les textures
3. Les textures seront automatiquement converties et placées dans les bons dossiers
