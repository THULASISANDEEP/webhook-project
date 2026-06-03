import "./PageHeader.css";

export default function PageHeader({ title, children }) {
  return (
    <div className="page-header">
      <h1 className="page-header__title">{title}</h1>
      {children && <p className="page-header__subtitle">{children}</p>}
    </div>
  );
}
