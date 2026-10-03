import { useEffect, useState } from "react";

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const ITEMS_PER_PAGE = 9;

export default function EntryList({ entries, loading, onUse, onDelete }) {
  const [query, setQuery] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const handleCopy = async (id, value) => {
    await navigator.clipboard.writeText(value);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = entries.filter((e) =>
    e.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const visibleEntries = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  if (loading) {
    return <div className="spinner small" aria-label="Loading entries" />;
  }

  if (entries.length === 0) {
    return (
      <div className="empty-state">
        <h3>No saved passwords yet</h3>
        <p>Add one with Encode Password above and it will show up here.</p>
      </div>
    );
  }

  return (
    <section className="entries">
      <div className="entries-head">
        <h2 className="entries-title">
          Saved entries <span className="count-chip">{entries.length}</span>
        </h2>
        <input
          type="search"
          className="search-input"
          placeholder="Search by description"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="muted">No entries match your search.</p>
      ) : (
        <>
          <div className="entry-grid">
            {visibleEntries.map((entry) => (
              <article className="entry-card" key={entry.id}>
                <div className="entry-top">
                  <h3>{entry.name}</h3>
                  <span className="entry-date">{formatDate(entry.created_at)}</span>
                </div>
                <p className="encoded-text">{entry.encoded_password}</p>
                <div className="entry-actions">
                  <button
                    className="link-btn accent-pink"
                    onClick={() => handleCopy(entry.id, entry.encoded_password)}
                  >
                    {copiedId === entry.id ? "Copied" : "Copy Encode"}
                  </button>
                  <button
                    className="link-btn"
                    onClick={() => onUse(entry.encoded_password)}
                  >
                    Use in Decode
                  </button>
                  {confirmId === entry.id ? (
                    <span className="confirm-group">
                      <button
                        className="link-btn danger"
                        onClick={() => {
                          onDelete(entry.id);
                          setConfirmId(null);
                        }}
                      >
                        Confirm
                      </button>
                      <button
                        className="link-btn"
                        onClick={() => setConfirmId(null)}
                      >
                        Cancel
                      </button>
                    </span>
                  ) : (
                    <button
                      className="link-btn danger"
                      onClick={() => setConfirmId(entry.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                onClick={() => goToPage(safePage - 1)}
                disabled={safePage === 1}
              >
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`page-btn ${page === safePage ? "page-btn-active" : ""}`}
                  onClick={() => goToPage(page)}
                >
                  {page}
                </button>
              ))}

              <button
                className="page-btn"
                onClick={() => goToPage(safePage + 1)}
                disabled={safePage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}