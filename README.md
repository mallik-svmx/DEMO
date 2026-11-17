# Particle Field

An interactive particle simulation rendered on an HTML5 canvas. 600 particles orbit your cursor, respond to gravity, and explode on click.

## Demo

Open `particles.html` in any modern browser — no build step or dependencies required.

## Controls

| Input | Effect |
|-------|--------|
| Move mouse | Particles are attracted toward the cursor |
| Click | Triggers an explosion that blasts nearby particles outward |
| Scroll | Adjusts gravity strength (scroll up = stronger, scroll down = weaker) |

## How it works

- Each particle has position, velocity, hue, and radius
- Every frame, a gravitational force pulls particles toward the mouse, with a short-range repulsion to prevent clumping
- Velocity is capped and dampened each frame for stable orbits
- Hue shifts with speed, so fast-moving particles glow brighter
- Particles wrap around screen edges
- Click events spawn an expanding ripple ring and apply an outward impulse
