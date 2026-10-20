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

/** Home: the app name and a settings button. Sub-page: Back and the page title. */
export function Nav({ page }: { page: string }) {
  if (page === "#settings") {
    return (
      <nav class="nav" aria-label="Main">
        <a href="#" class="back">
          {chevron}
          Back
        </a>
        <h1>Settings</h1>
      </nav>
    );
  }
  return (
    <nav class="nav" aria-label="Main">
      <h1>Text-A-Friend</h1>
      <a href="#settings" class="icon-link" aria-label="Settings">
        {sliders}
      </a>
    </nav>
  );
}
