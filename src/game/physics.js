// 무무월드컵2 — 물리 엔진 (알까기 튕기기) · 가로 필드, 골대 좌/우
import {
  FW, FH, GOAL_H, PIECE_R, BALL_R, PIECE_MASS, BALL_MASS,
  FRICTION, STOP, RESTITUTION, WALL_DAMP, MAX_SPEED, MAX_TURNS,
} from './constants.js';

const GOAL_Y0 = (FH - GOAL_H) / 2;
const GOAL_Y1 = (FH + GOAL_H) / 2;
export const goalBounds = { y0: GOAL_Y0, y1: GOAL_Y1 };

let _uid = 0;
const nid = () => `e${_uid++}`;

// 초기 포메이션 (4 vs 4 + 공). home=왼쪽, away=오른쪽
function formation() {
  _uid = 0;
  const piece = (team, role, x, y) => ({
    id: nid(), kind: 'piece', team, role, x, y, vx: 0, vy: 0, r: PIECE_R, mass: PIECE_MASS,
  });
  const cy = FH / 2;
  const home = [
    piece('home', 'GK', 45, cy),
    piece('home', 'DF', 200, cy - 110),
    piece('home', 'DF', 200, cy + 110),
    piece('home', 'FW', 360, cy),
  ];
  const away = [
    piece('away', 'GK', FW - 45, cy),
    piece('away', 'DF', FW - 200, cy - 110),
    piece('away', 'DF', FW - 200, cy + 110),
    piece('away', 'FW', FW - 360, cy),
  ];
  const ball = { id: 'ball', kind: 'ball', x: FW / 2, y: cy, vx: 0, vy: 0, r: BALL_R, mass: BALL_MASS };
  return { pieces: [...home, ...away], ball };
}

export function createWorld() {
  const { pieces, ball } = formation();
  return {
    pieces,
    ball,
    turn: 'home',
    phase: 'aim',          // 'aim' | 'sim' | 'ended'
    score: { home: 0, away: 0 },
    turnCount: 0,
    message: '',
    aim: null,
  };
}

// 득점 후 킥오프: 포메이션 리셋, 실점 팀이 선공
export function kickoff(world, concedingTeam) {
  const { pieces, ball } = formation();
  world.pieces = pieces;
  world.ball = ball;
  world.turn = concedingTeam;
  world.phase = 'aim';
  world.aim = null;
}

export function allEntities(world) {
  return [...world.pieces, world.ball];
}

const speed = (e) => Math.hypot(e.vx, e.vy);

// 한 조각 튕기기
export function flick(world, id, vx, vy) {
  const e = world.pieces.find((p) => p.id === id);
  if (!e) return;
  const sp = Math.hypot(vx, vy);
  if (sp > MAX_SPEED) { vx = (vx / sp) * MAX_SPEED; vy = (vy / sp) * MAX_SPEED; }
  e.vx = vx; e.vy = vy;
  world.phase = 'sim';
  world.aim = null;
}

// 원-원 충돌 (질량 반영 탄성)
function collide(a, b) {
  let dx = b.x - a.x, dy = b.y - a.y;
  let dist = Math.hypot(dx, dy) || 0.0001;
  const overlap = a.r + b.r - dist;
  if (overlap <= 0) return;
  const nx = dx / dist, ny = dy / dist;
  const invA = 1 / a.mass, invB = 1 / b.mass, invSum = invA + invB;
  a.x -= nx * overlap * (invA / invSum);
  a.y -= ny * overlap * (invA / invSum);
  b.x += nx * overlap * (invB / invSum);
  b.y += ny * overlap * (invB / invSum);
  const rvx = b.vx - a.vx, rvy = b.vy - a.vy;
  const vn = rvx * nx + rvy * ny;
  if (vn > 0) return;
  const j = (-(1 + RESTITUTION) * vn) / invSum;
  const ix = j * nx, iy = j * ny;
  a.vx -= ix * invA; a.vy -= iy * invA;
  b.vx += ix * invB; b.vy += iy * invB;
}

const inMouth = (y) => y > GOAL_Y0 && y < GOAL_Y1;

// 벽 반사 (공은 좌/우 골대 입구로 통과)
function walls(e) {
  if (e.y - e.r < 0) { e.y = e.r; e.vy = -e.vy * WALL_DAMP; }
  if (e.y + e.r > FH) { e.y = FH - e.r; e.vy = -e.vy * WALL_DAMP; }
  const pass = e.kind === 'ball' && inMouth(e.y);
  if (!pass && e.x - e.r < 0) { e.x = e.r; e.vx = -e.vx * WALL_DAMP; }
  if (!pass && e.x + e.r > FW) { e.x = FW - e.r; e.vx = -e.vx * WALL_DAMP; }
}

// 한 프레임 진행. 반환 { goal: 'home'|'away'|null, settled }
export function step(world) {
  if (world.phase !== 'sim') return { goal: null, settled: true };
  const ents = allEntities(world);

  for (const e of ents) {
    e.x += e.vx; e.y += e.vy;
    e.vx *= FRICTION; e.vy *= FRICTION;
    if (speed(e) < STOP) { e.vx = 0; e.vy = 0; }
  }
  for (let i = 0; i < ents.length; i++)
    for (let j = i + 1; j < ents.length; j++) collide(ents[i], ents[j]);
  for (const e of ents) walls(e);

  // 골: 공이 좌/우 골라인 통과. 왼쪽 골=away 득점, 오른쪽 골=home 득점
  const b = world.ball;
  if (inMouth(b.y)) {
    if (b.x < -b.r) return { goal: 'away', settled: false };
    if (b.x > FW + b.r) return { goal: 'home', settled: false };
  }

  const moving = ents.some((e) => speed(e) > 0);
  return { goal: null, settled: !moving };
}

// 턴 종료. world.phase==='ended'면 경기 끝
export function endTurn(world) {
  world.turnCount += 1;
  if (world.turnCount >= MAX_TURNS) {
    world.phase = 'ended';
    return;
  }
  world.turn = world.turn === 'home' ? 'away' : 'home';
  world.phase = 'aim';
}
