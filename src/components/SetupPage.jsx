import { useState } from "react";
import PasswordField from "./PasswordField";
import RecoveryFields from "./RecoveryFields";
import { registerAccount, getErrorMessage } from "../api";
import { emptyRecovery, recoveryQuestion, validateRecovery } from "../recovery";

const getStrength = (value) => {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (value.length >= 12) score += 1;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
  if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score += 1;
  return score;
};

const STRENGTH_LABELS = ["Too weak", "Weak", "Fair", "Good", "Strong"];

export default function SetupPage({ onAuthenticated, onSwitch }) {
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [confirm, setConfirm] = useState("");
  const [rec, setRec] = useState(emptyRecovery());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const strength = key ? getStrength(key) : 0;

  const handleSubmit = async () => {
    if (name.trim().length < 2 || !key || !confirm) {
      setError("Enter your name and fill in both master key fields.");
      return;
    }
    if (key.length < 8) {
      setError("Master key must be at least 8 characters.");
      return;
    }
    if (key !== confirm) {
      setError("Both master keys must match.");
      return;
    }
    const problem = validateRecovery(rec, key);
    if (problem) {
      setError(problem);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await registerAccount(
        name.trim(),
        key,
        recoveryQuestion(rec),
        rec.answer
      );
      onAuthenticated(res.data);
    } catch (err) {
      setError(getErrorMessage(err, "Could not create your account."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel auth-panel">
      <div className="panel-icon">👋</div>
      <h1 className="panel-title">Create your vault</h1>
      <p className="panel-sub">
        Your name and master key are how you sign in. Passwords are stored
        encrypted, locked by a key that your master key unlocks.
      </p>

      <div className="field">
        <label>Your name</label>
        <input
          type="text"
          value={name}
          placeholder="e.g. Nayeem"
          autoComplete="username"
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <PasswordField
        label="Create master key"
        value={key}
        onChange={setKey}
        placeholder="At least 8 characters"
        autoComplete="new-password"
      />

      <div className="strength" data-level={strength}>
        <div className="strength-bars">
          {[1, 2, 3, 4].map((n) => (
            <span key={n} className={n <= strength ? "bar on" : "bar"} />
          ))}
        </div>
        <span className="strength-text">
          {key ? STRENGTH_LABELS[strength] : "Use 12+ characters with symbols"}
        </span>
      </div>

      <PasswordField
        label="Confirm master key"
        value={confirm}
        onChange={setConfirm}
        placeholder="Type the master key again"
        autoComplete="new-password"
      />

      <RecoveryFields rec={rec} setRec={setRec} />

      {error && <p className="error-text">{error}</p>}

      <button
        className="btn btn-primary"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Creating..." : "Create vault"}
      </button>
      <button className="link-btn" onClick={onSwitch}>
        Already have a vault? Sign in
      </button>
    </section>
  );
}