import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export default function SessionList({ user }) {
  const [sessions, setSessions] = useState([]);

  const loadSessions = async () => {
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });
    if (error) console.error(error);
    else setSessions(data || []);
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const totalMinutes = sessions.reduce((a, s) => a + s.minutes, 0);
  const totalBoulders = sessions.reduce((a, s) => a + s.boulders, 0);

  return (
    <section id="sessions">
      <h2>Your Sessions</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {sessions.map((s) => (
          <li key={s.id}>
            {s.date}: {s.minutes} min – {s.boulders} boulders
          </li>
        ))}
      </ul>
      <section id="stats">
        <h3>Statistics</h3>
        <div>Total Minutes: {totalMinutes}</div>
        <div>Total Boulders: {totalBoulders}</div>
      </section>
    </section>
  );
}
