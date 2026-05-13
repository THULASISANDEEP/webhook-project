<!DOCTYPE html>
<html>
<head>
  <title>Payload</title>
</head>
<body>

<h2>📦 Payload</h2>
<pre id="data">Loading...</pre>

<script>
const id = new URLSearchParams(window.location.search).get("id");

fetch(`http://localhost:4000/payloads/${id}`)
  .then(res => res.json())
  .then(data => {
    document.getElementById("data").textContent =
      JSON.stringify(data.payload, null, 2);
  });
</script>

</body>
</html>