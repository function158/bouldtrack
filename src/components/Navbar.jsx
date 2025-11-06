export default function Navbar({ onRoute, onNew, onLogout, active }) {
    return (
      <header className="app-header">
        <div className="left">
          <button className={`nav-btn ${active==="home" ? "active":""}`} onClick={() => onRoute("home")}>Hjem</button>
          <button className={`nav-btn ${active==="sessions" ? "active":""}`} onClick={() => onRoute("sessions")}>Sessioner</button>
        </div>
        <div className="right">
          <button className="new-btn" onClick={onNew}>+ Ny Session</button>
          <button className="logout-btn" onClick={onLogout}>Log ud</button>
        </div>
      </header>
    );
  }
  