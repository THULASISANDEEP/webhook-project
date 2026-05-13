<!DOCTYPE html>
<html>
<head>
  <title>Webhook Dashboard</title>
  <style>
    body { font-family: Arial; padding: 20px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; }
    th { background-color: #333; color: white; }
    a { color: blue; text-decoration: underline; margin-right: 8px; }
  </style>
</head>
<body>

<h2>📊 Webhook Dashboard</h2>

<table>
  <thead>
    <tr>
      <th>Entity ID</th>
      <th>Stage</th>
      <th>Previous</th>
      <th>Event</th>
      <th>Environment</th>
      <th>Time</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody id="tableBody"></tbody>
</table>

<script>
async function loadData() {
  const res = await fetch("http://localhost:4000/payloads");
  const data = await res.json();

  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";

  data.forEach(item => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${item.entityId}</td>
      <td>${item.stage}</td>
      <td>${item.previousStage}</td>
      <td>${item.eventType}</td>
      <td>${item.environment}</td>
      <td>${new Date(item.createdAt).toLocaleString()}</td>
      <td>
        <a href="view.html?id=${item._id}" target="_blank">🔗 View</a>
        <a href="${item.cmsLink}" target="_blank">🌐 CMS</a>
        <button onclick="deleteItem('${item._id}')">Delete</button>
      </td>
    `;

    tbody.appendChild(row);
  });
}

async function deleteItem(id) {
  await fetch(`http://localhost:4000/payloads/${id}`, {
    method: "DELETE"
  });
  loadData();
}

loadData();
setInterval(loadData, 5000);
</script>

</body>
</html>