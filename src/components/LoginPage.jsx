import { useState } from "react";
import PasswordField from "./PasswordField";
import {
  loginAccount,
  fetchRecoveryQuestion,
  verifyRecovery,
  resetMasterKey,
  getErrorMessage,
} from "../api";

export default function LoginPage({ notice, onAuthenticated, onSwitch }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newKey, setNewKey] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [localNotice, setLocalNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const switchMode = (next) => {
    setMode(next);
    setError("");
    setLocalNotice("");
    setQuestion(null);
    setAnswer("");
    setResetToken("");
    setNewKey("");
    setConfirm("");
  };

  const handleLogin = async () => {
    if (!name.trim() || !key) {
      setError("Enter your name and master key.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await loginAccount(name.trim(), key);
      onAuthenticated(res.data);
    } catch (err) {
      setError(getErrorMessage(err, "Could not sign in."));
    } finally {
      setLoading(false);
    }
  };

  const handleFindQuestion = async () => {
    if (!name.trim()) {
      setError("Enter your name.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetchRecoveryQuestion(name.trim());
      setQuestion(res.data.question);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load your question."));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!answer.trim()) {
      setError("Enter your recovery answer.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await verifyRecovery(name.trim(), answer);
      setResetToken(res.data.reset_token);
      setAnswer("");
      setMode("newkey");
    } catch (err) {
      setError(getErrorMessage(err, "Could not verify the answer."));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (newKey.length < 8) {
      setError("New master key must be at least 8 characters.");
      return;
    }
    if (newKey !== confirm) {
      setError("Both master keys must match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await resetMasterKey(newKey, resetToken);
      setKey("");
      switchMode("login");
      setLocalNotice("Master key updated. Sign in with your new key.");
    } catch (err) {
      setError(getErrorMessage(err, "Could not reset the master key."));
    } finally {
      setLoading(false);
    }
  };

  if (mode === "verify") {
    return (
      <section className="panel auth-panel">
        <div className="steps">
          <span className="on" />
          <span />
        </div>
        <div className="panel-icon">🧩</div>
        <h1 className="panel-title">Verify it is you</h1>

        {question === null ? (
          <>
            <p className="panel-sub">Enter your name to find your recovery question.</p>
            <div className="field">
              <label>Your name</label>
              <input
                type="text"
                value={name}
                placeholder="The name you signed up with"
                autoComplete="username"
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFindQuestion()}
              />
            </div>
            {error && <p className="error-text">{error}</p>}
            <button
              className="btn btn-primary"
              onClick={handleFindQuestion}
              disabled={loading}
            >
              {loading ? "Looking up..." : "Continue"}
            </button>
          </>
        ) : (
          <>
            <p className="panel-sub">
              Five wrong answers lock this step for 15 minutes.
            </p>
            <div className="question-card">
              <span className="question-label">Your question</span>
              <span className="question-text">{question}</span>
            </div>
            <PasswordField
              label="Your answer"
              value={answer}
              onChange={setAnswer}
              placeholder="Type your recovery answer"
              onEnter={handleVerify}
            />
            {error && <p className="error-text">{error}</p>}
            <button
              className="btn btn-primary"
              onClick={handleVerify}
              disabled={loading}
            >
              {loading ? "Checking..." : "Verify answer"}
            </button>
          </>
        )}

        <button className="link-btn" onClick={() => switchMode("login")}>
          Back to sign in
        </button>
      </section>
    );
  }

  if (mode === "newkey") {
    return (
      <section className="panel auth-panel">
        <div className="steps">
          <span className="on" />
          <span className="on" />
        </div>
        <div className="panel-icon">🔑</div>
        <h1 className="panel-title">Choose a new master key</h1>
        <p className="panel-sub">This step expires in 10 minutes.</p>

        <PasswordField
          label="New master key"
          value={newKey}
          onChange={setNewKey}
          placeholder="At least 8 characters"
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
          Cancel
        </button>
      </section>
    );
  }

  const shownNotice = localNotice || notice;

  return (
    <section className="panel auth-panel">
      <div className="panel-icon">🔐</div>
      <h1 className="panel-title">Sign in to your Password</h1>
      <p className="panel-sub">Use your name and master key.</p>

      <div className="field">
        <label>Your name</label>
        <input
          type="text"
          value={name}
          placeholder="The name you signed up with"
          autoComplete="username"
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <PasswordField
        label="Master key"
        value={key}
        onChange={setKey}
        placeholder="Enter master key"
        autoComplete="current-password"
        onEnter={handleLogin}
      />

      {shownNotice && <p className="notice-text">{shownNotice}</p>}
      {error && <p className="error-text">{error}</p>}

      <button
        className="btn btn-primary"
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
      <button className="link-btn" onClick={() => switchMode("verify")}>
        Forgot master key? Reset it
      </button>
      <button className="link-btn" onClick={onSwitch}>
        New here? Create a Password
      </button>
    </section>
  );
}