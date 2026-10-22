import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorld, flick, step, endTurn, kickoff, allEntities } from '../src/game/physics.js';
import { resolvePeriod } from '../src/game/match.js';
import { createTournament, advance, currentOpponent } from '../src/game/tournament.js';
import { saveResult, loadRecord, loadTournament, saveTournament, saveTitle } from '../src/game/storage.js';
import { PLAYER_TEAM, MAX_SPEED, MAX_TURNS, FW } from '../src/game/constants.js';

const store = new Map();
globalThis.localStorage = { getItem: (key) => store.get(key) ?? null, setItem: (key, value) => store.set(key, value), removeItem: (key) => store.delete(key) };

test('동점은 연장전으로 진행하고 두 팀의 턴을 모두 마친 뒤 판정한다', () => {
  const w = createWorld();
  w.turnCount = MAX_TURNS;
  w.phase = 'ended';
  assert.equal(resolvePeriod(w), false);
  assert.equal(w.turnLimit, 28);
  assert.equal(w.overtime, 1);
  w.score.home = 1;
  w.turnCount = 27;
  assert.equal(resolvePeriod(w), false);
  w.turnCount = 28;
  assert.equal(resolvePeriod(w), true);
  assert.equal(w.phase, 'ended');
});

test('계속 동점이면 추첨 없이 다음 연장전, 턴도 번갈아 유지된다', () => {
  const w = createWorld();
  w.turnCount = 23;
  w.turn = 'away';
  endTurn(w);
  assert.equal(w.turn, 'home');
  resolvePeriod(w);
  w.turnCount = 28;
  resolvePeriod(w);
  assert.equal(w.turnLimit, 32);
  assert.equal(w.overtime, 2);
});

test('잘못된 팀, 비정상 속도, 시뮬레이션 중 중복 슛을 거부한다', () => {
  const w = createWorld();
  flick(w, w.pieces[4].id, 12, 0);
  assert.equal(w.phase, 'aim');
  flick(w, w.pieces[3].id, NaN, 0);
  assert.equal(w.phase, 'aim');
  flick(w, w.pieces[3].id, 1000, 0);
  assert.equal(w.pieces[3].vx, MAX_SPEED);
  flick(w, w.pieces[0].id, 20, 0);
  assert.equal(w.pieces[0].vx, 0);
});

test('좌우 득점과 킥오프가 점수와 턴 수를 보존한다', () => {
  for (const [x, team] of [[-30, 'away'], [FW + 30, 'home']]) {
    const w = createWorld();
    w.phase = 'sim'; w.ball.x = x; w.ball.y = 300;
    assert.equal(step(w).goal, team);
    w.score[team]++; w.turnCount = 4;
    kickoff(w, team === 'home' ? 'away' : 'home');
    assert.equal(w.score[team], 1);
    assert.equal(w.turnCount, 4);
    assert.equal(w.ball.x, FW / 2);
  }
});

test('완전히 겹친 조각도 분리되며 고정 스텝 시뮬레이션은 유한하게 정지한다', () => {
  const w = createWorld();
  w.pieces[1].x = w.pieces[0].x; w.pieces[1].y = w.pieces[0].y;
  flick(w, w.pieces[3].id, 22, 3);
  let settled = false;
  for (let i = 0; i < 2000; i++) {
    const r = step(w);
    assert.ok(allEntities(w).every((e) => Number.isFinite(e.x) && Number.isFinite(e.y)));
    if (r.goal || r.settled) { settled = true; break; }
  }
  assert.ok(settled);
  assert.ok(Math.hypot(w.pieces[0].x - w.pieces[1].x, w.pieces[0].y - w.pieces[1].y) > 0);
});

test('16개 고유 팀, 4승 우승, 중도 탈락 및 대진표 복원', () => {
  let t = createTournament();
  assert.equal(new Set(t.rounds[0].flatMap((m) => [m.a, m.b])).size, 16);
  assert.notEqual(currentOpponent(t), PLAYER_TEAM);
  for (let i = 0; i < 4; i++) {
    saveTournament(t);
    assert.deepEqual(loadTournament(), t);
    t = advance(t, true);
  }
  assert.equal(t.status, 'champion');
  saveTournament(t); assert.equal(loadTournament().status, 'champion');
  assert.equal(advance(createTournament(), false).status, 'eliminated');
});

test('실제 득실점 기록과 우승 수는 별도로 누적한다', () => {
  store.clear();
  saveResult({ home: 3, away: 1 }, true);
  saveResult({ home: 0, away: 2 }, false);
  saveTitle();
  assert.deepEqual(loadRecord(), { wins: 1, draws: 0, losses: 1, goalsFor: 3, goalsAgainst: 3, titles: 1 });
});

test('손상된 저장 데이터와 저장 차단 환경에서도 기본 상태로 실행한다', () => {
  store.set('mumu-worldcup2:record', '{broken');
  assert.equal(loadRecord().wins, 0);
  store.set('mumu-worldcup2:record', JSON.stringify({ wins: -3, losses: '999', goalsFor: null }));
  assert.equal(loadRecord().losses, 0);
  store.set('mumu-worldcup2:tournament', JSON.stringify({ roundIdx: 99 }));
  assert.equal(loadTournament(), null);
  const original = globalThis.localStorage;
  globalThis.localStorage = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } };
  assert.doesNotThrow(() => saveResult({ home: 2, away: 0 }));
  assert.equal(loadTournament(), null);
  globalThis.localStorage = original;
});
