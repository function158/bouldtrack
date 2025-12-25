import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

/* ---------------- constants ---------------- */

const COLORS = [
  "Grøn",
  "Gul",
  "Orange",
  "Blå",
  "Lilla",
  "Rød",
  "Sort",
  "Hvid",
  "Pink",
];

const colorOrder = [
  "Sort",
  "Rød",
  "Lilla",
  "Blå",
  "Grøn",
  "Orange",
  "Gul",
  "Hvid",
  "Pink",
];

const COMMON_EXERCISES = [
  "Pull ups",
  "Dips",
  "Push ups",
  "External rotation",
  "Fingerstyrke",
  "Plank",
];

const getGradient = (color) => {
  switch (color) {
    case "Grøn": return "linear-gradient(90deg,#236c41,#358356)";
    case "Gul": return "linear-gradient(90deg,#9b8918,#c3b12e)";
    case "Orange": return "linear-gradient(90deg,#a76112,#d78f4a)";
    case "Blå": return "linear-gradient(90deg,#20415e,#4d759e)";
    case "Lilla": return "linear-gradient(90deg,#57386d,#8c6ab5)";
    case "Rød": return "linear-gradient(90deg,#b03d2e,#e06648)";
    case "Sort": return "linear-gradient(90deg,#23272e,#45484d)";
    case "Hvid": return "linear-gradient(90deg,#f2f2f2,#dedede)";
    case "Pink": return "linear-gradient(90deg,#a42f8b,#cf7cd8)";
    default: return "linear-gradient(90deg,#666,#888)";
  }
};

/* ---------------- component ---------------- */

export default function NewSessionForm({ user, onSaved, onCancel }) {
  const [saving, setSaving] = useState(false);
  const [showManualLocationInput, setShowManualLocationInput] = useState(false);
  const [locationsList, setLocationsList] = useState([]);

  const [currentSession, setCurrentSession] = useState({
    date: new Date().toISOString().split("T")[0],
    location: "",
    duration: "",
    exercises: [],
    routes: [],
  });

  const [newExercise, setNewExercise] = useState("");
  const [selectedExercise, setSelectedExercise] = useState("");
  const [exerciseReps, setExerciseReps] = useState("");

  const [newRoute, setNewRoute] = useState({
    color: "",
    number: "",
    attempts: "",
    note: "",
    wallHeight: "5",
    failed: false, // 👈 NY
    flash: false,  // 👈 NY
  });

  /* ---------------- helpers ---------------- */

  const inputClass =
    "w-full h-12 bg-slate-700/70 rounded-xl px-4 text-white placeholder:text-slate-400 border border-slate-600 focus:border-blue-500 focus:outline-none";

  const sortLocations = (list) =>
    [...list].sort((a, b) =>
      a.localeCompare(b, "da", { sensitivity: "base" })
    );

  const loadLocations = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("sessions")
      .select("location")
      .eq("user_id", user.id);

    if (data) {
      const unique = [...new Set(data.map(s => s.location).filter(Boolean))];
      setLocationsList(sortLocations(unique));
    }
  };

  useEffect(() => {
    loadLocations();
  }, [user]);

  const addLocationToList = (location) => {
    if (location === "__manual__") {
      setShowManualLocationInput(true);
      return;
    }

    const trimmed = (location || "").trim();
    if (!trimmed) return;

    if (!locationsList.includes(trimmed)) {
      setLocationsList(sortLocations([...locationsList, trimmed]));
    }

    setCurrentSession(s => ({ ...s, location: trimmed }));
    setShowManualLocationInput(false);
  };

  const addExerciseWithReps = () => {
    if (!selectedExercise || !exerciseReps) return;
    setCurrentSession(s => ({
      ...s,
      exercises: [...s.exercises, `${selectedExercise}: ${exerciseReps} reps`],
    }));
    setSelectedExercise("");
    setExerciseReps("");
  };

  const addExercise = () => {
    if (!newExercise.trim()) return;
    setCurrentSession(s => ({
      ...s,
      exercises: [...s.exercises, newExercise],
    }));
    setNewExercise("");
  };

  const addRoute = () => {
    if (!newRoute.color || !newRoute.attempts) return;
    setCurrentSession(s => ({
      ...s,
      routes: [...s.routes, { ...newRoute }],
    }));
    setNewRoute(r => ({ ...r, color: "", number: "", attempts: "", note: "" }));
  };

  const groupAndSortRoutes = (routes) => {
    const grouped = {};
    routes.forEach((r) => {
      const h = r.wallHeight || "5";
      grouped[h] ??= [];
      grouped[h].push(r);
    });

    return Object.keys(grouped)
      .sort((a, b) => Number(a) - Number(b))
      .map(h => ({
        wallHeight: h,
        routes: grouped[h].sort(
          (a, b) => colorOrder.indexOf(a.color) - colorOrder.indexOf(b.color)
        ),
      }));
  };

  const saveSession = async (draft = false) => {
    if (!user) return alert("Du skal være logget ind");
    if (!draft && (!currentSession.location || !currentSession.duration)) {
      return alert("Lokation og varighed mangler");
    }

    setSaving(true);

    const { error } = await supabase.from("sessions").insert({
      ...currentSession,
      user_id: user.id,
    });

    setSaving(false);

    if (error) {
      alert("Fejl ved gemning af session");
      return;
    }

    onSaved?.();
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-slate-900 px-4 py-6">
      <div className="max-w-xl mx-auto bg-slate-800/70 backdrop-blur rounded-2xl p-6 space-y-6">

        <h2 className="text-xl font-semibold text-white">Ny Session</h2>

        {/* Dato */}
        <div>
          <label className="text-sm text-slate-400">Dato</label>
          <input
            type="date"
            value={currentSession.date}
            onChange={(e) =>
              setCurrentSession(s => ({ ...s, date: e.target.value }))
            }
            className={inputClass}
          />
        </div>

        {/* Lokation */}
        <div>
          <label className="text-sm text-slate-400">Lokation</label>

          {!showManualLocationInput ? (
            <div className="flex gap-2">
              <select
                value={currentSession.location}
                onChange={(e) => addLocationToList(e.target.value)}
                className={`${inputClass} flex-1`}
              >
                <option value="">Vælg eksisterende lokation</option>
                {locationsList.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
                <option value="__manual__">+ Tilføj ny</option>
              </select>

              <button
                onClick={() => setShowManualLocationInput(true)}
                className="h-12 w-12 rounded-xl bg-blue-500 text-white text-xl"
              >
                +
              </button>
            </div>
          ) : (
            <input
              type="text"
              placeholder="Ny lokation"
              className={inputClass}
              onBlur={(e) => addLocationToList(e.target.value)}
            />
          )}
        </div>

        {/* Varighed */}
        <div>
          <label className="text-sm text-slate-400">Varighed</label>
          <input
            type="text"
            placeholder="f.eks. 1 time 50 min eller 30 min"
            value={currentSession.duration}
            onChange={(e) =>
              setCurrentSession(s => ({ ...s, duration: e.target.value }))
            }
            className={inputClass}
          />
        </div>

        {/* Øvelser */}
        <div className="space-y-3">
          <label className="text-sm text-slate-400">Øvelser</label>

          <input
            type="number"
            placeholder="Antal reps"
            value={exerciseReps}
            onChange={(e) => setExerciseReps(e.target.value)}
            className={inputClass}
          />

          <div className="grid grid-cols-2 gap-2">
            {COMMON_EXERCISES.map(ex => (
              <button
                key={ex}
                onClick={() => setSelectedExercise(ex)}
                className={`h-12 rounded-xl text-sm font-medium ${
                  selectedExercise === ex
                    ? "bg-blue-500 text-white"
                    : "bg-slate-700 text-slate-300"
                }`}
              >
                {ex}
              </button>
            ))}
          </div>

          <button
            onClick={addExerciseWithReps}
            className="w-full h-12 rounded-xl bg-slate-600 text-white"
          >
            Tilføj øvelse
          </button>

          <input
            type="text"
            placeholder="Eller skriv manuelt (f.eks. 10 pull ups)"
            value={newExercise}
            onChange={(e) => setNewExercise(e.target.value)}
            className={inputClass}
            onBlur={addExercise}
          />
        </div>

        {/* Ruter */}
        <div className="space-y-3">
          <label className="text-sm text-slate-400">Ruter</label>

          <div className="grid grid-cols-3 gap-2">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setNewRoute(r => ({ ...r, color: c }))}
                className="h-12 rounded-xl text-sm font-semibold text-white"
                style={{ background: getGradient(c) }}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nummer (valgfrit)"
              value={newRoute.number}
              onChange={(e) =>
                setNewRoute({ ...newRoute, number: e.target.value })
              }
              className={`${inputClass} flex-1`}
            />

            <input
              type="number"
              placeholder="Forsøg"
              value={newRoute.attempts}
              onChange={(e) =>
                setNewRoute({ ...newRoute, attempts: e.target.value })
              }
              className="w-24 h-12 bg-slate-700/70 rounded-xl px-3 text-white border border-slate-600"
            />
          </div>
          <button
  type="button"
  onClick={() =>
    setNewRoute(r => ({
      ...r,
      failed: !r.failed,
      note: r.failed ? "" : "Fejl", // valgfrit fallback
    }))
  }
  className={`h-12 px-4 rounded-xl font-medium ${
    newRoute.failed
      ? "bg-red-600 text-white"
      : "bg-slate-700 text-slate-300"
  }`}
>
  ❌ Fejl
</button>
<button
  type="button"
  onClick={() =>
    setNewRoute(r => ({
      ...r,
      flash: !r.flash,
      attempts: !r.flash ? "1" : "",
      failed: false, // flash kan ikke være fejl
    }))
  }
  className={`h-12 px-4 rounded-xl font-medium ${
    newRoute.flash
      ? "bg-yellow-500 text-black"
      : "bg-slate-700 text-slate-300"
  }`}
>
  ⚡ Flash
</button>


          <input
            type="text"
            placeholder="Note (f.eks. 'Fejl – ikke nok fingerstyrke')"
            value={newRoute.note}
            onChange={(e) =>
              setNewRoute({ ...newRoute, note: e.target.value })
            }
            className={inputClass}
          />

          <button
            onClick={addRoute}
            className="w-full h-12 rounded-xl bg-blue-600 text-white font-semibold"
          >
            Tilføj rute
          </button>

          {groupAndSortRoutes(currentSession.routes).map(group => (
            <div key={group.wallHeight}>
              <h4 className="text-sm text-slate-400 mt-3">
                {group.wallHeight} m væg
              </h4>
              {group.routes.map((r, i) => (
                <div
                  key={i}
                  className="mt-1 p-2 rounded-lg text-sm text-white"
                  style={{ background: getGradient(r.color) }}
                >
                  {r.color} {r.number} ({r.attempts})
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Knapper */}
        <div className="space-y-3 pt-4">
          <button
            onClick={() => saveSession(false)}
            disabled={saving}
            className="w-full h-14 rounded-xl bg-green-500 text-white font-semibold text-lg"
          >
            Gem Session
          </button>

          <button
            onClick={() => saveSession(true)}
            className="w-full h-12 rounded-xl bg-slate-600 text-white"
          >
            Gem som kladde
          </button>

          <button
            onClick={onCancel}
            className="w-full text-slate-400 text-sm"
          >
            Annuller
          </button>
        </div>

      </div>
    </div>
  );
}
