// 무무월드컵2 — 캔버스 렌더 (90년대 축구게임판 비주얼) · 가로 필드
import { FW, FH, GOAL_H, MAX_DRAG, TEAM } from '../game/constants.js';

const GY0 = (FH - GOAL_H) / 2;
const GY1 = (FH + GOAL_H) / 2;

export function drawBoard(ctx, world, aim) {
  ctx.clearRect(0, 0, FW, FH);
  field(ctx);
  lines(ctx);
  goals(ctx);
  if (aim) drawAim(ctx, world, aim);
  for (const p of world.pieces) piece(ctx, p, world.turn === p.team && world.phase === 'aim');
  ball(ctx, world.ball);
}

// 초록 잔디 + 노란 점박이
function field(ctx) {
  ctx.fillStyle = '#3fa047';
  ctx.fillRect(0, 0, FW, FH);
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  for (let x = 0; x < FW; x += 64) ctx.fillRect(x, 0, 32, FH); // 세로 줄무늬
  ctx.fillStyle = 'rgba(255,221,51,0.5)';
  const gap = 26;
  for (let r = 0; r * gap < FH; r++) {
    for (let c = 0; c * gap < FW; c++) {
      const x = c * gap + (r % 2 ? gap / 2 : 0) + 10;
      const y = r * gap + 16;
      if (x > FW - 4) continue;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// 흰색 필드 라인 (가로 기준)
function lines(ctx) {
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 2.5;
  const m = 12;
  ctx.strokeRect(m, m, FW - 2 * m, FH - 2 * m);
  // 하프라인 (세로)
  ctx.beginPath();
  ctx.moveTo(FW / 2, m); ctx.lineTo(FW / 2, FH - m); ctx.stroke();
  // 센터서클
  ctx.beginPath();
  ctx.arc(FW / 2, FH / 2, 72, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath();
  ctx.arc(FW / 2, FH / 2, 4, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
  // 페널티 박스 (좌/우)
  const pbw = 120, pbh = 280, pby = (FH - pbh) / 2;
  ctx.strokeRect(m, pby, pbw, pbh);
  ctx.strokeRect(FW - m - pbw, pby, pbw, pbh);
  // 골 에어리어 (작은 박스)
  const gaw = 55, gah = 170, gay = (FH - gah) / 2;
  ctx.strokeRect(m, gay, gaw, gah);
  ctx.strokeRect(FW - m - gaw, gay, gaw, gah);
}

// 좌/우 골대 + 그물
function goals(ctx) {
  const depth = 11;
  for (const left of [true, false]) {
    const x = left ? 0 : FW;
    const dir = left ? 1 : -1;
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(left ? 0 : FW - depth, GY0, depth, GOAL_H);
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 1;
    for (let y = GY0; y <= GY1; y += 10) {
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dir * depth, y); ctx.stroke();
    }
    // 빨간 골대 프레임
    ctx.strokeStyle = '#e11d2a';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x, GY0); ctx.lineTo(x + dir * depth, GY0);
    ctx.lineTo(x + dir * depth, GY1); ctx.lineTo(x, GY1);
    ctx.stroke();
  }
}

// 조각 (플라스틱 말)
function piece(ctx, p, active) {
  const t = TEAM[p.team];
  if (active) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r + 5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,221,51,0.5)';
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(p.x + 2, p.y + 2.5, p.r, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
  ctx.fillStyle = t.color;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#fff';
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 13px Pretendard, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(p.role, p.x, p.y);
}

// 공
function ball(ctx, b) {
  ctx.beginPath();
  ctx.arc(b.x + 1.5, b.y + 2, b.r, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#111';
  ctx.stroke();
  ctx.fillStyle = '#111';
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    const x = b.x + Math.cos(a) * b.r * 0.42;
    const y = b.y + Math.sin(a) * b.r * 0.42;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

// 새총 조준선 + 발사 방향 화살표
function drawAim(ctx, world, aim) {
  const dx = aim.px - aim.sx, dy = aim.py - aim.sy;
  const dist = Math.hypot(dx, dy);
  if (dist < 2) return;
  const ratio = Math.min(dist, MAX_DRAG) / MAX_DRAG;
  const color = ratio < 0.5 ? '#4ade80' : ratio < 0.8 ? '#fbbf24' : '#ef4444';

  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(aim.sx, aim.sy);
  ctx.lineTo(aim.px, aim.py);
  ctx.stroke();
  ctx.setLineDash([]);

  const len = Math.min(dist, MAX_DRAG);
  const ex = aim.sx - (dx / dist) * len;
  const ey = aim.sy - (dy / dist) * len;
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(aim.sx, aim.sy);
  ctx.lineTo(ex, ey);
  ctx.stroke();
  const ang = Math.atan2(ey - aim.sy, ex - aim.sx);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(ex, ey);
  ctx.lineTo(ex - 13 * Math.cos(ang - 0.4), ey - 13 * Math.sin(ang - 0.4));
  ctx.lineTo(ex - 13 * Math.cos(ang + 0.4), ey - 13 * Math.sin(ang + 0.4));
  ctx.closePath();
  ctx.fill();
}
