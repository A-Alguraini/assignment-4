# Technical Documentation (Assignment 4)

## Architecture
- **HTML**: Single index.html with three sections (About, Projects, Contact). Projects render from <template id="projectItemTemplate"> and the GitHub feed uses <template id="repoTemplate">.
- **CSS**: css/styles.css defines design tokens (colors), layout (grid/cards), focus styles, chips, accordion, toast, reveal transitions, stats bar, timer, and feed cards.
- **JavaScript**: js/script.js handles state, normalization, GitHub API integration, rendering, form validation, timers, and notifications.

## State
const state = {
  projects: [],
  filtered: [],
  tags: new Set(),
  activeTags: new Set(),
  sort: 'title',
  query: '',
  difficulty: 'any',
  onlyPinned: false,
  pinned: new Set(load('pinnedProjects', [])),
  github: { repos: [], loaded: false, loading: false, error: '' }
};

Helper utilities:
- slugify + normalizeProjects ensure every project has an id/difficulty and preserves extra properties.
- persistPins writes the pinned set back to localStorage.

## Rendering & Interaction
1. **Init**: set year, apply theme, set greeting, init tabs, reveal observer, contact form handler, visitor-name form, timer, GitHub observer, and filter controls.
2. **Data**: loadProjects() fetches assets/projects.json. On error, shows message + Retry and can use a minimal fallback list.
3. **Filters**: buildTags() collects unique tags; applyFilters() combines query + active tag chips + difficulty select + optional pinned-only mode + sort (title/date) while keeping pinned items ahead of the rest.
4. **Cards**: renderProjects() clones the template per item, fills title/date/summary/details/difficulty, renders tags, wires the accordion, and handles the pin button (aria-pressed + localStorage persistence). Thumbnails lazy-load with explicit sizes.
5. **Stats**: updateStats() surfaces total vs. visible projects, pinned count, active tag filters, and difficulty selection.
6. **GitHub feed**: IntersectionObserver triggers fetchGitHubRepos() once the feed enters the viewport (lazy). A Refresh button retries manually. The API call hits https://api.github.com/users/A-Alguraini/repos?sort=updated&per_page=6, maps the response, and renders repo cards with stars, language, and relative updated time.
7. **Visitor form**: nameForm saves or clears the preferred greeting in localStorage. Session timer shows elapsed time since load.

## Accessibility
- Landmarks: header / nav / main / footer.
- Status areas use role="status" with aria-live="polite" (projects, contact form, GitHub feed, greeting status, toast).
- Visible focus rings; chips, pin buttons, and accordion buttons are keyboard-operable.
- All images include descriptive alt; thumbnails use imageAlt from JSON.
- Feed links open in a new tab with rel="noopener".

## Error, Loading, and Empty States
- Loading: "Loading projects..." while fetching.
- Error: network failure message with a Retry button.
- Empty: "No projects found." when filters match nothing.
- All status messages are announced via aria-live.

## Animations
- On-scroll reveal uses IntersectionObserver with threshold 0.12. When an element becomes visible, .visible is added and the observer unobserves it.
- Reduced-motion users skip animations via prefers-reduced-motion media query.

## Performance
- CSS preload to improve first paint.
- Thumbnails have explicit width/height and loading="lazy" to reduce CLS.
- Project/feed cards use content-visibility + contain-intrinsic-size to reserve space before rendering.
- GitHub fetch waits for viewport visibility (lazy data loading) and uses AbortController for timeouts.
- Minimal JS/CSS; no third-party libraries.

## Compatibility
- Chrome (Desktop): OK
- Edge (Desktop): OK
- Firefox (Desktop): OK
- iOS Safari: OK (tap targets >= 44px)
- Android Chrome: OK (lazy images work as expected)

## Data Format (assets/projects.json)
{
  "projects": [
    {
      "id": "k-park",
      "title": "K Park Parking App",
      "date": "2025-10-10",
      "summary": "Branding and UI concept for a campus parking app.",
      "details": "Designed logo treatment and explored flows for finding available parking.",
      "tags": ["ui", "branding", "campus"],
      "difficulty": "intermediate",
      "image": "assets/images/kpark.jpg",
      "imageAlt": "K Park app logo"
    },
    ...
  ]
}

## Future Work
- Persist filters in the URL for shareable views.
- Pagination ("Load more").
- Real email delivery using Formspree / EmailJS / a serverless endpoint.
- Offline cache for GitHub feed (IndexedDB) if rate-limited.
