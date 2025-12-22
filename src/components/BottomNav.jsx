export default function BottomNav({ page, setPage }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 56,
        background: '#0f172a', // slate-900 vibe
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        zIndex: 20,
      }}
    >
      <NavButton
        label="Home"
        active={page === 'home'}
        onClick={() => setPage('home')}
      />

      <NavButton
        label="Sessions"
        active={page === 'sessions'}
        onClick={() => setPage('sessions')}
      />
    </div>
  )
}

function NavButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        height: '100%',
        background: 'transparent',
        border: 'none',
        color: active ? '#60a5fa' : '#cbd5f5', // blue-400 / slate-300
        fontWeight: active ? 600 : 400,
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}
