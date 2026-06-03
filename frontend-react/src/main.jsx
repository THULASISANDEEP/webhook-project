/* Entry point — mounts the React app into #root */
import { createRoot } from "react-dom/client";
import "./index.css";   /* global reset + design tokens */
import "./App.css";     /* page-layout shells */
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(<App />);
