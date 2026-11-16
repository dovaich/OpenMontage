# فين التوكتوك؟ (Where Is the Tuk-Tuk?): low-poly cutscene source

Hoda wakes up without his tuk-tuk and runs a game-style quest. A QUEST box tracks his clues (0/3 to 3/3), and a location card appears at each stop.
1. **Service center:** El-Alamy, at his laptop: "By my calculations... either Alexandria... or a balcony." CLUE 1/3.
2. **Market:** Shehata demands money for the smashed imported melons, then sells Hoda two "for five". ITEM GET: two melons, a bribe for Uncle Sayed (CLUE 2/3).
3. **Building door:** "Don't say tea helps you remember!" Sayed: "This time it's watermelon." He eats one and gives the answer: the only lit balcony in the area. CLUE 3/3. The camera tilts up to the glowing balcony.
4. **Balcony:** the tuk-tuk is plugged into the socket and powering the building. Ibrahim offers "rent: one percent charge a month". Om Hamada invites Hoda to dinner... on the balcony, all four of them.
- The balcony sags (OVERLOAD).
- QUEST COMPLETE, BALCONY CAPACITY 4/3, then "يُتبع...".

## Files
- `scene14.js` is built by `build.py` from `engine8.js` + `alamy.js` + `tuk_block.js` + `ep14.js`. Three placeholders in `ep14.js` are filled in:
  - `${GARAGE}` from `garage_block.js` (the «مركز الصيانة» garage, moved to x = -100).
  - `${BASTAM}` from `bastam_def.js`.
  - `${HODA}` from `hoda_def.js`.
- Sets:

  | Set | x |
  |---|---|
  | Garage | -100 |
  | Market | 200 |
  | Building door | 300 |
  | Balcony | 0 |

- `assemble.py` builds the dialogue from the 5 AI Studio takes.
- `sfx14.py` synthesises the music and SFX, then mixes them with ducking.
- `recording_message.md` is the Claude-in-Chrome recording brief.

Voices: Hoda = Fenrir, El-Alamy = Rasalgethi, Shehata = Charon, Uncle Sayed = Enceladus, Ibrahim = Orus, Om Hamada = Kore, Announcer = Algenib.
