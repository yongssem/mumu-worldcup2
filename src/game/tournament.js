// 무무월드컵2 — 월드컵 16강 토너먼트 (싱글 엘리미네이션)
import { TEAMS, PLAYER_TEAM } from './constants.js';

export const ROUND_NAMES = ['16강', '8강', '4강', '결승'];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 대진표 생성. 플레이어(무무 코리아)는 항상 슬롯 0.
export function createTournament() {
  const others = shuffle(TEAMS.filter((t) => t !== PLAYER_TEAM));
  const sixteen = [PLAYER_TEAM, ...others];
  const round0 = [];
  for (let i = 0; i < 16; i += 2) {
    round0.push({ a: sixteen[i], b: sixteen[i + 1], winner: null });
  }
  return { rounds: [round0], roundIdx: 0, status: 'playing' };
}

const replace = (arr, idx, val) => arr.map((x, i) => (i === idx ? val : x));

// 현재 라운드의 플레이어 상대
export function currentOpponent(t) {
  return t.rounds[t.roundIdx][0].b;
}
export function roundName(t) {
  return ROUND_NAMES[t.roundIdx] || '결승';
}
// 라운드가 올라갈수록 AI 난이도 상승 (0.35 → 0.89)
export function aiDifficulty(t) {
  return Math.min(0.9, 0.35 + t.roundIdx * 0.18);
}

// 플레이어 경기 결과 반영 → 새 토너먼트 상태 반환
export function advance(t, playerWon) {
  const r = t.roundIdx;
  const round = t.rounds[r].map((m) => ({ ...m }));

  if (!playerWon) {
    round[0].winner = round[0].b;
    return { ...t, rounds: replace(t.rounds, r, round), status: 'eliminated' };
  }

  round[0].winner = PLAYER_TEAM;
  for (let i = 1; i < round.length; i++) {
    round[i].winner = Math.random() < 0.5 ? round[i].a : round[i].b;
  }
  const winners = round.map((m) => m.winner);
  const newRounds = replace(t.rounds, r, round);

  if (winners.length === 1) {
    return { ...t, rounds: newRounds, status: 'champion' };
  }
  const next = [];
  for (let i = 0; i < winners.length; i += 2) {
    next.push({ a: winners[i], b: winners[i + 1], winner: null });
  }
  return { ...t, rounds: [...newRounds, next], roundIdx: r + 1, status: 'playing' };
}
