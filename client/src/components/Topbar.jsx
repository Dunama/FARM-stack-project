import React from 'react';

function Topbar({ activeLabel, badgeText, onMenuToggle }) {
  return (
    <header className="topbar">
      <button className="topbar__menu-btn" onClick={onMenuToggle} aria-label="Toggle menu">
        Menu
      </button>
      <div className="topbar__breadcrumb">
        <span className="topbar__app-name">FARM Stack</span>
        <span className="topbar__sep">/</span>
        <span className="topbar__page">{activeLabel}</span>
      </div>
      {badgeText && <span className="topbar__badge">{badgeText}</span>}
    </header>
  );
}

export default Topbar;
