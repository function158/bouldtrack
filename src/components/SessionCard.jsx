import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export default function SessionCard({ session, onDelete, onUpdated }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editSession, setEditSession] = useState(session);
  const [saving, setSaving] = useState(false);

  const updateSession = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("sessions")
        .update(editSession)
        .eq("id", session.id);
      if (error) throw error;
      setEditing(false);
      onUpdated();
    } catch (err) {
      console.error("Fejl ved opdatering:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-4 transition-all">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setExpanded((e) => !e)}
      >
        <div>
          <div className="text-slate-400 text-sm">{session.date}</div>
          <div className="font-semibold text-lg">{session.location}</div>
          <div className="text-slate-300 text-sm">{session.duration}</div>
        </div>
        <div className="text-slate-400 text-sm">
          {expanded ? "▲" : "▼"}
        </div>
      </div>

      {expanded && (
        <div className="mt-4 border-t border-slate-700 pt-4 space-y-3">
          {!editing ? (
            <>
              {/* Øvelser */}
              <div>
                <h4 className="text-slate-400 text-sm mb-1">Øvelser:</h4>
                {Array.isArray(session.exercises) &&
                session.exercises.length > 0 ? (
                  <ul className="space-y-1">
                    {session.exercises.map((ex, i) => (
                      <li
                        key={i}
                        className="bg-slate-700/50 px-3 py-2 rounded-lg text-sm text-slate-100"
                      >
                        {typeof ex === "string"
                          ? ex
                          : ex.name || "Ukendt øvelse"}
                        {ex.sets && ex.reps
                          ? ` - ${ex.sets}x${ex.reps}`
                          : ""}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-slate-500 text-sm">
                    Ingen øvelser registreret
                  </div>
                )}
              </div>

              {/* Ruter */}
              <div>
                <h4 className="text-slate-400 text-sm mb-1">Ruter:</h4>
                {Array.isArray(session.routes) && session.routes.length > 0 ? (
                  <ul className="space-y-1">
                    {session.routes.map((r, i) => (
                      <li
                        key={i}
                        className="bg-slate-700/50 px-3 py-2 rounded-lg text-sm text-slate-100"
                      >
                        {r.color} {r.number}{" "}
                        {r.attempts ? `(${r.attempts})` : ""}{" "}
                        {r.note ? `- ${r.note}` : ""}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-slate-500 text-sm">Ingen ruter</div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setEditing(true)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-sm"
                >
                  Rediger
                </button>
                <button
                  onClick={onDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm"
                >
                  Slet
                </button>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-slate-400 text-sm mb-1">
                  Lokation
                </label>
                <input
                  value={editSession.location}
                  onChange={(e) =>
                    setEditSession({ ...editSession, location: e.target.value })
                  }
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">
                  Varighed
                </label>
                <input
                  value={editSession.duration}
                  onChange={(e) =>
                    setEditSession({ ...editSession, duration: e.target.value })
                  }
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-white"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={updateSession}
                  disabled={saving}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm"
                >
                  Gem
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-sm"
                >
                  Annuller
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
