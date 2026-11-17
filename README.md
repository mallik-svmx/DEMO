# Particle Field

An interactive particle simulation rendered on an HTML5 canvas. 600 particles orbit your cursor, respond to gravity, and explode on click.

## Demo

Open `particles.html` in any modern browser — no build step or dependencies required.

## Controls

| Input      | Effect                                                                |
| ---------- | --------------------------------------------------------------------- |
| Move mouse | Particles are attracted toward the cursor                             |
| Click      | Triggers an explosion that blasts nearby particles outward            |
| Scroll     | Adjusts gravity strength (scroll up = stronger, scroll down = weaker) |

## How it works

- Each particle has position, velocity, hue, and radius
- Every frame, a gravitational force pulls particles toward the mouse, with a short-range repulsion to prevent clumping
- Velocity is capped and dampened each frame for stable orbits
- Hue shifts with speed, so fast-moving particles glow brighter
- Particles wrap around screen edges
- Click events spawn an expanding ripple ring and apply an outward impulse

## Development

Code quality tooling requires Node.js 18+. Install once with `npm install`, then:

| Command                | What it does                                              |
| ---------------------- | --------------------------------------------------------- |
| `npm run quality`      | Run every check (formatting + JS lint + HTML lint)        |
| `npm run quality:fix`  | Auto-format and auto-fix what can be fixed, then re-check |
| `npm run format`       | Format all files with Prettier                            |
| `npm run format:check` | Verify formatting without writing changes                 |
| `npm run lint:js`      | Lint inline `<script>` code with ESLint                   |
| `npm run lint:html`    | Validate HTML structure with HTMLHint                     |
