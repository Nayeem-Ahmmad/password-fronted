import { useState, useRef, useEffect } from "react";
import { decodePassword } from "../api";

const REVEAL_SECONDS = 10;

export default function DecodeCard() {
  const [encodedValue, setEncodedValue] = useState("");
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
    if (!encodedValue || !masterKey) {
      setError("Encode ভ্যালু এবং Master Password দুটোই দিতে হবে।");
      return;
    }
    setLoading(true);
    setError("");
    setRevealed(null);
    try {
      const res = await decodePassword(encodedValue, masterKey);
      setRevealed(res.data.password);
      setCopied(false);
      startCountdown();
    } catch (err) {
      setError(err?.response?.data?.detail || "ভুল Master Key অথবা Encode ভ্যালু।");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(revealed);
    setCopied(true);
  };

  return (
    <div className="card">
      <h2>🔓 Decode Vault</h2>

      <label>Paste Encode Value</label>
      <input
        type="text"
        placeholder="Enter something here..."
        value={encodedValue}
        onChange={(e) => setEncodedValue(e.target.value)}
      />

      <label>Master Password</label>
      <input
        type="password"
        placeholder="Enter key to unlock..."
        value={masterKey}
        onChange={(e) => setMasterKey(e.target.value)}
      />

      {error && <p className="error-text">{error}</p>}

      <button className="btn btn-green" onClick={handleUnlock} disabled={loading}>
        {loading ? "Unlocking..." : "Unlock Original"}
      </button>

      {revealed && (
        <div className="reveal-box">
          <p className="reveal-password">{revealed}</p>
          <div className="reveal-actions">
            <button className="btn btn-copy" onClick={handleCopy}>
              {copied ? "Copied!" : "Copy"}
            </button>
            <span className="countdown">{countdown}s এর মধ্যে কপি করো</span>
          </div>
        </div>
      )}
    </div>
  );
}