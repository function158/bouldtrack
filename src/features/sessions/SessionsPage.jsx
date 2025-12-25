import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import NewSessionForm from "./NewSessionForm";

export default function SessionsPage({ user }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [openSessionIds, setOpenSessionIds] = useState([]);

  /* ---------------- data ---------------- */

  const loadSessions = async () => {
    if (!user) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (!error) setSessions(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (user?.id) loadSessions();
  }, [user?.id]);

  /* ---------------- helpers ---------------- */

  const toggleOpen = (id) => {
    setOpenSessionIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  /* ---------------- create mode ---------------- */

  if (creating) {
    return (
      <NewSessionForm
        user={user}
        onSaved={() => {
          setCreating(false);
          loadSessions();
        }}
        onCancel={() => setCreating(false)}
      />
    );
  }

  /* ---------------- loading ---------------- */

  if (loading) {
    return (
      <div className="p-6 text-slate-400 w-full">
        Indlæser sessioner…
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="p-4 space-y-4 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Sessioner</h2>
        <button
          onClick={() => setCreating(true)}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium"
        >
          + Ny session
        </button>
      </div>

      {/* Empty */}
      {sessions.length === 0 && (
        <p className="text-slate-400">
          Ingen sessioner endnu
        </p>
      )}

      {/* Sessions list */}
      <div className="space-y-3">
        {sessions.map((s) => {
          const isDraft = !s.location || !s.duration;
          const open = openSessionIds.includes(s.id);

          return (
            <div
              key={s.id}
              className="bg-slate-800/50 border border-slate-700 rounded-xl p-4"
            >
              <button
                onClick={() => toggleOpen(s.id)}
                className="w-full text-left"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">
                      {new Date(s.date).toLocaleDateString("da-DK")}
                    </div>
                    <div className="text-sm text-slate-400">
                      {s.location || "Ingen lokation"}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isDraft ? (
                      <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-medium">
                        Kladde
                      </span>
                    ) : (
                      <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                        {s.duration}
                      </span>
                    )}

                    <span className="text-xl">
                      {open ? "−" : "+"}
                    </span>
                  </div>
                </div>
              </button>

              {/* Expanded */}
              {open && (
                <div className="mt-4 space-y-3">
                  {Array.isArray(s.exercises) && s.exercises.length > 0 && (
                    <div>
                      <div className="text-sm text-slate-400 mb-1">
                        Øvelser
                      </div>
                      <div className="space-y-1">
                        {s.exercises.map((ex, i) => (
                          <div
                            key={i}
                            className="bg-slate-700/40 rounded px-3 py-1 text-sm"
                          >
                            {ex}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {Array.isArray(s.routes) && s.routes.length > 0 && (
                    <div>
                      <div className="text-sm text-slate-400 mb-1">
                        Ruter
                      </div>
                      <div className="space-y-1">
                        {s.routes.map((r, i) => (
                          <div
                            key={i}
                            className="bg-slate-700/40 rounded px-3 py-1 text-sm"
                          >
                            {r.color}
                            {r.number && ` #${r.number}`}
                            {r.attempts && ` (${r.attempts})`}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
