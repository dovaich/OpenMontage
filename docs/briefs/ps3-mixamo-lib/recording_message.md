# ANIMATION BATCH (not voices): download 10 Mixamo animations

This batch is **Mixamo animation files, not TTS**. Use **mixamo.com** through Claude in Chrome, logged in to the user's free Adobe account.
If Mixamo asks for a sign-in, stop and ask the user to sign in once. Never type a password. Nothing here costs money.
These files drive the series' own low-poly characters (Om Hamada, Ibrahim), which are mounted on the Mixamo skeleton by the builder, so
**only the animation matters, not the character's look**.

## Settings for every download
- In the **Characters** tab choose **X Bot** first and keep it for the whole batch (the builder's skeleton is X Bot's).
- In the **Animations** tab search the term, and pick the closest match to the description. If the first result is wrong, try the alternative term.
- Tick **In Place** whenever that checkbox is shown. Leave the other sliders at their defaults.
- **Download** with: Format **FBX Binary (.fbx)**, Skin **Without Skin**, Frames per Second **30**, Keyframe Reduction **none**.
- Wait for each download to finish before starting the next.

## The 10 animations (file name → search term → what it should look like)
1. `yelling.fbx` → "Yelling" (alt: "Yelling Out") → standing, shouting angrily at someone in front
2. `angry_point.fbx` → "Angry Point" (alt: "Pointing") → pointing a finger forward while angry
3. `arguing.fbx` → "Standing Arguing" (alt: "Arguing") → heated talking with both hands
4. `talking.fbx` → "Talking" → calm standing conversation with small hand gestures
5. `bragging.fbx` → "Victory" (alt: "Fist Pump") → proud celebration, arm raised
6. `shrug.fbx` → "Shrugging" (alt: "Shrug") → "not my fault" shrug
7. `facepalm.fbx` → "Face Palm" (alt: "Disappointed") → hand to the face in despair
8. `scared.fbx` → "Terrified" (alt: "Scared") → jumping back in fear, hands up
9. `fall_back.fbx` → "Falling Back Death" (alt: "Knocked Out") → blown backwards onto the floor
10. `silly_dance.fbx` → "Silly Dancing" (alt: "Hip Hop Dancing") → a goofy dance

## After downloading
1. Move the files from Downloads into the repo as `incoming/ps3-mixamo-lib/<file name above>`.
2. Write `incoming/ps3-mixamo-lib/manifest.txt`, one line per file: `<file> <exact Mixamo animation name picked> <In Place yes/no/not offered>`.
   If one could not be found, leave it out and say so on its own line.
3. Set `queue/ps3-mixamo-lib.status` to `recorded`, then commit and push to `ccr-3b18907e-5bki3m` (message: `incoming: ps3-mixamo-lib animations`).
4. Notify the builder: `claude -p "ANIMS READY: ps3-mixamo-lib" --cloud session_01AGkU7yqdvR5XFpAPPR6hCd`. The builder also watches the branch.
