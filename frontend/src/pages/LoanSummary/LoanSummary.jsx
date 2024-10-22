import { useEffect, useRef, useState } from "react";
import { Table, Alert, Button } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import EntriesSelectorAndSearch from "../../components/EntriesSelectorAndSearch/EntriesSelectorAndSearch";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import EntriesInfoAndPagination from "../../components/EntriesInfoAndPagination/EntriesInfoAndPagination";
import { useGetLoanSummaryQuery } from "../../app/loanApi";
import { useReactToPrint } from "react-to-print";
import "./loanSummary.css";

const LoanSummary = () => {
  const location = useLocation();
  const [filter, setFilter] = useState("");
  const [entriesToShow, setEntriesToShow] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data,
    isLoading,
    isError,
    error: fetchError,
    refetch,
  } = useGetLoanSummaryQuery();

  // Filter based on customer name
  const filteredLoans =
    data?.loans?.filter((loan) =>
      loan.customer.fullName.toLowerCase().includes(filter.toLowerCase())
    ) || [];

  const totalPages = Math.ceil(filteredLoans.length / entriesToShow);
  const paginatedLoans = filteredLoans.slice(
    (currentPage - 1) * entriesToShow,
    currentPage * entriesToShow
  );

  useEffect(() => {
    refetch();
  }, [location, refetch]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const getRowClass = (status) => {
    switch (status) {
      case "Paid":
        return "table-success"; // Green
      case "Pending":
        return "table-warning"; // Yellow
      case "Overdue":
        return "table-danger"; // Red
      default:
        return "";
    }
  };

  const printArea = useRef();
  const handlePrint = useReactToPrint({
    content: () => printArea.current,
  });

  // Function to process loan installments
  const processInstallments = (installments) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    let filteredInstallments = [];

    installments.forEach((installment) => {
      const installmentDate = new Date(installment.dueDate);

      // Check for overdue installments (due date is in the past and status is "Overdue")
      if (installmentDate < currentDate && installment.status === "Overdue") {
        filteredInstallments.push(installment);
      }

      // Check for paid installments (only show those paid up to today)
      if (
        installment.status === "Paid" &&
        installmentDate.getMonth() <= currentMonth &&
        installmentDate.getFullYear() <= currentYear
      ) {
        filteredInstallments.push(installment);
      }

      // Check for pending installments (only show current month's pending installment)
      if (
        installment.status === "Pending" &&
        installmentDate.getMonth() - 1 === currentMonth &&
        installmentDate.getFullYear() === currentYear
      ) {
        filteredInstallments.push(installment);
      }

      // Check for partially paid installments
      if (
        installment.status === "Partially Paid" &&
        installmentDate.getFullYear() <= currentYear &&
        installmentDate.getMonth() <= currentMonth
      ) {
        filteredInstallments.push(installment);
      }
    });

    return filteredInstallments; // Return the filtered installments
  };

  return (
    <div
      className="loan-summary-container page-container"
      id="print_area"
      ref={printArea}
    >
      <h1 className="page-heading">Loan Summary</h1>
      <hr className="custom-hr" />

      <div className="print-not-show">
        <EntriesSelectorAndSearch
          entriesToShow={entriesToShow}
          setEntriesToShow={setEntriesToShow}
          filter={filter}
          setFilter={setFilter}
          setCurrentPage={setCurrentPage}
        />
      </div>
      {isLoading && <LoadingSpinner />}

      {isError && (
        <Alert variant="danger">
          {fetchError?.message || "Failed to load loans."}
        </Alert>
      )}

      {/* Loan Summary Table */}
      {data && (
        <div className="table-make-responsive">
          <div className="print-not-show">
            <Button
              variant="primary"
              onClick={handlePrint}
              className="mb-3 print-not-show"
            >
              Print All
            </Button>
          </div>
          <Table className="table-responsive" bordered hover>
            <thead>
              <tr className="table-info">
                <th>S.No</th>
                <th>Customer Name</th>
                <th>Email</th>
                <th>Loan Amount</th>
                <th>Monthly Repayment</th>
                <th>Total Paid</th>
                <th>Remaining Balance</th>
                <th>Status</th>
                <th>Overdue Months</th>
                <th>Overdue Amount</th>
                <th>Payment History</th>
              </tr>
            </thead>

            <tbody>
              {paginatedLoans.length > 0 ? (
                paginatedLoans.map((loan, index) => {
                  const processedInstallments = processInstallments(
                    loan.loanDetails.installments
                  );

                  return (
                    <tr
                      key={`${loan.customer._id}-${loan.loanDetails.loanId}`}
                      className={getRowClass(
                        loan.status.paid > 0
                          ? "Paid"
                          : loan.status.overdue > 0
                          ? "Overdue"
                          : "Pending"
                      )}
                    >
                      <td>{(currentPage - 1) * entriesToShow + index + 1}</td>
                      <td>{loan.customer.fullName}</td>
                      <td>{loan.customer.email}</td>
                      <td>{loan.loanDetails.totalRepayment}</td>
                      <td>{loan.loanDetails.monthlyRepayment}</td>
                      <td>{loan.loanDetails.totalPaid}</td>
                      <td>{loan.loanDetails.remaining}</td>
                      <td>
                        {loan.status.paid > 0 &&
                        loan.status.paid >= loan.loanDetails.monthlyRepayment
                          ? "Paid"
                          : loan.status.overdue > 0
                          ? "Overdue"
                          : "Pending"}
                      </td>

                      <td>{loan.status.overdue}</td>
                      <td>{loan.status.overdueAmount}</td>

                      <td>
                        {processedInstallments.length > 0 ? (
                          processedInstallments.map((installment, idx) => (
                            <div key={idx}>
                              {installment.month}: {installment.status} (Paid:{" "}
                              {installment.paidAmount}, Due:{" "}
                              {installment.remainingAmount})
                            </div>
                          ))
                        ) : (
                          <div>No installments to display</div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="11" className="text-center">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      )}

      {/* Pagination and Entries Info */}
      <div className="print-not-show">
        <EntriesInfoAndPagination
          paginatedItems={paginatedLoans}
          totalItems={filteredLoans}
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default LoanSummary;
