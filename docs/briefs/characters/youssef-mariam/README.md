# Youssef + Mariam (MakeHuman / MPFB characters, Mixamo rig)
- **Youssef**: 1.83 m, slim, wheat (قمحي) skin, light beard (painted stubble), short black hair, denim shirt + jeans + sneakers.
- **Mariam**: 1.75 m, fair skin, hijab (custom mesh made from her own head/neck/shoulders, skinned to the rig), cream long-sleeve sweater, long navy skirt.
- Both: `mixamo` rig from MPFB (bones `mixamorig:*`), so the Mixamo FBX files in incoming/ps3-mixamo-lib play on them via the
  world-space retarget in docs/briefs/whatif-style-test-src/scene.js (`bake`). GLBs: youssef.glb, mariam.glb.
  In three.js set alphaTest ~0.35 on the BLEND materials (hair, brows, lashes, eyes).

## Rebuild (Blender 4.2 LTS + MPFB 2.0.18 from extensions.blender.org, MakeHuman system assets CC0)
Assets: files2.makehumancommunity.org/asset_packs/makehuman_system_assets/makehuman_system_assets_cc0.zip -> MPFB user data dir
(~/.config/blender/4.2/extensions/.user/user_default/mpfb/data/), plus skirts01_cc0 (toigo_long_full_skirt) and shirts01_cc0
(toigo_fisherman_sweater) into data/clothes/. Scripts expect working dir /opt/chars and system assets unpacked at /opt/mh/sys.
```
blender -b --python build_male.py                       # -> youssef.blend
blender -b youssef.blend --python prep_export.py -- Youssef /opt/chars
python3 paint_skin.py Youssef_face.json youssef_skin.png 0.92,0.79,0.64 0.62   # wheat tint + stubble
blender -b Youssef_ready.blend --python export_glb.py -- Youssef youssef_skin.png youssef.glb darkbrown_eye.png
blender -b --python build_female.py                     # -> mariam.blend
blender -b mariam.blend --python prep_export.py -- Mariam /opt/chars hijab      # builds the hijab, removes the ears under it
python3 paint_skin.py Mariam_face.json mariam_skin.png 1.0,0.97,0.95 0
blender -b Mariam_ready.blend --python export_glb.py -- Mariam mariam_skin.png mariam.glb darkbrown_eye.png \
  '{"fisherman_sweater":"sweater_cream.png","long_full_skirt":"skirt_navy.png"}'
```
Check: viewer.html + shoot.cjs (serve the build dir, `node shoot.cjs models/x.glb 1.83 look/x`).
Licenses: MakeHuman base + system assets + toigo skirt/sweater are CC0.
