// 무무월드컵2 — 모드 선택 화면
export default function ModeSelect({ onSelect, onBack }) {
  return (
    <div className="screen center-screen">
      <button className="back-link" onClick={onBack}>← 처음으로</button>
      <h2 className="screen-title">모드 선택</h2>
      <div className="mode-cards">
        <button className="mode-card p1" onClick={() => onSelect('1p')}>
          <div className="mode-emoji">🏆</div>
          <div className="mode-title">1인용</div>
          <div className="mode-desc">월드컵 16강<br />토너먼트에 도전!</div>
        </button>
        <button className="mode-card p2" onClick={() => onSelect('2p')}>
          <div className="mode-emoji">⚔️</div>
          <div className="mode-title">2인 대전</div>
          <div className="mode-desc">한 태블릿에서<br />번갈아 튕기기</div>
        </button>
      </div>
      <p className="screen-hint">태블릿 가로 화면을 추천해요 📱↔️</p>
    </div>
  );
}
