import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function MainDashboard() {
  const [data, setData] = useState([]);
  const [expanded, setExpanded] = useState(null);

  const fetchData = async () => {
    const res = await fetch("http://localhost:4000/payloads");
    const json = await res.json();
    setData(json.data || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const deleteItem = async (id) => {
    await fetch(`http://localhost:4000/payloads/${id}`, {
      method: "DELETE",
    });
    fetchData();
  };

  /* 🔥 GROUP BY DATE */
  const grouped = data.reduce((acc, item) => {
    const date = new Date(item.createdAt).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

  return (
    <div style={{ padding: "20px", background: "#0b1a2f", minHeight: "100vh", color: "white" }}>
      <h2>Webhook Dashboard</h2>

      <Link to="/translator">🚫 Translator Page</Link>

      {Object.keys(grouped).map((date) => (
        <div key={date} style={{ marginTop: "20px" }}>
          <h3>{date}</h3>

          <table border="1" width="100%" style={{ background: "white", color: "black" }}>
            <thead>
              <tr>
                <th>Entity</th>
                <th>Time</th>
                <th>Locales</th>
                <th>Stage</th>
                <th>Previous</th>
                <th>Env</th>
                <th>CMS</th>
                <th>Delete</th>
                <th>More</th>
              </tr>
            </thead>

            <tbody>
              {grouped[date].map((item) => (
                <>
                  <tr key={item._id}>
                    <td>
                      <b>{item.title}</b>
                      <br />
                      <small>{item.entityId}</small>
                    </td>

                    <td>{new Date(item.createdAt).toLocaleTimeString()}</td>

                    <td>{item.localesChanged?.join(", ") || "-"}</td>

                    <td>{item.stage}</td>
                    <td>{item.previousStage}</td>
                    <td>{item.environment}</td>

                    <td>
                      <a href={item.cmsLink} target="_blank">
                        Open
                      </a>
                    </td>

                    <td>
                      <button onClick={() => deleteItem(item._id)}>
                        Delete
                      </button>
                    </td>

                    <td>
                      <button
                        onClick={() =>
                          setExpanded(expanded === item._id ? null : item._id)
                        }
                      >
                        More
                      </button>
                    </td>
                  </tr>

                  {/* 🔥 MORE SECTION (ARRAY SUPPORT) */}
                  {expanded === item._id && (
                    <tr>
                      <td colSpan="9">
                        {Object.entries(item.localeChanges || {}).map(
                          ([locale, changes]) => (
                            <div key={locale} style={{ marginBottom: "15px" }}>
                              {Array.isArray(changes) ? (
  changes.map((c, i) => (
    <div key={i}>
      <div style={{ fontWeight: "bold" }}>
        {locale} → {c.field}
      </div>
      <div>
        <span style={{ color: "red" }}>{c.before || "-"}</span>
        {" → "}
        <span style={{ color: "green" }}>{c.after || "-"}</span>
      </div>
    </div>
  ))
) : (
  <div>
    <div style={{ fontWeight: "bold" }}>
      {locale} → {changes.field}
    </div>
    <div>
      <span style={{ color: "red" }}>{changes.before || "-"}</span>
      {" → "}
      <span style={{ color: "green" }}>{changes.after || "-"}</span>
    </div>
  </div>
)}
                            </div>
                          )
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}