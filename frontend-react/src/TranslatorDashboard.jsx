import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function TranslatorDashboard() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    fetch("http://localhost:4000/payloads")
      .then((res) => res.json())
      .then((res) => {
        const rejected = res.data.filter(
          (item) => item.stage === "reject"
        );

        setData(rejected);
      });
  }, []);
  const filteredData = data.filter((item) => {

    /* SEARCH FILTER */
    const matchesSearch =
      item.title
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      item.entityId
        ?.toLowerCase()
        .includes(search.toLowerCase());

    /* DATE FILTER */
    const itemDate = new Date(item.createdAt);

    const matchesFrom =
      !fromDate ||
      itemDate >= new Date(fromDate);

    const matchesTo =
      !toDate ||
      itemDate <=
        new Date(toDate + "T23:59:59");

    return (
      matchesSearch &&
      matchesFrom &&
      matchesTo
    );
  });

  return (
    <div
      style={{
        padding: "20px",
        background: "white",
        minHeight: "100vh",
        color: "black",
      }}
    >
      <h2
        style={{
          marginBottom: "20px",
        }}
      >
        Rejected Records
      </h2>

      <Link to="/">← Back</Link>
      <div
  style={{
    display: "flex",
    gap: "10px",
    marginTop: "20px",
    marginBottom: "20px",
  }}
>
  {/* SEARCH */}
  <input
    type="text"
    placeholder="Search title or record ID..."
    value={search}
    onChange={(e) =>
      setSearch(e.target.value)
    }
    style={{
      padding: "10px",
      width: "280px",
      borderRadius: "8px",
      border: "1px solid #ccc",
    }}
  />

  {/* FROM DATE */}
  <input
    type="date"
    value={fromDate}
    onChange={(e) =>
      setFromDate(e.target.value)
    }
    style={{
      padding: "10px",
      borderRadius: "8px",
      border: "1px solid #ccc",
    }}
  />

  {/* TO DATE */}
  <input
    type="date"
    value={toDate}
    onChange={(e) =>
      setToDate(e.target.value)
    }
    style={{
      padding: "10px",
      borderRadius: "8px",
      border: "1px solid #ccc",
    }}
  />

  {/* RESET */}
  <button
    onClick={() => {
      setSearch("");
      setFromDate("");
      setToDate("");
    }}
  >
    Home
  </button>
</div>

      <div
        style={{
          marginTop: "20px",
          border: "1px solid #ddd",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <table
          width="100%"
          style={{
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr
              style={{
                background: "#0f172a",
                color: "white",
              }}
            >
              <th style={{ padding: "15px" }}>
                Title
              </th>

              <th style={{ padding: "15px" }}>
                Time
              </th>

              <th style={{ padding: "15px" }}>
                Locale
              </th>

              <th style={{ padding: "15px" }}>
                Stage
              </th>
              <th style={{ padding: "15px" }}>
  CMS
</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  style={{
                    padding: "20px",
                    textAlign: "center",
                  }}
                >
                  No rejected records
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr
                  key={item._id}
                  style={{
                    borderBottom:
                      "1px solid #eee",
                  }}
                >
                  {/* TITLE + RECORD ID */}
                  <td
                    style={{
                      padding: "15px",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: "bold",
                        marginBottom: "4px",
                      }}
                    >
                      {item.title}
                    </div>

                    <small
                      style={{
                        color: "#555",
                      }}
                    >
                      {item.entityId}
                    </small>
                  </td>

                  {/* TIME + DATE */}
                  <td
                    style={{
                      padding: "15px",
                    }}
                  >
                    <div>
                      {new Date(
                        item.createdAt
                      ).toLocaleTimeString()}
                    </div>

                    <small
                      style={{
                        color: "gray",
                      }}
                    >
                      {new Date(
                        item.createdAt
                      ).toLocaleDateString()}
                    </small>
                  </td>

                  {/* LOCALES */}
                  <td
                    style={{
                      padding: "15px",
                    }}
                  >
                    {item.localesChanged?.join(
                      ", "
                    ) || "-"}
                  </td>

                  {/* STAGE */}
                  <td
                    style={{
                      padding: "15px",
                      color: "red",
                      fontWeight: "bold",
                    }}
                  >
                    {item.stage}
                  </td>
                  {/* CMS LINK */}
<td
  style={{
    padding: "15px",
  }}
>
  <a
    href={item.cmsLink}
    target="_blank"
  >
    Open
  </a>
</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}