import { useState } from "react";

export default function EntryList({ entries }) {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (id, value) => {
    navigator.clipboard.writeText(value);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (entries.length === 0) return null;

  return (
    <div className="entry-list">
      {entries.map((entry) => (
        <div className="entry-card" key={entry.id}>
          <h3>{entry.name}</h3>
          <p className="encoded-text">{entry.encoded_password}</p>
          <button
            className="btn btn-link"
            onClick={() => handleCopy(entry.id, entry.encoded_password)}
          >
            {copiedId === entry.id ? "Copied!" : "Copy Encode"}
          </button>
        </div>
      ))}
    </div>
  );
}