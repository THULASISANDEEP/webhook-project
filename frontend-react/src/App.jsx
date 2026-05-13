import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainDashboard from "./MainDashboard";
import TranslatorDashboard from "./TranslatorDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainDashboard />} />
        <Route path="/translator" element={<TranslatorDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}