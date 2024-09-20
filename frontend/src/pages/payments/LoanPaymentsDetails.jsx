/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { Button, Table, Alert } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import EntriesInfoAndPagination from "../../components/EntriesInfoAndPagination/EntriesInfoAndPagination";
import EntriesSelectorAndSearch from "../../components/EntriesSelectorAndSearch/EntriesSelectorAndSearch";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { useLocation, useNavigate } from "react-router-dom";
import {
  useGetAllLoanPaymentsQuery,
  useDeleteLoanPaymentMutation,
} from "../../app/loanPaymentApi";
import {
  SuccessAlert,
  ErrorAlert,
  ConfirmationAlert,
} from "../../components/AlertComponents/AlertComponents";
import "./loanPaymentsDetails.css";
import "../../assets/css/pagesStyle.css";

// Utility function to format date as dd-mm-yyyy
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const LoanPaymentsDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [filter, setFilter] = useState("");
  const [entriesToShow, setEntriesToShow] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const {
    data: loanPayments = [],
    isLoading,
    isError,
    isSuccess,
    refetch, // Refetch function to reload data
  } = useGetAllLoanPaymentsQuery();
  const [deleteLoanPayment, { isLoading: isDeleting, isError: deleteError }] =
    useDeleteLoanPaymentMutation();

  useEffect(() => {
    refetch();
  }, [location, refetch]);

  const filteredPayments =
    loanPayments?.filter(
      (payment) =>
        payment.customerName?.toLowerCase().includes(filter.toLowerCase()) &&
        payment.status === "installment"
    ) || [];

  const totalPages = Math.ceil(filteredPayments.length / entriesToShow);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * entriesToShow,
    currentPage * entriesToShow
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleDeletePayment = async (id) => {
    const confirmed = await ConfirmationAlert({
      title: "Confirm Delete",
      text: "Are you sure you want to delete this loan payment?",
    });

    if (confirmed) {
      try {
        await deleteLoanPayment(id).unwrap();
        SuccessAlert({
          title: "Deleted!",
          text: "The loan payment and corresponding records have been deleted.",
        });
        refetch();
      } catch (error) {
        ErrorAlert({
          title: "Error",
          text: `Failed to delete the loan payment: ${error}`,
        });
      }
    }
  };

  const handleEditPayment = (id) => {
    navigate(`/loan-payments/edit/${id}`);
  };

  return (
    <div className="loan-payment-details-container page-container">
      <h1 className="page-heading">Loan Payment Details</h1>
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

      {isError && <Alert variant="danger">Failed to load payments.</Alert>}

      {/* Loan Payment Details Table */}
      {isSuccess && (
        <div className="table-make-responsive">
          <Table className="table-responsive" bordered hover responsive>
            <thead>
              <tr className="table-info">
                <th>S.No</th>
                <th>Customer Name</th>
                <th>Loan</th>
                <th>Paid</th>
                <th>Remaining</th>

                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPayments.length > 0 ? (
                paginatedPayments.map((payment, index) => (
                  <tr key={payment._id}>
                    <td>{(currentPage - 1) * entriesToShow + index + 1}</td>
                    <td className="customer-name">{payment.customerName}</td>
                    <td>{payment.totalAmount}</td>
                    <td>{payment.paid}</td>
                    <td>{payment.remaining}</td>

                    <td>
                      <Button
                        variant="outline-primary"
                        onClick={() => handleEditPayment(payment._id)}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="outline-danger"
                        onClick={() => handleDeletePayment(payment._id)}
                        disabled={isDeleting}
                      >
                        <FaTrash className="deleteIcon" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">
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
        paginatedItems={paginatedPayments}
        totalItems={filteredPayments}
        currentPage={currentPage}
        totalPages={totalPages}
        handlePageChange={handlePageChange}
      />
    </div>
  );
};

export default LoanPaymentsDetails;
