import { useEffect, useState } from "react";
import { Table, Spinner, Alert } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import EntriesSelectorAndSearch from "../../components/EntriesSelectorAndSearch/EntriesSelectorAndSearch";
import EntriesInfoAndPagination from "../../components/EntriesInfoAndPagination/EntriesInfoAndPagination";
import { useGetCustomerReportQuery } from "../../app/customerApi";
import "../../assets/css/pagesStyle.css";

const CustomerReport = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Pagination and Filtering States
  const [filter, setFilter] = useState("");
  const [entriesToShow, setEntriesToShow] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLoanAmountSum, setTotalLoanAmountSum] = useState(0);

  const {
    data: customerData = [],
    isLoading,
    isSuccess,
    error: fetchError,
    refetch,
  } = useGetCustomerReportQuery();

  // Calculate total loan amount sum
  useEffect(() => {
    if (customerData && customerData.length > 0) {
      const totalAmountSum = customerData.reduce(
        (accumulator, customer) => accumulator + customer.totalLoanAmount,
        0
      );
      setTotalLoanAmountSum(totalAmountSum);
    }
  }, [customerData]);

  useEffect(() => {
    refetch();
  }, [refetch, location]);

  // Apply Filtering
  const filteredCustomers = isSuccess
    ? customerData.filter((customer) =>
        customer.fullName.toLowerCase().includes(filter.toLowerCase())
      )
    : [];

  // Apply Pagination
  const totalPages = Math.ceil(filteredCustomers.length / entriesToShow);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * entriesToShow,
    currentPage * entriesToShow
  );

  console.log(paginatedCustomers);
  // Handle Page Change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Function to handle row click and navigate to details page
  const handleRowClick = (loanId) => {
    navigate(`/reports/single-customer-report/${loanId}`);
  };

  return (
    <div className="page-container">
      <h1 className="page-heading">Customer Report</h1>
      <hr className="custom-hr" />

      <EntriesSelectorAndSearch
        entriesToShow={entriesToShow}
        setEntriesToShow={setEntriesToShow}
        filter={filter}
        setFilter={setFilter}
        setCurrentPage={setCurrentPage}
      />

      {isLoading && (
        <div className="text-center my-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}

      {fetchError && (
        <Alert variant="danger">
          {fetchError.data?.message || "Failed to load customers."}
        </Alert>
      )}

      {isSuccess && (
        <>
          <Table responsive bordered className="table-sm">
            <thead>
              <tr className="table-info">
                <th>S.No</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>Total Loans</th>
                <th>Total Repayment Amount</th>
                <th>Total Paid</th>
                <th>Total Remaining</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCustomers.map((customer, index) => (
                <tr
                  key={customer.id}
                  onClick={() => handleRowClick(customer.id)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{(currentPage - 1) * entriesToShow + index + 1}</td>
                  {/* Serial Number */}
                  <td className="customer-name">{customer.fullName}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phoneNumber}</td>
                  <td>{customer.totalLoans}</td>
                  <td>{customer.totalLoanAmount}</td>
                  <td>{customer.totalPaid}</td>
                  <td>{customer.totalRemaining}</td>
                  <td>{customer.address}</td>
                </tr>
              ))}
              <tr className="total-row">
                <td colSpan={5} className="report-total">
                  Total
                </td>
                <td colSpan={4}>{totalLoanAmountSum}</td>
              </tr>
            </tbody>
          </Table>

          <EntriesInfoAndPagination
            paginatedItems={paginatedCustomers}
            totalItems={filteredCustomers}
            currentPage={currentPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default CustomerReport;
