import React, { useRef, useEffect } from 'react';

/**
 * Pagination component for paginating lists.
 * @param {number} currentPage - The current page number (1-based).
 * @param {number} totalPages - Total number of pages.
 * @param {function} onPageChange - Callback when a page is selected.
 */
function Pagination({ currentPage, totalPages, onPageChange }) {
  const containerRef = useRef(null);
  useEffect(() => {
    // Scroll the current page button into view if needed
    const btn = containerRef.current?.querySelector('.active');
    if (btn) btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [currentPage]);
  if (totalPages <= 1) return null;
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }
  return (
    <div style={{display:'flex', justifyContent:'center', alignItems:'center', width:'100%'}}>
      <div className="pagination-bar-scroll" ref={containerRef} style={{margin:'0 auto'}}>
        <button disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>&lt;</button>
        {pages.map(page => (
          <button
            key={page}
            className={page === currentPage ? 'active' : ''}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}
        <button disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>&gt;</button>
      </div>
    </div>
  );
}

export default Pagination; 