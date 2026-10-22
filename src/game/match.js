import { MAX_TURNS } from './constants.js';

// 연장전은 양 팀에 2턴씩 동일한 기회를 준 뒤 판정한다.
export function resolvePeriod(world) {
  const limit = world.turnLimit || MAX_TURNS;
  if (world.turnCount < limit) return false;
  if (world.score.home !== world.score.away) { world.phase = 'ended'; return true; }
  world.turnLimit = limit + 4;
  world.overtime = (world.overtime || 0) + 1;
  world.phase = 'aim';
  return false;
}
