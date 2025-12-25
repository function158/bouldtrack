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
  });

  
  /* ---------------- helpers ---------------- */

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
    if (!newRoute.color) return;
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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Ny Session</h2>

      <input
        type="date"
        value={currentSession.date}
        onChange={(e) =>
          setCurrentSession(s => ({ ...s, date: e.target.value }))
        }
        className="w-full bg-slate-700 p-3 rounded-lg"
      />

      {!showManualLocationInput ? (
        <select
          value={currentSession.location}
          onChange={(e) => addLocationToList(e.target.value)}
          className="w-full bg-slate-700 p-3 rounded-lg"
        >
          <option value="">Vælg lokation</option>
          {locationsList.map(l => (
            <option key={l} value={l}>{l}</option>
          ))}
          <option value="__manual__">+ Tilføj ny</option>
        </select>
      ) : (
        <input
          type="text"
          placeholder="Ny lokation"
          className="w-full bg-slate-700 p-3 rounded-lg"
          onBlur={(e) => addLocationToList(e.target.value)}
        />
      )}

      <input
        type="text"
        placeholder="Varighed (fx 1t 30m)"
        value={currentSession.duration}
        onChange={(e) =>
          setCurrentSession(s => ({ ...s, duration: e.target.value }))
        }
        className="w-full bg-slate-700 p-3 rounded-lg"
      />

      {/* Øvelser */}
      <div>
        <label className="text-sm text-slate-400">Øvelser</label>

        <div className="flex gap-2 mb-2">
          <select
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
            className="flex-1 bg-slate-700 p-3 rounded-lg"
          >
            <option value="">Vælg øvelse</option>
            {COMMON_EXERCISES.map(ex => (
              <option key={ex}>{ex}</option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Reps"
            value={exerciseReps}
            onChange={(e) => setExerciseReps(e.target.value)}
            className="w-24 bg-slate-700 p-3 rounded-lg"
          />
        </div>

        <button
          onClick={addExerciseWithReps}
          className="w-full bg-slate-600 py-2 rounded-lg"
        >
          Tilføj øvelse
        </button>
      </div>
      {/* Ruter */}
      <div>
        <label className="text-sm text-slate-400">Ruter</label>

        <div className="grid grid-cols-3 gap-2">
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => setNewRoute(r => ({ ...r, color: c }))}
              className="p-3 rounded-lg text-sm"
              style={{ background: getGradient(c) }}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
  <input
    type="text"
    value={newRoute.number}
    onChange={(e) =>
      setNewRoute({ ...newRoute, number: e.target.value })
    }
    placeholder="Nr"
    className="flex-1 bg-slate-700 rounded-lg p-3 text-white border border-slate-600"
  />

  {/* ⭐ VIGTIGT: ANTAL FORSØG */}
  <input
    type="number"
    min="1"
    value={newRoute.attempts}
    onChange={(e) =>
      setNewRoute({ ...newRoute, attempts: e.target.value })
    }
    placeholder="Forsøg"
    className="w-24 bg-slate-700 rounded-lg p-3 text-white border border-slate-600"
  />
</div>

        <button
          onClick={addRoute}
          className="w-full bg-blue-600 py-3 rounded-xl mt-2"
        >
          Tilføj rute
        </button>

        {groupAndSortRoutes(currentSession.routes).map(group => (
          <div key={group.wallHeight}>
            <h4 className="text-sm text-slate-400">
              {group.wallHeight} m væg
            </h4>
            {group.routes.map((r, i) => (
              <div
                key={i}
                className="p-2 rounded-lg text-sm"
                style={{ background: getGradient(r.color) }}
              >
                {r.color} {r.number} ({r.attempts})
              </div>
            ))}
          </div>
        ))}
      </div>

      <button
        onClick={() => saveSession(false)}
        disabled={saving}
        className="w-full bg-green-600 py-4 rounded-xl"
      >
        Gem session
      </button>

      <button
        onClick={() => saveSession(true)}
        className="w-full bg-slate-600 py-3 rounded-xl"
      >
        Gem som kladde
      </button>

      <button
        onClick={onCancel}
        className="w-full text-slate-400"
      >
        Annuller
      </button>
    </div>
  );
}
