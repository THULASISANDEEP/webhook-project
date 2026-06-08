import LocaleChanges from "../LocaleChanges/LocaleChanges";
import "./ExpandedRow.css";

export default function ExpandedRow({ item, colSpan }) {
  return (
    <tr>
      <td colSpan={colSpan} className="expanded-cell">
        <div className="expanded-inner">
          <div className="expanded-heading">Field Changes</div>
          <LocaleChanges localeChanges={item.localeChanges} />
        </div>
      </td>
    </tr>
  );
}
