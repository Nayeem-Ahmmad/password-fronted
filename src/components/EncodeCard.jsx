import { useState } from "react";
import PasswordField from "./PasswordField";
import { encodePassword, getErrorMessage } from "../api";

const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWER = "abcdefghijkmnopqrstuvwxyz";
const NUMBERS = "23456789";
const SYMBOLS = "!@#$%^&*-_?";

const generatePassword = (length, options) => {
  let charset = "";
  if (options.upper) charset += UPPER;
  if (options.lower) charset += LOWER;
  if (options.numbers) charset += NUMBERS;
  if (options.symbols) charset += SYMBOLS;
  if (!charset) charset = LOWER + NUMBERS;

  const values = new Uint32Array(length);
  crypto.getRandomValues(values);
  return Array.from(values, (v) => charset[v % charset.length]).join("");
};

export default function EncodeCard({ onSaved }) {
  const [label, setLabel] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const [showGenerator, setShowGenerator] = useState(false);
  const [length, setLength] = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);

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
      setShowGenerator(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err, "Could not save the password."));
    } finally {
      setLoading(false);
    }
  };

  const currentOptions = () => ({
    upper: useUpper,
    lower: useLower,
    numbers: useNumbers,
    symbols: useSymbols,
  });

  const toggleGenerator = () => {
    if (!showGenerator) {
      setPassword(generatePassword(length, currentOptions()));
    }
    setShowGenerator((v) => !v);
  };

  const updateLength = (value) => {
    setLength(value);
    setPassword(generatePassword(value, currentOptions()));
  };

  const updateOption = (key, value) => {
    const next = { ...currentOptions(), [key]: value };
    if (key === "upper") setUseUpper(value);
    if (key === "lower") setUseLower(value);
    if (key === "numbers") setUseNumbers(value);
    if (key === "symbols") setUseSymbols(value);
    setPassword(generatePassword(length, next));
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

      <button type="button" className="link-btn align-left" onClick={toggleGenerator}>
        {showGenerator ? "Hide generator" : "Generate a strong password"}
      </button>

      {showGenerator && (
        <div className="generator-panel">
          <div className="slider-row">
            <label>Length: {length}</label>
            <input
              type="range"
              min="8"
              max="32"
              value={length}
              onChange={(e) => updateLength(Number(e.target.value))}
            />
          </div>

          <div className="toggle-grid">
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={useUpper}
                onChange={(e) => updateOption("upper", e.target.checked)}
              />
              Uppercase
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={useLower}
                onChange={(e) => updateOption("lower", e.target.checked)}
              />
              Lowercase
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={useNumbers}
                onChange={(e) => updateOption("numbers", e.target.checked)}
              />
              Numbers
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={useSymbols}
                onChange={(e) => updateOption("symbols", e.target.checked)}
              />
              Symbols
            </label>
          </div>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setPassword(generatePassword(length, currentOptions()))}
          >
            Regenerate
          </button>
        </div>
      )}

      {error && <p className="error-text">{error}</p>}

      <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
        {loading ? "Saving..." : saved ? "Saved" : "⚡ Save Securely"}
      </button>
    </section>
  );
}