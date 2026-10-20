/**
 * A line is an opener, a body and a closer, each a standalone piece in
 * texting voice, so any combination reads naturally and the pool is
 * OPENERS * BODIES * CLOSERS lines. `{name}` is filled in by the caller.
 */
export const OPENERS = [
  "hey {name},",
  "{name}!",
  "hi {name},",
  "yo {name},",
  "ok {name},",
  "{name}, popping in.",
  "hey {name}, been too long.",
  "thinking of you, {name}.",
  "{name}, no reason for this text.",
  "hey hey {name},",
  "{name}. hi.",
  "hello from the void, {name}.",
];

export const BODIES = [
  "something today reminded me of you. how are you doing?",
  "what are you watching or reading right now? I need recommendations.",
  "how are things actually going?",
  "got time for a call this week? pick a day.",
  "what are you up to this weekend?",
  "found a song I think you would like. want it?",
  "just saying hi.",
  "how did that thing you were worried about turn out?",
  "thanks for being a good friend. just felt like saying it.",
  "what is the best thing you ate this month?",
  "what are you looking forward to right now?",
  "how is work treating you? honest answer.",
  "how is the family doing?",
  "what have you been cooking lately? I am out of ideas.",
  "picked up anything new lately? hobby, show, weird obsession, anything.",
  "what does your week look like?",
  "I miss you. that is it, that is the text.",
  "what would you do with a totally free saturday?",
  "what is one thing you are proud of right now?",
  "give me a recommendation. show, recipe, place, anything.",
  "what has been stressing you out lately? I have time to listen.",
  "tell me something good that happened to you this week.",
  "can I call you sometime this week? nothing urgent, just want to catch up.",
  "what is your current comfort show?",
  "any trips coming up?",
  "what is keeping you busy these days?",
  "I have a question for you, and it is how are you?",
  "any good podcasts lately? I am all out.",
  "what song is stuck in your head right now?",
  "send me a photo of your view.",
  "rate your week out of ten. I will go first if you want.",
  "quick check in. how is your head?",
];

export const CLOSERS = ["", "no rush", "talk soon?"];

const one = (list: readonly string[], random: () => number) =>
  list[Math.floor(random() * list.length)];

/** A fresh line, redrawn once if it lands on `avoid` so "Different line" never looks stuck. */
export function pickLine(avoid = "", random = Math.random): string {
  const line = [one(OPENERS, random), one(BODIES, random), one(CLOSERS, random)]
    .filter(Boolean)
    .join(" ");
  return line === avoid ? pickLine("", random) : line;
}
