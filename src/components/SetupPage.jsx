import { useState } from "react";
import { createPortal } from "react-dom";
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
  const [showWarning, setShowWarning] = useState(false);

  const strength = key ? getStrength(key) : 0;

  const validate = () => {
    if (name.trim().length < 2 || !key || !confirm) {
      setError("Enter your name and fill in both master key fields.");
      return false;
    }
    if (key.length < 8) {
      setError("Master key must be at least 8 characters.");
      return false;
    }
    if (key !== confirm) {
      setError("Both master keys must match.");
      return false;
    }
    const problem = validateRecovery(rec, key);
    if (problem) {
      setError(problem);
      return false;
    }
    return true;
  };

  const handleReview = () => {
    setError("");
    if (validate()) {
      setShowWarning(true);
    }
  };

  const handleConfirmCreate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await registerAccount(
        name.trim(),
        key,
        recoveryQuestion(rec),
        rec.answer
      );
      setShowWarning(false);
      onAuthenticated(res.data);
    } catch (err) {
      setShowWarning(false);
      setError(getErrorMessage(err, "Could not create your account."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel auth-panel">
      <div className="panel-icon">𓆩♡𓆪</div>
      <h1 className="panel-title">Create your Password</h1>
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

      <button className="btn btn-primary" onClick={handleReview} disabled={loading}>
        {loading ? "Creating..." : "Create Password"}
      </button>
      <button className="link-btn" onClick={onSwitch}>
        Already have a Password? Sign in
      </button>

      {showWarning &&
        createPortal(
          <div className="modal-overlay" onClick={() => !loading && setShowWarning(false)}>
            <div className="modal-card warning-modal" onClick={(e) => e.stopPropagation()}>
              <div className="warning-icon">⚠️</div>
              <h3 className="modal-title">Before you continue</h3>
              <p className="panel-sub">
                Your master key and recovery answer are the <b>only</b> way to unlock
                your password. Nobody — not even the developer — can reset or recover
                them for you.
              </p>
              <p className="panel-sub warning-strong">
                If you forget your master key <u><b>and</b></u> your recovery answer at the
                same time, every password stored here will be permanently and
                irreversibly lost.
              </p>

              <div className="modal-actions">
                <button
                  className="btn btn-ghost"
                  onClick={() => setShowWarning(false)}
                  disabled={loading}
                >
                  Go back
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleConfirmCreate}
                  disabled={loading}
                >
                  {loading ? "Creating..." : "I understand, Continue"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
}