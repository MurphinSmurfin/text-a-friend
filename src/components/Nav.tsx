const sliders = (
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    aria-hidden="true"
  >
    <path d="M4 7h8M18 7h2M4 12h2M12 12h8M4 17h10M20 17h0" />
    <circle cx="15" cy="7" r="2.5" fill="var(--bg)" />
    <circle cx="9" cy="12" r="2.5" fill="var(--bg)" />
    <circle cx="17" cy="17" r="2.5" fill="var(--bg)" />
  </svg>
);
const chevron = (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M15 6l-6 6 6 6" />
  </svg>
);

const calendar = (
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    aria-hidden="true"
  >
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
);

const people = (
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 13.5a6.5 6.5 0 0 1 3.5 6.5" />
  </svg>
);

const TITLES: Record<string, string> = {
  "#friends": "Friends",
  "#settings": "Settings",
  "#birthdays": "Birthdays",
};

/** Home: the app name, then friends, calendar and settings links. Sub-page: Back and the page title. */
export function Nav({ page }: { page: string }) {
  const title = TITLES[page];
  if (title) {
    return (
      <nav class="nav" aria-label="Main">
        <a href="#" class="back">
          {chevron}
          Back
        </a>
        <h1>{title}</h1>
      </nav>
    );
  }
  return (
    <nav class="nav" aria-label="Main">
      <h1>Text-A-Friend</h1>
      <a href="#friends" class="icon-link" aria-label="Friends">
        {people}
      </a>
      <a href="#birthdays" class="icon-link" aria-label="Birthdays">
        {calendar}
      </a>
      <a href="#settings" class="icon-link" aria-label="Settings">
        {sliders}
      </a>
    </nav>
  );
}
