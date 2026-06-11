import { loadRecord } from '../game/storage.js';

// 무무월드컵2 — 랜딩(히어로) 화면
export default function Landing({ onStart }) {
  const rec = loadRecord();
  return (
    <div className="landing">
      {/* 배경: public/bg-landing.png 있으면 사용, 없으면 잔디 그라데이션 fallback */}
      <div className="landing-bg" />
      <div className="landing-overlay" />

      <div className="landing-content">
        <p className="landing-kicker">턴제 축구 배틀</p>
        <h1 className="landing-title">무무월드컵<span className="title-2">2</span></h1>
        <p className="landing-desc">
          조각을 손가락으로 당겼다 놓아<br />
          공을 골대로 튕겨 넣어라! 🪙
        </p>

        <button className="btn-primary" onClick={onStart}>시작하기 ⚽</button>

        <div className="record-card">
          <div className="record-item"><span>{rec.wins}</span>승</div>
          <div className="record-item"><span>{rec.draws}</span>무</div>
          <div className="record-item"><span>{rec.losses}</span>패</div>
        </div>
        <p className="landing-hint">90년대 그 축구게임판처럼 — 번갈아 한 번씩 튕기기!</p>
      </div>
    </div>
  );
}
