import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./App.css";

export default function MainDashboard() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedLocales, setSelectedLocales] = useState([]);
  const [selectedStage, setSelectedStage] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);

  const fetchData = async () => {
    const res = await fetch("http://localhost:4000/payloads");
    const json = await res.json();
    setData(json.data || []);
    setFilteredData(json.data || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = () => {
    if (!search.trim()) {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter(
      (item) =>
        item.title?.toLowerCase().includes(search.toLowerCase()) ||
        item.entityId?.toLowerCase().includes(search.toLowerCase())
    );

    setFilteredData(filtered);
  };
  const applyFilters = () => {
    let filtered = [...data];

    /* 🔍 SEARCH */
    if (search.trim()) {
      filtered = filtered.filter(
        (item) =>
          item.title?.toLowerCase().includes(search.toLowerCase()) ||
          item.entityId?.toLowerCase().includes(search.toLowerCase())
      );
    }

    /* 🌍 LOCALE FILTER */
    if (selectedLocales.length > 0) {
      filtered = filtered.filter((item) =>
        selectedLocales.some((locale) =>
          item.localesChanged?.includes(locale)
        )
      );
    }

    /* 🔄 STAGE FILTER */
    if (selectedStage) {
      filtered = filtered.filter(
        (item) => item.stage === selectedStage
      );
    }

    /* 📅 DATE RANGE */
    if (startDate) {
      filtered = filtered.filter(
        (item) =>
          new Date(item.createdAt) >= new Date(startDate)
      );
    }

    if (endDate) {
      filtered = filtered.filter(
        (item) =>
          new Date(item.createdAt) <=
          new Date(endDate + "T23:59:59")
      );
    }

    setFilteredData(filtered);
  };

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
  const allLocales = [
    ...new Set(
      data.flatMap((item) => item.localesChanged || [])
    ),
  ];

  /* 🔥 GROUP BY DATE */
  

  return (
    <div className="container">
      <h2 className="page-title">
  Webhook Dashboard
</h2>

      <Link className="link-btn" to="/translator">
  Translator Page
</Link>
<div
  style={{
    display: "flex",
    gap: "10px",
    marginTop: "20px",
    marginBottom: "20px",
  }}
>
  <input
    type="text"
    placeholder="Search title or record ID..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    style={{
      padding: "6px",
      width: "300px",
      borderRadius: "8px",
      border: "1px solid #ccc",
    }}
  />

  <button onClick={applyFilters}>
  Search
</button>
  <button
  onClick={() => {
    setFilteredData(data);
    setSearch("");
    setSelectedLocales([]);
    setSelectedStage("");
    setStartDate("");
    setEndDate("");
  }}
>
  Home
</button>
<div
  style={{
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "6px",
    background: "white",
    width: "70px",
    height: "45px",
    overflowY: "auto",
    overflowX: "hidden",
  }}
>
  {allLocales.map((locale) => (
    <label
      key={locale}
      style={{
        display: "block",
        alignItems: "center",
        gap: "4px",
        fontSize: "13px",
        marginBottom: "2px",
      }}
    >
      <input
        type="checkbox"
        value={locale}
        checked={selectedLocales.includes(locale)}
        onChange={(e) => {
          if (e.target.checked) {
            setSelectedLocales([
              ...selectedLocales,
              locale,
            ]);
          } else {
            setSelectedLocales(
              selectedLocales.filter(
                (l) => l !== locale
              )
            );
          }
        }}
      />
      {" "}{locale}
    </label>
  ))}
</div>
<select
  value={selectedStage}
  onChange={(e) => setSelectedStage(e.target.value)}
>
  <option value="">All Stages</option>
  <option value="review">Review</option>
  <option value="approved">Approved</option>
  <option value="reject">Reject</option>
</select>

<input
  type="date"
  value={startDate}
  onChange={(e) => setStartDate(e.target.value)}
/>

<input
  type="date"
  value={endDate}
  onChange={(e) => setEndDate(e.target.value)}
/>
</div>
      <div>
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
              {filteredData.map((item) => (
                <React.Fragment key={item._id}>
                  <tr id={item._id}
  key={item._id}>
                    <td>
                      <b>{item.title}</b>
                      <br />
                      <small>{item.entityId}</small>
                    </td>

                    <td>
  <div>
    {new Date(item.createdAt).toLocaleTimeString()}
  </div>

  <small style={{ color: "gray" }}>
    {new Date(item.createdAt).toLocaleDateString()}
  </small>
</td>

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
      </div>
    
  );
}