# Phase 1 handover

Brainwave Quest phase 1. This page closes the phase and hands over what is done, what is not done, and what comes next.

## Public URL

The game is live at: `https://mideagame.onrender.com`

Health check: `https://mideagame.onrender.com/healthz`

The service name is `mideaGame` and the runtime is the Render free plan.

## Simple explanation of how it works

Brainwave Quest is a free learning game for Nigerian children aged 4 to 12. It ships in three age bands: Sprouts (4 to 6, Nursery 1 to Primary 1), Explorers (7 to 9, Primary 2 to 4) and Adventurers (10 to 12, Primary 5 to 6).

A child picks an age band at sign up, then a nickname and an animal avatar, then a topic. The child starts at Bronze level and moves to Silver and Gold as they win. Each round has eight questions. The timer is generous, and untimed mode is available.

The child answers, sees a one line explanation, earns stars and coins, and moves along a map. The adaptive rule checks the last eight answers. At 80 percent or more the child moves up. Below 50 percent the child moves down and sees a hint.

Missed questions return after one day, then three days, then seven days.

Progress is stored in the browser for phase 1. There are no accounts.

## Test evidence

- `npm run typecheck`: clean.
- `npm run validate:questions`: 123 files, 4488 questions, 0 errors, 13 warnings (reading grade above target; no blocking issues).
- `npx vitest run`: 38 tests passed, including validator, scoring, adaptive rule, spaced review and the live WebSocket round.
- `npm run build`: client and server build clean.
- Full round flow verified live at `https://mideagame.onrender.com`, including playing Christian Studies end-to-end and the offline practice round.

## Verified features

- Three age bands, chosen at sign up: Sprouts (4 to 6), Explorers (7 to 9), Adventurers (10 to 12).
- Question selection is band-aware, so a younger child never sees questions above their band.
- Nine subjects, all fully selectable on the map: English, Mathematics, Code and AI, Integrated Science, Home Economics, Social Studies, Arabic, Christian Studies and Music.
- Content depth (validator clean): the 10-12 band carries the original full banks (English and Mathematics, 40 per level). The 4 to 6 and 7 to 9 bands carry generated starter banks for every subject (8 per level per topic). Total question bank: 4,488 questions across 123 files, validator 0 errors.
- Solo play and daily mix.
- Eight questions per round, generous timer, untimed mode.
- One line explanation after each answer.
- Stars, coins, map progression.
- Adaptive rule, spaced review, stars, coins, streak.
- Validator blocks duplicates, missing explanations, answers outside options, text above the band reading grade and em dashes.
- Home button on the map returns to the start screen and keeps progress.
- Animal avatars are the real photos from the attached set, cropped into square local assets.
- PWA: installable on phones and tablets (manifest, icons, apple touch icon).
- Offline mode: the service worker caches the app shell and the full question bundle, and a client-side solo practice round lets a child play entirely without a connection; progress is saved on the device and merges on the next online session.
- Teacher CSV template and import script (now with a band column).
- Report a mistake button with server side rate limits.
- Read aloud via browser speech, large tap targets, high contrast, no timer penalty, reduced-motion support.
- Lighthouse: Accessibility 100, Best Practices 100.

## How to publish an update

1. Change code or content.
2. Run `npm run typecheck`, `npm run validate:questions`, `npx vitest run`, `npm run build`.
3. Commit with a clear message.
4. Push to GitHub.
5. Deploy on Render from the same repository.

## How to restart or recover

- Restart: redeploy the same commit, or run `npm start` for the built server.
- Reset progress: clear the browser local storage key `brainwave-quest-progress-v1`.
- Reset content: edit the JSON question files, run the band's generator (`npm run generate:english`, `npm run generate:math`, `npm run generate:code`, or the subject generators such as `tsx scripts/generate-science.ts`), then `npm run validate:questions` and `tsx scripts/sync-registry.ts`.
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
- Content depth is uneven by design for this pilot: English and Mathematics in band 10-12 are full, generated starter banks sit in bands 4 to 6 and 7 to 9 for every subject (8 per level per topic, to be topped up later).
- Code and AI has a small sample set, not a full curriculum.
- Arabic content covers letters, words, reading and numbers but needs review by a qualified Arabic teacher, and RTL presentation is basic.
- No parent accounts, child profiles, consent records or delete controls in phase 1.
- Progress is local to the browser.
- Spaced review uses due times from a local book.
- No backups yet. Phase 1 stores content in the Git repository.

## Next step

Starter banks are live and playable. The owner decides whether to top up the starter banks to full depth (40 per level per topic), add teacher review tooling, or continue to phase 2.
