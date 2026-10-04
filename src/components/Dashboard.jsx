import { useCallback, useEffect, useState } from "react";
import EncodeCard from "./EncodeCard";
import DecodeCard from "./DecodeCard";
import EntryList from "./EntryList";
import { fetchEntries, deleteEntry, updateEntry, exportBackup, getErrorMessage } from "../api";

export default function Dashboard({ name, onLock }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [decodeValue, setDecodeValue] = useState("");

  const loadEntries = useCallback(async () => {
    try {
      const res = await fetchEntries();
      setEntries(res.data);
      setLoadError("");
    } catch (err) {
      setLoadError(getErrorMessage(err, "Could not load saved entries."));
    } finally {
      setLoading(false);
    }
  }, []);

  const handleBackup = async () => {
  try {
    const res = await exportBackup();
    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vault-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    setLoadError(getErrorMessage(err, "Could not create a backup."));
  }
};

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleDelete = async (id) => {
    try {
      await deleteEntry(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setLoadError(getErrorMessage(err, "Could not delete this entry."));
    }
  };

  const handleUpdate = async (id, payload) => {
    const res = await updateEntry(id, payload);
    setEntries((prev) => prev.map((e) => (e.id === id ? res.data : e)));
    return res.data;
  };

  const handleUse = (value) => {
    setDecodeValue(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="dashboard">
      <header className="dash-header">
        <h1 className="dash-title">
          Personal Vault <span className="pro-badge">PRO</span>
        </h1>
        <div className="dash-user">
          <span className="user-chip">👋 {name}</span>
          <button className="btn btn-ghost" onClick={onLock}>
            Sign out
          </button>
        </div>
      </header>

      <div className="cards-row">
        <EncodeCard onSaved={loadEntries} />
        <DecodeCard value={decodeValue} onValueChange={setDecodeValue} />
      </div>

      {loadError && <p className="error-text">{loadError}</p>}

      <EntryList
        entries={entries}
        loading={loading}
        onUse={handleUse}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
      />
    </div>
  );
}