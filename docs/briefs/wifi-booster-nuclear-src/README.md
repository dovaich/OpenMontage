# مقوّي الواي فاي النووي (episode 4): low-poly cutscene source

The internet goes down five minutes before Hamada's online exam. Ibrahim builds a "nuclear Wi-Fi booster" from a satellite dish,
a coat hanger and Om Hamada's stuffed-veggies pan. It picks up the upstairs neighbour Abu Samir's Wi-Fi, the pan catches fire,
and the whole district loses power.

- 47.5 s, 4:3. Same engine as episode 3: `engine.js` is extracted from `../shibshib-final-boss-src/scene.js`, `ep4.js` holds this episode,
  and `scene4.js` is the two files joined.
- Voice: the user's single-voice Google AI Studio take. `lines.json` holds each line's source range (`src`) and placement (`t0`/`t1`).
  The lines were matched to the take by silence and pitch.
- `sfx4.py` synthesises the score and SFX locally: inventor plucks, 56k-modem handshake, sizzle and fire, boom, city power-down,
  and crickets.

Rebuild: `node render.cjs frames 15` (serve this folder on :8765 first, with `env.js` and `lines.js` generated from the dialogue track as
in episode 3), then `python3 sfx4.py dialogue.wav mix.wav`, then the same ffmpeg CRT chain.
