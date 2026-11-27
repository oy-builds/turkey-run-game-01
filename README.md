[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/oy-builds/turkey-run-game-01/rank.svg)](https://make.fun/bounty/turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/oy-builds/turkey-run-game-01/reward.svg)](https://make.fun/bounty/turkey-run-game-01)

# Turkey Trot — The Thanksgiving Breakout

A complete original turkey escape game that plays offline in a desktop browser
from its own static files. You are Tilly the turkey, and Thanksgiving dinner is
coming for you: sprint out of the farmyard, through the barn, past the kitchen
oven, and into the woods before Farmer Bram catches you — or the carving knife
does.

## How to play

- **Run:** Tilly runs on her own. Your job is timing.
- **Jump:** `Space`, `↑`, `W`, or click — clear fences, hay bales and the oven.
- **Duck:** `↓` or `S` — slip under swinging carving knives and low beams.
- **Dash:** `Shift` or `X` — a burst of speed that also shakes the farmer off
  a little (short cooldown).
- **Pause:** `P`. **Mute:** `M`. **Restart:** `R` on any end screen, or click
  the button.

## The run

- **HUD:** score, distance, lives (3 hearts), stage, corn collected, and the
  farmer-proximity bar — when it fills, Bram grabs you.
- **Stages:** Farmyard (0–500 m) → Barn (500–1000 m) → Kitchen (1000–1500 m)
  → the Woods. Each stage runs faster and throws denser hazards.
- **Hazards:** fences, hay bales, puddles, swinging carving knives, the oven.
  A stumble costs a life and lets the farmer close in.
- **Pickups:** corn (+50), golden feather (+150, rare). Near-misses earn +25.
- **Win:** reach 1500 m and vanish into the woods. **Lose:** 3 stumbles and
  the farmer catches you — or the knife does.

## Screenshots

`?shot=start` shows the title screen, `?shot=play` a mid-run frame with the
HUD, `?shot=caught` the caught end screen, `?shot=escaped` the escape end
screen. Add `&seed=N` for a deterministic layout.

## Run it

Serve `game/` with any static server and open `game/index.html`, or:

```sh
node serve.ts   # serves game/ at http://localhost:8080
```

No network requests, no build step, no dependencies. Sound is synthesized
with WebAudio; nothing is downloaded.

## Hand-in

`main.ts` (Node 22, standard library only) copies `game/` and `screenshots/`
to `/output` (or `$MAKEFUN_OUTPUT_DIR`) and writes `/output/dossier.json`
with `buildDossier` from `vendor/makefun-game.ts`:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT — see [LICENSE](LICENSE).
