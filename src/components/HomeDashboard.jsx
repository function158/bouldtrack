import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

/**
 * HomeDashboard viser statistik (tid, antal routes), knap til ny session og signout
 */
export default function HomeDashboard({ user, onNavigate, onSignOut }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState("week");

  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line
  }, [user]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });
      if (!error) {
        setSessions(data || []);
      } else {
        console.error(error);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const parseDuration = (duration) => {
    if (!duration) return 0;
    const hoursMatch = duration.match(/(\d+)\s*(t|h|hour|timer|time)/i);
    const minutesMatch = duration.match(/(\d+)\s*(m|min|minut|minutter|minutes?)/i);
    const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
    return hours * 60 + minutes;
  };

  const getStats = () => {
    const now = new Date();
    let startDate = new Date();
    if (timePeriod === "week") startDate.setDate(now.getDate() - 7);
    if (timePeriod === "month") startDate.setMonth(now.getMonth() - 1);
    if (timePeriod === "year") startDate.setFullYear(now.getFullYear() - 1);

    const filtered = sessions.filter(s => new Date(s.date) >= startDate);
    const totalMinutes = filtered.reduce((acc, s) => acc + parseDuration(s.duration), 0);
    let totalRoutes = 0;
    const colorCounts = {};

    filtered.forEach(s => {
      if (Array.isArray(s.routes)) {
        s.routes.forEach(r => {
          const isCompleted = !r.note || !r.note.toLowerCase().includes("fejl");
          if (isCompleted) {
            totalRoutes++;
            if (r.color) colorCounts[r.color] = (colorCounts[r.color] || 0) + 1;
          }
        });
      }
    });

    // sort colors by difficulty order present in original app
    const colorOrder = ['Sort', 'Rød', 'Lilla', 'Blå', 'Grøn', 'Orange', 'Gul', 'Hvid', 'Pink'];
    const sorted = Object.entries(colorCounts).sort((a,b)=> colorOrder.indexOf(a[0]) - colorOrder.indexOf(b[0]));

    return {
      totalHours: Math.floor(totalMinutes / 60),
      totalMinutes: totalMinutes % 60,
      totalRoutes,
      colorCounts: Object.fromEntries(sorted)
    };
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
      <svg className="animate-spin" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 12a9 0 1 1-6.219-8.56"></path></svg>
    </div>
  );

  const stats = getStats();

  return (
    <div>
      <header className="mb-8 pt-6 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">BouldTrack</h1>
          <p className="text-slate-400">
            <div className="mt-3 flex gap-2">
              <button onClick={()=>setTimePeriod('week')} className={`px-3 py-1 rounded-lg text-sm font-medium border ${timePeriod==='week' ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'}`}>Uge</button>
              <button onClick={()=>setTimePeriod('month')} className={`px-3 py-1 rounded-lg text-sm font-medium border ${timePeriod==='month' ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'}`}>Måned</button>
              <button onClick={()=>setTimePeriod('year')} className={`px-3 py-1 rounded-lg text-sm font-medium border ${timePeriod==='year' ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'}`}>År</button>
            </div>
            <div className="text-slate-400 mt-2">{timePeriod === 'week' ? 'Denne uge' : timePeriod === 'month' ? 'Sidste måned' : 'Sidste år'}</div>
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-sm font-medium">{user.email}</div>
          <button onClick={onSignOut} className="mt-2 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm">Log ud</button>
        </div>
      </header>

      <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 mb-6 border border-slate-700">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <span className="text-sm">Tid klatret</span>
            </div>
            <div className="text-3xl font-bold text-blue-400">
              {stats.totalHours > 0 && `${stats.totalHours}t `}
              {stats.totalMinutes}m
            </div>
          </div>

          <div className="bg-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline></svg>
              <span className="text-sm">Boulders taget</span>
            </div>
            <div className="text-3xl font-bold text-green-400">
              {stats.totalRoutes}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Eksempel på trackede øvelser — hold simple */}
          <div className="bg-slate-700/50 rounded-xl p-4">
            <div className="text-slate-400 text-sm">Pull ups</div>
            <div className="text-2xl font-bold text-cyan-400">—</div>
          </div>
          <div className="bg-slate-700/50 rounded-xl p-4">
            <div className="text-slate-400 text-sm">Dips</div>
            <div className="text-2xl font-bold text-amber-400">—</div>
          </div>
        </div>

        {Object.keys(stats.colorCounts).length > 0 ? (
          <div className="space-y-2">
            <h3 className="text-sm text-slate-400 mb-3">Ruter (sværest først)</h3>
            {Object.entries(stats.colorCounts).map(([color, count]) => (
              <div key={color} className="flex items-center justify-between bg-slate-700/30 rounded-lg p-3">
                <span className="font-semibold text-lg">{color}</span>
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1 rounded-full text-lg font-bold">{count}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-400 py-8">
            {timePeriod === 'week' ? 'Ingen boulders denne uge endnu! 💪' :
              timePeriod === 'month' ? 'Ingen boulders denne måned endnu! 💪' :
              'Ingen boulders dette år endnu! 💪'}
          </div>
        )}
      </div>

      <button onClick={onNavigate} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 rounded-xl mb-4 flex items-center justify-center gap-2 transition-all shadow-lg">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Ny Session
      </button>
    </div>
  );
}
