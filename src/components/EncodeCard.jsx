import { useState } from "react";
import PasswordField from "./PasswordField";
import { encodePassword, getErrorMessage } from "../api";

const CHARSET =
  "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%^&*-_?";

const generatePassword = (length = 16) => {
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);
  return Array.from(values, (v) => CHARSET[v % CHARSET.length]).join("");
};

export default function EncodeCard({ onSaved }) {
  const [label, setLabel] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!label.trim() || !password) {
      setError("Add a description and a password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await encodePassword(label.trim(), password);
      setLabel("");
      setPassword("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err, "Could not save the password."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel card">
      <h2 className="card-title">🔒 Encode Password</h2>

      <div className="field">
        <label>Describe</label>
        <input
          type="text"
          value={label}
          placeholder="e.g. Gmail Account"
          onChange={(e) => setLabel(e.target.value)}
        />
      </div>

      <PasswordField
        label="Password"
        value={password}
        onChange={setPassword}
        placeholder="Enter password..."
        autoComplete="new-password"
        onEnter={handleSave}
      />

      {/* <button
        type="button"
        className="link-btn align-left"
        onClick={() => setPassword(generatePassword())}
      >
        Generate a strong password
      </button> */}

      {error && <p className="error-text">{error}</p>}

      <button
        className="btn btn-primary"
        onClick={handleSave}
        disabled={loading}
      >
        {loading ? "Saving..." : saved ? "Saved" : "⚡ Save Securely"}
      </button>
    </section>
  );
}