import { useEffect, useState } from 'react';
import Landing from './components/Landing.jsx';
import ModeSelect from './components/ModeSelect.jsx';
import Tournament from './components/Tournament.jsx';
import Game from './components/Game.jsx';
import Footer from './components/Footer.jsx';
import { createTournament, advance, currentOpponent, aiDifficulty } from './game/tournament.js';
import { saveResult, saveTitle, loadTournament, saveTournament } from './game/storage.js';
import Guide from './components/Guide.jsx';
import Icon from './components/Icons.jsx';
import { PLAYER_TEAM } from './game/constants.js';
import './App.css';

// 무무월드컵2 — 최상위 라우팅: 랜딩 → 모드선택 → (토너먼트 ↔ 게임 | 2인게임)
export default function App() {
  const [screen, setScreen] = useState('landing');
  const [tournament, setTournament] = useState(loadTournament);
  const [guide, setGuide] = useState(false);
  const [notice, setNotice] = useState('');
  const [fullscreen, setFullscreen] = useState(false);
  const [game, setGame] = useState(null);     // {mode, p1, p2, difficulty}
  const [gameKey, setGameKey] = useState(0);  // 매치마다 Game 리셋

  useEffect(() => { if (tournament) saveTournament(tournament); }, [tournament]);
  useEffect(() => {
    const change = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', change);
    return () => document.removeEventListener('fullscreenchange', change);
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 5000);
    return () => clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    window.scrollTo(0, 0);
    const heading = document.querySelector('main h1, .screen-title');
    if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); }
  }, [screen]);

  async function share() {
    const url = new URL(window.location.pathname, window.location.origin).href;
    if (navigator.share) {
      try { await navigator.share({ title: '무무월드컵2', text: '손끝으로 만드는 역전 골! 무무월드컵2에서 한 판 해요.', url }); return; }
      catch (error) { if (error.name === 'AbortError') return; }
    }
    try {
      await navigator.clipboard.writeText(url); setNotice('게임 링크를 복사했어요. 친구에게 붙여넣어 주세요.');
    } catch { setNotice(`주소창의 링크를 복사해서 공유해 주세요: ${url}`); }
  }
  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      else setNotice('이 브라우저에서는 전체화면을 지원하지 않아요. 가로로 돌리면 더 넓게 즐길 수 있어요.');
    } catch { setNotice('전체화면을 열 수 없어요. 브라우저 설정을 확인해 주세요.'); }
  }

  function startMode(mode) {
    if (mode === '1p') {
      setTournament(createTournament());
      setScreen('tournament');
    } else {
      setGame({ mode: '2p', p1: { name: '파랑 1P' }, p2: { name: '빨강 2P' } });
      setGameKey((k) => k + 1);
      setScreen('game');
    }
  }

  // 1P: 토너먼트 다음 경기 시작
  function playTournamentMatch() {
    setGame({
      mode: '1p',
      p1: { name: PLAYER_TEAM },
      p2: { name: currentOpponent(tournament) },
      difficulty: aiDifficulty(tournament),
    });
    setGameKey((k) => k + 1);
    setScreen('game');
  }

  // 1P 경기 결과 → 토너먼트 진행
  function recordMatch({ score, homeWon }) {
    if (game.mode !== '1p') return;
    saveResult(score, homeWon);
    const next = advance(tournament, homeWon);
    setTournament(next);
    if (next.status === 'champion') saveTitle();
  }

  function restartTournament() {
    setTournament(createTournament());
    setScreen('tournament');
  }

  return (
    <>
      {screen !== 'game' && <header className="site-header"><button className="brand" onClick={() => setScreen('landing')} aria-label="무무월드컵2 처음으로"><Icon name="ball" size={26} /><span>무무월드컵<b>2</b></span></button><nav aria-label="게임 도구"><button className="icon-btn" aria-label="플레이 방법" onClick={() => setGuide(true)}><Icon name="help" /></button><button className="icon-btn" aria-label="게임 공유" onClick={share}><Icon name="share" /></button><button className="icon-btn" aria-label={fullscreen ? '전체화면 해제' : '전체화면'} onClick={toggleFullscreen}><Icon name="expand" /></button></nav></header>}
      {notice && <div className="notice" role="status">{notice}<button className="icon-btn" aria-label="알림 닫기" onClick={() => setNotice('')}><Icon name="close" /></button></div>}
      {screen === 'game' ? (
        <Game
          key={gameKey}
          mode={game.mode}
          p1={game.p1}
          p2={game.p2}
          difficulty={game.difficulty}
          onEnd={() => setScreen('tournament')}
          onRecord={recordMatch}
          onGuide={() => setGuide(true)}
          onFullscreen={toggleFullscreen}
          suspended={guide}
          onQuit={() => setScreen(game.mode === '1p' ? 'tournament' : 'mode')}
        />
      ) : (
        <div className="app-shell">
          {screen === 'landing' && <Landing onStart={() => setScreen('mode')} onGuide={() => setGuide(true)} canResume={tournament?.status === 'playing'} onResume={() => setScreen('tournament')} />}
          {screen === 'mode' && (
            <ModeSelect onSelect={startMode} onBack={() => setScreen('landing')} />
          )}
          {screen === 'tournament' && tournament && (
            <Tournament
              tournament={tournament}
              onPlay={playTournamentMatch}
              onRestart={restartTournament}
              onHome={() => setScreen('landing')}
            />
          )}
          <Footer />
        </div>
      )}
      {guide && <Guide onClose={() => setGuide(false)} />}
    </>
  );
}
