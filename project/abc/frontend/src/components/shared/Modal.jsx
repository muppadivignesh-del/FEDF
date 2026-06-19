import React, { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidths = { sm: 400, md: 560, lg: 720, xl: 900 };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: maxWidths[size] }}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button
            onClick={onClose}
            style={{ background:'none',border:'none',fontSize:'20px',cursor:'pointer',color:'var(--text-muted)',lineHeight:1,padding:'2px 6px',borderRadius:'6px' }}
            onMouseEnter={e => e.target.style.background='var(--bg)'}
            onMouseLeave={e => e.target.style.background='none'}
          >×</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
