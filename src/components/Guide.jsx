import Modal from './Modal.jsx';

export default function Guide({ onClose }) {
  return <Modal title="손끝으로 만드는 골" onClose={onClose}>
    <div className="guide-demo" aria-hidden="true"><span className="demo-piece">FW</span><span className="demo-line" /><span className="demo-target">→</span></div>
    <ol className="guide-steps">
      <li><b>내 팀 조각을 선택해요</b><p>파란 팀은 오른쪽 골대, 빨간 팀은 왼쪽 골대를 공격해요.</p></li>
      <li><b>쏠 방향의 반대로 당겨요</b><p>길게 당길수록 강해져요. 화살표와 파워 표시로 방향과 힘을 확인하세요.</p></li>
      <li><b>손을 놓으면 슛!</b><p>양 팀 합산 24턴. 동점이면 같은 턴 수로 연장전을 반복해 승부를 가려요.</p></li>
    </ol>
    <p className="keyboard-note">키보드: Tab으로 경기장 선택 → 숫자 1–4로 조각 선택 → 방향키로 조준 → + / −로 힘 조절 → Enter로 슛 · Esc로 조준 취소</p>
    <button className="btn-primary" onClick={onClose}>준비됐어요 <span>→</span></button>
  </Modal>;
}
