import "./Pagination.css";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  getPageNumbers,
}) {
  return (
    <>
      

      {/* Page buttons */}
      <div className="pagination">
        <span className="pagination__info">Page {currentPage} of {totalPages || 1}</span>
        <div className="pagination__buttons">
          <button
            className="page-btn"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          >‹</button>

          {getPageNumbers().map((p) => (
            <button
              key={p}
              className={`page-btn ${p === currentPage ? "page-btn--active" : ""}`}
              onClick={() => onPageChange(p)}
            >{p}</button>
          ))}

          <button
            className="page-btn"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => onPageChange(currentPage + 1)}
          >›</button>
        </div>
      </div>
    </>
  );
}
