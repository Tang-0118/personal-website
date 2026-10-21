# Guardian lion asset credit

- Source model: **Chinese Guardian Lions** by **SolidXperts**
- Source page: https://sketchfab.com/3d-models/chinese-guardian-lions-c981456846cc49f59cfa92553b7a7506
- License: **CC BY-NC 4.0** (Attribution-NonCommercial)
- Local file: `assets/lion.glb`

## Modification

The original Sketchfab scan is a 1,000,000-triangle photogrammetry model.
The local `lion.glb` was downloaded through the Objaverse mirror and simplified
to about **30,000 triangles** with `gltfpack -si 0.03 -noq`; the embedded
2048 px texture is retained. The mesh is loaded at runtime with Three.js
`GLTFLoader` and replaces the four procedural guardian-lion groups.

## Attribution requirement

Credit SolidXperts and link the source page wherever the model is displayed.
The model is **non-commercial only**. If this site is used commercially,
replace the asset or obtain a separate license.
