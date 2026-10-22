import Icon from './Icons.jsx';
export default function ModeSelect({ onSelect, onBack }) {
  return (
    <div className="screen center-screen">
      <button className="back-link" onClick={onBack}>← 처음으로</button>
      <p className="landing-kicker">CHOOSE YOUR MATCH</p>
      <h1 className="screen-title">오늘의 승부는?</h1>
      <p className="screen-hint">정상을 향한 도전도, 친구와의 한 판도.</p>
      <div className="mode-cards">
        <button className="mode-card p1" onClick={() => onSelect('1p')}>
          <span className="mode-number">01 / SOLO</span><Icon name="trophy" size={42} />
          <span className="mode-title">월드컵 도전</span>
          <span className="mode-desc">16강부터 결승까지, AI와 실력 대결.<br />라운드가 올라갈수록 강해지는 상대!</span>
          <span className="mode-meta">1인 플레이 · 진행 자동 저장 <Icon name="arrow" /></span>
        </button>
        <button className="mode-card p2" onClick={() => onSelect('2p')}>
          <span className="mode-number">02 / TOGETHER</span><Icon name="users" size={42} />
          <span className="mode-title">친구와 한 판</span>
          <span className="mode-desc">같은 화면에서 번갈아 튕기기.<br />파랑과 빨강, 오늘의 승자는 누구?</span>
          <span className="mode-meta">2인 플레이 · 한 기기로 함께 <Icon name="arrow" /></span>
        </button>
      </div>
      <p className="screen-hint">각 팀 4명 · 합산 24턴 · 동점 시 연장전</p>
    </div>
  );
}
