import { useState } from "react";
import { supabase } from "./supabaseClient";

export default function SessionForm({ user, onAdded }) {
  const [date, setDate] = useState("");
  const [minutes, setMinutes] = useState("");
  const [boulders, setBoulders] = useState("");

  const addSession = async (e) => {
    e.preventDefault();
    if (!date || !minutes || !boulders) return;
    const { error } = await supabase.from("sessions").insert({
      user_id: user.id,
      date,
      minutes: Number(minutes),
      boulders: Number(boulders),
    });
    if (error) alert(error.message);
    else {
      setDate("");
      setMinutes("");
      setBoulders("");
      onAdded(); // reload
    }
  };

  return (
    <form id="session-form" onSubmit={addSession}>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        placeholder="Date"
      />
      <input
        type="number"
        value={minutes}
        onChange={(e) => setMinutes(e.target.value)}
        placeholder="Minutes climbed"
      />
      <input
        type="number"
        value={boulders}
        onChange={(e) => setBoulders(e.target.value)}
        placeholder="Boulders completed"
      />
      <button type="submit">Add Session</button>
    </form>
  );
}
