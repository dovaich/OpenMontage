# "Jet Dishwasher 3000" — Y2K Console Cutscene Director's Pack

**Format:** 4:3 (render at 1440×1080, finish at 640×480 feel) · 30 fps (cuts snapped to 15 fps animation "on twos" for janky console feel) · **Runtime 38.6 s** (locked to supplied audio)
**Genre:** Egyptian domestic slapstick in the style of a sixth-generation console cutscene (PS2 / Dreamcast era, 2000–2004)

---

## 0. Audio Map (measured from the supplied WAV)

Timecodes come from silence detection on the uploaded track. They are accurate to about ±0.1 s, so snap your edit to the waveform.

| # | Line | In | Out | Notes |
|---|------|----|-----|-------|
| L1 | Wife: "حراااام عليك يا إبراهيم! …" | 00.00 | 08.40 | Starts on frame 1, with no pre-roll |
| L2 | Husband: "اهدي يا ولية … المطبخ هيلمع!" | 08.77 | 19.75 | Natural breath at **15.84–16.22**, right after "النفاثة 3000" |
| L3 | Wife: "موتور توك توك إيه … افصلهااااا!" | 20.26 | 25.33 | The loudest peak is the scream "افصلهااااا" (~24.3–25.3) |
| L4 | Husband: "متخافيش يا مرا … دوسي عالتوربـ—" | 25.73 | 30.63 | Hard cut-off |
| L5 | SFX: static → dead air → 8-bit boom | 30.63 | 33.37 | Static tail 30.63–31.42 · **dead air 31.42–32.26** · boom burst 32.26–33.37 |
| L6 | Announcer: "Mission Failed. Kitchen Health: 0%." / "Restart Level or Sleep on the Balcony." | 33.69 | 38.40 | Split at 35.52–36.00 |

> The 0.84 s of dead air before the boom is your best comedic beat. Play it as a **frozen, glitched frame** (a console "hang"), then hit the boom.

---

## 1. Global Visual Bible (keep this consistent across all shots)

### Style DNA
- **Geometry:** low-poly models at roughly 1,500–3,000 tris per character, with hard faceted edges. Hands are mittens with fused fingers (only the thumb separates). Heads are slightly oversized.
- **Textures:** 128×128 to 256×256 maps with point/nearest filtering. Faces are hand-painted texture decals. Colors are dithered and visibly blocky. You can see texture seams.
- **Lighting:** Gouraud/flat vertex lighting, one hard key light with no real shadows. Characters get a dark blob shadow on the floor. Floor tiles have a cheap fake specular "shine" sheet.
- **Animation:** stiff, mocap-free keyframes that snap between poses. Faces are swappable **texture expressions**: eyes and mouth change as 2D decals and the geometry never deforms. Mouths are simple **jaw-flaps**.
- **Camera:** cutscene-engine moves. Slow linear dollies, abrupt snap-zooms, occasional clipping through a wall edge. Wide-angle lens (≈24 mm).
- **Post:** 4:3, CRT scanlines, soft phosphor bloom on whites and the window, slight chroma bleed (red smears to the right), mild barrel curvature, low draw distance with fog outside the window.

### Character Sheets (paste these descriptions verbatim into every prompt)
**WIFE ("Om Hamada"):** plump Egyptian housewife in her 40s, low-poly. Pink floral house galabeya, emerald-green headscarf tied back at the nape, bright **yellow rubber dish gloves**, blue plastic slippers. Round face, thick painted eyebrows, big expressive texture eyes.

**HUSBAND (Ibrahim):** skinny Egyptian man in his 40s, low-poly. Huge black mustache, balding with side hair. White ribbed **sleeveless undershirt**, blue-grey striped pajama pants, plastic sandals, **brass welding goggles pushed up on his forehead**, pencil behind his ear, grease smudges on his arms.

### Set: The Kitchen (a single, consistent set)
Small Cairo apartment kitchen, late afternoon. **Turquoise ceramic wall tiles** with chipped corners. A white enamel sink overflowing with a **towering mountain of dishes**: aluminum pots, a dented fava-bean pot (قدرة فول), frying pans, tea glasses, and spoons sticking out like a porcupine. An orange **butane gas cylinder** under a two-burner stove. An old cream-colored fridge covered in fridge magnets. A plastic red-and-white checked tablecloth. A window with wooden shutters showing a laundry line and a hazy fogged-out cityscape of satellite dishes. A single bare fluorescent tube on the ceiling with a green tint.

### The Prop: "غسالة المواعين النفاثة 3000 / JET DISHWASHER 3000"
A red **tuk-tuk engine block** (single-cylinder, cooling fins, rusty exhaust pipe) bolted onto a wooden fruit crate, strapped to the sink faucet pipe with **silver duct tape** and zip ties. A coiled **red canvas fire hose** with a brass nozzle. **Exposed red, yellow and blue wires** spliced into a wall socket with a multi-plug adaptor. A pull-start cord with a plastic bottle cap as the handle. A hand-painted cardboard sign reads "3000". A big red mushroom **"TURBO" button** on a cheese-tin control box. One tuk-tuk side mirror with a plastic flower and a blue evil-eye charm still attached.

---

## 2. Scene-by-Scene Timeline & Animation Breakdown

| Shot | Time | Audio | Camera | Action / Animation | Face Decals | Props / FX |
|------|------|-------|--------|--------------------|-------------|------------|
| **S01** | 00.00–03.20 | L1 "حراااام عليك يا إبراهيم!" | Low angle **crane-down** over the dish mountain, then a snap-zoom onto the wife | Her head and gloved hands **pop up from behind the dish tower** like a whack-a-mole. On "حراااام" both arms shoot up and stay rigidly locked in a T-pose for 4 frames. | Eyes: huge white circles · Mouth: rectangular scream | Dish tower wobbles as a single rigid object. One spoon spins off. |
| **S02** | 03.20–08.40 | L1 "ضهري اتقطم … مش في بيت!" | MCU, slow linear dolly-in, slight Dutch tilt | Hand on her lower back and torso **bent at a broken 30° angle** on "ضهري اتقطم". Counts items on her fingers (fused mitten fingers) on "حلل وطاسات وملاعق". On "مطعم" she flings her arms wide and the dish tower behind her grows by **+3 pots by teleportation** (a pop-in LOD glitch, played as a gag). | Eyebrows angled up in tragedy · tears as 2 blue pixel quads | A steam/sweat drop sprite (a flat billboard) |
| **S03** | 08.77–12.50 | L2 "اهدي يا ولية ووسعي كدة للدماغ الشغالة!" | Low-angle **hero shot** from floor level, with backlight from the doorway | The kitchen door **kicks open, clipping through the wall** for 2 frames. Ibrahim stands framed in white bloom, taps his temple on "الدماغ الشغالة", and **pulls his goggles down** with a "shing". | Smug half-lidded eyes · grin texture showing 4 square teeth | Lens flare (a flat hexagon sprite). Dust motes. |
| **S04** | 12.50–15.84 | L2 "عملتلك اختراع القرن: غسالة المواعين النفاثة 3000" | Snap to a medium-wide two-shot, then a **360° orbit** around the invention | He yanks a bedsheet tarp off the machine. The orbit is a stiff constant-speed turntable, like a vehicle-select screen. **Title card slam** on "النفاثة 3000" (see HUD H2). | Wife: eyes go flat lines (deadpan) · Husband: sparkle eyes | Sparkle sprites, rotating spotlight cone |
| **S05** | 16.22–19.75 | L2 "موتور توك توك مع خرطوم مطافي، في ثانيتين المطبخ هيلمع!" | Detail inserts that cut on the words: **engine** (on "موتور توك توك") → **hose nozzle** (on "خرطوم مطافي") → back to the husband | He slaps the engine proudly and a cooling fin falls off. He mimes "two seconds" with 2 fused fingers. On "هيلمع" a **"ding" star glint** sprite appears on a pot. | Husband: "thumbs-up" face decal | Duct tape peeling at one corner. A loose wire twitches. |
| **S06a** | 20.26–22.70 | L3 "موتور توك توك إيه في المطبخ يا مجنون؟!" | Wide shot, then the camera shakes at low frequency | Ibrahim yanks the pull cord and the engine **roars to life**, vibrating as a rigid block that slides across the counter. The wife grabs his undershirt and shakes him in a 2-frame loop. | Wife: furious red-tinted face texture · Husband: oblivious grin | Black exhaust smoke (a stack of grey billboard puffs). Plates rattle. |
| **S06b** | 22.70–24.20 | L3 "الريحة شايطة والزرار بيشرز.." | **ECU insert** on the multi-plug | The plastic switch **sparks** in bursts of yellow 4-point star sprites. The wire insulation melts as a texture swap from red to black. | — | Spark particles, a green smoke wisp, the fluorescent tube flickering |
| **S06c** | 24.20–25.33 | L3 "افصلهااااا!" | **Snap-zoom to an ECU of the wife's face**, held through the scream | Her jaw-flap is maxed open. Her headscarf flaps as 2 alternating meshes. | Eyes: tiny pinpoint pupils · Mouth: giant black hexagon | The wind blows her eyebrows off-model for a frame (a deliberate glitch) |
| **S07** | 25.73–30.63 | L4 "متخافيش يا مرا دي أحدث تكنولوجيا يابانية مع لمسة مصرية.. دوسي عالتوربـ—" | Dutch angle with heavy camera shake. Slow push toward the red TURBO button. | The hose is **thrashing like a snake** and spraying water as flat blue ribbon geometry. Dishes fly past the lens. Ibrahim shouts with one hand on the engine and his undershirt rippling. On "يابانية" he gives a thumbs-up. On "دوسي عالتوربـ—" **the wife's gloved finger slams the TURBO button** (pick: her finger or his foot). | Husband: wild-eyed grin · Wife: eyes shut, teeth clenched | Water ribbons, flying plates, smoke filling the frame, HUD meter plunging |
| **S08a** | 30.63–31.42 | L5 static | — | **Freeze frame** on the button press, then RGB channel split, tearing horizontal bars, and VHS-style noise | — | Digital "hang" glitch |
| **S08b** | 31.42–32.26 | L5 dead air | — | **Frozen frame, slightly desaturated, with a tiny spinning "loading disc" icon** in the corner. Total silence. | — | The audience holds its breath |
| **S08c** | 32.26–33.37 | L5 BOOM | **Exterior wide** of the Cairo apartment block (yellow-ochre facade, AC units, satellite dishes, laundry lines) | One kitchen window **erupts in a low-poly fireball**: orange/yellow octahedron explosion sprites, flying pixel debris, a single pot launched into the sky, and pigeons scattering as 4-frame sprites. | — | Fireball, white screen flash (2 frames), a pot falling back to land on a parked car |
| **S09** | 33.37–38.60 | L6 Announcer | Back inside, a static locked-off wide shot of the ruined kitchen | Both stand stiffly, **covered in black soot**, with smoking **afro-poofed hair** and her headscarf shredded. A slow 3-second **blink cycle**. A single plate falls from the ceiling and shatters on "Sleep on the Balcony". Ibrahim gives a weak thumbs-up and coughs a smoke ring. The **GAME OVER** overlay drops in at 35.5 (see HUD H5). | Both: flat white dot eyes on a black soot face texture | Smoke wisps, ash flakes falling, the engine sputtering with one last cough, the fluorescent tube dangling and swinging |

---

## 3. AI Video Prompts (copy-paste ready)

### Workflow for consistency (recommended)
1. **Generate the two character sheets and the kitchen set as still images first** (prompts K1–K3 below). Use them as the reference / first frame for **image-to-video** in every shot. This is how you get the same faces, clothes and set in every clip.
2. Generate each shot at **1.2–1.5× the needed length**, then trim to the audio map.
3. **Generate without dialogue.** Lay the supplied WAV over the cut afterwards, because jaw-flap lip-sync is supposed to look loose. On models that add audio (Veo 3 / Sora 2), add "no speech, no music" or mute the clip.
4. Apply the **shared retro post chain** (section 5) to every clip so the CRT look matches exactly, even if the generators drift.

> Naming specific games ("GTA San Andreas", "Crazy Taxi") in prompts can trigger content filters on some platforms, or make the model copy branded UI. The prompts below describe the *look* in generic terms. If your platform allows it, you can append "reminiscent of early-2000s open-world and arcade-racer cutscenes".

### 3.1 Reference stills (image model: FLUX / Imagen / Midjourney / GPT-Image)

**K1 — Wife character sheet**
```
Character turnaround sheet, front view and three-quarter view, of a plump Egyptian housewife in her 40s rendered as an early-2000s sixth-generation console 3D model: low-poly faceted geometry with visible polygon edges, roughly 2000 triangles, mitten hands with fused fingers, slightly oversized head, hand-painted low-resolution 128px face texture with big expressive cartoon eyes and thick painted eyebrows. Pink floral house galabeya, emerald-green headscarf tied back at the nape, bright yellow rubber dish gloves, blue plastic slippers. Flat vertex lighting, single hard key light, dark blob shadow under feet, plain grey studio background, nearest-neighbor pixelated textures, 4:3 frame, no text.
```

**K2 — Husband character sheet**
```
Character turnaround sheet, front view and three-quarter view, of a skinny Egyptian man in his 40s rendered as an early-2000s sixth-generation console 3D model: low-poly faceted geometry with visible polygon edges, mitten hands with fused fingers, slightly oversized head, hand-painted low-resolution face texture. Huge black mustache, balding with side hair, white ribbed sleeveless undershirt, blue-grey striped pajama pants, plastic sandals, brass welding goggles pushed up on his forehead, pencil behind his ear, grease smudges on arms. Smug grin showing four square teeth. Flat vertex lighting, blob shadow, plain grey studio background, nearest-neighbor pixelated textures, 4:3 frame, no text.
```

**K3 — Kitchen set + invention**
```
Wide establishing view of a small Cairo apartment kitchen rendered as an early-2000s console game environment: low-poly geometry, visible polygon vertices, crunchy 256px pixelated textures, flat specular sheen on the floor tiles, no realistic shadows. Turquoise ceramic wall tiles with chipped corners, white enamel sink overflowing with a towering mountain of dirty dishes, aluminum pots, a dented metal fava-bean pot, frying pans and spoons sticking out. Orange butane gas cylinder under a two-burner stove, old cream fridge covered in magnets, red-and-white checked plastic tablecloth, wooden-shuttered window with a laundry line and a foggy low-draw-distance skyline of satellite dishes. On the counter: a red tuk-tuk engine block with cooling fins and a rusty exhaust bolted to a wooden fruit crate, strapped to the faucet pipe with silver duct tape and zip ties, a coiled red canvas fire hose with a brass nozzle, exposed red yellow and blue wires spliced into a multi-plug, a cheese-tin control box with a big red mushroom button. Green-tinted fluorescent ceiling tube, late-afternoon light, 4:3 aspect ratio, CRT scanlines, soft phosphor bloom, no people, no text.
```

### 3.2 Shared style suffix
Every shot prompt below already ends with this block. If you write new shots, append it too:
```
STYLE: early-2000s sixth-generation console in-engine cutscene, low-poly 3D models with visible polygon edges and faceted shading, crunchy low-resolution pixelated textures with nearest-neighbor filtering, flat vertex lighting with fake specular highlights, blob shadows, stiff snappy keyframe animation with swappable 2D texture facial expressions and simple jaw-flap mouths, 4:3 aspect ratio, CRT scanlines, blooming oversaturated colors, slight chroma bleed, mild barrel distortion. Not photorealistic, no modern rendering, no subtitles, no on-screen text, no speech, no music.
```

### 3.3 Shot prompts

**S01 — Dish Mountain Pop-Up (3.2 s → generate 5 s)**
```
Low-angle camera cranes down a towering, wobbling mountain of dirty dishes, aluminum pots, frying pans and spoons piled in a white enamel sink in a small turquoise-tiled Cairo apartment kitchen. Suddenly a plump Egyptian housewife in a pink floral house galabeya, emerald-green headscarf tied back and bright yellow rubber dish gloves pops up from behind the dish pile like a whack-a-mole and throws both arms straight up in a rigid locked pose, screaming with a huge rectangular open mouth and giant white circle eyes. The camera snap-zooms onto her face. One spoon spins off the pile. STYLE: early-2000s sixth-generation console in-engine cutscene, low-poly 3D models with visible polygon edges and faceted shading, crunchy low-resolution pixelated textures with nearest-neighbor filtering, flat vertex lighting with fake specular highlights, blob shadows, stiff snappy keyframe animation with swappable 2D texture facial expressions and simple jaw-flap mouths, 4:3 aspect ratio, CRT scanlines, blooming oversaturated colors, slight chroma bleed, mild barrel distortion. Not photorealistic, no modern rendering, no subtitles, no on-screen text, no speech, no music.
```

**S02 — The Rant (5.2 s → generate 6–8 s)**
```
Medium close-up, slow linear dolly-in with a slight Dutch tilt. A plump Egyptian housewife in a pink floral house galabeya, emerald-green headscarf tied back and yellow rubber dish gloves rants dramatically in her turquoise-tiled Cairo kitchen. She bends forward at a stiff broken angle clutching her lower back, then counts on her mitten-like fused fingers, then flings both arms wide in exasperation. Behind her the towering mountain of dirty pots and pans in the sink suddenly pops three pots taller in an instant, like a level-of-detail glitch. Tragic upturned eyebrows, two blue pixel tear quads, a flat sweat-drop sprite. Her mouth flaps open and shut in a simple jaw-flap animation. STYLE: early-2000s sixth-generation console in-engine cutscene, low-poly 3D models with visible polygon edges and faceted shading, crunchy low-resolution pixelated textures with nearest-neighbor filtering, flat vertex lighting with fake specular highlights, blob shadows, stiff snappy keyframe animation with swappable 2D texture facial expressions and simple jaw-flap mouths, 4:3 aspect ratio, CRT scanlines, blooming oversaturated colors, slight chroma bleed, mild barrel distortion. Not photorealistic, no modern rendering, no subtitles, no on-screen text, no speech, no music.
```

**S03 — Inventor's Entrance (3.7 s → generate 5 s)**
```
Floor-level low-angle hero shot. A kitchen door is kicked open and briefly clips through the turquoise tile wall. A skinny Egyptian man with a huge black mustache, balding head, white ribbed sleeveless undershirt, blue-grey striped pajama pants and plastic sandals stands framed in the doorway against blinding white bloom backlight. Brass welding goggles sit on his forehead and there is a pencil behind his ear. He taps his temple smugly with one mitten finger, then snaps the goggles down over his eyes. Smug half-lidded eyes, a grin showing four square teeth, a flat hexagonal lens flare sprite, floating dust motes. STYLE: early-2000s sixth-generation console in-engine cutscene, low-poly 3D models with visible polygon edges and faceted shading, crunchy low-resolution pixelated textures with nearest-neighbor filtering, flat vertex lighting with fake specular highlights, blob shadows, stiff snappy keyframe animation with swappable 2D texture facial expressions and simple jaw-flap mouths, 4:3 aspect ratio, CRT scanlines, blooming oversaturated colors, slight chroma bleed, mild barrel distortion. Not photorealistic, no modern rendering, no subtitles, no on-screen text, no speech, no music.
```

**S04 — The Unveiling (3.3 s → generate 5 s)**
```
Medium-wide two-shot in a small turquoise-tiled Cairo kitchen. A skinny mustached Egyptian man in a white sleeveless undershirt, striped pajama pants and brass goggles yanks a floral bedsheet off a contraption on the counter, revealing a red tuk-tuk engine block with cooling fins and a rusty exhaust pipe, bolted to a wooden fruit crate, strapped to the sink pipe with silver duct tape, with a coiled red canvas fire hose and a brass nozzle. The camera then performs a stiff, constant-speed 360-degree turntable orbit around the machine like a vehicle-select screen, under a rotating spotlight cone with sparkle sprites. Beside him a plump housewife in a pink floral galabeya, green headscarf and yellow rubber gloves stares deadpan with flat-line eyes. STYLE: early-2000s sixth-generation console in-engine cutscene, low-poly 3D models with visible polygon edges and faceted shading, crunchy low-resolution pixelated textures with nearest-neighbor filtering, flat vertex lighting with fake specular highlights, blob shadows, stiff snappy keyframe animation with swappable 2D texture facial expressions and simple jaw-flap mouths, 4:3 aspect ratio, CRT scanlines, blooming oversaturated colors, slight chroma bleed, mild barrel distortion. Not photorealistic, no modern rendering, no subtitles, no on-screen text, no speech, no music.
```

**S05 — Detail Pass (3.5 s → generate 5 s; or three 2 s clips)**
```
Quick sequence of close-up inserts of a homemade kitchen contraption: a red single-cylinder tuk-tuk engine with cooling fins strapped to a sink faucet pipe with peeling silver duct tape and zip ties; a brass fire-hose nozzle on a red canvas hose; exposed red, yellow and blue wires twitching where they are spliced into a wall multi-plug; a tuk-tuk side mirror decorated with a plastic flower and a blue evil-eye charm. A skinny mustached man's mitten hand slaps the engine proudly and one cooling fin falls off. Ending on a dented aluminum pot that gets a single four-point star glint sprite. STYLE: early-2000s sixth-generation console in-engine cutscene, low-poly 3D models with visible polygon edges and faceted shading, crunchy low-resolution pixelated textures with nearest-neighbor filtering, flat vertex lighting with fake specular highlights, blob shadows, stiff snappy keyframe animation with swappable 2D texture facial expressions and simple jaw-flap mouths, 4:3 aspect ratio, CRT scanlines, blooming oversaturated colors, slight chroma bleed, mild barrel distortion. Not photorealistic, no modern rendering, no subtitles, no on-screen text, no speech, no music.
```

**S06a — Engine Start Panic (2.4 s → generate 5 s)**
```
Wide shot of a small turquoise-tiled Cairo kitchen with a low-frequency camera shake. A skinny mustached Egyptian man in a white sleeveless undershirt and brass goggles yanks a pull-start cord and a red tuk-tuk engine strapped to the sink roars to life, vibrating violently as one rigid block and sliding across the counter, belching thick black exhaust smoke made of grey billboard puffs. Stacked plates rattle. A plump housewife in a pink floral galabeya, green headscarf and yellow rubber gloves grabs his undershirt with both hands and shakes him back and forth in a stiff two-frame loop, her face texture tinted angry red, while he grins obliviously. STYLE: early-2000s sixth-generation console in-engine cutscene, low-poly 3D models with visible polygon edges and faceted shading, crunchy low-resolution pixelated textures with nearest-neighbor filtering, flat vertex lighting with fake specular highlights, blob shadows, stiff snappy keyframe animation with swappable 2D texture facial expressions and simple jaw-flap mouths, 4:3 aspect ratio, CRT scanlines, blooming oversaturated colors, slight chroma bleed, mild barrel distortion. Not photorealistic, no modern rendering, no subtitles, no on-screen text, no speech, no music.
```

**S06b — Sparking Switch (1.5 s → generate 4–5 s)**
```
Extreme close-up of a cheap plastic wall multi-plug adaptor with exposed red, yellow and blue wires spliced into it with silver duct tape, on a turquoise-tiled kitchen wall. The switch sparks violently in bursts of yellow four-point star particle sprites, the red wire insulation blackens as an instant texture swap, and a wisp of green smoke curls up. A green-tinted fluorescent light flickers off and on. STYLE: early-2000s sixth-generation console in-engine cutscene, low-poly 3D models with visible polygon edges and faceted shading, crunchy low-resolution pixelated textures with nearest-neighbor filtering, flat vertex lighting with fake specular highlights, blob shadows, stiff snappy keyframe animation, 4:3 aspect ratio, CRT scanlines, blooming oversaturated colors, slight chroma bleed, mild barrel distortion. Not photorealistic, no modern rendering, no on-screen text, no speech, no music.
```

**S06c — The Scream (1.1 s → generate 4 s, use the peak)**
```
Sudden snap-zoom into an extreme close-up of a plump Egyptian housewife's low-poly face, with an emerald-green headscarf and yellow rubber gloves raised to her cheeks, screaming. Her jaw-flap mouth is a giant black hexagon, her eyes shrink to tiny pinpoint pupils, her headscarf flaps between two alternating stiff meshes, and her painted eyebrows briefly glitch off her face for a single frame. Black smoke puffs drift behind her in the turquoise-tiled kitchen. STYLE: early-2000s sixth-generation console in-engine cutscene, low-poly 3D models with visible polygon edges and faceted shading, crunchy low-resolution pixelated textures with nearest-neighbor filtering, flat vertex lighting, stiff snappy keyframe animation with swappable 2D texture facial expressions, 4:3 aspect ratio, CRT scanlines, blooming oversaturated colors, slight chroma bleed, mild barrel distortion. Not photorealistic, no modern rendering, no on-screen text, no speech, no music.
```

**S07 — Turbo Chaos (4.9 s → generate 6–8 s)**
```
Dutch-angle shot with heavy camera shake inside a small turquoise-tiled Cairo kitchen in full chaos. A red canvas fire hose thrashes around the room like an angry snake, spraying water rendered as flat blue ribbon geometry. Dirty plates, pots and spoons fly past the camera lens. Black smoke fills the upper frame. A skinny mustached Egyptian man in a soaked white sleeveless undershirt and brass goggles holds onto a roaring red tuk-tuk engine and shouts with wild eyes and a manic grin, giving a thumbs-up, his undershirt rippling in the wind. The camera slowly pushes toward a big red mushroom button on a cheese-tin control box, and a yellow rubber-gloved finger slams down on it. STYLE: early-2000s sixth-generation console in-engine cutscene, low-poly 3D models with visible polygon edges and faceted shading, crunchy low-resolution pixelated textures with nearest-neighbor filtering, flat vertex lighting with fake specular highlights, blob shadows, stiff snappy keyframe animation with swappable 2D texture facial expressions and simple jaw-flap mouths, 4:3 aspect ratio, CRT scanlines, blooming oversaturated colors, slight chroma bleed, mild barrel distortion. Not photorealistic, no modern rendering, no subtitles, no on-screen text, no speech, no music.
```

**S08a/b — Freeze + Hang:** don't generate these. Build them in the edit from the last frame of S07 (see section 5).

**S08c — Exterior Explosion (1.1 s → generate 5 s)**
```
Static exterior wide shot of a run-down yellow-ochre Cairo apartment block at dusk, with air-conditioning units, satellite dishes, laundry lines and wooden shutters, all rendered as an early-2000s console game environment with low draw distance and fog. One third-floor kitchen window suddenly erupts in a chunky low-poly fireball made of orange and yellow octahedron explosion sprites, with blocky pixel debris flying out. A single aluminum cooking pot launches high into the sky, flat pigeon sprites scatter, and a white full-screen flash lasts two frames. STYLE: early-2000s sixth-generation console in-engine cutscene, low-poly 3D models with visible polygon edges and faceted shading, crunchy low-resolution pixelated textures with nearest-neighbor filtering, flat vertex lighting, 4:3 aspect ratio, CRT scanlines, blooming oversaturated colors, slight chroma bleed, mild barrel distortion. Not photorealistic, no modern rendering, no on-screen text, no speech, no music.
```

**S09 — Ash-Covered Aftermath (5.2 s → generate 6–8 s)**
```
Static locked-off wide shot of a destroyed small Cairo kitchen: blackened turquoise tiles, a dangling fluorescent tube swinging slowly, smoke wisps, ash flakes falling, and a charred red tuk-tuk engine on the counter that coughs out one last puff. A plump Egyptian housewife with a shredded green headscarf and yellow rubber gloves and a skinny mustached man in a torn sleeveless undershirt with cracked goggles stand stiffly side by side, both completely covered in black soot, with smoking afro-poofed hair and flat white dot eyes on soot-black face textures. They blink slowly in unison. The man coughs out a smoke ring and gives a weak thumbs-up. A single white plate falls from the ceiling and shatters on the floor between them. STYLE: early-2000s sixth-generation console in-engine cutscene, low-poly 3D models with visible polygon edges and faceted shading, crunchy low-resolution pixelated textures with nearest-neighbor filtering, flat vertex lighting with fake specular highlights, blob shadows, stiff snappy keyframe animation with swappable 2D texture facial expressions, 4:3 aspect ratio, CRT scanlines, blooming oversaturated colors, slight chroma bleed, mild barrel distortion. Not photorealistic, no modern rendering, no subtitles, no on-screen text, no speech, no music.
```

### 3.4 Negative prompt (Runway / Kling / anything that accepts one)
```
photorealistic, realistic skin, subsurface scattering, ray tracing, global illumination, soft shadows, depth of field bokeh, 16:9 widescreen, letterbox, smooth high-poly, Pixar style, anime, modern game graphics, Unreal Engine 5, lens dirt, film grain, subtitles, captions, watermark, logo, extra fingers, distorted text
```

### 3.5 Platform notes
- **Veo 3.x:** 8 s maximum, and it handles "4:3, CRT scanlines" well. Mute the native audio. Use a K-sheet frame as the first image.
- **Sora 2:** strongest at slapstick physics (S06a, S07, S08c). Keep the character descriptions verbatim in every prompt, and add "no speech, no music".
- **Runway Gen-4 / 4.5:** use the K1–K3 stills as **references**, which gives the best identity lock. Use 10 s for S02, S07 and S09.
- All of them tend to "upgrade" the graphics. If a clip comes back too clean, re-run it with "PlayStation-2-era / Dreamcast-era graphics, 480i" added, or rely on the post chain in section 5.

---

## 4. Retro HUD & Overlay Concepts

**Typography**
- English: **Press Start 2P** (Google Fonts) or VT323.
- Arabic: use a **Square Kufic** style (الخط الكوفي المربع). It is drawn on a grid, so it reads natively as pixel art. Off-the-shelf options are **Reem Kufi** or **Lalezar**, rendered at a low pixel size and upscaled with nearest-neighbor. You can also hand-build the 5–6 Arabic words below on a 12×12 grid.
- Use a 1-px black outline plus a 2-px hard drop shadow, with no anti-aliasing.

| ID | Element | Placement | Behavior & Timing |
|----|---------|-----------|-------------------|
| **H1** | **KITCHEN DURABILITY / متانة المطبخ** meter | Top-left. A segmented 10-block bar with a little kitchen-sink pixel icon. | 100% green from 0.00. At 20.3 (engine start) it drops to 80% and turns yellow. At 22.8 (sparks) it drops to 55% with a hit-shake. At 24.3 (scream) it drops to 40% and turns orange. Through S07 it **ticks down one block per flying plate**. At 30.0 it hits 5% and **flashes red** with a "LOW!" blink. At 32.3 (boom) it shatters to **0%** and the bar pieces fall off the screen. |
| **H2** | **Item-unlock title card** | Center, slammed in at 15.0 | A spinning 3D low-poly engine icon over a starburst. "NEW ITEM! / !اختراع جديد" with "غسالة المواعين النفاثة 3000" and "JET DISHWASHER 3000" underneath, plus stat bars: POWER ★★★★★ · SAFETY ☆☆☆☆☆ · SMELL ★★★★★. Hold it for 1.2 s, then it wipes off. |
| **H3** | **DISH COUNTER** | Top-right | "DISHES: 9,999+" rolls up like an odometer during L1 and freezes at "MAX" on "مطعم" (≈7.5). |
| **H4** | **Character dialogue boxes** | Bottom third. A blue gradient box with a white pixel border and a portrait window. | A pixel portrait of the speaker (wife = green scarf, husband = goggles) with a name tag, "أم حمادة" / "إبراهيم". The Arabic subtitle **types on letter by letter** with a bleep. An English sub sits in a smaller line below. A "▼" blinking cursor appears at the end of each line. For L4 the box **shakes and cracks**, and the text cuts off mid-letter at "التوربـ". |
| **H5** | **GAME OVER screen** | Full-screen, from 35.5 | The frame desaturates and darkens by 60% over the S09 aftermath. "GAME OVER" drops in letter by letter with a bounce, and "انتهت اللعبة" slams in underneath in red Square Kufic. Then a menu: **"▶ RESTART LEVEL / إعادة المرحلة"** and **"SLEEP ON THE BALCONY / النوم في البلكونة"**. On "Sleep on the Balcony" (≈37.2) the cursor **moves down to the balcony option by itself** with a selection blip, which is the punchline. |
| **H6** | **Mission Failed banner** | A center strip at 33.7 | A red horizontal band slides in: "MISSION FAILED / فشلت المهمة" with "KITCHEN HEALTH: 0%". It exits as the GAME OVER screen enters. |
| **H7** | **Results card** (optional end tag, after 38.6) | Full-screen | "DISHES WASHED: 0 · DISHES DESTROYED: 347 · CEILING DAMAGE: YES · HUSBAND RANK: **D−**", then "CONTINUE? 9… 8… 7…" with a tiny tuk-tuk icon sputtering beside the countdown. |
| **H8** | **Hang glitch** (S08a/b) | Full-screen | RGB split and horizontal tearing (30.6–31.4), then a dead freeze with a small spinning disc "LOADING…" icon bottom-right (31.4–32.3). |
| **H9** | **Particle overlays** | — | Pre-made alpha loops: grey smoke billboards (4-frame cycle), yellow star sparks, falling ash flakes, and blue water droplets. Make them **flat and camera-facing**, which is how the era did it. |

---

## 5. Finishing Chain (makes every clip match)

Apply this to each generated clip before editing:

```bash
ffmpeg -i in.mp4 -vf "\
scale=320:240:flags=neighbor,\
fps=15,\
eq=saturation=1.35:contrast=1.08,\
scale=1440:1080:flags=neighbor,\
split[a][b];[b]gblur=sigma=6,curves=all='0/0 0.6/0.4 1/1'[glow];[a][glow]blend=all_mode=screen:all_opacity=0.35,\
rgbashift=rh=2:bh=-2,\
lenscorrection=k1=-0.06:k2=-0.02,\
drawgrid=w=iw:h=4:t=1:c=black@0.28,\
vignette=PI/5" \
-r 30 -c:v libx264 -crf 16 -pix_fmt yuv420p out.mp4
```

What each step does: `320×240` with nearest-neighbor gives crunchy texels. `fps=15` gives "on twos" animation. The blur+screen pass is the phosphor bloom. `rgbashift` is chroma bleed. `lenscorrection` is the CRT curvature. `drawgrid` draws the scanlines.

**Freeze / hang (S08a–b):** grab the last frame of S07, hold it for 1.63 s, apply `rgbashift` jitter plus `noise=alls=40:allf=t` for the first 0.79 s, then hold it clean and desaturated with the loading-disc overlay for 0.84 s.

**Edit order:** cut the picture to the section 0 map, lay the HUD (H1–H9) as alpha overlays on top, then put the original WAV underneath untouched. Optionally add a low engine-rumble bed from 20.3 to 30.6 and a pitched-down 8-bit "hit" under the boom at 32.26.
