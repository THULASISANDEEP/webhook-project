import { Link, useLocation } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import "./NavbarLinks.css";

export default function NavbarLinks({ onHomeClick }) {
  const location = useLocation();

  return (
    <>
      <Link
        to={ROUTES.HOME}
        onClick={onHomeClick}
        className={`navbar__link ${location.pathname === ROUTES.HOME ? "navbar__link--active" : ""}`}
      >
        Admin
      </Link>
      <Link
        to={ROUTES.TRANSLATOR}
        className={`navbar__link ${location.pathname === ROUTES.TRANSLATOR ? "navbar__link--active" : ""}`}
      >
        Translator
      </Link>
    </>
  );
}
