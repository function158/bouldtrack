import { supabase } from '../lib/supabase'

export default function TopBar({ title }) {
  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        height: 52,
        padding: '0 16px',
        background: '#0f172a', // slate-900
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <span
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: '#e5e7eb', // slate-200
        }}
      >
        {title}
      </span>

      <button
        onClick={() => supabase.auth.signOut()}
        style={{
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.15)',
          color: '#cbd5f5', // slate-300
          fontSize: 13,
          padding: '6px 10px',
          borderRadius: 6,
          cursor: 'pointer',
        }}
      >
        Log ud
      </button>
    </div>
  )
}
