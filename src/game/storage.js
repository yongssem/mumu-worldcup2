// 무무월드컵2 — localStorage 전적 저장
const KEY = 'mumu-worldcup2:record';

import { PLAYER_TEAM, TEAMS } from './constants.js';
const SESSION_KEY = 'mumu-worldcup2:tournament';
const empty = { wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, titles: 0 };

export function loadRecord() {
  try {
    const raw = localStorage.getItem(KEY);
    const data = raw ? JSON.parse(raw) : {};
    return Object.fromEntries(Object.keys(empty).map((key) => [key, Number.isSafeInteger(data?.[key]) && data[key] >= 0 ? data[key] : 0]));
  } catch {
    return { ...empty };
  }
}

export function saveResult(score, homeWon = score.home > score.away) {
  const rec = loadRecord();
  if (homeWon) rec.wins += 1;
  else rec.losses += 1;
  rec.goalsFor += score.home;
  rec.goalsAgainst += score.away;
  try {
    localStorage.setItem(KEY, JSON.stringify(rec));
  } catch {
    /* 저장 실패 무시 */
  }
  return rec;
}

export function saveTitle() {
  const rec = loadRecord();
  rec.titles += 1;
  try { localStorage.setItem(KEY, JSON.stringify(rec)); } catch { /* 비공개 모드에서도 플레이 가능 */ }
}

export function saveTournament(tournament) {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(tournament)); } catch { /* 저장 공간 제한 */ }
}

export function loadTournament() {
  try {
    const t = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (!t || !Number.isInteger(t.roundIdx) || t.roundIdx < 0 || t.roundIdx > 3 || !['playing', 'champion', 'eliminated'].includes(t.status)) return null;
    if (!Array.isArray(t.rounds) || t.rounds.length !== t.roundIdx + 1) return null;
    if (!t.rounds.every((round, i) => Array.isArray(round) && round.length === 8 / (2 ** i) && round.every((m) => m && TEAMS.includes(m.a) && TEAMS.includes(m.b) && m.a !== m.b && (m.winner === null || m.winner === m.a || m.winner === m.b)))) return null;
    if (!t.rounds.every((round) => round[0].a === PLAYER_TEAM)) return null;
    if (t.status === 'playing' && t.rounds[t.roundIdx][0].winner !== null) return null;
    return t;
  } catch { return null; }
}

export function resetRecord() {
  try { localStorage.removeItem(KEY); } catch { /* noop */ }
  return { ...empty };
}
