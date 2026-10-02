import { useEffect, useState } from "react";
import SetupPage from "./components/SetupPage";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import { fetchStatus } from "./api";
import "./App.css";

const SESSION_KEY = "vault_unlocked";

export default function App() {
  const [stage, setStage] = useState("loading");
  const [name, setName] = useState("");
  const [offline, setOffline] = useState(false);

  const boot = async () => {
    setOffline(false);
    setStage("loading");
    try {
      const res = await fetchStatus();
      if (!res.data.configured) {
        setStage("setup");
        return;
      }
      setName(res.data.name);
      setStage(sessionStorage.getItem(SESSION_KEY) ? "dashboard" : "login");
    } catch {
      setOffline(true);
    }
  };

  useEffect(() => {
    boot();
  }, []);

  const handleSetupDone = (savedName) => {
    setName(savedName);
    setStage("login");
  };

  const handleUnlocked = (savedName) => {
    sessionStorage.setItem(SESSION_KEY, "1");
    setName(savedName);
    setStage("dashboard");
  };

  const handleLock = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setStage("login");
  };

  if (offline) {
    return (
      <main className="center-screen">
        <section className="panel auth-panel">
          <div className="panel-icon">📡</div>
          <h1 className="panel-title">Server not reachable</h1>
          <p className="panel-sub">
            Start the Django server on port 8000, then try again.
          </p>
          <button className="btn btn-primary" onClick={boot}>
            Try again
          </button>
        </section>
      </main>
    );
  }

  if (stage === "loading") {
    return (
      <main className="center-screen">
        <div className="spinner" aria-label="Loading" />
      </main>
    );
  }

  if (stage === "setup") {
    return (
      <main className="center-screen">
        <SetupPage onDone={handleSetupDone} />
      </main>
    );
  }

  if (stage === "login") {
    return (
      <main className="center-screen">
        <LoginPage name={name} onUnlocked={handleUnlocked} />
      </main>
    );
  }

  return <Dashboard name={name} onLock={handleLock} />;
}