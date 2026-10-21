/* ============================================================
   Yuelu Academy · scanned guardian lions
   Source: "Chinese Guardian Lions" by SolidXperts (CC BY-NC 4.0)
   https://sketchfab.com/3d-models/chinese-guardian-lions-c981456846cc49f59cfa92553b7a7506
   Optimized from 1,000,000 to ~30,000 triangles with gltfpack.
   ============================================================ */
(function () {
  'use strict';
  const YL = window.YL;

  YL.loadLionModel = function () {
    if (!THREE.GLTFLoader || !YL.lionGroups || !YL.lionGroups.length) return;
    const loader = new THREE.GLTFLoader();
    loader.load('assets/lion.glb', function (gltf) {
      const src = gltf.scene;
      let box = new THREE.Box3().setFromObject(src);
      const size = box.getSize(new THREE.Vector3());
      if (!size.y) return;

      // one shared source, normalised to the height of the old stone lion
      const scale = 2.65 / size.y;
      src.scale.setScalar(scale);
      box = new THREE.Box3().setFromObject(src);
      src.position.set(
        -(box.min.x + box.max.x) / 2,
        -box.min.y,
        -(box.min.z + box.max.z) / 2
      );

      src.traverse(function (o) {
        if (!o.isMesh) return;
        o.castShadow = true;
        o.receiveShadow = true;
        const m = o.material;
        if (m) {
          m.roughness = 0.92;
          m.metalness = 0;
          m.envMapIntensity = 0.25;
          if (m.map) m.map.anisotropy = 4;
        }
      });

      for (const g of YL.lionGroups) {
        while (g.children.length) g.remove(g.children[0]);
        g.add(src.clone(true));
      }
      YL.lionsLoaded = true;
    }, undefined, function (err) {
      // file:// or a missing asset: keep the procedural fallback
      console.warn('lion scan not loaded, using procedural fallback', err);
    });
  };
})();
