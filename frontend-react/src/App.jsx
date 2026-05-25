/* Root app component — sets up client-side routing */
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainDashboard from "./MainDashboard";
import TranslatorDashboard from "./TranslatorDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main webhook monitoring dashboard */}
        <Route path="/" element={<MainDashboard />} />

        {/* Translator view: rejected records only */}
        <Route path="/translator" element={<TranslatorDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}