import { useEffect, useState } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_URL;

export default function App() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState("Low");
  const [editing, setEditing] = useState(null); // id
  const [editTitle, setEditTitle] = useState("");
  const [editSeverity, setEditSeverity] = useState("Low");
  const [error, setError] = useState("");

  async function load() {
    setError("");
    try {
      const r = await fetch(`${API}/api/incidents`);
      if (!r.ok) throw new Error("Load failed");
      setItems(await r.json());
    } catch {
      setError("No se pudo cargar. ¿API encendida?");
    }
  }

  async function add(e) {
    e.preventDefault();
    setError("");
    const res = await fetch(`${API}/api/incidents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, severity })
    });
    if (res.ok) {
      setTitle("");
      setSeverity("Low");
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? "No se pudo crear");
    }
  }

  function startEdit(x) {
    setEditing(x.id);
    setEditTitle(x.title);
    setEditSeverity(x.severity);
  }

  async function saveEdit(id) {
    setError("");
    const res = await fetch(`${API}/api/incidents/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle, severity: editSeverity })
    });
    if (res.ok) {
      setEditing(null);
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? "No se pudo actualizar");
    }
  }

  async function del(id) {
    await fetch(`${API}/api/incidents/${id}`, { method: "DELETE" });
    load();
  }

  useEffect(() => { load(); }, []);

  return (
    <main className="container">
      <h1>Incidents</h1>

      <form className="toolbar" onSubmit={add}>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Title"
          required
        />
        <select value={severity} onChange={e => setSeverity(e.target.value)}>
          <option>Low</option><option>Med</option><option>High</option>
        </select>
        <button type="submit">Add</button>
      </form>

      {error && <div className="error">{error}</div>}

      <div className="list">
        {items.length === 0 && (
          <div className="empty">Sin datos aún. Agrega el primero 👇</div>
        )}

        {items.map(x => (
          <div key={x.id} className="card">
            {editing === x.id ? (
              <>
                <div className="row" style={{ flex: 1 }}>
                  <input
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <select
                    value={editSeverity}
                    onChange={e => setEditSeverity(e.target.value)}
                  >
                    <option>Low</option><option>Med</option><option>High</option>
                  </select>
                </div>
                <div className="row">
                  <button onClick={() => saveEdit(x.id)}>Save</button>
                  <button className="ghost" onClick={() => setEditing(null)} type="button">
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="row" style={{ gap: 12 }}>
                  <div><b>#{x.id}</b> {x.title}</div>
                  <span className={`badge ${x.severity.toLowerCase()}`}>{x.severity}</span>
                </div>
                <div className="row">
                  <button className="ghost" onClick={() => startEdit(x)} type="button">
                    Edit
                  </button>
                  <button onClick={() => del(x.id)} type="button">Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
