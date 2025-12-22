import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function NewSessionPage({ user, onSaved, onCancel }) {
  const [date, setDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  )
  const [duration, setDuration] = useState('')
  const [routes, setRoutes] = useState([])
  const [exercises, setExercises] = useState([])
  const [saving, setSaving] = useState(false)

  const addRoute = () => {
    setRoutes([...routes, { color: '', note: '' }])
  }

  const updateRoute = (i, field, value) => {
    const next = [...routes]
    next[i][field] = value
    setRoutes(next)
  }

  const addExercise = () => {
    setExercises([...exercises, ''])
  }

  const updateExercise = (i, value) => {
    const next = [...exercises]
    next[i] = value
    setExercises(next)
  }

  const saveSession = async () => {
    setSaving(true)

    const { error } = await supabase.from('sessions').insert({
      user_id: user.id,
      date,
      duration,
      routes,
      exercises,
    })

    setSaving(false)

    if (!error) onSaved()
    else alert(error.message)
  }

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>

      <h2>Ny session</h2>

      {/* DATE */}
      <label>
        Dato
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </label>

      {/* DURATION */}
      <label>
        Tid klatret (fx 1t 30m)
        <input
          placeholder="1t 30m"
          value={duration}
          onChange={e => setDuration(e.target.value)}
        />
      </label>

      {/* ROUTES */}
      <div>
        <strong>Ruter</strong>

        {routes.map((r, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input
              placeholder="Farve"
              value={r.color}
              onChange={e => updateRoute(i, 'color', e.target.value)}
            />
            <input
              placeholder="Note (fx fejl)"
              value={r.note}
              onChange={e => updateRoute(i, 'note', e.target.value)}
            />
          </div>
        ))}

        <button onClick={addRoute}>+ Tilføj rute</button>
      </div>

      {/* EXERCISES */}
      <div>
        <strong>Øvelser</strong>

        {exercises.map((ex, i) => (
          <input
            key={i}
            placeholder="Fx Pull ups: 10 reps"
            value={ex}
            onChange={e => updateExercise(i, e.target.value)}
            style={{ display: 'block', marginTop: 8 }}
          />
        ))}

        <button onClick={addExercise}>+ Tilføj øvelse</button>
      </div>

      {/* ACTIONS */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={onCancel}>Annuller</button>
        <button onClick={saveSession} disabled={saving}>
          {saving ? 'Gemmer…' : 'Gem session'}
        </button>
      </div>

    </div>
  )
}
