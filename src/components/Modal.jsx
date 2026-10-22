import { useEffect, useRef } from 'react';
import Icon from './Icons.jsx';

export default function Modal({ title, onClose, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const dialog = ref.current;
    dialog.showModal();
    return () => { dialog.close(); previous?.focus(); };
  }, []);
  return <dialog ref={ref} className="modal" aria-label={title} onCancel={(e) => { e.preventDefault(); onClose(); }} onClick={(e) => { if (e.target === ref.current) onClose(); }}>
    <div className="modal-head"><h2>{title}</h2><button className="icon-btn" aria-label="닫기" onClick={onClose}><Icon name="close" /></button></div>
    {children}
  </dialog>;
}
