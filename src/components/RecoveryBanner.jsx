import { useState } from "react";
import PasswordField from "./PasswordField";
import RecoveryFields from "./RecoveryFields";
import { setRecovery, getErrorMessage } from "../api";
import { emptyRecovery, recoveryQuestion, validateRecovery } from "../recovery";

export default function RecoveryBanner({ onSaved }) {
  const [open, setOpen] = useState(false);
  const [masterKey, setMasterKey] = useState("");
  const [rec, setRec] = useState(emptyRecovery());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!masterKey) {
      setError("Enter your master key to confirm.");
      return;
    }
    const problem = validateRecovery(rec, masterKey);
    if (problem) {
      setError(problem);
      return;
    }
    setLoading(true);
    setError("");
    try {
      await setRecovery(masterKey, recoveryQuestion(rec), rec.answer);
      await onSaved();
    } catch (err) {
      setError(getErrorMessage(err, "Could not save the recovery answer."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="banner">
      <div className="banner-head">
        <div>
          <h3>Recovery answer is not set</h3>
          <p>Without it, a forgotten master key can never be reset.</p>
        </div>
        {!open && (
          <button className="btn btn-primary" onClick={() => setOpen(true)}>
            Set it up
          </button>
        )}
      </div>

      {open && (
        <div className="banner-form">
          <PasswordField
            label="Master key"
            value={masterKey}
            onChange={setMasterKey}
            placeholder="Enter your master key"
            autoComplete="current-password"
          />
          <RecoveryFields rec={rec} setRec={setRec} />
          {error && <p className="error-text">{error}</p>}
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save recovery answer"}
          </button>
        </div>
      )}
    </section>
  );
}