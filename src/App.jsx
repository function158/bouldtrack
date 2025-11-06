import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import Login from "./Login";
import HomeDashboard from "./components/HomeDashboard";
import SessionsPage from "./components/SessionsPage";
import "./index.css"; // keep Tailwind imports (or App.css if you prefer)

export default function App() {
  const [user, setUser] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const activeUser = data.session?.user || null;
      setUser(activeUser);
      if (activeUser) {
        setShowWelcome(true);
        setTimeout(() => setShowWelcome(false), 2500);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        setShowWelcome(true);
        setTimeout(() => setShowWelcome(false), 2500);
      }
    });

    return () => {
      mounted = false;
      listener.subscription?.unsubscribe();
    };
  }, []);

  if (!user) return <Login onLogin={setUser} />;

  return (
    <>
      <MainApp
        user={user}
        signOut={() => supabase.auth.signOut().then(() => setUser(null))}
      />
      {showWelcome && (
        <div className="fixed bottom-6 right-6 bg-blue-600 text-white px-4 py-3 rounded-xl shadow-lg">
          <p>Velkommen, {user.email} 👋</p>
        </div>
      )}
    </>
  );
}

function MainApp({ user, signOut }) {
  const [page, setPage] = useState("home"); // 'home' | 'sessions'

  return (
    <div className="min-h-screen bg-bgDark text-textMain flex flex-col items-center">
      {/* Centered content: full width but limited by max-w */}
      <div className="w-full max-w-5xl px-4 py-8">
        {page === "home" ? (
          <HomeDashboard
            user={user}
            onNavigate={() => setPage("sessions")}
            onSignOut={signOut}
          />
        ) : (
          <SessionsPage
            user={user}
            onBack={() => setPage("home")}
            onSignOut={signOut}
          />
        )}
      </div>

      {/* Bottom nav aligned to same max width */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-800/90 backdrop-blur border-t border-slate-700">
        <div className="w-full max-w-5xl mx-auto px-4 py-3 flex justify-around">
          <button
            onClick={() => setPage("home")}
            className={`flex flex-col items-center gap-1 ${
              page === "home" ? "text-blue-400" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="text-xs font-medium">Hjem</span>
          </button>

          <button
            onClick={() => setPage("sessions")}
            className={`flex flex-col items-center gap-1 ${
              page === "sessions" ? "text-blue-400" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span className="text-xs font-medium">Sessioner</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
