import { useEffect, useState } from "react";
import EncodeCard from "./components/EncodeCard";
import DecodeCard from "./components/DecodeCard";
import EntryList from "./components/EntryList";
import { fetchEntries } from "./api";
import "./App.css";

function App() {
  const [entries, setEntries] = useState([]);

  const loadEntries = async () => {
    try {
      const res = await fetchEntries();
      setEntries(res.data);
    } catch (err) {
      console.error("Failed to load entries", err);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  return (
    <div className="app-container">
      <h1 className="title">
        Personal Vault <span className="pro-badge">PRO</span>
      </h1>

      <div className="cards-row">
        <EncodeCard onSaved={loadEntries} />
        <DecodeCard />
      </div>

      <EntryList entries={entries} />
    </div>
  );
}

export default App;