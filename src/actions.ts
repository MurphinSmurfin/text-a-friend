import type { Draft } from "./components/AddFriend.tsx";
import {
  ensurePick,
  lineFor,
  localDate,
  pickFor,
  weekStart,
  type Friend,
  type Pick,
  type State,
} from "./lib/state.ts";

type Update = (fn: (s: State) => State) => void;

/** Every change to the list goes through here, and each one re-checks this week's pick. */
export function makeActions(setState: Update, onSpin: () => void) {
  const update: Update = (fn) => setState((s) => ensurePick(fn(s), new Date()));
  const today = () => localDate(new Date());
  const week = () => weekStart(new Date());
  /** A pick the user asked for, so it is shown without another spin. */
  const pick = (friend: Friend, avoid?: string): Pick => ({
    friendId: friend.id,
    line: lineFor(friend, new Date(), avoid),
    week: week(),
    spun: true,
  });
  return {
    /** `asPick` makes the new friend this week's pick: the spin link's screen promises a first line for the name just typed. */
    add: (draft: Draft, asPick = false) =>
      update((s) => {
        const friend: Friend = {
          ...draft,
          id: crypto.randomUUID(),
          lastContact: null,
          birthday: null,
        };
        return {
          ...s,
          friends: [...s.friends, friend],
          // a lone friend's pick was on screen without a spin, so a second friend must not hide it again
          pick: asPick
            ? pick(friend)
            : s.pick && s.friends.length === 1
              ? { ...s.pick, spun: true }
              : s.pick,
        };
      }),
    // shortcut: no editing a friend's method, remove and re-add; upgrade when someone asks
    remove: (id: string) =>
      update((s) => ({ ...s, friends: s.friends.filter((f) => f.id !== id) })),
    setBirthday: (id: string, birthday: string | null) =>
      update((s) => ({
        ...s,
        friends: s.friends.map((f) => (f.id === id ? { ...f, birthday } : f)),
      })),
    contacted: (id: string) =>
      update((s) => ({
        ...s,
        friends: s.friends.map((f) =>
          f.id === id ? { ...f, lastContact: today() } : f,
        ),
        weeks: s.weeks.includes(week()) ? s.weeks : [...s.weeks, week()],
        log: [...s.log, { date: today(), friendId: id }],
      })),
    someoneElse: () => {
      onSpin();
      update((s) => {
        const friend = pickFor(
          s.friends.filter((f) => f.id !== s.pick?.friendId),
          new Date(),
        );
        return friend ? { ...s, pick: pick(friend, s.pick?.line) } : s;
      });
    },
    /** The weekly spin. It picks again so a tie breaks while the user is watching, not at page load. */
    spin: () => {
      onSpin();
      update((s) => {
        const friend = pickFor(s.friends, new Date());
        return friend ? { ...s, pick: pick(friend) } : s;
      });
    },
    /** Make a given friend this week's pick, used for the other birthdays once the first is done. */
    choose: (id: string) => {
      onSpin();
      update((s) => {
        const friend = s.friends.find((f) => f.id === id);
        return friend ? { ...s, pick: pick(friend) } : s;
      });
    },
    newLine: () =>
      update((s) => {
        const friend = s.friends.find((f) => f.id === s.pick?.friendId);
        return s.pick && friend
          ? {
              ...s,
              pick: {
                ...s.pick,
                line: lineFor(friend, new Date(), s.pick.line),
              },
            }
          : s;
      }),
  };
}
