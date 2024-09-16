/* eslint-disable react/prop-types */
import { Button } from "react-bootstrap";

const EntriesInfoAndPagination = ({
  paginatedItems,
  totalItems,
  currentPage,
  totalPages,
  handlePageChange,
}) => {
  return (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
      <div className="my-2">
        {`Showing ${paginatedItems.length} of ${totalItems.length} entries`}
      </div>
      <nav aria-label="Page navigation border-1" className="my-2">
        <ul className="pagination mb-0">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <Button
              className="page-link"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
          </li>
          {Array.from({ length: totalPages }, (_, i) => (
            <li
              key={i}
              className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
            >
              <Button
                className="page-link"
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </Button>
            </li>
          ))}
          <li
            className={`page-item ${
              currentPage === totalPages ? "disabled" : ""
            }`}
          >
            <Button
              className="page-link"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default EntriesInfoAndPagination;
