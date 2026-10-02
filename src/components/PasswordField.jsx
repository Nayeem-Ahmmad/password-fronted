import { useState } from "react";

export default function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  autoComplete = "off",
  onEnter,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="field">
      <label>{label}</label>
      <div className="input-wrap">
        <input
          type={visible ? "text" : "password"}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onEnter && onEnter()}
        />
        <button
          type="button"
          className="toggle-visibility"
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}