# Frontend Changes

## Code Quality Tooling

### Summary

Added a code quality workflow for the front-end (`particles.html`): automatic formatting,
JavaScript linting of inline scripts, and HTML validation, all run through npm scripts.

### New files

| File                | Purpose                                                                                                                                                  |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `package.json`      | Dev dependencies and npm scripts (`quality`, `quality:fix`, `format`, `format:check`, `lint`, `lint:js`, `lint:js:fix`, `lint:html`)                     |
| `package-lock.json` | Locked dependency versions                                                                                                                               |
| `eslint.config.js`  | ESLint flat config: `@eslint/js` recommended rules + `eslint-plugin-html` to lint `<script>` blocks, browser globals, `prefer-const`, `no-var`, `eqeqeq` |
| `.prettierrc.json`  | Prettier style: single quotes, semicolons, trailing commas, 100-char width                                                                               |
| `.prettierignore`   | Excludes `node_modules` and the lockfile from formatting                                                                                                 |
| `.htmlhintrc`       | HTMLHint rules: doctype, `lang`, `<title>`, charset, viewport, tag pairing, unique ids, quoted attributes, `alt` text                                    |
| `.editorconfig`     | Consistent editor settings (UTF-8, LF, 2-space indent, final newline)                                                                                    |
| `.gitignore`        | Ignores `node_modules/`                                                                                                                                  |

### Changes to existing files

#### `particles.html`

- Reformatted with Prettier (indentation, quoting, line wrapping); no change to behaviour.
- Added `<meta name="viewport" content="width=device-width, initial-scale=1">` (flagged by HTMLHint).
- `let mouse` → `const mouse` (object is mutated, never reassigned; flagged by `prefer-const`).
- Removed unused `lastTime` variable and the unused `dt` frame-delta computation in `draw()`
  (flagged by `no-unused-vars`). It was never applied to the physics, so animation is unchanged.

#### `README.md`

- Reformatted with Prettier (table alignment).
- Added a **Development** section documenting the quality commands.

### Usage

```bash
npm install          # one-time setup
npm run quality      # check formatting + lint JS + lint HTML
npm run quality:fix  # auto-fix, then re-check
```

The current codebase passes all checks with zero errors.

## Theme Toggle Button

All changes are in `particles.html`.

### Overview

Added a circular, icon-based light/dark theme toggle fixed to the top-right corner. The existing dark look stays the default; a new light theme recolors the page and the canvas rendering.

### Markup

- New `<button id="theme-toggle" type="button">` holding two inline SVG icons: a **moon** (shown in the dark theme) and a **sun** (shown in the light theme).
- The SVGs have `aria-hidden="true"` and `focusable="false"`. The button's accessible name comes from `aria-label`.

### Styling (CSS)

- Theme colors are CSS custom properties on `:root`, overridden by `:root[data-theme="light"]`.
- The `body` background fades between themes over 0.4s.
- Button: 44×44px circle (a comfortable touch target), translucent glass look (`backdrop-filter: blur`), thin border: a minimal style that matches the existing UI.
- Hover makes the button slightly larger and its background slightly stronger. When pressed, it shrinks a little.
- **Icon animation:** the two icons sit in the same grid cell and cross-fade. The outgoing icon rotates ±90° and shrinks while fading out, and the incoming icon rotates and scales into place (0.5s cubic-bezier).
- `:focus-visible` shows a clear outline ring for keyboard users only, not on mouse clicks.
- `prefers-reduced-motion: reduce` turns off the transitions.
- The page hides the system cursor and draws its own (`cursor: none`). Over the button, the real pointer cursor shows and the custom cursor dot is hidden.

### Behavior (JS)

- `THEMES` object defines per-theme canvas colors: trail fade color, mouse glow, ripple color, and particle lightness range (darker particles in light mode so they stay visible).
- `applyTheme(name)` sets `data-theme` on `<html>`. It also updates `aria-label` and `title` to describe the next action ("Switch to light theme"), syncs `aria-pressed`, and saves the choice in `localStorage` (wrapped in try/catch).
- The saved theme is restored on load.
- The click handler calls `stopPropagation()`, so toggling the theme (by mouse, Enter or Space) does not trigger the canvas explosion.
- The canvas trail fill uses the theme color, so the canvas background fades to the new theme over a few frames as the trail effect redraws.

### Accessibility

- It is a native `<button>`, so it is in the tab order and responds to Enter and Space with no extra code.
- It has a descriptive, state-aware `aria-label` and `aria-pressed`.
- It has a visible focus indicator and respects reduced-motion settings.

## Header Styling

- The instruction labels and theme toggle now sit in a fixed `<header id="app-header">` bar (72px) with a solid background, a 2px accent bottom border and a drop shadow, so it reads as separate from the particle canvas.
- Header colors are theme variables (`--header-bg`, `--header-border`, `--header-shadow`, `--header-fg`) for both dark and light themes.
