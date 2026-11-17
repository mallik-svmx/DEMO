# Frontend Changes: Code Quality Tooling

## Summary

Added a code quality workflow for the front-end (`particles.html`): automatic formatting,
JavaScript linting of inline scripts, and HTML validation, all run through npm scripts.

## New files

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

## Changes to existing files

### `particles.html`

- Reformatted with Prettier (indentation, quoting, line wrapping); no change to behaviour.
- Added `<meta name="viewport" content="width=device-width, initial-scale=1">` (flagged by HTMLHint).
- `let mouse` → `const mouse` (object is mutated, never reassigned; flagged by `prefer-const`).
- Removed unused `lastTime` variable and the unused `dt` frame-delta computation in `draw()`
  (flagged by `no-unused-vars`). It was never applied to the physics, so animation is unchanged.

### `README.md`

- Reformatted with Prettier (table alignment).
- Added a **Development** section documenting the quality commands.

## Usage

```bash
npm install          # one-time setup
npm run quality      # check formatting + lint JS + lint HTML
npm run quality:fix  # auto-fix, then re-check
```

The current codebase passes all checks with zero errors.
