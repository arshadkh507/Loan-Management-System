/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { Button, Table, Form, Alert } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import EntriesInfoAndPagination from "../../components/EntriesInfoAndPagination/EntriesInfoAndPagination";
import EntriesSelectorAndSearch from "../../components/EntriesSelectorAndSearch/EntriesSelectorAndSearch";
import {
  SuccessAlert,
  ErrorAlert,
  ConfirmationAlert,
} from "../../components/AlertComponents/AlertComponents";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { useDeleteLoanMutation, useGetLoansQuery } from "../../app/loanApi";
import "./loanDetails.css";
import "../../assets/css/pagesStyle.css";
import { useLocation, useNavigate, useParams } from "react-router-dom";

// Utility function to format date as dd-mm-yyyy
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0"); // Ensure two-digit day
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Ensure two-digit month
  const year = date.getFullYear();
  return `${day}-${month}-${year}`; // Format as dd-mm-yyyy
};

const LoanDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  console.log(id);
  const [filter, setFilter] = useState("");
  const [entriesToShow, setEntriesToShow] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLoans, setSelectedLoans] = useState([]);

  const {
    data: loans = [],
    error: fetchError,
    isLoading,
    isError,
    isSuccess,
    refetch,
  } = useGetLoansQuery();
  const [
    deleteLoan,
    { isLoading: isDeleting, isError: deleteError, error: deletingError },
  ] = useDeleteLoanMutation(); // Add deleteLoan mutation

  console.log(loans);

  const filteredLoans = loans.filter((loan) =>
    loan.customerId.fullName.toLowerCase().includes(filter.toLowerCase())
  );

  const totalPages = Math.ceil(filteredLoans.length / entriesToShow);
  const paginatedLoans = filteredLoans.slice(
    (currentPage - 1) * entriesToShow,
    currentPage * entriesToShow
  );

  useEffect(() => {
    refetch();
  }, [refetch, location]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSelectLoan = (id) => {
    setSelectedLoans((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((loanId) => loanId !== id)
        : [...prevSelected, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedLoans.length === loans.length) {
      setSelectedLoans([]);
    } else {
      setSelectedLoans(loans.map((loan) => loan._id));
    }
  };

  const handleDeleteLoan = (id) => {
    ConfirmationAlert({
      title: "Are you sure?",
      text: "To delete the selected loan!",
    }).then((isConfirmed) => {
      if (isConfirmed) {
        deleteLoan(id)
          .unwrap()
          .then(() => {
            SuccessAlert({ title: "Deleted!", text: "Loan has been deleted." });
            refetch(); // Refresh the loan list
          })
          .catch((error) => {
            ErrorAlert({ title: "Error!", text: "Failed to delete the loan." });
          });
      }
    });
  };

  const handleEditLoan = (id) => {
    navigate(`/loan/edit/${id}`);
  };

  return (
    <div className="loan-details-container page-container">
      <h1 className="page-heading">Loan Details</h1>
      <hr className="custom-hr" />

      {/* Search and Entries Selector */}
      <EntriesSelectorAndSearch
        entriesToShow={entriesToShow}
        setEntriesToShow={setEntriesToShow}
        filter={filter}
        setFilter={setFilter}
        setCurrentPage={setCurrentPage}
      />

      {isLoading && <LoadingSpinner />}

      {deleteError && (
        <Alert variant="danger">
          {deletingError.data?.message || "Failed to load loans."}
        </Alert>
      )}

      {isError && (
        <Alert variant="danger">
          {fetchError.data?.message || "Failed to load loans."}
        </Alert>
      )}

      {/* Loan Details Table */}
      {isSuccess && (
        <div className="table-make-responsive">
          <Table className="table-responsive" bordered hover responsive>
            <thead>
              <tr className="table-info">
                <th>S.No</th>
                <th>Customer Name</th>
                <th>Loan Amount</th>
                <th>Interest Rate (%)</th>
                <th>Duration (Months)</th>
                <th>Total Repayment</th>
                <th>Monthly Repayment</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLoans.length > 0 ? (
                paginatedLoans.map((loan, index) => (
                  <tr
                    key={loan._id}
                    className={loan._id === id ? "table-info" : ""}
                  >
                    <td>{(currentPage - 1) * entriesToShow + index + 1}</td>
                    <td className="customer-name">
                      {loan.customerId.fullName}
                    </td>
                    <td>{loan.loanAmount}</td>
                    <td>{loan.interestRate}%</td>
                    <td>{loan.duration}</td>
                    <td>{loan.totalRepayment}</td>
                    <td>{loan.monthlyRepayment.toFixed(2)}</td>
                    <td>{formatDate(loan.startDate)}</td>
                    <td>{formatDate(loan.endDate)}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        onClick={() => handleEditLoan(loan._id)}
                        disabled={isDeleting} // Disable button while deleting
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="outline-danger"
                        onClick={() => handleDeleteLoan(loan._id)}
                        disabled={isDeleting} // Disable button while deleting
                      >
                        {isDeleting ? (
                          <LoadingSpinner />
                        ) : (
                          <FaTrash className="deleteIcon" />
                        )}
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      )}

      {/* Pagination and Entries Info */}
      <EntriesInfoAndPagination
        paginatedItems={paginatedLoans}
        totalItems={filteredLoans}
        currentPage={currentPage}
        totalPages={totalPages}
        handlePageChange={handlePageChange}
      />
    </div>
  );
};

export default LoanDetails;
