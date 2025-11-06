import React, { useState } from "react";
import { supabase } from "../supabaseClient";

const colors = ['Grøn','Gul','Orange','Blå','Lilla','Rød','Sort','Hvid','Pink'];

function getGradient(color){
  switch(color){
    case 'Grøn': return 'linear-gradient(90deg,#236c41 0%,#358356 100%)';
    case 'Gul': return 'linear-gradient(90deg,#9b8918 0%,#c3b12e 100%)';
    case 'Orange': return 'linear-gradient(90deg,#a76112 0%,#d78f4a 100%)';
    case 'Blå': return 'linear-gradient(90deg,#20415e 0%,#4d759e 100%)';
    case 'Lilla': return 'linear-gradient(90deg,#57386d 0%,#8c6ab5 100%)';
    case 'Rød': return 'linear-gradient(90deg,#b03d2e 0%,#e06648 100%)';
    case 'Sort': return 'linear-gradient(90deg,#23272e 0%,#45484d 100%)';
    case 'Hvid': return 'linear-gradient(90deg,#f2f2f2 0%,#dedede 100%)';
    case 'Pink': return 'linear-gradient(90deg,#a42f8b 0%,#cf7cd8 100%)';
    default: return 'linear-gradient(90deg,#888 0%,#bbb 100%)';
  }
}

export default function NewSessionModal({ user, onClose, locationsList = [] }) {
  const [currentSession, setCurrentSession] = useState({
    date: new Date().toISOString().split('T')[0],
    location: '',
    duration: '',
    exercises: [],
    routes: []
  });
  const [newExercise, setNewExercise] = useState('');
  const [selectedExercise, setSelectedExercise] = useState('');
  const [exerciseReps, setExerciseReps] = useState('');
  const [newRoute, setNewRoute] = useState({ color:'', number:'', attempts:'', note:'', wallHeight:'5' });
  const [saving, setSaving] = useState(false);
  const [showManualLocationInput, setShowManualLocationInput] = useState(locationsList.length === 0);

  const addExercise = () => {
    if (newExercise.trim()) {
      setCurrentSession(prev=>({ ...prev, exercises: [...prev.exercises, newExercise.trim()] }));
      setNewExercise('');
    }
  };

  const addExerciseWithReps = (exercise, reps) => {
    if (!exercise || !reps) return;
    const text = `${exercise}: ${reps} reps`;
    setCurrentSession(prev=>({ ...prev, exercises: [...prev.exercises, text] }));
    setExerciseReps('');
    setSelectedExercise('');
  };

  const addRoute = () => {
    if (!newRoute.color || !newRoute.wallHeight) return;
    setCurrentSession(prev=>({ ...prev, routes: [...prev.routes, {...newRoute}] }));
    setNewRoute({ ...newRoute, color:'', number:'', attempts:'', note:'' });
  };

  const saveSession = async (asDraft=false) => {
    if (!user) { alert('Du skal være logget ind'); return; }
    setSaving(true);
    try {
      const payload = { ...currentSession, user_id: user.id };
      const { data, error } = await supabase.from('sessions').insert(payload).select().single();
      if (error) {
        console.error(error);
        alert('Fejl ved gemning');
      } else {
        onClose();
      }
    } catch (e) {
      console.error(e);
      alert('Fejl ved gemning');
    }
    setSaving(false);
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 mb-6 border border-slate-700">
      <h2 className="text-2xl font-bold mb-4">Ny Session</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-2">Dato</label>
          <input type="date" value={currentSession.date} onChange={(e)=>setCurrentSession({...currentSession, date:e.target.value})}
                 className="w-full bg-slate-700 rounded-lg p-3 text-white border border-slate-600"/>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-2">Lokation</label>
          <div className="flex gap-2 items-center">
            {!showManualLocationInput && locationsList.length>0 ? (
              <select value={currentSession.location} onChange={(e)=>setCurrentSession({...currentSession, location:e.target.value})}
                      className="flex-1 bg-slate-700 rounded-lg p-3 text-white border border-slate-600">
                <option value="">Vælg eksisterende lokation</option>
                {locationsList.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
            ) : null}

            {showManualLocationInput || locationsList.length === 0 ? (
              <div className="flex flex-1 gap-2">
                <input type="text" value={currentSession.location} onChange={(e)=>setCurrentSession({...currentSession, location:e.target.value})}
                       placeholder="Skriv lokation" className="flex-1 bg-slate-700 rounded-lg p-3 text-white border border-slate-600"/>
                <button onClick={()=>setShowManualLocationInput(false)} className="bg-slate-700 hover:bg-slate-600 px-4 rounded-lg">Vælg</button>
              </div>
            ) : (
              <button onClick={()=>setShowManualLocationInput(true)} className="bg-blue-500 hover:bg-blue-600 px-4 py-3 rounded-lg">Tilføj</button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-2">Varighed</label>
          <input type="text" value={currentSession.duration} onChange={(e)=>setCurrentSession({...currentSession, duration:e.target.value})}
                 placeholder="f.eks. 1 time 50 min eller 30 min" className="w-full bg-slate-700 rounded-lg p-3 text-white border border-slate-600"/>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-2">Øvelser</label>

          <div className="mb-4">
            <div className="mb-3">
              <input type="number" value={exerciseReps} onChange={(e)=>setExerciseReps(e.target.value)} placeholder="Antal reps"
                     className="w-full bg-slate-700 rounded-lg p-3 text-white border border-slate-600"/>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              {['Pull ups','Dips','Push ups','External rotation','Fingerstyrke','Plank'].map(ex => (
                <button key={ex} onClick={()=>setSelectedExercise(ex)}
                        className={`p-2 rounded-lg text-sm font-medium transition-all ${selectedExercise===ex? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>{ex}</button>
              ))}
            </div>

            {selectedExercise && exerciseReps && (
              <div className="mb-3">
                <button onClick={()=>addExerciseWithReps(selectedExercise, exerciseReps)} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 rounded-xl">Tilføj {selectedExercise}: {exerciseReps} reps</button>
              </div>
            )}
          </div>

          <div className="flex gap-2 mb-2">
            <input type="text" value={newExercise} onChange={(e)=>setNewExercise(e.target.value)} placeholder="Eller skriv manuelt (f.eks. 10 pull ups)"
                   className="flex-1 bg-slate-700 rounded-lg p-3 text-white border border-slate-600"/>
            <button onClick={addExercise} className="bg-blue-500 hover:bg-blue-600 px-4 rounded-lg">Tilføj</button>
          </div>

          {currentSession.exercises.map((ex,i)=>(
            <div key={i} className="flex items-center gap-2 bg-slate-700/50 rounded-lg p-2 mb-1 text-sm">
              <span className="flex-1">{ex}</span>
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-2">Ruter</label>
          <div className="space-y-2 mb-2">
            <div className="grid grid-cols-3 gap-2 mb-3">
              {colors.map(c=>(
                <button key={c} onClick={()=>setNewRoute({...newRoute, color:c})}
                        className={`p-3 rounded-lg font-medium text-sm transition-all border-2 ${newRoute.color===c ? 'border-white shadow-lg scale-105' : 'border-transparent opacity-80 hover:opacity-100'}`}
                        style={{ background: getGradient(c), color: c === 'Hvid' ? '#232323' : '#fff' }}>
                  {c}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input type="text" value={newRoute.number} onChange={(e)=>setNewRoute({...newRoute, number:e.target.value})} placeholder="Nummer (valgfrit)" className="flex-1 bg-slate-700 rounded-lg p-3 border border-slate-600"/>
              <input type="number" value={newRoute.attempts} onChange={(e)=>setNewRoute({...newRoute, attempts:e.target.value})} placeholder="Forsøg" className="w-24 bg-slate-700 rounded-lg p-3 border border-slate-600"/>
            </div>

            <input type="text" value={newRoute.note} onChange={(e)=>setNewRoute({...newRoute, note:e.target.value})} placeholder="Note (f.eks. 'Fejl - ikke nok fingerstyrke')" className="w-full bg-slate-700 rounded-lg p-3 border border-slate-600"/>

            <div className="flex gap-2 pt-4">
              <button onClick={addRoute} className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl">Tilføj rute</button>
              <div className="relative inline-block text-left">
                <button className="bg-slate-700/60 hover:bg-slate-600 text-slate-300 text-sm font-medium px-3 py-1 rounded-full border border-slate-600">🧱 {newRoute.wallHeight}m</button>
                {/* For simplicity, default to 5m. You can expand with selector if needed */}
              </div>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            {currentSession.routes.map((r,i)=>(
              <div key={i} className="rounded-lg p-2 text-sm mb-1" style={{ background: getGradient(r.color), color: r.color==='Hvid'? '#232323':'#fff' }}>
                <span className="font-semibold">{r.color}</span>{r.number ? ` #${r.number}` : ''}{r.attempts ? ` (${r.attempts})` : ''}{r.note ? ` - ${r.note}` : ''}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <button onClick={()=>saveSession(false)} disabled={saving} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl">{saving ? 'Gemmer...' : 'Gem Session'}</button>
          <button onClick={()=>saveSession(true)} disabled={saving} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl">Gem som kladde</button>
          <button onClick={onClose} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl">Annuller</button>
        </div>
      </div>
    </div>
  );
}
