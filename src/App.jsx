import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'


import LoginPage from './features/auth/LoginPage'
import HomePage from './features/home/HomePage'
import SessionsPage from './features/sessions/SessionsPage'
import TopBar from './components/TopBar'
import BottomNav from './components/BottomNav'

export default function App() {
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('home')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
      })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <p>Loading…</p>
  if (!user) return <LoginPage onLogin={setUser} />

  return (
    <div style={{ paddingBottom: 60 }}>
      <TopBar
        title={page === 'home' ? 'Home' : 'Sessions'}
      />
  
      {/* CONTENT */}
      {page === 'home' && <HomePage user={user} />}
      {page === 'sessions' && <SessionsPage user={user} />}
  
      <BottomNav page={page} setPage={setPage} />
    </div>
  )
}
