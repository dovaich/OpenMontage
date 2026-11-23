# حي أم حمادة (Hay Om Hamada): open-world game

A mobile-first open-world browser game set in the Om Hamada series neighbourhood. It uses Three.js and reuses the series' own
character models (ported from `docs/briefs/vertical-template/engine8.js` and the episode sources), so it keeps the same low-poly PS2 look.

## Run
```bash
cd games/hay-om-hamada
npm install
npm run dev        # http://localhost:5173 (also on the LAN, so a phone on the same Wi-Fi can open it)
npm run build      # static build in dist/ (relative paths, ready for Capacitor)
```

## What's in the game now
- **The city:** the neighbourhood from the series in the middle, then:
  - downtown to the north (the mall «سنتر النجوم», the gas station, the school)
  - the industrial area to the west (scrapyard, ice factory, warehouses)
  - the Nile corniche to the east, with a bridge to the island (park, tower, palms, feluccas)
  - low-rise brick blocks to the south, then the desert road, «حديقة القفز ٣٠٠٠» with ramps, and the pyramids on the horizon
- **Vehicles:** you can get into any car.
  - Types: sedan, newer sedan, small hatch, 504-style wagon, black and white taxis, microbus, pickup (melons, gas cylinders or boxes), removal truck, bus.
  - Abu Samir's «١٢٨» has the red button: it flies for a short time on "nuclear fuel".
  - Hooda's tuk-tuk is drivable too.
  - Traffic AI drives the road grid (right-hand lanes, turns, the roundabout, honks, slows for people).
  - Carjacking a driver makes them get out and complain.
- **Life:** pedestrians walk the sidewalks, flee, get knocked over with cartoon stars and get back up angry. Kids play football in the school yard (you can kick the ball). Day/night cycle with lit windows and street lamps.
- **Interiors:** Om Hamada's apartment (living room, kitchen, Hamada's room, balcony window), the stairs to Ibrahim's roof workshop, the café, the grocery «بقالة الأمل», and the «عاجل جدًا» studio.
- **26 story missions in two chapters.** Each one is played as a specific character: Ibrahim, Hooda, Hamada, Om Hamada, Bestem, Nashwa, Uncle Sayed or El-Gazzar.
- **Side activities:**
  - taxi/Uber fares (128, tuk-tuk or any taxi)
  - Shehata's melon deliveries
  - 3 races
  - 8 stunt jumps
  - 30 golden bolts to collect
  - 18 invention cards
  - garage upgrades at El-Alamy's desk (engine levels, paint, repair)
  - tea at the café, snacks at the grocery
- **Slipper meter:** knocking people over or crashing fills it. At 3 slippers Om Hamada comes after you and throws slippers. 3 hits and she takes you home with a fine.
- **Phone menu:** missions, a big map where you tap to set a waypoint, the card album, progress (%), settings. The game saves on its own in the browser.

## Tests
`/tmp`-style Playwright scripts drove every mission from start to finish (auto-teleport per step), a real race with an autopilot, the taxi job, chaos and the slipper chase. No page errors.
Draw calls are about 350 around the neighbourhood. The render resolution drops automatically if a phone runs below 26 fps.

## Files
| File | Contents |
|---|---|
| `src/kit.js` | Series engine utilities, faces, `makeChar`, poses, plus merge helpers (`bakeModel`, `optimizeRig`) |
| `src/chars.js` | The cast (12 playable characters) |
| `src/world.js` | The city, colliders (spatial hash), raised ground/ramps/roof, zones, doors, parking, chunked baking |
| `src/carmodels.js`, `src/vehicles.js` | Vehicle models; physics, traffic AI, parked cars |
| `src/peds.js` | Pedestrians and the football game |
| `src/interiors.js` | The interiors |
| `src/gameplay.js`, `src/missiondata.js` | Mission engine, side jobs, races, collectibles, cards, phone pages; mission/card/race data |
| `src/audio.js` | WebAudio sounds (no files) |
| `src/main.js` | Renderer, input, player on foot/driving, camera, day/night, HUD, chaos meter, save |

## APK later
`dist/` uses relative paths (`base: './'`), so it can be wrapped with Capacitor:
`npm i @capacitor/core @capacitor/cli @capacitor/android && npx cap init "حي أم حمادة" com.omhamada.hay --web-dir dist && npx cap add android`,
then build the APK/AAB in Android Studio (needs a signing key for the Play Store).
