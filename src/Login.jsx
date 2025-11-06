import React, { useState } from "react";
import { supabase } from "./supabaseClient";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      onLogin(data.user);
    }
    setLoading(false);
  };

  const handleSignup = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      setShowPopup(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-lg w-full max-w-md relative">
        <h1 className="text-2xl font-bold mb-6 text-center">Log ind på Climber.IO</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email"
                 className="w-full bg-slate-700 p-3 rounded-lg border border-slate-600 focus:border-blue-500" required/>
          <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Adgangskode"
                 className="w-full bg-slate-700 p-3 rounded-lg border border-slate-600 focus:border-blue-500" required/>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-blue-500 hover:bg-blue-600 py-3 rounded-lg font-semibold">
            {loading ? 'Logger ind...' : 'Log ind'}
          </button>
          <button onClick={handleSignup} type="button" disabled={loading} className="w-full bg-slate-700 hover:bg-slate-600 py-3 rounded-lg font-semibold mt-2">
            Opret ny konto
          </button>
        </form>

        {showPopup && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-xl text-center w-80">
              <h3 className="text-xl font-semibold mb-3 text-blue-400">Bekræft din email</h3>
              <p className="text-slate-300 mb-6">Tjek din indbakke for at bekræfte din konto, før du logger ind.</p>
              <button onClick={() => setShowPopup(false)} className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg">Luk</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
