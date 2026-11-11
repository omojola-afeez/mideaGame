# Phase 1 handover

Brainwave Quest phase 1. This page closes the phase and hands over what is done, what is not done, and what comes next.

## Public URL

The game is live at: `https://mideagame.onrender.com`

Health check: `https://mideagame.onrender.com/healthz`

The service name is `mideaGame` and the runtime is the Render free plan.

## Simple explanation of how it works

Brainwave Quest is a free learning game for Nigerian pupils aged 9 to 11, called Explorers.

A child picks an English, Mathematics or Code and AI topic. The child starts at Bronze level and moves to Silver and Gold as they win. Each round has eight questions. The timer is generous, and untimed mode is available.

The child answers, sees a one line explanation, earns stars and coins, and moves along a map. The adaptive rule checks the last eight answers. At 80 percent or more the child moves up. Below 50 percent the child moves down and sees a hint.

Missed questions return after one day, then three days, then seven days.

Progress is stored in the browser for phase 1. There are no accounts.

## Test evidence

- `npm run typecheck`: clean.
- `npm run validate:questions`: 17 files, 1944 questions, 0 errors, 0 warnings.
- `npx vitest run`: 37 tests passed, including validator, scoring, adaptive rule, spaced review and the live WebSocket round.
- `npm run build`: client and server build clean.

## Verified features

- Explorers band only.
- English, Mathematics and Code and AI.
- Solo play and daily mix.
- Eight questions per round, generous timer, untimed mode.
- One line explanation after each answer.
- Stars, coins, map progression.
- Adaptive rule, spaced review, stars, coins, streak.
- Validator blocks duplicates, missing explanations, answers outside options and text above reading grade.
- Teacher CSV template and import script.
- Report a mistake button with server side rate limits.
- Read aloud via browser speech, large tap targets, high contrast, no timer penalty.

## How to publish an update

1. Change code or content.
2. Run `npm run typecheck`, `npm run validate:questions`, `npx vitest run`, `npm run build`.
3. Commit with a clear message.
4. Push to GitHub.
5. Deploy on Render from the same repository.

## How to restart or recover

- Restart: redeploy the same commit, or run `npm start` for the built server.
- Reset progress: clear the browser local storage key `brainwave-quest-progress-v1`.
- Reset content: edit the JSON question files, run `npm run generate:english`, `npm run generate:math`, `npm run generate:code`, then `npm run validate:questions`.
- Recover reports: restart the server, reports reset in memory. Export from the reports screen if needed.

## Ongoing costs

- Phase 1 target: zero cost.
- Hosting is expected to stay on the Render free tier for a small pilot.
- The owner must recheck current free tier limits before launch.
- Any paid plan requires owner approval.

## Accounts

- The owner owns the GitHub account `omojola-afeez`.
- The owner owns the Google account used for teacher review, if it exists.
- No player accounts exist in phase 1.

## Remaining limitations

- All content is draft and pending human teacher review.
- Reading comprehension uses 40 authored passages.
- Code and AI has a small sample set, not a full curriculum.
- No parent accounts, child profiles, consent records or delete controls in phase 1.
- Progress is local to the browser.
- Spaced review uses due times from a local book.
- No backups yet. Phase 1 stores content in the Git repository.

## Next step

Stop here for phase 1 approval. The owner decides whether to continue with phase 2.
