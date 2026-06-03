import React from "react";
import LocalesCell from "../Cells/LocalesCell/LocalesCell";
import UserCell    from "../Cells/UserCell/UserCell";
import StageBadge  from "../Cells/StageBadge/StageBadge";
import CmsLink     from "../Cells/CmsLink/CmsLink";
import MoreButton  from "../Cells/MoreButton/MoreButton";
import ExpandedRow from "./ExpandedRow";
import { formatTime, formatDate } from "../../utils/dateUtils";
import "./TableRow.css";

/**
 * A single data row (+ its optional expanded panel).
 *
 * Props:
 *  item        — record object
 *  isExpanded  — boolean
 *  onToggle    — () => void
 *  colSpan     — number of columns (for the expanded row)
 *  showPrevStage — boolean (admin shows Previous stage, translator doesn't)
 */
export default function TableRow({ item, isExpanded, onToggle, colSpan, showPrevStage = false }) {
  return (
    <React.Fragment>
      <tr>
        {/* Entity */}
        <td>
          <div className="entity-name">{item.title}</div>
          <div className="entity-id">{item.entityId}</div>
        </td>

        {/* Time */}
        <td>
          <div style={{ fontWeight: 500 }}>{formatTime(item.createdAt)}</div>
          <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "2px" }}>
            {formatDate(item.createdAt)}
          </div>
        </td>

        {/* Locales */}
        <td><LocalesCell locales={item.localesChanged} /></td>

        {/* Current stage */}
        <td><StageBadge value={item.stage} /></td>

        {/* Previous stage — admin only */}
        {showPrevStage && <td><StageBadge value={item.previousStage} /></td>}

        {/* User */}
        <td>
          <UserCell names={(item.updatedByNames || []).map((u) => u.name)} />
        </td>

        {/* CMS link */}
        <td><CmsLink href={item.cmsLink} /></td>

        {/* Expand toggle */}
        <td>
          <MoreButton isExpanded={isExpanded} onClick={onToggle} />
        </td>
      </tr>

      {isExpanded && <ExpandedRow item={item} colSpan={colSpan} />}
    </React.Fragment>
  );
}
