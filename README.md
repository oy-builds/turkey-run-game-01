[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/oy-builds/turkey-run-game-01/rank.svg)](https://make.fun/bounty/turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/oy-builds/turkey-run-game-01/reward.svg)](https://make.fun/bounty/turkey-run-game-01)
# Gobble Run — The Great Turkey Escape

Thanksgiving is coming, and Tom the turkey is on the menu. Run him from the
farmyard, through the barn, past the farmhouse kitchen — 1800 metres to the
woods — while Jed the farmer chases, searches the haystacks and corners him,
and the oven glows and the carving knives fall.

## Play

Open `game/index.html` in a desktop browser (or serve `game/` with any static
server). No build step, no network requests, no files outside `game/`.

- **← → / A D** — dart left and right
- **Space / ↑ / W** — jump fences, pumpkins, hay bales and roasting pans
- **↓ / S** — dive into a haystack to hide when one is beside you
- **P** — pause · **M** — mute · **R** — run again

Grab corn for +50 points, clear obstacles for +25, and keep the farmer
behind you: every stumble lets Jed gain ground, and three hits — or one grab
— means dinner. Three stages get faster as you go: the farmyard, the barn,
and the kitchen, where carving knives drop from above and the oven is always
hot. Reach 1800 m and Tom lives to gobble another day.

Sound is synthesized live with WebAudio (gobbles, thuds, a bouncy bass line)
— no audio files. All art is drawn on canvas in `game/src/art.js`.

## Structure

| File | Job |
| --- | --- |
| `game/index.html` | Page shell, loads the game scripts |
| `game/src/main.js` | Game loop, state machine (title → play → caught/escaped) |
| `game/src/turkey.js` | Tom: running, jumping, hiding, stumbling |
| `game/src/farmer.js` | Jed: chase, search-the-hay, corner-and-lunge AI |
| `game/src/kitchen.js` | Stages, obstacle/pickup spawning, collisions |
| `game/src/hud.js` | HUD (score, corn, distance, lives, farmer meter) and menus |
| `game/src/art.js` | All canvas art: turkey, farmer, farm, barn, kitchen |
| `game/src/audio.js` | WebAudio sounds and music, no audio files |
| `game/src/input.js` | Keyboard + mouse input |
| `game/src/shots.js` | `?shot=` hooks that stage title/play/end frames for screenshots |

## Build / verify

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, stdlib only) copies `game/` and `screenshots/` to the
output directory and writes `dossier.json` via `buildDossier` from
`vendor/makefun-game.ts`.

## License

MIT — see `LICENSE`.
