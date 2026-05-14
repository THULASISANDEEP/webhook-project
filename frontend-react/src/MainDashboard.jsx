import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./App.css";

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
  /* 🔥 EXTRACT TEXT FROM DATO STRUCTURED TEXT */
  const getDisplayValue = (value) => {
    if (!value) return "-";

    /* NORMAL STRING */
    if (typeof value === "string") return value;

    /* STRUCTURED TEXT */
    if (
      typeof value === "object" &&
      value.document?.children
    ) {
      try {
        return value.document.children
          .map((child) =>
            child.children
              ?.map((c) => c.value || "")
              .join("")
          )
          .join(" ");
      } catch {
        return "[Structured Text]";
      }
    }

    return JSON.stringify(value);
  };

  /* 🔥 GROUP BY DATE */
  const grouped = data.reduce((acc, item) => {
    const date = new Date(item.createdAt).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

  return (
    <div className="container">
      <h2 className="page-title">
  Webhook Dashboard
</h2>

      <Link className="link-btn" to="/translator">
  Translator Page
</Link>

      {Object.keys(grouped).map((date) => (
        <div key={date}>
          <h3 className="date-title">{date}</h3>

          <div className="table-wrapper">
<table>
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
                <React.Fragment key={item._id}>
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
        <span style={{ color: "red" }}>
  {getDisplayValue(c.before)}</span>
        {" → "}
        <span style={{ color: "green" }}>
  {getDisplayValue(c.after)}</span>
      </div>
    </div>
  ))
) : (
  <div>
    <div style={{ fontWeight: "bold" }}>
      {locale} → {changes.field}
    </div>
    <div>
      <span style={{ color: "red" }}>
  {getDisplayValue(changes.before)}</span>
      {" → "}
      <span style={{ color: "green" }}>
  {getDisplayValue(changes.after)}</span>
    </div>
  </div>
)}
                            </div>
                          )
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      ))}
    </div>
  );
}