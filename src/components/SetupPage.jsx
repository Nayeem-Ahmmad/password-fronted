import { useState } from "react";
import PasswordField from "./PasswordField";
import { setupVault, getErrorMessage } from "../api";

const getStrength = (value) => {
    let score = 0;
    if (value.length >= 8) score += 1;
    if (value.length >= 12) score += 1;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
    if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score += 1;
    return score;
};

const STRENGTH_LABELS = ["Too weak", "Weak", "Fair", "Good", "Strong"];

export default function SetupPage({ onDone }) {
    const [name, setName] = useState("");
    const [key, setKey] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const strength = key ? getStrength(key) : 0;

    const handleSubmit = async () => {
        if (!name.trim() || !key || !confirm) {
            setError("Fill in all three fields.");
            return;
        }
        if (key.length < 6) {
            setError("Master key must be at least 6 characters.");
            return;
        }
        if (key !== confirm) {
            setError("Both master keys must match.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            await setupVault(name.trim(), key);
            onDone(name.trim());
        } catch (err) {
            setError(getErrorMessage(err, "Could not create the vault."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="panel auth-panel">
            <div className="panel-icon">𓆩♡𓆪</div>
            <h1 className="panel-title">Welcome to Personal Password</h1>
            <p className="panel-sub">Set your name and a master key to get started.</p>

            <div className="field">
                <label>Your name</label>
                <input
                    type="text"
                    value={name}
                    placeholder="e.g. Nayeem"
                    onChange={(e) => setName(e.target.value)}
                />
            </div>

            <PasswordField
                label="Create master key"
                value={key}
                onChange={setKey}
                placeholder="Choose a strong key"
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
                onEnter={handleSubmit}
            />

            {error && <p className="error-text">{error}</p>}

            <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading}
            >
                {loading ? "Creating..." : "Create vault"}
            </button>
        </section>
    );
}