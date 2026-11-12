import { useEffect, useState } from "preact/hooks";
import { useBadge } from "./hooks/useBadge.ts";
import { useHash } from "./hooks/useHash.ts";
import { useOverride } from "./hooks/useOverride.ts";
import { useNow } from "./hooks/useNow.ts";
import { useStoredState } from "./hooks/useStoredState.ts";
import { AddFriend } from "./components/AddFriend.tsx";
import { BirthdaysPage } from "./components/BirthdaysPage.tsx";
import { DoneCard } from "./components/DoneCard.tsx";
import { SettingsPage } from "./components/SettingsPage.tsx";
import { Footer } from "./components/Footer.tsx";
import { FriendList } from "./components/FriendList.tsx";
import { Nav } from "./components/Nav.tsx";
import { PickCard } from "./components/PickCard.tsx";
import { Welcome } from "./components/Welcome.tsx";
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
import { parseSpin, revealText, spinHash } from "./lib/welcome.ts";
import "./app.css";

export function App() {
  const [state, setState] = useStoredState();
  const now = useNow(1000);
  const page = useHash();
  const yearCard = useOverride("yearcard");
  const [spinning, setSpinning] = useState(false);

  const today = localDate(new Date(now));
  const week = weekStart(new Date(now));

  // Monday midnight while the app is open: re-pick. The new pick stays hidden until the user spins.
  useEffect(() => {
    if (state.pick && state.pick.week !== week)
      setState((s) => ensurePick(s, new Date(now)));
  }, [week]);

  const {
    add,
    remove,
    setBirthday,
    contacted,
    someoneElse,
    choose,
    newLine,
    spin,
  } = makeActions(setState, () => setSpinning(true));

  const current = state.friends.find((f) => f.id === state.pick?.friendId);
  const weeksInARow = streak(state.weeks, new Date());
  const done = current?.lastContact != null && current.lastContact >= week;
  // one friend is not a wheel worth spinning: show them straight away
  const revealed =
    done || state.pick?.spun === true || state.friends.length === 1;
  const replay = parseSpin(page);
  const birthdays = birthdaysInWeek(state.friends, week).map((b) => ({
    id: b.friend.id,
    name: b.friend.name,
    date: b.date,
    done: b.friend.lastContact != null && b.friend.lastContact >= week,
  }));

  useBadge(current !== undefined && !done);

  return (
    <>
      <Nav page={page} />
      {replay ? (
        <Welcome
          // keyed so a link opened in the same tab starts from a still wheel, not the last screen's state
          key={page}
          spin={replay}
          onAdd={(draft) => {
            add(draft, true);
            // replace, not push: Back should leave the app, not reopen the replay over their new wheel
            location.replace("#");
          }}
        />
      ) : page === "#settings" ? (
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
      ) : !current ? (
        <Welcome spin={null} onAdd={add} />
      ) : (
        <main>
          <Wheel
            friends={state.friends}
            pickId={revealed ? current.id : undefined}
            spinning={spinning}
            onLand={() => setSpinning(false)}
          />
          {done ? (
            <DoneCard
              friend={current}
              // only for a wheel that turned: a lone friend was never spun for, and a one-slice link says so
              reveal={
                state.pick?.spun && state.friends.length > 1
                  ? revealText(
                      location.origin +
                        location.pathname +
                        spinHash(
                          state.friends.length,
                          state.friends.indexOf(current),
                        ),
                    )
                  : null
              }
              now={now}
              streak={weeksInARow}
              birthdays={birthdays}
              onPick={choose}
            />
          ) : (
            <PickCard
              friend={current}
              text={fill(state.pick?.line ?? "", current.name)}
              revealed={revealed}
              spinning={spinning}
              streak={weeksInARow}
              birthdays={birthdays}
              canSwitch={state.friends.length > 1}
              onSpin={spin}
              onNewLine={newLine}
              onSomeoneElse={someoneElse}
              onContacted={contacted}
            />
          )}
          {state.friends.length < 3 && (
            <section class="card">
              <a href="#friends" class="button secondary">
                Add more friends
              </a>
              <p class="note">
                Your list lives in this browser only. Settings has a backup
                code.
              </p>
            </section>
          )}
          {yearCardOn(today, yearCard) && <YearCard state={state} now={now} />}
        </main>
      )}
      <Footer />
    </>
  );
}
