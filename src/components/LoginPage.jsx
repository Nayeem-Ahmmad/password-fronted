import { useState } from "react";
import PasswordField from "./PasswordField";
import { loginVault, resetMasterKey, getErrorMessage } from "../api";

export default function LoginPage({ name, onUnlocked }) {
  const [mode, setMode] = useState("login");
  const [key, setKey] = useState("");
  const [newKey, setNewKey] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!key) {
      setError("Enter your master key.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await loginVault(key);
      onUnlocked(res.data.name || name);
    } catch (err) {
      setError(getErrorMessage(err, "Could not unlock the vault."));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (newKey.length < 6) {
      setError("New master key must be at least 6 characters.");
      return;
    }
    if (newKey !== confirm) {
      setError("Both master keys must match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await resetMasterKey(newKey);
      setNewKey("");
      setConfirm("");
      setKey("");
      setMode("login");
      setNotice("Master key updated. Unlock with your new key.");
    } catch (err) {
      setError(getErrorMessage(err, "Could not reset the master key."));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next) => {
    setMode(next);
    setError("");
    setNotice("");
  };

  if (mode === "reset") {
    return (
      <section className="panel auth-panel">
        <div className="panel-icon">🔑</div>
        <h1 className="panel-title">Reset master key</h1>
        <p className="panel-sub">Choose a new key for your vault.</p>

        <PasswordField
          label="New master key"
          value={newKey}
          onChange={setNewKey}
          placeholder="Enter a new key"
          autoComplete="new-password"
        />
        <PasswordField
          label="Confirm new key"
          value={confirm}
          onChange={setConfirm}
          placeholder="Type the new key again"
          autoComplete="new-password"
          onEnter={handleReset}
        />

        {error && <p className="error-text">{error}</p>}

        <button
          className="btn btn-primary"
          onClick={handleReset}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save new key"}
        </button>
        <button className="link-btn" onClick={() => switchMode("login")}>
          Back to unlock
        </button>
      </section>
    );
  }

  return (
    <section className="panel auth-panel">
      <div className="panel-icon">🔐</div>
      <h1 className="panel-title">Welcome back, {name}</h1>
      <p className="panel-sub">Enter your master key to unlock the vault.</p>

      <PasswordField
        label="Master key"
        value={key}
        onChange={setKey}
        placeholder="Enter master key"
        autoComplete="current-password"
        onEnter={handleLogin}
      />

      {notice && <p className="notice-text">{notice}</p>}
      {error && <p className="error-text">{error}</p>}

      <button
        className="btn btn-primary"
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? "Unlocking..." : "Unlock vault"}
      </button>
      <button className="link-btn" onClick={() => switchMode("reset")}>
        Forgot master key? Reset it
      </button>
    </section>
  );
}