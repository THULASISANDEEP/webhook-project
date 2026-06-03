import "./StageBadge.css";

const BADGE_CLASS = {
  review:   "badge badge--review",
  approved: "badge badge--approved",
  reject:   "badge badge--reject",
};

export default function StageBadge({ value }) {
  if (!value) return <span className="badge badge--neutral">—</span>;
  const cls = BADGE_CLASS[value.toLowerCase()] || "badge badge--neutral";
  return <span className={cls}>{value}</span>;
}
