ASSIGNMENT 4 - PERSONAL WEB APPLICATION (README)

Live Demo: https://a-alguraini.github.io/assignment-4/ (enable Pages on main)
Repository: https://github.com/A-Alguraini/assignment-4

Overview
A polished, production-ready personal portfolio built with vanilla HTML, CSS, and JavaScript. This capstone iteration combines all prior work (Assignments 1-3) into a single refined application featuring persistent visitor state (name, theme, pinned projects), multi-step filtering logic (difficulty + tags + search + pinned toggle), a lazy-loaded GitHub feed, session timer, and performance optimizations (content-visibility, deferred fetches, reduced-motion support).

Run Locally
1. Clone the repository:
   git clone https://github.com/A-Alguraini/assignment-4.git
2. Open the folder in VS Code.
3. Launch with Live Server (recommended) or open index.html directly in a browser.

Project Structure
assignment-4/
  index.html
  css/
    styles.css
  js/
    script.js
  assets/
    images/
    projects.json
  docs/
    ai-usage-report.md
    technical-documentation.md
  presentation/
    slides.pdf
    demo-video.mp4
  .gitignore
  README.md

Features
- Tabbed navigation (About / Projects / Contact) with smooth transitions.
- Time-based greeting + personalized name stored in localStorage.
- Session timer showing how long a visitor has been on the page.
- Dark / light theme toggle persisted across sessions.
- Project gallery with search, tag chips, difficulty filter, and pinned-first sorting.
- Stats bar displaying visible / total projects, pin count, and active filters.
- GitHub feed (top 6 repos) loaded lazily via IntersectionObserver with manual refresh.
- Contact form with real-time validation and toast notifications.
- On-scroll reveal animations respecting prefers-reduced-motion.
- Optimized with content-visibility, lazy images, explicit dimensions, and CSS preload.

Accessibility
- Semantic landmarks (header, nav, main, footer).
- Keyboard-operable controls with visible focus rings.
- aria-live status regions for dynamic content.
- Descriptive alt text on all images.

Compatibility
Tested on Chrome, Edge, Firefox (desktop), iOS Safari, and Android Chrome.

Deployment (GitHub Pages)
1. Repo -> Settings -> Pages.
2. Source: Deploy from branch main, folder / (root).
3. Site URL: https://a-alguraini.github.io/assignment-4/

AI Summary
Documented in docs/ai-usage-report.md. AI assisted with brainstorming the GitHub feed, pinning workflow, documentation outlines, and presentation structure. All outputs were reviewed and adapted for accessibility, performance, and personal style.

Presentation
See presentation/README.md for outline and file placeholders (slides.pdf, demo-video.mp4).

License
MIT (or your preferred license).
