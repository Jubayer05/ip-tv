"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const Pagination = ({
  totalPages = 10,
  initialPage = 1,
  onPageChange = () => {},
}) => {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      onPageChange(page);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      // Show all pages if total is 7 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Complex logic for ellipsis
      if (currentPage <= 4) {
        // Show 1, 2, 3, 4, 5, ..., last
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Show 1, ..., last-4, last-3, last-2, last-1, last
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show 1, ..., current-1, current, current+1, ..., last
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center space-x-1 bg-gray-900 p-2 rounded-lg w-fit">
      {/* Previous Button */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`flex items-center justify-center w-8 h-8 rounded ${
          currentPage === 1
            ? "text-gray-600 cursor-not-allowed"
            : "text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200"
        }`}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Page Numbers */}
      {renderPageNumbers().map((page, index) => (
        <div key={index}>
          {page === "..." ? (
            <span className="flex items-center justify-center w-8 h-8 text-gray-400 text-sm">
              ...
            </span>
          ) : (
            <button
              onClick={() => handlePageChange(page)}
              className={`flex items-center justify-center w-8 h-8 rounded text-sm font-medium transition-colors duration-200 ${
                currentPage === page
                  ? "bg-cyan-400 text-black"
                  : "text-gray-300 hover:text-white hover:bg-gray-700"
              }`}
            >
              {page}
            </button>
          )}
        </div>
      ))}

      {/* Next Button */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`flex items-center justify-center w-8 h-8 rounded ${
          currentPage === totalPages
            ? "text-gray-600 cursor-not-allowed"
            : "text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200"
        }`}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

// Demo component to show the pagination in action
const PaginationDemo = () => {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-8">
      <div className="text-white text-center">
        <h2 className="text-xl font-bold mb-2">Pagination Demo</h2>
        <p className="text-gray-400">Current Page: {currentPage}</p>
      </div>

      <Pagination
        totalPages={10}
        initialPage={1}
        onPageChange={setCurrentPage}
      />

      {/* Additional examples with different configurations */}
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-2">Large dataset (50 pages)</p>
          <Pagination
            totalPages={50}
            initialPage={25}
            onPageChange={(page) => console.log("Page changed to:", page)}
          />
        </div>

        <div className="text-center">
          <p className="text-gray-400 text-sm mb-2">Small dataset (5 pages)</p>
          <Pagination
            totalPages={5}
            initialPage={3}
            onPageChange={(page) => console.log("Page changed to:", page)}
          />
        </div>
      </div>
    </div>
  );
};

export { Pagination, PaginationDemo };
export default Pagination;
