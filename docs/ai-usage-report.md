# AI Usage Report (Assignment 4)

## Tools Used
- GitHub Copilot: in-editor code completions for JS helpers and CSS tweaks.
- ChatGPT / Claude: brainstorming GitHub feed layout, pinning strategy, difficulty filter UX, README structure, and presentation outline.
- VS Code IntelliSense: quick fixes, property hints, and auto-imports.

## Representative Prompts
1. "Design a GitHub repos widget that loads on scroll, includes a refresh button, and summarizes stars/language/updated date."
2. "How can I add pin/unpin buttons to project cards and persist them in localStorage while keeping the UI accessible?"
3. "Give me sentence starters for documenting AI usage and performance optimizations in a student README."
4. "Outline a 5-7 minute presentation for a portfolio capstone covering intro, demo, deep dive, and conclusion."

## Raw Outputs (Short Excerpts)
- Skeleton fetch logic with AbortController for GitHub API.
- Suggestion to use aria-pressed buttons for representing pinned state.
- Outline bullets for AI usage and performance documentation.
- Presentation slide structure with timing recommendations.

## Edits & Rationale
- **API Integration**: rewrote the suggested fetch block to normalize repo data, limit to six entries, and trigger via IntersectionObserver.
- **State Management**: extended the aria-pressed idea into a full pinning workflow (Set + localStorage persistence + stats bar).
- **Performance**: merged AI hints with content-visibility/contain-intrinsic-size tweaks, added reduced-motion handling, and deferred network calls.
- **Docs**: rephrased AI output to match personal tone and included concrete metrics.
- **Presentation**: adapted the generated outline to match assignment rubric timing and added speaker notes.

## Challenges
- Respecting GitHub's anonymous rate limits while keeping the UI responsive; solution: lazy fetch + refresh button + friendly error states.
- Keeping multiple filters (search, tags, difficulty, pinned) in sync without redundant renders; solved with a single applyFilters pipeline.
- Preventing layout shift for dynamically loaded cards; addressed with contain-intrinsic-size and reserved heights.

## Learning Outcomes
- Managing richer app state (query, sort, difficulty, pinned set, GitHub status) in vanilla JS.
- Chaining multiple IntersectionObservers (reveal + feed) without hurting performance.
- Documenting AI usage with enough specificity to demonstrate understanding and modifications.
- Structuring a live demo presentation with backup visuals.

## Innovation
- Pin-first workflow with live stats and localStorage persistence.
- GitHub feed that feels native to the portfolio (lazy loading, refresh, aria-live messaging).
- Visitor personalization via stored greeting + live session timer.
- Presentation assets placeholder with clear outline for quick preparation.
