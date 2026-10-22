import { useEffect, useRef, useState } from 'react';
import { createWorld, step, flick, endTurn, kickoff } from '../game/physics.js';
import { aiFlick } from '../game/ai.js';
import { FW, FH, MAX_DRAG, MAX_SPEED } from '../game/constants.js';
import { drawBoard } from './draw.js';
import { resolvePeriod } from '../game/match.js';
import Modal from './Modal.jsx';
import Icon from './Icons.jsx';

// 무무월드컵2 — 알까기 물리 게임 (가로 풀스크린)
// props: mode '1p'|'2p', p1/p2 {name}, difficulty(1P AI), onEnd(result), onQuit()
export default function Game({ mode, p1, p2, difficulty = 0.5, onEnd, onQuit, onRecord, onGuide, onFullscreen, suspended }) {
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
  const goalTimerRef = useRef(0);
  const frameTimeRef = useRef(0);
  const accumulatorRef = useRef(0);
  const suspendedRef = useRef(false);
  const [quitOpen, setQuitOpen] = useState(false);
  const [power, setPower] = useState(0);
  const [hidden, setHidden] = useState(document.hidden);

  const [hud, setHud] = useState(() => snapshot(worldRef.current));
  const [splash, setSplash] = useState(null);   // {team, name}
  const [result, setResult] = useState(null);   // {homeWon, tie}

  useEffect(() => {
    const change = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', change);
    return () => document.removeEventListener('visibilitychange', change);
  }, []);
  useEffect(() => {
    suspendedRef.current = suspended || quitOpen || hidden;
    cancelAim();
    if (!suspendedRef.current && active(worldRef.current)) ensureLoop();
  }, [suspended, quitOpen, hidden]);

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
    return () => { cancelAnimationFrame(rafRef.current); clearTimeout(goalTimerRef.current); runningRef.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function draw() {
    if (ctxRef.current) drawBoard(ctxRef.current, worldRef.current, aimRef.current);
  }
  function active(w) {
    if (pausedRef.current || suspendedRef.current) return false;
    if (w.phase === 'sim') return true;
    return mode === '1p' && w.phase === 'aim' && w.turn === 'away';
  }
  function ensureLoop() {
    if (runningRef.current) return;
    runningRef.current = true;
    frameTimeRef.current = 0;
    accumulatorRef.current = 0;
    rafRef.current = requestAnimationFrame(loop);
  }
  function loop(timestamp) {
    const w = worldRef.current;
    if (suspendedRef.current) { runningRef.current = false; return; }
    const delta = frameTimeRef.current ? Math.min(timestamp - frameTimeRef.current, 50) : 1000 / 60;
    frameTimeRef.current = timestamp;
    if (w.phase === 'sim') {
      accumulatorRef.current += delta;
      while (accumulatorRef.current >= 1000 / 120) {
        accumulatorRef.current -= 1000 / 120;
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

    goalTimerRef.current = setTimeout(() => {
      setSplash(null);
      pausedRef.current = false;
      if (resolvePeriod(w)) { finishMatch(w); return; }
      const concede = w.overtime > 0 ? (w.turn === 'home' ? 'away' : 'home') : (scorer === 'home' ? 'away' : 'home');
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
    if (resolvePeriod(w)) { finishMatch(w); return; }
    sync();
  }

  // 경기 종료 처리
  function finishMatch(w) {
    if (endedRef.current) return;
    endedRef.current = true;
    w.phase = 'ended';
    const { home, away } = w.score;
    const homeWon = home > away;
    setResult({ homeWon, tie: false });
    onRecord?.({ score: { ...w.score }, homeWon });
    sync();
  }

  // ── 포인터(튕기기) 입력 ──
  function toLogical(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left - canvasRef.current.clientLeft) / canvasRef.current.clientWidth) * FW,
      y: ((e.clientY - rect.top - canvasRef.current.clientTop) / canvasRef.current.clientHeight) * FH,
    };
  }
  // 이번 턴에 사람이 조작할 팀 (1P는 home만, 2P는 현재 턴 팀)
  function humanTeam(w) {
    if (w.phase !== 'aim' || pausedRef.current || suspendedRef.current) return null;
    if (mode === '2p') return w.turn;
    return w.turn === 'home' ? 'home' : null;
  }
  function onDown(e) {
    if (!e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0) || aimRef.current) return;
    const w = worldRef.current;
    const team = humanTeam(w);
    if (!team) return;
    const { x, y } = toLogical(e);
    const radius = Math.max(28, 22 * FW / canvasRef.current.clientWidth);
    const hit = w.pieces.filter((p) => p.team === team).sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y)).find((p) => Math.hypot(p.x - x, p.y - y) <= Math.max(p.r, radius));
    if (!hit) return;
    aimRef.current = { id: hit.id, sx: hit.x, sy: hit.y, px: hit.x, py: hit.y, pointerId: e.pointerId, startX: x, startY: y };
    try { canvasRef.current.setPointerCapture(e.pointerId); } catch { /* 합성 이벤트 */ }
    draw();
  }
  function onMove(e) {
    if (!aimRef.current || aimRef.current.pointerId !== e.pointerId) return;
    const { x, y } = toLogical(e);
    const a = aimRef.current;
    a.px = a.sx + x - a.startX; a.py = a.sy + y - a.startY;
    setPower(Math.round(Math.min(Math.hypot(a.px - a.sx, a.py - a.sy) / MAX_DRAG, 1) * 100));
    draw();
  }
  function onUp(e) {
    const a = aimRef.current;
    if (!a || (e?.pointerId !== undefined && a.pointerId !== e.pointerId)) return;
    aimRef.current = null;
    setPower(0);
    const dx = a.px - a.sx, dy = a.py - a.sy;
    const dist = Math.hypot(dx, dy);
    if (dist < 6) { draw(); return; }
    const mag = (Math.min(dist, MAX_DRAG) / MAX_DRAG) * MAX_SPEED;
    flick(worldRef.current, a.id, (-dx / dist) * mag, (-dy / dist) * mag);
    sync();
    ensureLoop();
  }

  function cancelAim() { aimRef.current = null; setPower(0); draw(); }

  function onKeyDown(e) {
    const w = worldRef.current;
    const team = humanTeam(w);
    if (!team) return;
    if (e.key === 'Escape') { cancelAim(); return; }
    if (/^[1-4]$/.test(e.key)) {
      e.preventDefault();
      const p = w.pieces.filter((piece) => piece.team === team)[Number(e.key) - 1];
      aimRef.current = { id: p.id, sx: p.x, sy: p.y, px: p.x + (team === 'home' ? -100 : 100), py: p.y };
    } else if (aimRef.current && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '=', '-', 'Enter', ' '].includes(e.key)) {
      e.preventDefault();
      if (e.key === 'Enter' || e.key === ' ') { onUp(); return; }
      const a = aimRef.current;
      let angle = Math.atan2(a.sy - a.py, a.sx - a.px);
      let length = Math.hypot(a.px - a.sx, a.py - a.sy);
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') angle -= Math.PI / 36;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') angle += Math.PI / 36;
      if (e.key === '+' || e.key === '=') length = Math.min(MAX_DRAG, length + 15);
      if (e.key === '-') length = Math.max(15, length - 15);
      a.px = a.sx - Math.cos(angle) * length; a.py = a.sy - Math.sin(angle) * length;
    } else return;
    setPower(Math.round(Math.min(Math.hypot(aimRef.current.px - aimRef.current.sx, aimRef.current.py - aimRef.current.sy) / MAX_DRAG, 1) * 100));
    draw();
  }

  function rematch() {
    endedRef.current = false;
    aiTimerRef.current = 0;
    aimRef.current = null;
    pausedRef.current = false;
    clearTimeout(goalTimerRef.current);
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
        <button className="exit-btn" onClick={() => result ? onQuit() : setQuitOpen(true)}>← 나가기</button>
        <div className="score-panel">
          <span className="team-name home">{p1.name}</span>
          <span className="sc sc-home">{hud.score.home}</span>
          <span className="sc-sep">:</span>
          <span className="sc sc-away">{hud.score.away}</span>
          <span className="team-name away">{p2.name}</span>
        </div>
        <div className="game-tools"><button className="icon-btn" aria-label="플레이 방법" onClick={onGuide}><Icon name="help" /></button><button className="icon-btn" aria-label="전체화면 전환" onClick={onFullscreen}><Icon name="expand" /></button></div>
      </div>
      <div className="match-progress"><span>{mode === '1p' ? 'WORLD CUP' : 'FRIENDLY MATCH'} {hud.overtime > 0 && `· 연장 ${hud.overtime}차`}</span><progress max={hud.turnLimit} value={hud.turnCount} aria-label="완료한 턴" /><span>{hud.turnCount} / {hud.turnLimit}턴</span></div>

      <div className="board-wrap">
        <canvas
          ref={canvasRef}
          className="pitch"
          tabIndex={0}
          aria-label="축구 경기장. 숫자 1부터 4로 조각 선택, 방향키 조준, 더하기 빼기로 힘 조절, Enter로 슛."
          onKeyDown={onKeyDown}
          onBlur={cancelAim}
          style={{ touchAction: 'none' }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={cancelAim}
          onLostPointerCapture={cancelAim}
        />

        {splash && (
          <div className={`goal-splash ${splash.team}`}>
            <div className="goal-big">⚽ GOAL!</div>
            <div className="goal-team">{splash.name}</div>
          </div>
        )}

        {result && (
          <Modal title="경기 종료" onClose={() => mode === '1p' ? onEnd() : onQuit()}>
            <div className="end-card">
              {mode === '1p' ? (
                <>
                  <h2>{result.homeWon ? '🎉 승리!' : '😢 패배'}</h2>
                  <p className="end-score">{hud.score.home} : {hud.score.away}{result.tie ? ' (승부차기)' : ''}</p>
                  <button className="btn-primary" onClick={() => onEnd({ homeWon: result.homeWon })} autoFocus>
                    {result.homeWon ? '대진표 확인 →' : '대진표로'}
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
          </Modal>
        )}
      </div>

      <div className="game-foot">
        {!result && (
          <p className={`turn-tip ${turnTeam}`} role="status">
            <span className="turn-dot" /> {myTurnLabel}
            <span className="tip-sub">{hud.phase === 'sim' ? '공이 멈추면 다음 차례예요' : '조각을 누른 채 반대로 당겼다 놓기'}</span>
          </p>
        )}
        {!result && <div className="power-control"><span>SHOT POWER</span><meter min="0" max="100" value={power} aria-label="슛 세기" /><b>{power}%</b></div>}
      </div>
      <p className="rotate-hint">가로로 돌리면 경기장이 더 크게 보여요.</p>
      {quitOpen && <Modal title="경기를 나갈까요?" onClose={() => setQuitOpen(false)}><p>현재 경기의 점수는 저장되지 않아요.{mode === '1p' && ' 완료한 라운드는 유지되며, 이 경기는 다시 시작할 수 있어요.'}</p><div className="end-btns"><button className="btn-ghost" onClick={() => setQuitOpen(false)}>계속 경기</button><button className="btn-primary" onClick={onQuit}>나가기</button></div></Modal>}
    </div>
  );
}

function snapshot(w) {
  return { turn: w.turn, phase: w.phase, score: { ...w.score }, turnCount: w.turnCount, turnLimit: w.turnLimit, overtime: w.overtime, message: w.message };
}
