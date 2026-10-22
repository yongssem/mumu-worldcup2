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
import Modal from './components/Modal.jsx';
import { PLAYER_TEAM } from './game/constants.js';
import './App.css';

// 무무월드컵2 — 최상위 라우팅: 랜딩 → 모드선택 → (토너먼트 ↔ 게임 | 2인게임)
export default function App() {
  const [screen, setScreen] = useState('landing');
  const [tournament, setTournament] = useState(loadTournament);
  const [guide, setGuide] = useState(false);
  const [notice, setNotice] = useState('');
  const [fullscreen, setFullscreen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installGuide, setInstallGuide] = useState(false);
  const [installed, setInstalled] = useState(() => window.matchMedia('(display-mode: standalone)').matches || Boolean(navigator.standalone));
  const [game, setGame] = useState(null);     // {mode, p1, p2, difficulty}
  const [gameKey, setGameKey] = useState(0);  // 매치마다 Game 리셋

  useEffect(() => { if (tournament) saveTournament(tournament); }, [tournament]);
  useEffect(() => {
    const available = (event) => { event.preventDefault(); setInstallPrompt(event); };
    const completed = () => { setInstalled(true); setInstallPrompt(null); setInstallGuide(false); setNotice('홈 화면에 설치했어요. 아이콘을 눌러 다시 만나요!'); };
    window.addEventListener('beforeinstallprompt', available);
    window.addEventListener('appinstalled', completed);
    return () => { window.removeEventListener('beforeinstallprompt', available); window.removeEventListener('appinstalled', completed); };
  }, []);
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

  async function install() {
    if (!installPrompt) { setInstallGuide(true); return; }
    try { await installPrompt.prompt(); await installPrompt.userChoice; }
    catch { setInstallGuide(true); }
    finally { setInstallPrompt(null); }
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
          {screen === 'landing' && <Landing onStart={() => setScreen('mode')} onGuide={() => setGuide(true)} canResume={tournament?.status === 'playing'} onResume={() => setScreen('tournament')} onInstall={install} installed={installed} />}
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
      {installGuide && <Modal title="홈 화면에서 바로 만나요" onClose={() => setInstallGuide(false)}><p>브라우저에 맞는 방법으로 게임 바로가기를 추가해 주세요.</p><ul className="install-guide"><li><strong>iPhone · iPad Safari</strong><br />공유 메뉴 → 홈 화면에 추가</li><li><strong>Android Chrome</strong><br />브라우저 메뉴 → 홈 화면에 추가 또는 앱 설치</li><li><strong>PC Chrome · Edge</strong><br />주소창 설치 아이콘 또는 브라우저 메뉴의 앱 설치 항목</li></ul><p>설치 메뉴가 없다면 Safari나 Chrome에서 링크를 다시 열어 주세요. 설치 후에도 플레이에는 인터넷 연결이 필요해요.</p><button className="btn-primary" onClick={() => setInstallGuide(false)}>확인</button></Modal>}
    </>
  );
}
