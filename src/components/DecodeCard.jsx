import { useEffect, useRef, useState } from "react";
import PasswordField from "./PasswordField";
import { decodePassword, getErrorMessage } from "../api";

const REVEAL_SECONDS = 10;

export default function DecodeCard({ value, onValueChange }) {
  const [masterKey, setMasterKey] = useState("");
  const [revealed, setRevealed] = useState(null);
  const [countdown, setCountdown] = useState(REVEAL_SECONDS);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const hide = () => {
    clearInterval(timerRef.current);
    setRevealed(null);
    setCopied(false);
    setCountdown(REVEAL_SECONDS);
  };

  const startCountdown = () => {
    clearInterval(timerRef.current);
    setCountdown(REVEAL_SECONDS);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setRevealed(null);
          setCopied(false);
          return REVEAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleUnlock = async () => {
    if (!value.trim() || !masterKey) {
      setError("Paste the encode value and enter your master key.");
      return;
    }
    setLoading(true);
    setError("");
    hide();
    try {
      const res = await decodePassword(value.trim(), masterKey);
      setRevealed(res.data.password);
      setMasterKey("");
      startCountdown();
    } catch (err) {
      setError(getErrorMessage(err, "Wrong master key or encode value."));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(revealed);
    setCopied(true);
  };

  return (
    <section className="panel card">
      <h2 className="card-title">🔓 Decode Password</h2>

      <div className="field">
        <label>Paste Encode Value</label>
        <input
          type="text"
          value={value}
          placeholder="Enter something here..."
          onChange={(e) => onValueChange(e.target.value)}
        />
      </div>

      <PasswordField
        label="Master Password"
        value={masterKey}
        onChange={setMasterKey}
        placeholder="Enter key to unlock..."
        autoComplete="current-password"
        onEnter={handleUnlock}
      />

      {error && <p className="error-text">{error}</p>}

      <button
        className="btn btn-green"
        onClick={handleUnlock}
        disabled={loading}
      >
        {loading ? "Unlocking..." : "Unlock Original"}
      </button>

      {revealed && (
        <div className="reveal-box">
          <p className="reveal-password">{revealed}</p>
          <div className="reveal-actions">
            <button className="btn btn-dark" onClick={handleCopy}>
              {copied ? "Copied" : "Copy"}
            </button>
            <button className="link-btn" onClick={hide}>
              Hide now
            </button>
            <span className="countdown">Hides in {countdown}s</span>
          </div>
          <div className="reveal-progress">
            <span style={{ width: `${(countdown / REVEAL_SECONDS) * 100}%` }} />
          </div>
        </div>
      )}
    </section>
  );
}