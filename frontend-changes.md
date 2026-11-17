# Frontend Changes: Theme Toggle Button

All changes are in `particles.html`.

## Overview
Added a circular, icon-based light/dark theme toggle fixed to the top-right corner. The existing dark look stays the default; a new light theme recolors the page and the canvas rendering.

## Markup
- New `<button id="theme-toggle" type="button">` holding two inline SVG icons: a **moon** (shown in the dark theme) and a **sun** (shown in the light theme).
- The SVGs have `aria-hidden="true"` and `focusable="false"`. The button's accessible name comes from `aria-label`.

## Styling (CSS)
- Theme colors are CSS custom properties on `:root`, overridden by `:root[data-theme="light"]`.
- The `body` background fades between themes over 0.4s.
- Button: 44×44px circle (a comfortable touch target), translucent glass look (`backdrop-filter: blur`), thin border: a minimal style that matches the existing UI.
- Hover makes the button slightly larger and its background slightly stronger. When pressed, it shrinks a little.
- **Icon animation:** the two icons sit in the same grid cell and cross-fade. The outgoing icon rotates ±90° and shrinks while fading out, and the incoming icon rotates and scales into place (0.5s cubic-bezier).
- `:focus-visible` shows a clear outline ring for keyboard users only, not on mouse clicks.
- `prefers-reduced-motion: reduce` turns off the transitions.
- The page hides the system cursor and draws its own (`cursor: none`). Over the button, the real pointer cursor shows and the custom cursor dot is hidden.

## Behavior (JS)
- `THEMES` object defines per-theme canvas colors: trail fade color, mouse glow, ripple color, and particle lightness range (darker particles in light mode so they stay visible).
- `applyTheme(name)` sets `data-theme` on `<html>`. It also updates `aria-label` and `title` to describe the next action ("Switch to light theme"), syncs `aria-pressed`, and saves the choice in `localStorage` (wrapped in try/catch).
- The saved theme is restored on load.
- The click handler calls `stopPropagation()`, so toggling the theme (by mouse, Enter or Space) does not trigger the canvas explosion.
- The canvas trail fill uses the theme color, so the canvas background fades to the new theme over a few frames as the trail effect redraws.

## Accessibility
- It is a native `<button>`, so it is in the tab order and responds to Enter and Space with no extra code.
- It has a descriptive, state-aware `aria-label` and `aria-pressed`.
- It has a visible focus indicator and respects reduced-motion settings.
