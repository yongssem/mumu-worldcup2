// 무무월드컵2 — localStorage 전적 저장
const KEY = 'mumu-worldcup2:record';

const empty = { wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 };

export function loadRecord() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...empty, ...JSON.parse(raw) } : { ...empty };
  } catch {
    return { ...empty };
  }
}

export function saveResult(score) {
  const rec = loadRecord();
  if (score.home > score.away) rec.wins += 1;
  else if (score.home === score.away) rec.draws += 1;
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

export function resetRecord() {
  try { localStorage.removeItem(KEY); } catch { /* noop */ }
  return { ...empty };
}
