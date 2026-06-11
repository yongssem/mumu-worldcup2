// 무무월드컵2 — 상대팀(away) 튕기기 AI. away는 왼쪽(x=0) 골대를 공격.
import { FH, MAX_SPEED } from './constants.js';
import { flick, goalBounds } from './physics.js';

const targetGoal = () => ({ x: 0, y: (goalBounds.y0 + goalBounds.y1) / 2 });

const norm = (x, y) => { const d = Math.hypot(x, y) || 1; return { x: x / d, y: y / d }; };
const dot = (a, b) => a.x * b.x + a.y * b.y;

// difficulty: 0~1 (라운드가 올라갈수록 정교/강하게). 기본 0.5
export function aiFlick(world, difficulty = 0.5) {
  if (world.phase !== 'aim' || world.turn !== 'away') return;
  const ball = world.ball;
  const goal = targetGoal();
  const ballToGoal = norm(goal.x - ball.x, goal.y - ball.y);

  const mine = world.pieces.filter((p) => p.team === 'away');
  let best = null;
  for (const p of mine) {
    const toBall = norm(ball.x - p.x, ball.y - p.y);
    const dist = Math.hypot(ball.x - p.x, ball.y - p.y);
    const align = dot(toBall, ballToGoal);
    const penalty = p.role === 'GK' ? 0.6 : 0;
    const score = align - dist / 600 - penalty;
    if (!best || score > best.score) best = { p, toBall, dist, align, score };
  }
  if (!best) return;

  const dir = best.toBall;
  const base = best.align > 0.2 ? 9 : 5;
  const power = Math.min(MAX_SPEED, best.dist * 0.14 + base + difficulty * 4);
  // 실력이 낮을수록 흔들림 큼
  const jitter = (rand() - 0.5) * (0.32 - difficulty * 0.22);
  const ca = Math.cos(jitter), sa = Math.sin(jitter);
  const vx = (dir.x * ca - dir.y * sa) * power;
  const vy = (dir.x * sa + dir.y * ca) * power;
  flick(world, best.p.id, vx, vy);
}

function rand() { return Math.random(); }
