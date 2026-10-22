import { loadRecord } from '../game/storage.js';
import Icon from './Icons.jsx';

// 무무월드컵2 — 랜딩(히어로) 화면
export default function Landing({ onStart, onGuide, onResume, canResume, onInstall, installed }) {
  const rec = loadRecord();
  return (
    <main className="landing">

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
      <figure className="landing-art">
        <img src="/landing-stadium.webp" srcSet="/landing-stadium-mobile.webp 768w, /landing-stadium.webp 1536w" sizes="(max-width: 600px) calc(100vw - 48px), (max-width: 1200px) 48vw, 580px" width="1536" height="1024" fetchpriority="high" decoding="async" alt="경기장 조명 아래 잔디 위에서 축구공을 두고 마주 선 파란색과 빨간색 축구게임 조각" />
        <figcaption><span>THE STAGE IS YOURS.</span><span>오늘의 역전 골, 당신의 손끝에서.</span></figcaption>
      </figure>
      <div className="landing-strip"><span>01 <b>당겨서 슛</b></span><span>02 <b>혼자 또는 둘이</b></span><span>03 <b>네 번 이기면 챔피언</b></span></div>
      <div className="landing-extras"><button className="text-btn" onClick={onInstall} disabled={installed}>{installed ? '홈 화면 앱으로 실행 중' : '홈 화면에 설치'} <Icon name="arrow" size={16} /></button><a href="https://www.instagram.com/yongssam.dev/" target="_blank" rel="noopener noreferrer">바이브용쌤 인스타 ↗</a></div>
    </main>
  );
}
