# Text-A-Friend

Have you ever felt that you wanted to talk to someone but don't really know who, what, or how to talk to them? Then you give up the thought entirely and blame it all on the internet for making you soft and introverted since a lot of things can be done virtually without actually interacting with anyone in person. Text-A-Friend helps you decide and gives you the push you need to get up and going again.

<p align="center"><img src="spin.gif" width="320" alt="The wheel spinning on an iPhone and landing on this week's friend"></p>

Try it at [text-a-friend.vercel.app](https://text-a-friend.vercel.app/). On an iPhone, open it in Safari, tap Share, then Add to Home Screen so it keeps your list.

![JavaScript size](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/MurphinSmurfin/text-a-friend/main/badges/js.json) ![Runtime dependencies](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/MurphinSmurfin/text-a-friend/main/badges/deps.json) ![Tests](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/MurphinSmurfin/text-a-friend/main/badges/tests.json) ![No backend](https://img.shields.io/badge/backend-none-555) ![PWA](https://img.shields.io/badge/PWA-installable-7c3aed)

## What it does

You add a few friends and how you'd reach them. Every Monday a roulette wheel picks one. It's rigged: whoever you've gone longest without talking to wins. It also writes the first line for you, something like "hello from the void, Josh. how are things actually going? no rush", because the blank message box is where the thought usually dies. If the line doesn't sound like you, reroll it.

One tap opens Messages, WhatsApp or email with the line already typed. Instagram can't do that, so it opens the profile and copies the line for you to paste. Anything else goes through the share sheet.

When you've sent it, tap "I reached out". Your streak goes up and a countdown runs to the next spin on Monday. The list colours itself green, amber and red by how long it's been since you talked to each person, which is the app's polite way of nagging.

There's no account and no server. Your friends' names and numbers stay in your browser. Settings has a backup that squashes the whole list into one line of text you can paste on another phone, a Monday reminder you can drop into your calendar, and the privacy notes. Installed on a home screen, the icon shows a dot until this week's text is sent. The calendar page holds birthdays: in a friend's birthday week the wheel picks them and the line is a birthday one, and if two people share a week the wheel takes the earlier birthday and "Someone else" jumps to the other. In the last weeks of the year a shareable "your year in texts" card appears.

## How it's built

Preact, Vite and TypeScript. One runtime dependency, which is Preact at 7 KB. The whole app is 15 KB of JavaScript gzipped and under 2 KB of CSS, with system fonts and no component library. State is `useState` plus `localStorage`, and every read from storage is validated so a bad save can't break the app. There are 46 tests, all on the pure functions in `src/lib`, run by Vitest.

A few things that took some figuring out:

- The wheel is inline SVG drawn from angles, and the spin is one CSS transition. At first it spun clean off the screen. A viewBox with a negative origin puts `transform-origin: 50% 50%` at the wrong corner, and `transform-box: fill-box` is the fix. See [`lib/wheel.ts`](src/lib/wheel.ts).
- The backup code is compact JSON, compressed with the browser's built-in deflate, then base64url. Ten friends come out to about 230 characters. Restoring runs the result through the same validator as storage, so a tampered code drops bad rows instead of breaking things. See [`lib/code.ts`](src/lib/code.ts).
- The Monday reminder is a hand-written calendar file with `RRULE:FREQ=WEEKLY;BYDAY=MO`. Phone calendars import it as a repeating event, so there's no notification permission to ask for. See [`lib/ics.ts`](src/lib/ics.ts).
- SMS links use `?&body=` because that's the one separator both iOS and Android accept. WhatsApp gets the number in international format from a country picker. See [`lib/methods.ts`](src/lib/methods.ts).

## Privacy

There is no server behind this and no analytics in it, and you never sign in to anything. Nothing leaves your device. Private browsing wipes the list when you close the window, and Safari deletes site data after seven days without a visit unless the page is on your home screen. So install it, or keep a backup code somewhere.

## Run it yourself

```bash
npm install
npm run dev
npm test
npm run build
```

## Not done yet

- Drag to spin
- Snooze a friend for a few weeks
- Your own inside-joke lines per friend
