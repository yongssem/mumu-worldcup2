import { useState } from 'react';
import Landing from './components/Landing.jsx';
import ModeSelect from './components/ModeSelect.jsx';
import Tournament from './components/Tournament.jsx';
import Game from './components/Game.jsx';
import Footer from './components/Footer.jsx';
import { createTournament, advance, currentOpponent, aiDifficulty } from './game/tournament.js';
import { saveResult } from './game/storage.js';
import { PLAYER_TEAM } from './game/constants.js';
import './App.css';

// 무무월드컵2 — 최상위 라우팅: 랜딩 → 모드선택 → (토너먼트 ↔ 게임 | 2인게임)
export default function App() {
  const [screen, setScreen] = useState('landing');
  const [tournament, setTournament] = useState(null);
  const [game, setGame] = useState(null);     // {mode, p1, p2, difficulty}
  const [gameKey, setGameKey] = useState(0);  // 매치마다 Game 리셋

  function startMode(mode) {
    if (mode === '1p') {
      setTournament(createTournament());
      setScreen('tournament');
    } else {
      setGame({ mode: '2p', p1: { name: '1P 🔵' }, p2: { name: '2P 🔴' } });
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
  function onMatchEnd({ homeWon }) {
    const next = advance(tournament, homeWon);
    setTournament(next);
    if (next.status === 'champion') saveResult({ home: 1, away: 0 }); // 우승=승 기록
    setScreen('tournament');
  }

  function restartTournament() {
    setTournament(createTournament());
    setScreen('tournament');
  }

  return (
    <>
      {screen === 'game' ? (
        <Game
          key={gameKey}
          mode={game.mode}
          p1={game.p1}
          p2={game.p2}
          difficulty={game.difficulty}
          onEnd={onMatchEnd}
          onQuit={() => setScreen(game.mode === '1p' ? 'tournament' : 'mode')}
        />
      ) : (
        <div className="app-shell">
          {screen === 'landing' && <Landing onStart={() => setScreen('mode')} />}
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
    </>
  );
}
