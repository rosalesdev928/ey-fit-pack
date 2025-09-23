import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL;

export default function App() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState("Low");

  async function load() {
    const r = await fetch(`${API}/api/incidents`);
    setItems(await r.json());
  }
  async function add(e) {
    e.preventDefault();
    await fetch(`${API}/api/incidents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, severity })
    });
    setTitle(""); setSeverity("Low"); load();
  }
  async function del(id) {
    await fetch(`${API}/api/incidents/${id}`, { method: "DELETE" });
    load();
  }

  useEffect(() => { load(); }, []);

  return (
    <main style={{maxWidth: 720, margin: "40px auto", fontFamily: "system-ui"}}>
      <h1>Incidents</h1>
      <form onSubmit={add} style={{display:"flex", gap:8, margin:"12px 0"}}>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" style={{flex:1, padding:8}} required />
        <select value={severity} onChange={e=>setSeverity(e.target.value)} style={{padding:8}}>
          <option>Low</option><option>Med</option><option>High</option>
        </select>
        <button type="submit">Add</button>
      </form>
      <ul style={{listStyle:"none", padding:0}}>
        {items.map(x=>(
          <li key={x.id} style={{display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #eee"}}>
            <span><b>#{x.id}</b> {x.title} — <i>{x.severity}</i></span>
            <button onClick={()=>del(x.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </main>
  );
}
