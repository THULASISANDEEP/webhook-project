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
  const [showLocales, setShowLocales] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const fetchData = async () => {
    const res = await fetch("http://localhost:4000/payloads");
    const json = await res.json();
    setData(json.data || []);
    setFilteredData(json.data || []);
  };

  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
  applyFilters();
}, [
  search,
  selectedLocales,
  selectedStage,
  startDate,
  endDate,
]);

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

    /*  LOCALE FILTER */
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
  /* 🔥 PAGINATION */
  const totalRecords = filteredData.length;

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow =
    indexOfLastRow - rowsPerPage;

  const currentRows = filteredData.slice(
    indexOfFirstRow,
    indexOfLastRow
  );

  const totalPages = Math.ceil(
    filteredData.length / rowsPerPage
  );
  const searchSuggestions = data.filter(
    (item) =>
      item.title
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      item.entityId
        ?.toLowerCase()
        .includes(search.toLowerCase())
  );

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
    fontSize: "14px",
    color: "#666",
    marginBottom: "12px",
    marginTop: "10px",
    fontWeight: "500",
  }}
>
  Total: {data.length} | Visible: {filteredData.length}
</div>
<div
  style={{
    display: "flex",
    gap: "10px",
    marginTop: "20px",
    marginBottom: "20px",
  }}
>
  <div
  style={{
    position: "relative",
  }}
>
  <input
    type="text"
    placeholder="Search title or record ID..."
    value={search}
    onChange={(e) => {
      setSearch(e.target.value);
      setShowSearchDropdown(true);
      applyFilters();
    }}
    onFocus={() =>
      setShowSearchDropdown(true)
    }
    onMouseEnter={() =>
      setShowSearchDropdown(true)
    }
    onMouseOver={(e) => {
      e.currentTarget.style.transform =
        "translateY(-2px)";
      e.currentTarget.style.boxShadow =
        "0 8px 20px rgba(0,0,0,0.1)";
    }}

    onMouseOut={(e) => {
      e.currentTarget.style.transform =
        "translateY(0px)";
      e.currentTarget.style.boxShadow =
        "0 2px 10px rgba(0,0,0,0.05)";
    }}
    
    style={{
      padding: "12px 16px",
      width: "320px",
      borderRadius: "14px",
      border: "1px solid #dcdcdc",
      outline: "none",
      fontSize: "15px",
      background: "#fff",
      boxShadow:
        "0 2px 8px rgba(0,0,0,0.05)",
      transition: "0.3s",
      transition: "0.3s",
boxShadow:
  "0 2px 10px rgba(0,0,0,0.05)",
  
    }}
  />
  
 
  {showSearchDropdown &&
    search.trim() &&
    searchSuggestions.length > 0 && (
      <div
        style={{
  padding: "12px 16px",
  width: "320px",
  borderRadius: "14px",
  border: "1px solid #dcdcdc",
  outline: "none",
  fontSize: "15px",
  background: "#fff",
  transition: "0.3s",
  boxShadow:
    "0 2px 10px rgba(0,0,0,0.05)",
}}
      >
        {searchSuggestions.map((item) => (
          <div
            key={item._id}
            onClick={() => {
              setSearch(item.title);
              setFilteredData([item]);
              setShowSearchDropdown(false);
            }}
            style={{
              padding: "14px",
              cursor: "pointer",
              borderBottom:
                "1px solid #f1f1f1",
            }}
          >
            <div
              style={{
                fontWeight: "600",
                fontSize: "15px",
              }}
            >
              {item.title}
            </div>

            <div
              style={{
                color: "#777",
                fontSize: "13px",
                marginTop: "4px",
              }}
            >
              {item.entityId}
            </div>
          </div>
        ))}
      </div>
    )}
</div>

  <button
  onClick={() => {
    setFilteredData(data);
    setSearch("");
    setSelectedLocales([]);
    setSelectedStage("");
    setStartDate("");
    setEndDate("");
  }}

  onMouseOver={(e) => {
    e.currentTarget.style.transform =
      "translateY(-2px)";
    e.currentTarget.style.boxShadow =
      "0 8px 18px rgba(0,0,0,0.1)";
  }}

  onMouseOut={(e) => {
    e.currentTarget.style.transform =
      "translateY(0px)";
    e.currentTarget.style.boxShadow =
      "none";
  }}

  style={{
    transition: "0.3s",
  }}
>
  Home
</button>
<div
  style={{ position: "relative" }}
  onMouseLeave={() =>
    setShowLocales(false)
  }
>
  <button
  onMouseEnter={() =>
    setShowLocales(true)
  }

  onMouseOver={(e) => {
    e.currentTarget.style.transform =
      "translateY(-2px)";
    e.currentTarget.style.boxShadow =
      "0 8px 18px rgba(0,0,0,0.1)";
  }}

  onMouseOut={(e) => {
    e.currentTarget.style.transform =
      "translateY(0px)";
    e.currentTarget.style.boxShadow =
      "0 2px 6px rgba(0,0,0,0.05)";
  }}
    style={{
      padding: "10px",
      borderRadius: "8px",
      border: "1px solid #ccc",
      background: "white",
      minWidth: "100px",
      cursor: "pointer",
      height: "45px",
    }}
  >
    Locales ▼
  </button>

  {showLocales && (
    <div
     onMouseLeave={() =>
      setShowLocales(false)
    }
      style={{
        position: "absolute",
        top: "42px",
        left: 0,
        background: "white",
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "10px",
        zIndex: 1000,
        minWidth: "120px",
        maxHeight: "200px",
        overflowY: "auto",
        transition: "0.3s",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
    >
      {allLocales.map((locale) => (
        <label
          key={locale}
          style={{
            display: "block",
            marginBottom: "8px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          <input
            type="checkbox"
            checked={selectedLocales.includes(locale)}
            onChange={(e) => {
              if (e.target.checked) {
                const updated = e.target.checked
  ? [...selectedLocales, locale]
  : selectedLocales.filter(
      (l) => l !== locale
    );

setSelectedLocales(updated);

setTimeout(() => {
  setShowLocales(false);
}, 200);
              } else {
                setSelectedLocales(
                  selectedLocales.filter(
                    (l) => l !== locale
                  )
                );
              }
            }}
          />

          {" "}
          {locale}
        </label>
      ))}
    </div>
  )}
</div>
<select
  value={selectedStage}
  onChange={(e) =>
    setSelectedStage(e.target.value)
  }

  onMouseEnter={(e) => e.target.focus()}
  onMouseOver={(e) => {
    e.currentTarget.style.transform =
      "translateY(-2px)";
  }}

  onMouseOut={(e) => {
    e.currentTarget.style.transform =
      "translateY(0px)";
  }}
  style={{
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #ddd",
    background: "white",
    cursor: "pointer",
    fontSize: "14px",
    transition: "0.3s",
    boxShadow:
      "0 2px 6px rgba(0,0,0,0.05)",
  }}
>
  <option value="">All Stages</option>
  <option value="review">Review</option>
  <option value="approved">Approved</option>
  <option value="reject">Reject</option>
</select>

<input
  type="date"
  value={startDate}
  onChange={(e) =>
    setStartDate(e.target.value)
  }
  onMouseEnter={(e) => e.target.showPicker()}
  onMouseOver={(e) => {
    e.currentTarget.style.transform =
      "translateY(-2px)";
  }}

  onMouseOut={(e) => {
    e.currentTarget.style.transform =
      "translateY(0px)";
  }}
  style={{
    padding: "11px",
    borderRadius: "12px",
    border: "1px solid #ddd",
    background: "white",
    transition: "0.3s",
    boxShadow:
      "0 2px 6px rgba(0,0,0,0.05)",
  }}
/>

<input
  type="date"
  value={endDate}
  onChange={(e) =>
    setEndDate(e.target.value)
  }
  onMouseEnter={(e) => e.target.showPicker()}
  onMouseOver={(e) => {
    e.currentTarget.style.transform =
      "translateY(-2px)";
  }}

  onMouseOut={(e) => {
    e.currentTarget.style.transform =
      "translateY(0px)";
  }}
  style={{
    padding: "11px",
    borderRadius: "12px",
    border: "1px solid #ddd",
    background: "white",
    boxShadow:
      "0 2px 6px rgba(0,0,0,0.05)",
    transition: "0.3s",
  }}
/>
</div>
      <div>
        <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
    marginTop: "10px",
  }}
>
  <div
    style={{
      fontSize: "14px",
      color: "#666",
    }}
  >
    Total: {totalRecords} | Visible:{" "}
    {currentRows.length}
  </div>

  <select
    value={rowsPerPage}
    onChange={(e) => {
      setRowsPerPage(Number(e.target.value));
      setCurrentPage(1);
    }}
    style={{
      padding: "5px",
      borderRadius: "6px",
    }}
  >
    <option value={5}>5</option>
    <option value={10}>10</option>
    <option value={20}>20</option>
    <option value={50}>50</option>
  </select>
</div>
          <div className="table-wrapper">
<table
  style={{
    borderCollapse: "separate",
    borderSpacing: "0 10px",
  }}
>
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
              {currentRows.map((item) => (
                <React.Fragment key={item._id}>
                  <tr
  id={item._id}
  style={{
    background: "white",
    transition: "0.3s",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.04)",
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform =
      "scale(1.002)";
    e.currentTarget.style.boxShadow =
      "0 8px 20px rgba(0,0,0,0.08)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform =
      "scale(1)";
    e.currentTarget.style.boxShadow =
      "0 2px 10px rgba(0,0,0,0.04)";
  }}
>
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
  <div
    style={{
      marginBottom: "20px",
      padding: "10px",
      border: "1px solid #ddd",
      borderRadius: "8px",
      background: "#fafafa",
    }}
  >
    <div
      style={{
        fontWeight: "bold",
        fontSize: "18px",
        marginBottom: "10px",
      }}
    >
      {locale}
    </div>

    {changes.map((c, i) => (
      <div
        key={i}
        style={{
          marginBottom: "12px",
          paddingLeft: "15px",
        }}
      >
        <div
          style={{
            fontWeight: "bold",
            marginBottom: "4px",
          }}
        >
          {c.field}
        </div>

        <div>
          <span style={{ color: "red" }}>
            {getDisplayValue(c.before)}
          </span>

          {" → "}

          <span style={{ color: "green" }}>
            {getDisplayValue(c.after)}
          </span>
        </div>
      </div>
    ))}
  </div>
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
          <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "10px",
  }}
>
  <button
    disabled={currentPage === 1}
    onClick={() =>
      setCurrentPage(currentPage - 1)
    }
  >
    Prev
  </button>

  <span>
    Page {currentPage} of {totalPages}
  </span>

  <button
    disabled={currentPage === totalPages}
    onClick={() =>
      setCurrentPage(currentPage + 1)
    }
  >
    Next
  </button>
</div>
          </div>
        </div>
      </div>
    
  );
}