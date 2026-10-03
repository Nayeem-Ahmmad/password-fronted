import PasswordField from "./PasswordField";
import { CUSTOM, QUESTIONS } from "../recovery";

export default function RecoveryFields({ rec, setRec }) {
  const update = (patch) => setRec((prev) => ({ ...prev, ...patch }));

  return (
    <div className="recovery-box">
      <h3 className="recovery-title">Recovery answer</h3>
      <p className="recovery-text">
        Pick something short that only you know. You will need this answer to
        reset your master key. Capital letters and extra spaces do not matter.
      </p>

      <div className="field">
        <label>Question</label>
        <select
          value={rec.choice}
          onChange={(e) => update({ choice: e.target.value })}
        >
          {QUESTIONS.map((q) => (
            <option key={q} value={q}>
              {q}
            </option>
          ))}
        </select>
      </div>

      {rec.choice === CUSTOM && (
        <div className="field">
          <label>Your question</label>
          <input
            type="text"
            value={rec.custom}
            placeholder="e.g. Name of my first pet"
            onChange={(e) => update({ custom: e.target.value })}
          />
        </div>
      )}

      <PasswordField
        label="Your answer"
        value={rec.answer}
        onChange={(v) => update({ answer: v })}
        placeholder="Short and easy to remember"
      />
      <PasswordField
        label="Confirm answer"
        value={rec.confirm}
        onChange={(v) => update({ confirm: v })}
        placeholder="Type the answer again"
      />

      <label className="check-row">
        <input
          type="checkbox"
          checked={rec.ack}
          onChange={(e) => update({ ack: e.target.checked })}
        />
        <span>
          I will remember this answer. Without it, my master key cannot be
          reset.
        </span>
      </label>
    </div>
  );
}