import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import NewSessionModal from "./NewSessionModal";
import SessionCard from "./SessionCard";

export default function SessionsPage({ user, onBack, onSignOut }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [locationsList, setLocationsList] = useState([]);

  useEffect(() => {
    if (user) loadSessions();
  }, [user]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) throw error;

      // Sikrer korrekt format for JSON-felter
      const cleaned = (data || []).map((s) => ({
        ...s,
        exercises:
          typeof s.exercises === "string"
            ? JSON.parse(s.exercises || "[]")
            : s.exercises || [],
        routes:
          typeof s.routes === "string"
            ? JSON.parse(s.routes || "[]")
            : s.routes || [],
      }));

      setSessions(cleaned);
      const uniqueLocations = [
        ...new Set(cleaned.map((s) => s.location).filter(Boolean)),
      ];
      setLocationsList(
        uniqueLocations.sort((a, b) =>
          a.localeCompare(b, "da", { sensitivity: "base" })
        )
      );
    } catch (err) {
      console.error("Fejl ved hentning af sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  const removeSession = async (id) => {
    if (!window.confirm("Er du sikker på at du vil slette denne session?")) return;
    try {
      const { error } = await supabase.from("sessions").delete().eq("id", id);
      if (!error) {
        setSessions((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error("Fejl ved sletning:", err);
    }
  };

  if (loading)
    return <div className="text-center py-12 text-slate-400">Indlæser...</div>;

  return (
    <div>
      <header className="mb-6 pt-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Sessioner</h1>
          <p className="text-slate-400">Alle dine klatresessioner</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-sm font-medium">{user.email}</div>
          <div className="mt-2 flex gap-2">
            <button
              onClick={onBack}
              className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-sm"
            >
              Hjem
            </button>
            <button
              onClick={onSignOut}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm"
            >
              Log ud
            </button>
          </div>
        </div>
      </header>

      {/* Ny session-knap */}
      {!showNew && (
        <button
          onClick={() => setShowNew(true)}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 rounded-xl mb-6 flex items-center justify-center gap-2 transition-all shadow-lg"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Ny Session
        </button>
      )}

      {showNew && (
        <NewSessionModal
          user={user}
          onClose={() => {
            setShowNew(false);
            loadSessions();
          }}
          locationsList={locationsList}
        />
      )}

      {/* Sessionsliste */}
      <div className="space-y-4">
        {sessions.length === 0 ? (
          <div className="text-center text-slate-400 py-12">
            Ingen sessioner endnu. Tilføj din første! 💪
          </div>
        ) : (
          sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onDelete={() => removeSession(session.id)}
              onUpdated={loadSessions}
            />
          ))
        )}
      </div>
    </div>
  );
}
