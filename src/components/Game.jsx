import { useEffect, useRef, useState } from 'react';
import { createWorld, step, flick, endTurn, kickoff } from '../game/physics.js';
import { aiFlick } from '../game/ai.js';
import { FW, FH, MAX_DRAG, MAX_SPEED, MAX_TURNS } from '../game/constants.js';
import { drawBoard } from './draw.js';

// 무무월드컵2 — 알까기 물리 게임 (가로 풀스크린)
// props: mode '1p'|'2p', p1/p2 {name}, difficulty(1P AI), onEnd(result), onQuit()
export default function Game({ mode, p1, p2, difficulty = 0.5, onEnd, onQuit }) {
  const canvasRef = useRef(null);
  const worldRef = useRef(null);
  if (!worldRef.current) worldRef.current = createWorld();

  const aimRef = useRef(null);
  const aiTimerRef = useRef(0);
  const rafRef = useRef(0);
  const ctxRef = useRef(null);
  const runningRef = useRef(false);
  const pausedRef = useRef(false);    // 골 연출 중 멈춤
  const endedRef = useRef(false);

  const [hud, setHud] = useState(() => snapshot(worldRef.current));
  const [splash, setSplash] = useState(null);   // {team, name}
  const [result, setResult] = useState(null);   // {homeWon, tie}

  function sync() { setHud(snapshot(worldRef.current)); }

  // 캔버스 초기화
  useEffect(() => {
    const canvas = canvasRef.current;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = FW * dpr;
    canvas.height = FH * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctxRef.current = ctx;
    draw();
    if (active(worldRef.current)) ensureLoop();
    return () => { cancelAnimationFrame(rafRef.current); runningRef.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function draw() {
    if (ctxRef.current) drawBoard(ctxRef.current, worldRef.current, aimRef.current);
  }
  function active(w) {
    if (pausedRef.current) return false;
    if (w.phase === 'sim') return true;
    return mode === '1p' && w.phase === 'aim' && w.turn === 'away';
  }
  function ensureLoop() {
    if (runningRef.current) return;
    runningRef.current = true;
    rafRef.current = requestAnimationFrame(loop);
  }
  function loop() {
    const w = worldRef.current;
    if (w.phase === 'sim') {
      for (let i = 0; i < 2; i++) {
        const res = step(w);
        if (res.goal) { handleGoal(w, res.goal); break; }
        if (res.settled) { finishTurn(w); break; }
      }
    } else if (mode === '1p' && w.phase === 'aim' && w.turn === 'away') {
      if (!aiTimerRef.current) aiTimerRef.current = performance.now() + 600;
      else if (performance.now() > aiTimerRef.current) {
        aiTimerRef.current = 0;
        aiFlick(w, difficulty);
        sync();
      }
    }
    draw();
    if (active(worldRef.current)) rafRef.current = requestAnimationFrame(loop);
    else { runningRef.current = false; draw(); }
  }

  // 득점 → 스플래시 연출 후 킥오프
  function handleGoal(w, scorer) {
    w.score[scorer] += 1;
    w.turnCount += 1;
    const name = scorer === 'home' ? p1.name : p2.name;
    setSplash({ team: scorer, name });
    pausedRef.current = true;
    runningRef.current = false;
    sync();

    setTimeout(() => {
      setSplash(null);
      pausedRef.current = false;
      if (w.turnCount >= MAX_TURNS) { finishMatch(w); return; }
      const concede = scorer === 'home' ? 'away' : 'home';
      kickoff(w, concede);
      w.message = '';
      sync();
      draw();
      if (active(w)) ensureLoop();
    }, 1700);
  }

  function finishTurn(w) {
    endTurn(w);
    aiTimerRef.current = 0;
    if (w.phase === 'ended') { finishMatch(w); return; }
    sync();
  }

  // 경기 종료 처리
  function finishMatch(w) {
    if (endedRef.current) return;
    endedRef.current = true;
    w.phase = 'ended';
    const { home, away } = w.score;
    const tie = home === away;
    const homeWon = tie ? Math.random() < 0.5 : home > away;
    setResult({ homeWon, tie });
    sync();
  }

  // ── 포인터(튕기기) 입력 ──
  function toLogical(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * FW,
      y: ((e.clientY - rect.top) / rect.height) * FH,
    };
  }
  // 이번 턴에 사람이 조작할 팀 (1P는 home만, 2P는 현재 턴 팀)
  function humanTeam(w) {
    if (w.phase !== 'aim' || pausedRef.current) return null;
    if (mode === '2p') return w.turn;
    return w.turn === 'home' ? 'home' : null;
  }
  function onDown(e) {
    const w = worldRef.current;
    const team = humanTeam(w);
    if (!team) return;
    const { x, y } = toLogical(e);
    const hit = w.pieces.find((p) => p.team === team && Math.hypot(p.x - x, p.y - y) <= p.r + 10);
    if (!hit) return;
    aimRef.current = { id: hit.id, sx: hit.x, sy: hit.y, px: x, py: y };
    try { canvasRef.current.setPointerCapture(e.pointerId); } catch { /* 합성 이벤트 */ }
    draw();
  }
  function onMove(e) {
    if (!aimRef.current) return;
    const { x, y } = toLogical(e);
    aimRef.current.px = x; aimRef.current.py = y;
    draw();
  }
  function onUp() {
    const a = aimRef.current;
    if (!a) return;
    aimRef.current = null;
    const dx = a.px - a.sx, dy = a.py - a.sy;
    const dist = Math.hypot(dx, dy);
    if (dist < 6) { draw(); return; }
    const mag = (Math.min(dist, MAX_DRAG) / MAX_DRAG) * MAX_SPEED;
    flick(worldRef.current, a.id, (-dx / dist) * mag, (-dy / dist) * mag);
    sync();
    ensureLoop();
  }

  function rematch() {
    endedRef.current = false;
    aiTimerRef.current = 0;
    aimRef.current = null;
    pausedRef.current = false;
    setResult(null);
    setSplash(null);
    worldRef.current = createWorld();
    sync();
    draw();
  }

  const turnTeam = hud.turn;
  const turnName = turnTeam === 'home' ? p1.name : p2.name;
  const myTurnLabel = mode === '1p'
    ? (turnTeam === 'home' ? '내 차례' : '상대(AI) 차례')
    : `${turnName} 차례`;

  return (
    <div className="game-screen">
      <div className="game-hud">
        <button className="exit-btn" onClick={onQuit}>← 나가기</button>
        <div className="score-panel">
          <span className="team-name home">{p1.name}</span>
          <span className="sc sc-home">{hud.score.home}</span>
          <span className="sc-sep">:</span>
          <span className="sc sc-away">{hud.score.away}</span>
          <span className="team-name away">{p2.name}</span>
        </div>
        <div className="turn-pill">{hud.turnCount}/{MAX_TURNS}턴</div>
      </div>

      <div className="board-wrap">
        <canvas
          ref={canvasRef}
          className="pitch"
          style={{ touchAction: 'none' }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        />

        {splash && (
          <div className={`goal-splash ${splash.team}`}>
            <div className="goal-big">⚽ GOAL!</div>
            <div className="goal-team">{splash.name}</div>
          </div>
        )}

        {result && (
          <div className="end-overlay">
            <div className="end-card">
              {mode === '1p' ? (
                <>
                  <h2>{result.homeWon ? '🎉 승리!' : '😢 패배'}</h2>
                  <p className="end-score">{hud.score.home} : {hud.score.away}{result.tie ? ' (승부차기)' : ''}</p>
                  <button className="btn-primary" onClick={() => onEnd({ homeWon: result.homeWon })}>
                    {result.homeWon ? '다음 라운드 ▶' : '대진표로'}
                  </button>
                </>
              ) : (
                <>
                  <h2>{result.tie ? '승부차기 끝!' : (result.homeWon ? `🏆 ${p1.name} 승리!` : `🏆 ${p2.name} 승리!`)}</h2>
                  <p className="end-score">{hud.score.home} : {hud.score.away}</p>
                  <div className="end-btns">
                    <button className="btn-ghost" onClick={onQuit}>나가기</button>
                    <button className="btn-primary" onClick={rematch}>다시 ▶</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="game-foot">
        {!result && (
          <p className={`turn-tip ${turnTeam}`}>
            <span className="turn-dot" /> {myTurnLabel}
            <span className="tip-sub"> — 조각을 누른 채 반대로 당겼다 놓기</span>
          </p>
        )}
      </div>
    </div>
  );
}

function snapshot(w) {
  return { turn: w.turn, phase: w.phase, score: { ...w.score }, turnCount: w.turnCount, message: w.message };
}
