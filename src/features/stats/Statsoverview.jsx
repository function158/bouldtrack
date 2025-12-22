import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'

/* -------------------- KONFIG -------------------- */

const PERIODS = {
  week: 7,
  month: 30,
  year: 365,
}

const colorOrder = [
  'Sort',
  'Rød',
  'Lilla',
  'Blå',
  'Grøn',
  'Orange',
  'Gul',
  'Hvid',
  'Pink',
]

const COLOR_PALETTE = {
  red: '#ef4444',
  rød: '#ef4444',
  purple: '#a855f7',
  lilla: '#a855f7',
  blue: '#3b82f6',
  blå: '#3b82f6',
  green: '#22c55e',
  grøn: '#22c55e',
  orange: '#f97316',
  yellow: '#eab308',
  gul: '#eab308',
  black: '#020617',
  sort: '#020617',
  white: '#e5e7eb',
  hvid: '#e5e7eb',
  pink: '#ec4899',
  grey: '#94a3b8',
  gray: '#94a3b8',
  brown: '#92400e',
}

/* -------------------- HELPERS -------------------- */

function getColorValue(colorName) {
  if (!colorName) return '#64748b'
  const key = colorName.toLowerCase().trim()
  return COLOR_PALETTE[key] || '#64748b'
}

function parseDuration(duration) {
  if (!duration) return 0

  const hoursMatch = duration.match(/(\d+)\s*(t|time|timer|h)/i)
  const minutesMatch = duration.match(/(\d+)\s*(m|min|minut|minutter)/i)

  const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0
  const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0

  return hours * 60 + minutes
}

function parseReps(text) {
  const m = text.match(/(\d+)\s*reps/i)
  return m ? Number(m[1]) : 0
}

/* -------------------- COMPONENT -------------------- */

export default function StatsOverview({ user }) {
  const [sessions, setSessions] = useState([])
  const [period, setPeriod] = useState('week')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)

      setSessions(data || [])
      setLoading(false)
    }
    load()
  }, [user.id])

  const stats = useMemo(() => {
    const since = new Date()
    since.setDate(since.getDate() - PERIODS[period])

    let totalMinutes = 0
    let totalRoutes = 0
    let pullups = 0
    let dips = 0
    const colorCounts = {}

    sessions
      .filter(s => new Date(s.date) >= since)
      .forEach(session => {
        totalMinutes += parseDuration(session.duration)

        if (Array.isArray(session.routes)) {
          session.routes.forEach(route => {
            const completed =
              !route.note || !route.note.toLowerCase().includes('fejl')

            if (completed) {
              totalRoutes++
              if (route.color) {
                colorCounts[route.color] =
                  (colorCounts[route.color] || 0) + 1
              }
            }
          })
        }

        if (Array.isArray(session.exercises)) {
          session.exercises.forEach(ex => {
            const lower = ex.toLowerCase()
            if (lower.includes('pull')) pullups += parseReps(ex)
            if (lower.includes('dip')) dips += parseReps(ex)
          })
        }
      })

    const sortedColors = Object.entries(colorCounts).sort(
      (a, b) =>
        colorOrder.indexOf(a[0]) - colorOrder.indexOf(b[0])
    )

    return {
      hours: Math.floor(totalMinutes / 60),
      minutes: totalMinutes % 60,
      totalRoutes,
      pullups,
      dips,
      colors: sortedColors,
    }
  }, [sessions, period])

  if (loading) return <p>Indlæser stats…</p>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* PERIODE TOGGLE */}
      <div style={toggleWrap}>
        {['week', 'month', 'year'].map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            style={{
              ...toggleBtn,
              background: period === p ? '#1e293b' : 'transparent',
            }}
          >
            {p === 'week' ? 'Uge' : p === 'month' ? 'Måned' : 'År'}
          </button>
        ))}
      </div>

      {/* TOP STATS */}
      <div style={grid2}>
        <StatBox label="Tid klatret" value={`${stats.hours}t ${stats.minutes}m`} />
        <StatBox label="Boulders taget" value={stats.totalRoutes} />
      </div>

      {/* EXERCISES */}
      <div style={grid2}>
        <StatBox label="Pull-ups" value={stats.pullups} small />
        <StatBox label="Dips" value={stats.dips} small />
      </div>

      {/* COLORS */}
      <div>
        <div style={cardTitle}>Fuldførte ruter (sværest først)</div>

        {stats.colors.length === 0 && (
          <p style={{ opacity: 0.6 }}>Ingen ruter i perioden</p>
        )}

        <div style={colorGrid}>
          {stats.colors.map(([color, count]) => (
            <ColorCard key={color} color={color} count={count} />
          ))}
        </div>
      </div>

    </div>
  )
}

/* -------------------- UI -------------------- */

function StatBox({ label, value, small }) {
  return (
    <div style={card}>
      <div style={labelStyle}>{label}</div>
      <div style={{ fontSize: small ? 20 : 26, fontWeight: 600 }}>
        {value}
      </div>
    </div>
  )
}

function ColorCard({ color, count }) {
  const bg = getColorValue(color)

  return (
    <div style={colorCard}>
      <div style={{ ...colorCircle, background: bg }}>
        {count}
      </div>
      <div style={{ fontSize: 14 }}>
        {color} ({count})
      </div>
    </div>
  )
}

/* -------------------- STYLES -------------------- */

const grid2 = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 12,
}

const card = {
  background: '#020617',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  padding: 14,
}

const cardTitle = {
  fontSize: 14,
  fontWeight: 600,
  marginBottom: 10,
}

const labelStyle = {
  fontSize: 12,
  opacity: 0.6,
  marginBottom: 4,
}

const toggleWrap = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gap: 8,
}

const toggleBtn = {
  padding: '8px 0',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.12)',
  color: '#e5e7eb',
  background: 'transparent',
}

const colorGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 12,
}

const colorCard = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  background: '#020617',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 14,
  padding: 12,
}

const colorCircle = {
  width: 36,
  height: 36,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 600,
  fontSize: 14,
}
