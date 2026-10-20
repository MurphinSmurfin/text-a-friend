import { useEffect, useState } from "preact/hooks";
import { useBadge } from "./hooks/useBadge.ts";
import { useHash } from "./hooks/useHash.ts";
import { useOverride } from "./hooks/useOverride.ts";
import { useNow } from "./hooks/useNow.ts";
import { useStoredState } from "./hooks/useStoredState.ts";
import { AddFriend } from "./components/AddFriend.tsx";
import { BirthdaysPage } from "./components/BirthdaysPage.tsx";
import { SettingsPage } from "./components/SettingsPage.tsx";
import { Footer } from "./components/Footer.tsx";
import { FriendList } from "./components/FriendList.tsx";
import { Nav } from "./components/Nav.tsx";
import { PickCard } from "./components/PickCard.tsx";
import { Wheel } from "./components/Wheel.tsx";
import { YearCard } from "./components/YearCard.tsx";
import { makeActions } from "./actions.ts";
import {
  birthdaysInWeek,
  ensurePick,
  fill,
  localDate,
  streak,
  weekStart,
} from "./lib/state.ts";
import { yearCardOn } from "./lib/flags.ts";
import "./app.css";

export function App() {
  const [state, setState] = useStoredState();
  const now = useNow(1000);
  const page = useHash();
  const yearCard = useOverride("yearcard");
  const [spinning, setSpinning] = useState(false);

  const today = localDate(new Date(now));
  const week = weekStart(new Date(now));

  // Monday midnight while the app is open: re-pick, which also spins the wheel
  useEffect(() => {
    if (state.pick && state.pick.week !== week) {
      setState((s) => ensurePick(s, new Date(now)));
      setSpinning(true);
    }
  }, [week]);

  const { add, remove, setBirthday, contacted, someoneElse, choose, newLine } =
    makeActions(setState, () => setSpinning(true));

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
      ) : page === "#friends" ? (
        <main>
          <AddFriend onAdd={add} />
          <FriendList friends={state.friends} today={today} onRemove={remove} />
        </main>
      ) : page === "#birthdays" ? (
        <BirthdaysPage
          friends={state.friends}
          today={today}
          onSet={setBirthday}
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
            birthdays={birthdaysInWeek(state.friends, week).map((b) => ({
              id: b.friend.id,
              name: b.friend.name,
              date: b.date,
              done:
                b.friend.lastContact != null && b.friend.lastContact >= week,
            }))}
            onPick={choose}
          />

          {yearCardOn(today, yearCard) && <YearCard state={state} now={now} />}
        </main>
      )}
      <Footer />
    </>
  );
}
