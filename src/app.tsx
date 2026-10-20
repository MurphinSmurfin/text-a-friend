import { useEffect, useState } from "preact/hooks";
import { useBadge } from "./hooks/useBadge.ts";
import { useHash } from "./hooks/useHash.ts";
import { useOverride } from "./hooks/useOverride.ts";
import { useNow } from "./hooks/useNow.ts";
import { AddFriend, type Draft } from "./components/AddFriend.tsx";
import { SettingsPage } from "./components/SettingsPage.tsx";
import { FriendList } from "./components/FriendList.tsx";
import { Nav } from "./components/Nav.tsx";
import { PickCard } from "./components/PickCard.tsx";
import { Wheel } from "./components/Wheel.tsx";
import { YearCard } from "./components/YearCard.tsx";
import {
  EMPTY,
  ensurePick,
  fill,
  loadState,
  localDate,
  pickFriend,
  streak,
  weekStart,
  type State,
} from "./lib/state.ts";
import { pickLine } from "./lib/prompts.ts";
import { yearCardOn } from "./lib/flags.ts";
import "./app.css";

const KEY = "text-a-friend";

function read(): State {
  try {
    return ensurePick(loadState(localStorage.getItem(KEY)), new Date());
  } catch {
    return EMPTY;
  }
}

export function App() {
  const [state, setState] = useState(read);
  const now = useNow(1000);
  const page = useHash();
  const yearCard = useOverride("yearcard");
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // private mode or full storage: the app still works for this visit
    }
  }, [state]);

  const today = localDate(new Date(now));
  const week = weekStart(new Date(now));

  // Monday midnight while the app is open: re-pick, which also spins the wheel
  useEffect(() => {
    if (state.pick && state.pick.week !== week) {
      setState((s) => ensurePick(s, new Date(now)));
      setSpinning(true);
    }
  }, [week]);

  const update = (fn: (s: State) => State) =>
    setState((s) => ensurePick(fn(s), new Date()));
  const add = (draft: Draft) =>
    update((s) => ({
      ...s,
      friends: [
        ...s.friends,
        { ...draft, id: crypto.randomUUID(), lastContact: null },
      ],
    }));
  // shortcut: no editing a friend's method, remove and re-add; upgrade when someone asks
  const remove = (id: string) =>
    update((s) => ({ ...s, friends: s.friends.filter((f) => f.id !== id) }));
  const contacted = (id: string) =>
    update((s) => ({
      ...s,
      friends: s.friends.map((f) =>
        f.id === id ? { ...f, lastContact: today } : f,
      ),
      weeks: s.weeks.includes(week) ? s.weeks : [...s.weeks, week],
      log: [...s.log, { date: today, friendId: id }],
    }));
  const someoneElse = () => {
    setSpinning(true);
    update((s) => {
      const friend = pickFriend(
        s.friends.filter((f) => f.id !== s.pick?.friendId),
      );
      return friend
        ? {
            ...s,
            pick: { friendId: friend.id, line: pickLine(s.pick?.line), week },
          }
        : s;
    });
  };
  const newLine = () =>
    update((s) =>
      s.pick ? { ...s, pick: { ...s.pick, line: pickLine(s.pick.line) } } : s,
    );

  const current = state.friends.find((f) => f.id === state.pick?.friendId);
  const weeksInARow = streak(state.weeks, new Date());
  const done = current?.lastContact != null && current.lastContact >= week;

  useBadge(current !== undefined && !done);

  return (
    <>
      <Nav page={page} />
      {page === "#settings" ? (
        <SettingsPage
          state={state}
          onRestore={(s) => setState(ensurePick(s, new Date(now)))}
        />
      ) : (
        <main>
          {state.friends.length > 0 && (
            <Wheel
              friends={state.friends}
              pickId={state.pick?.friendId}
              spinning={spinning}
              onLand={() => setSpinning(false)}
            />
          )}

          <PickCard
            friend={current}
            text={current ? fill(state.pick?.line ?? "", current.name) : ""}
            done={done}
            spinning={spinning && current !== undefined}
            canSwitch={state.friends.length > 1}
            onNewLine={newLine}
            onSomeoneElse={someoneElse}
            onContacted={contacted}
            now={now}
            streak={weeksInARow}
          />

          <AddFriend onAdd={add} />
          <FriendList friends={state.friends} today={today} onRemove={remove} />
          {yearCardOn(today, yearCard) && <YearCard state={state} now={now} />}
        </main>
      )}
    </>
  );
}
