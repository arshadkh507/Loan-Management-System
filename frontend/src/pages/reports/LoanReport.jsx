/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { Table, Alert } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import EntriesSelectorAndSearch from "../../components/EntriesSelectorAndSearch/EntriesSelectorAndSearch";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import EntriesInfoAndPagination from "../../components/EntriesInfoAndPagination/EntriesInfoAndPagination";
import { useGetLoanPaymentReportQuery } from "../../app/loanPaymentApi";

// Utility function to format date as dd-mm-yyyy
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0"); // Ensure two-digit day
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Ensure two-digit month
  const year = date.getFullYear();
  return `${day}-${month}-${year}`; // Format as dd-mm-yyyy
};

const LoanReport = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("");
  const [entriesToShow, setEntriesToShow] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  //   const [selectedLoans, setSelectedLoans] = useState([]);

  const [totalLoanAmount, setTotalLoanAmount] = useState(0);
  const [totalPaidAmount, setTotalPaidAmount] = useState(0);
  const [totalRemainingAmount, setTotalRemainingAmount] = useState(0);

  const {
    data: loans = [],
    isLoading,
    error: fetchError,
    isSuccess,
    isError,
  } = useGetLoanPaymentReportQuery();

  useEffect(() => {
    console.log(loans);
    if (loans && loans.length > 0) {
      const totalLoan = loans.reduce(
        (accumulator, loan) => accumulator + loan.loanId.loanAmount,
        0
      );
      const totalPaid = loans.reduce(
        (accumulator, loan) => accumulator + loan.paid,
        0
      );
      const totalRemaining = loans.reduce(
        (accumulator, loan) => accumulator + loan.remaining,
        0
      );
      setTotalLoanAmount(totalLoan);
      setTotalPaidAmount(totalPaid);
      setTotalRemainingAmount(totalRemaining);
    }
  }, [loans]);

  const filteredLoans = loans.filter((loan) =>
    loan.customerName.toLowerCase().includes(filter.toLowerCase())
  );

  const totalPages = Math.ceil(filteredLoans.length / entriesToShow);
  const paginatedLoans = filteredLoans.slice(
    (currentPage - 1) * entriesToShow,
    currentPage * entriesToShow
  );

  // useEffect(() => {
  //   refetch();
  // }, [refetch, location]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Function to handle row click and navigate to details page
  const handleRowClick = (loanId) => {
    navigate(`/loans/details/${loanId}`);
    // navigate(`/loans/details`);
  };

  return (
    <div className="loan-report-container page-container">
      <h1 className="page-heading">Loan Report</h1>
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
                <th>Paid Amount</th>
                <th>Remaining Amount</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLoans.length > 0 ? (
                <>
                  {paginatedLoans.map((loan, index) => (
                    <tr
                      key={loan._id}
                      onClick={() => handleRowClick(loan.loanId._id)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{(currentPage - 1) * entriesToShow + index + 1}</td>
                      <td className="customer-name">{loan.customerName}</td>
                      <td>{loan.loanId.loanAmount}</td>
                      <td>{loan.loanId.interestRate}%</td>
                      <td>{loan.loanId.duration}</td>
                      <td>{loan.loanId.totalRepayment}</td>
                      <td>{loan.loanId.monthlyRepayment.toFixed(2)}</td>
                      <td>{formatDate(loan.loanId.startDate)}</td>
                      <td>{formatDate(loan.loanId.endDate)}</td>
                      <td>{loan.paid}</td>
                      <td>{loan.remaining}</td>
                    </tr>
                  ))}
                  <tr className="total-row p-3">
                    <td colSpan={2}>Total</td>
                    <td colSpan={7}>{totalLoanAmount}</td>

                    <td className="report-total">{totalPaidAmount}</td>
                    <td>{totalRemainingAmount}</td>
                  </tr>
                </>
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

export default LoanReport;

// Payment History	A view button or link to see payment history for the loan
