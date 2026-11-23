# حي أم حمادة (Hay Om Hamada): open-world game, phase 1

A mobile-first open-world browser game set in the Om Hamada series neighbourhood. It uses Three.js and reuses the series' own
character models (ported from `docs/briefs/vertical-template/engine8.js` and the episode sources), so it keeps the same low-poly PS2 look.

## Run
```bash
cd games/hay-om-hamada
npm install
npm run dev        # http://localhost:5173 (also on the LAN, so a phone on the same Wi-Fi can open it)
npm run build      # static build in dist/ (relative paths, ready for Capacitor)
```

## Phase 1 (done)
- **The neighbourhood:** four blocks around a roundabout with a fountain and palms, a ring road, and an outer wall of buildings. Places from the series:
  - Om Hamada's building, with Uncle Sayed's chair and Ibrahim's junk at the door, and Abu Samir's «١٢٨» parked outside
  - «مركز الصيانة» (open garage: car lift, tyres, El-Alamy's desk)
  - the market with «فرشة شحاتة» and the other stalls
  - Hooda's tuk-tuk stand with the «ح و د | ٣٠٠٠» tuk-tuk
  - the café «قهوة الحبايب», the mosque, and the «عاجل جدًا» TV station
- **Every character is playable:** 11 of them. Press the portrait at the top right, then pick a character. The one you leave stays where you left them.
- **Controls (phone):** left side of the screen = floating joystick (push it to the edge to run), right side = drag to turn the camera, buttons to jump («نُط») and talk («كلّم»).
- **Controls (keyboard):** WASD, Shift to run, Space to jump, E to talk, Q to switch character, mouse drag and wheel for the camera.
- **Talking:** walk up to any character for the «كلّم» button. Each one has their own lines, shown in the series-style dialogue box with their portrait.
- **HUD:** location cards when you enter a named place, a minimap, the game saves the character and position (localStorage), and the resolution drops automatically on slow phones.

## Files
| File | Contents |
|---|---|
| `src/kit.js` | Utilities, `drawFace`/`faceTexture`, `makeChar`, `applyPose`, ported from engine8 |
| `src/chars.js` | The cast (models, names, colours, face options, speed, lines) |
| `src/world.js` | The neighbourhood: buildings, streets, landmarks, colliders, zones, minimap data. Static meshes are merged by material (~200 draw calls) |
| `src/samir_car.js` | Abu Samir's car, ported from `samir_car.js` |
| `src/main.js` | Renderer, input, player/NPC movement and animation, camera, HUD, character switch, save |

## Next phases
2. The first mission end to end (Nuclear Wi-Fi Booster): Abu Samir changes the password, you collect parts, assemble on the roof, disaster, card.
3. Driving: the tuk-tuk and the «١٢٨» (Rapier.js physics), Om Hamada's slipper meter, day/night.
4. More missions (each episode = a mission), the invention-card album, sounds and voices from the episodes.

## APK later
`dist/` uses relative paths (`base: './'`), so it can be wrapped with Capacitor:
`npm i @capacitor/core @capacitor/cli @capacitor/android && npx cap init "حي أم حمادة" com.omhamada.hay --web-dir dist && npx cap add android`,
then build the APK/AAB in Android Studio (needs a signing key for the Play Store).
