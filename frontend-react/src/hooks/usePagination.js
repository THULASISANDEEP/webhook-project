import { useState, useEffect } from "react";
import { DEFAULT_ROWS_PER_PAGE, PAGE_WINDOW } from "../constants/pagination";

/**
 * Pagination state and helpers.
 *
 * @param {any[]}  data        — the filtered data array to paginate
 * @param {number} [initialRowsPerPage]
 * @returns {Object}
 */
export default function usePagination(data, initialRowsPerPage = DEFAULT_ROWS_PER_PAGE) {
  const [currentPage,  setCurrentPage]  = useState(1);
  const [rowsPerPage,  setRowsPerPage]  = useState(initialRowsPerPage);

  /* Reset to page 1 whenever the data changes (e.g. after filtering) */
  useEffect(() => { setCurrentPage(1); }, [data]);

  const totalPages   = Math.ceil(data.length / rowsPerPage) || 1;
  const indexOfLast  = currentPage * rowsPerPage;
  const currentRows  = data.slice(indexOfLast - rowsPerPage, indexOfLast);

  const getPageNumbers = () => {
    const pages = [];
    const start = Math.max(1, currentPage - PAGE_WINDOW);
    const end   = Math.min(totalPages, currentPage + PAGE_WINDOW);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const changeRowsPerPage = (n) => {
    setRowsPerPage(Number(n));
    setCurrentPage(1);
  };

  return {
    currentPage, setCurrentPage, rowsPerPage,
    totalPages, indexOfLast, currentRows,
    getPageNumbers, changeRowsPerPage,
  };
}
