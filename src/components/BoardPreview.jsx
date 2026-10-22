import { useEffect, useRef } from 'react';
import { drawBoard } from './draw.js';
import { createWorld } from '../game/physics.js';
import { FW, FH } from '../game/constants.js';

export default function BoardPreview() {
  const ref = useRef(null);
  useEffect(() => {
    const ctx = ref.current.getContext('2d');
    const world = createWorld();
    const p = world.pieces[3];
    drawBoard(ctx, world, { id: p.id, sx: p.x, sy: p.y, px: p.x - 110, py: p.y + 30 });
  }, []);
  return <figure className="board-preview">
    <div className="preview-head"><span><i /> KICK-OFF READY</span><span>4 vs 4</span></div>
    <canvas ref={ref} width={FW} height={FH} aria-label="파랑과 빨강 팀이 마주 선 실제 게임 경기장 미리보기" />
    <figcaption><span>당기고. 조준하고. 골!</span><span>YOUR NEXT GREAT GOAL ↗</span></figcaption>
  </figure>;
}
