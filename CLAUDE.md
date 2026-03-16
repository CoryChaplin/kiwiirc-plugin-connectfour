# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn          # Install dependencies
yarn build    # Compile → dist/plugin-connectfour.js (minified)
yarn watch    # Webpack watch mode
yarn dev      # Dev server on port 9000 with CORS enabled
yarn lint     # Run ESLint + StyleLint
```

No automated tests exist; testing requires a running Kiwi IRC instance.

## Architecture

This is a **Kiwi IRC plugin** that enables two users to play Connect Four in private messages. The plugin communicates entirely through IRC's `TAGMSG` mechanism using the custom tag `+kiwiirc.com/c4`.

### Data flow

Game state is never stored on a server — all synchronization happens peer-to-peer via IRC tags:

1. Player A clicks the button → sends `invite` TAGMSG to Player B
2. Player B accepts → sends `invite_accepted` with a randomly-chosen start player
3. Each move sends an `action` command containing the column index and current turn number
4. The turn number acts as a sync check: if the received turn doesn't match local state, an `error` is sent and the game is terminated

### Key files

- **[src/plugin.js](src/plugin.js)** — Plugin entry point. Registers with Kiwi IRC, listens to IRC events (`irc.raw.TAGMSG`, `irc.nick`, `irc.quit`, `mediaviewer.show/hide`), and dispatches game commands. All game command routing lives here.
- **[src/libs/connectfour.js](src/libs/connectfour.js)** — Game engine. Owns board state via Vue reactivity. Notable: win lines are pre-calculated at module load. Turn parity determines player marker: odd turns = X (first player), even turns = O.
- **[src/libs/utils.js](src/libs/utils.js)** — Global game registry (`games` object keyed by remote player nick) and helpers for sending TAGMSG data and terminating games.
- **[src/components/GameButton.vue](src/components/GameButton.vue)** — Header button; handles invite initiation with a 4-second acceptance timeout.
- **[src/components/GameComponent.vue](src/components/GameComponent.vue)** — Game board UI; handles invite accept/decline and move submission.

### IRC tag protocol

Commands sent in the `+kiwiirc.com/c4` tag value:

| Command | Direction | Payload |
|---|---|---|
| `invite` | A → B | — |
| `invite_received` | B → A | — |
| `invite_accepted` | B → A | `startPlayer` nick |
| `invite_declined` | B → A | — |
| `action` | either → other | `column` (0-6), `turn` number |
| `error` | either → other | — |
| `terminate` | either → other | — |
