/* Root app component — sets up client-side routing */
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainDashboard       from "./pages/MainDashboard";
import TranslatorDashboard from "./pages/TranslatorDashboard";
import { ROUTES }          from "./constants/routes";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.HOME}       element={<MainDashboard />} />
        <Route path={ROUTES.TRANSLATOR} element={<TranslatorDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
