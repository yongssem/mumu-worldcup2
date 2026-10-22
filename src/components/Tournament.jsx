// 무무월드컵2 — 월드컵 16강 대진표/진행 화면
import { ROUND_NAMES, currentOpponent, roundName } from '../game/tournament.js';
import { PLAYER_TEAM } from '../game/constants.js';

export default function Tournament({ tournament: t, onPlay, onRestart, onHome }) {
  // 우승
  if (t.status === 'champion') {
    return (
      <div className="screen center-screen champion">
        <div className="trophy">🏆</div>
        <h1 className="champ-title">우승!</h1>
        <p className="champ-sub">{PLAYER_TEAM}<br />월드컵 정상에 올랐습니다!</p>
        <button className="btn-primary" onClick={onHome}>처음으로</button>
      </div>
    );
  }
  // 탈락
  if (t.status === 'eliminated') {
    return (
      <div className="screen center-screen">
        <div className="trophy">😢</div>
        <h1 className="champ-title">{roundName(t)} 탈락</h1>
        <p className="champ-sub">아쉽게 여기까지…<br />다시 도전해볼까요?</p>
        <div className="end-btns">
          <button className="btn-ghost" onClick={onHome}>처음으로</button>
          <button className="btn-primary" onClick={onRestart}>다시 도전 🔁</button>
        </div>
      </div>
    );
  }

  // 진행 중
  const opp = currentOpponent(t);
  return (
    <div className="screen center-screen">
      <button className="back-link" onClick={onHome}>← 나가기</button>
      <p className="landing-kicker">ROAD TO THE TROPHY</p>
      <h1 className="screen-title">정상까지, {4 - t.roundIdx}번의 승리.</h1>

      {/* 라운드 진행 단계 */}
      <div className="round-steps">
        {ROUND_NAMES.map((name, i) => (
          <div key={name} className={`step ${i < t.roundIdx ? 'done' : ''} ${i === t.roundIdx ? 'now' : ''}`}>
            {i < t.roundIdx ? '✓' : name}
          </div>
        ))}
      </div>

      {/* 다음 경기 VS 카드 */}
      <div className="vs-card">
        <div className="vs-team home">
          <span className="vs-flag">{PLAYER_TEAM}</span>
          <span className="vs-tag">나</span>
        </div>
        <div className="vs-mid">VS</div>
        <div className="vs-team away">
          <span className="vs-flag">{opp}</span>
          <span className="vs-tag">상대</span>
        </div>
      </div>

      <p className="round-label">{roundName(t)} · {ROUND_NAMES.length - t.roundIdx}경기 남음</p>
      <button className="btn-primary big" onClick={onPlay}>경기 시작 ▶</button>
      <p className="screen-hint">라운드 자동 저장 · 경기 중 나가면 해당 경기를 다시 시작해요</p>
      <details className="bracket" open><summary>월드컵 전체 대진표</summary><div className="bracket-rounds">{ROUND_NAMES.map((name, i) => <section key={name}><h3>{name}</h3>{t.rounds[i] ? t.rounds[i].map((m, j) => <div className={`bracket-match ${j === 0 ? 'player-match' : ''}`} key={j}><span className={m.winner === m.a ? 'winner' : ''}>{m.a}<b>{m.winner === m.a ? '✓' : ''}</b></span><span className={m.winner === m.b ? 'winner' : ''}>{m.b}<b>{m.winner === m.b ? '✓' : ''}</b></span></div>) : <p className="bracket-wait">이전 라운드 종료 후 결정</p>}</section>)}</div></details>
    </div>
  );
}
