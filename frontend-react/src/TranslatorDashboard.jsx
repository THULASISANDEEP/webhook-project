import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function TranslatorDashboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/payloads")
      .then(res => res.json())
      .then(res => {
        const rejected = res.data.filter(
          item => item.stage === "reject"
        );
        setData(rejected);
      });
  }, []);

  return (
    <div style={{ padding: "20px", color: "white", background: "#0b1a2f", minHeight: "100vh" }}>
      <h2>Rejected Records</h2>

      <Link to="/">← Back</Link>

      <table border="1" width="100%" style={{ marginTop: "20px", background: "white", color: "black" }}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Time</th>
            <th>Stage</th>
            <th>Previous</th>
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="4">No rejected records</td>
            </tr>
          ) : (
            data.map(item => (
              <tr key={item._id}>
                <td>{item.title}</td>
                <td>{new Date(item.createdAt).toLocaleTimeString()}</td>
                <td>{item.stage}</td>
                <td>{item.previousStage}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}