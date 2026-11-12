# El-Alamy — current look (future episodes)
The «مركز الصيانة» episode keeps its old look. Use this model from now on.

- Black moto leather jacket: stand-up band collar with one silver snap, quilted shoulders, open silver zip, worn open.
- Black turtleneck underneath. Slim grey trousers, polished black shoes.
- Short black hair, all one colour, swept up a little at the front with short sides.
- Clean-shaven: no beard, no moustache. No glasses, no bow tie, no blazer.
- Default face is `smug` + `smile`. Use `faceTexture(eyes, mouth, ALAMY_FACE)`.

`alamy.js` defines `makeAlamy(parent)` and needs the engine8 globals. Paste it after engine8 in a new episode.
To redo the sheet:
1. Build `sheet_built.js` from engine8.js + alamy.js + sheet.js.
2. Serve the folder and run `node rsheet.cjs sh 1 0,1,2,3`.
