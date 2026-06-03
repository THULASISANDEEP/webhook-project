import { capitalise } from "../../utils/displayUtils";
import "./NavbarStats.css";

export default function NavbarStats({ recordCount, environment }) {
  const envLabel = environment ? capitalise(environment) : null;

  return (
    <div className="navbar__right">
      {recordCount !== undefined && (
        <span className="navbar__count">
          {recordCount} record{recordCount !== 1 ? "s" : ""}
        </span>
      )}
      {envLabel && <span className="navbar__env-badge">{envLabel}</span>}
    </div>
  );
}
