import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import NewSessionPage from './NewSessionPage'

export default function SessionsPage({ user }) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  const loadSessions = async () => {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (!error) setSessions(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadSessions()
  }, [user.id])

  // 👉 VIS "NY SESSION"-SIDEN
  if (creating) {
    return (
      <NewSessionPage
        user={user}
        onSaved={() => {
          setCreating(false)
          loadSessions()
        }}
        onCancel={() => setCreating(false)}
      />
    )
  }

  if (loading) return <p>Indlæser sessioner…</p>

  // 👉 NORMAL LISTE
  return (
    <div style={{ padding: 16 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <h2>Sessioner</h2>
        <button onClick={() => setCreating(true)}>
          + Ny session
        </button>
      </div>

      {sessions.length === 0 && <p>Ingen sessioner endnu</p>}

      {sessions.map((s) => (
        <div
          key={s.id}
          style={{
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10,
            padding: 12,
            marginBottom: 8,
          }}
        >
          <strong>{s.date}</strong><br />
          {s.duration}
        </div>
      ))}
    </div>
  )
}
