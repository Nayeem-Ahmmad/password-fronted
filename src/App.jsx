import { useEffect, useState } from "react";
import SetupPage from "./components/SetupPage";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import Footer from "./components/Footer";
import {
  fetchMe,
  getToken,
  saveToken,
  clearToken,
  setUnauthorizedHandler,
} from "./api";
import "./App.css";
import "./Recovery.css";
import "./Footer.css";

function Shell({ children, full = false }) {
  return (
    <div className="shell">
      {children}
      <Footer compact={!full} />
    </div>
  );
}

export default function App() {
  const [stage, setStage] = useState("loading");
  const [view, setView] = useState("login");
  const [name, setName] = useState("");
  const [notice, setNotice] = useState("");
  const [offline, setOffline] = useState(false);

  const goToAuth = (message = "") => {
    setNotice(message);
    setView("login");
    setStage("auth");
  };

  const boot = async () => {
    setOffline(false);
    if (!getToken()) {
      setStage("auth");
      return;
    }
    setStage("loading");
    try {
      const res = await fetchMe();
      setName(res.data.name);
      setStage("dashboard");
    } catch (err) {
      if (err?.response) {
        clearToken();
        goToAuth();
      } else {
        setOffline(true);
      }
    }
  };

  useEffect(() => {
    setUnauthorizedHandler(() => goToAuth("Your session expired. Sign in again."));
    boot();
  }, []);

  const handleAuthenticated = (data) => {
    saveToken(data.token);
    setName(data.name);
    setNotice("");
    setStage("dashboard");
  };

  const handleLock = () => {
    clearToken();
    goToAuth();
  };

  if (offline) {
    return (
      <Shell>
        <main className="center-screen">
          <section className="panel auth-panel">
            <div className="panel-icon">📡</div>
            <h1 className="panel-title">Server not reachable</h1>
            <p className="panel-sub">
              Check your connection or start the Django server, then try again.
            </p>
            <button className="btn btn-primary" onClick={boot}>
              Try again
            </button>
          </section>
        </main>
      </Shell>
    );
  }

  if (stage === "loading") {
    return (
      <main className="center-screen">
        <div className="spinner" aria-label="Loading" />
      </main>
    );
  }

  if (stage === "auth") {
    return (
      <Shell>
        <main className="center-screen">
          {view === "register" ? (
            <SetupPage
              onAuthenticated={handleAuthenticated}
              onSwitch={() => setView("login")}
            />
          ) : (
            <LoginPage
              notice={notice}
              onAuthenticated={handleAuthenticated}
              onSwitch={() => {
                setNotice("");
                setView("register");
              }}
            />
          )}
        </main>
      </Shell>
    );
  }

  return (
    <Shell full>
      <Dashboard name={name} onLock={handleLock} />
    </Shell>
  );
}