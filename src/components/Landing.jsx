import { loadRecord } from '../game/storage.js';
import Icon from './Icons.jsx';
import BoardPreview from './BoardPreview.jsx';

// 무무월드컵2 — 랜딩(히어로) 화면
export default function Landing({ onStart, onGuide, onResume, canResume }) {
  const rec = loadRecord();
  return (
    <main className="landing">
      {/* 배경: public/bg-landing.png 있으면 사용, 없으면 잔디 그라데이션 fallback */}
      <div className="landing-bg" />
      <div className="landing-overlay" />

      <div className="landing-content">
        <p className="landing-kicker"><span className="live-dot" /> 손끝에서 시작되는 월드컵</p>
        <h1 className="landing-title">작은 조각.<br />커다란 <span>승부.</span></h1>
        <p className="game-wordmark">무무월드컵 <b>2</b><span> FLICK FOOTBALL</span></p>
        <p className="landing-desc">
          그때 그 축구게임판이 돌아왔어요.<br />
          한 번의 터치, 한 번의 역전. 이번엔 당신의 차례!
        </p>

        <div className="landing-actions"><button className="btn-primary" onClick={onStart}>경기장 입장 <Icon name="arrow" /></button><button className="text-btn" onClick={onGuide}><Icon name="help" /> 플레이 방법</button></div>
        {canResume && <button className="resume-link" onClick={onResume}>진행 중인 월드컵 이어하기 →</button>}

        <div className="record-card">
          <div className="record-item"><span>{rec.wins}</span>승리</div>
          <div className="record-item"><span>{rec.losses}</span>패배</div>
          <div className="record-item"><span>{rec.goalsFor}</span>득점</div>
          <div className="record-item"><span>{rec.titles}</span>우승</div>
        </div>
        <p className="landing-hint">이 브라우저의 1인 월드컵 기록 · 자동 저장</p>
      </div>
      <BoardPreview />
      <div className="landing-strip"><span>01 <b>당겨서 슛</b></span><span>02 <b>혼자 또는 둘이</b></span><span>03 <b>네 번 이기면 챔피언</b></span></div>
    </main>
  );
}
