// Basic tests for particles.html.
// Runs the page's inline <script> inside a Node `vm` sandbox with a minimal
// stubbed DOM + canvas, so no browser or third-party dependencies are needed.
//
// Run with: npm test   (or: node --test tests/*.test.cjs)

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const HTML = fs.readFileSync(path.join(__dirname, '..', 'particles.html'), 'utf8');
const SCRIPT = HTML.match(/<script>([\s\S]*?)<\/script>/)[1];

function createStubContext() {
  const noop = () => {};
  const ctx2d = new Proxy(
    { createRadialGradient: () => ({ addColorStop: noop }) },
    { get: (t, k) => (k in t ? t[k] : noop), set: () => true }
  );
  const canvas = { width: 0, height: 0, getContext: () => ctx2d };
  const cursor = { style: {} };
  const listeners = {};
  const rafCallbacks = [];

  const window = {
    innerWidth: 800,
    innerHeight: 600,
    addEventListener: (type, fn) => {
      (listeners[type] ||= []).push(fn);
    },
  };
  const document = {
    getElementById: id => ({ c: canvas, cursor }[id]),
  };

  const context = vm.createContext({
    window,
    document,
    Math,
    requestAnimationFrame: cb => rafCallbacks.push(cb),
  });
  vm.runInContext(SCRIPT, context);

  return {
    context,
    canvas,
    cursor,
    window,
    rafCallbacks,
    // Evaluate an expression against the script's top-level scope.
    run: code => vm.runInContext(code, context),
    fire: (type, event = {}) => (listeners[type] || []).forEach(fn => fn(event)),
  };
}

test('canvas is sized to the window on load and on resize', () => {
  const env = createStubContext();
  assert.equal(env.canvas.width, 800);
  assert.equal(env.canvas.height, 600);

  env.window.innerWidth = 1024;
  env.window.innerHeight = 768;
  env.fire('resize');
  assert.equal(env.canvas.width, 1024);
  assert.equal(env.canvas.height, 768);
  assert.equal(env.run('W'), 1024);
  assert.equal(env.run('H'), 768);
});

test('creates PARTICLE_COUNT particles with valid initial state', () => {
  const env = createStubContext();
  assert.equal(env.run('particles.length'), env.run('PARTICLE_COUNT'));
  assert.equal(env.run('PARTICLE_COUNT'), 600);

  const bad = env.run(`particles.filter(p =>
    p.x < 0 || p.x > W || p.y < 0 || p.y > H ||
    p.radius < 0.4 || p.radius > 2.2 ||
    p.hue < 0 || p.hue >= 360 ||
    Math.abs(p.vx) > 2 || Math.abs(p.vy) > 2
  ).length`);
  assert.equal(bad, 0);
});

test('particle speed is capped at MAX_SPEED', () => {
  const env = createStubContext();
  const speed = env.run(`
    const p = particles[0];
    p.x = 100; p.y = 100;
    p.vx = 500; p.vy = -500;
    p.update();
    Math.hypot(p.vx, p.vy);
  `);
  assert.ok(speed <= env.run('MAX_SPEED') + 1e-9, `speed ${speed} exceeds cap`);
});

test('particles are attracted toward a distant mouse', () => {
  const env = createStubContext();
  const vx = env.run(`
    mouse.x = 700; mouse.y = 300;
    const q = particles[1];
    q.x = 100; q.y = 300; q.vx = 0; q.vy = 0;
    q.update();
    q.vx;
  `);
  assert.ok(vx > 0, 'particle should move toward the mouse (positive x)');
});

test('particles wrap around screen edges', () => {
  const env = createStubContext();
  const pos = env.run(`
    mouse.x = W / 2; mouse.y = H / 2;
    gravityStrength = 0;
    const w = particles[2];
    w.x = -25; w.y = H + 25; w.vx = 0; w.vy = 0;
    w.update();
    ({ x: w.x, y: w.y });
  `);
  assert.equal(pos.x, env.run('W') + 20);
  assert.equal(pos.y, -20);
});

test('mousemove updates mouse position and custom cursor', () => {
  const env = createStubContext();
  env.fire('mousemove', { clientX: 123, clientY: 456 });
  assert.equal(env.run('mouse.x'), 123);
  assert.equal(env.run('mouse.y'), 456);
  assert.equal(env.cursor.style.left, '123px');
  assert.equal(env.cursor.style.top, '456px');
});

test('click explodes nearby particles outward and adds a ripple', () => {
  const env = createStubContext();
  env.run(`
    mouse.x = 400; mouse.y = 300;
    particles.forEach(p => { p.x = 0; p.y = 0; p.vx = 0; p.vy = 0; });
    particles[0].x = 450; particles[0].y = 300;   // 50px right of mouse
    particles[1].x = 400; particles[1].y = 900;   // 600px away
  `);
  env.fire('click');

  assert.ok(env.run('particles[0].vx') > 0, 'near particle pushed away from mouse');
  assert.equal(env.run('particles[1].vx'), 0);
  assert.equal(env.run('particles[1].vy'), 0);
  assert.equal(env.run('ripples.length'), 1);
  assert.deepEqual(
    { ...env.run('({ x: ripples[0].x, y: ripples[0].y, r: ripples[0].r })') },
    { x: 400, y: 300, r: 0 }
  );
});

test('scroll adjusts gravity and clamps it to [0.05, 3]', () => {
  const env = createStubContext();
  const start = env.run('gravityStrength');

  env.fire('wheel', { deltaY: -100 }); // scroll up = stronger
  assert.ok(env.run('gravityStrength') > start);

  env.fire('wheel', { deltaY: -1e6 });
  assert.equal(env.run('gravityStrength'), 3);

  env.fire('wheel', { deltaY: 1e6 });
  assert.equal(env.run('gravityStrength'), 0.05);
});

test('animation loop runs frames and fades out ripples', () => {
  const env = createStubContext();
  assert.equal(env.rafCallbacks.length, 1, 'first frame is scheduled on load');

  env.fire('click');
  assert.equal(env.run('ripples.length'), 1);

  // Run enough frames for the ripple alpha (×0.93 per frame) to drop below 0.01.
  for (let i = 1; i <= 80; i++) {
    env.rafCallbacks.shift()(i * 16.67);
  }
  assert.equal(env.rafCallbacks.length, 1, 'each frame schedules the next');
  assert.equal(env.run('ripples.length'), 0);

  const allFinite = env.run(
    'particles.every(p => [p.x, p.y, p.vx, p.vy, p.hue].every(Number.isFinite))'
  );
  assert.ok(allFinite, 'particle state stays finite after many frames');
});
