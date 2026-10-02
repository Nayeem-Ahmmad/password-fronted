import { useState } from "react";
import { encodePassword } from "../api";

export default function EncodeCard({ onSaved }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!name || !password) {
      setError("নাম এবং পাসওয়ার্ড দুটোই দিতে হবে।");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await encodePassword(name, password);
      setName("");
      setPassword("");
      onSaved();
    } catch (err) {
      setError("সেভ করতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>🔒 Encode Password</h2>

      <label>Describe</label>
      <input
        type="text"
        placeholder="e.g. Gmail Account"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <label>Password</label>
      <input
        type="password"
        placeholder="Enter password..."
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <p className="error-text">{error}</p>}

      <button className="btn btn-blue" onClick={handleSave} disabled={loading}>
        {loading ? "Saving..." : "⚡ Save Securely"}
      </button>
    </div>
  );
}