import NavbarBrand from "../NavbarBrand/NavbarBrand";
import NavbarLinks from "../NavbarLinks/NavbarLinks";
import NavbarStats from "../NavbarStats/NavbarStats";
import "./Navbar.css";

export default function Navbar({ onHomeClick, recordCount, environment }) {
  return (
    <nav className="navbar">
      <div className="navbar__left">
        <NavbarBrand />
        <NavbarLinks onHomeClick={onHomeClick} />
      </div>
      <NavbarStats recordCount={recordCount} environment={environment} />
    </nav>
  );
}
