/* eslint-disable no-unused-vars */
// /* eslint-disable no-unused-vars */

import { useState, useEffect } from "react";
import { Form, Row, Col, Alert, Table } from "react-bootstrap";
import Select from "react-select";
import { useGetLoansQuery } from "../../app/loanApi";
import "../../assets/css/pagesStyle.css";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  useGetCustomerPaymentsQuery,
  useGetCustomerPaymentReportQuery,
} from "../../app/customerPaymentApi";
import { useGetAllLoanPaymentsQuery } from "../../app/loanPaymentApi";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";

const SingleCustomerReport = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const {
    data: loans = [],
    isLoading: loansLoading,
    isError: loansError,
  } = useGetLoansQuery();

  console.log("loans: ", loans);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [customerLoans, setCustomerLoans] = useState([]);
  const [customerLoansPayments, setCustomerLoansPayments] = useState([]);
  const [filteredLoanPayments, setFilteredLoanPayments] = useState([]);

  const {
    data: customerPayments = [],
    isLoading: paymentsLoading,
    isError: paymentsError,
  } = useGetCustomerPaymentsQuery(
    selectedCustomer ? selectedCustomer.value : null
  );

  console.log("customerPayments : ", customerPayments);

  const {
    data: loanPayments = [],
    isLoading: loanPaymentsLoading,
    isError: loanPaymentsError,
    refetch,
  } = useGetAllLoanPaymentsQuery(
    selectedCustomer ? selectedCustomer.value : null
  );

  console.log("loanPayments : ", loanPayments);

  useEffect(() => {
    if (selectedCustomer || location) {
      refetch();
    }
  }, [location, refetch, selectedCustomer]);

  useEffect(() => {
    if (selectedCustomer) {
      // Filter loans for the selected customer
      const filteredLoans = loans.filter(
        (loan) => loan.customerId._id === selectedCustomer.value
      );
      setCustomerLoans(filteredLoans);
      // Filter customer payments (installments)
      const filteredCustomerPayments = customerPayments.filter(
        (payment) =>
          payment.customerId._id === selectedCustomer.value &&
          payment.status === "installment"
      );

      // Filter loan payments and combine with corresponding loan data
      const filteredLoanPaymentsData = loanPayments
        .filter((payment) => payment.customerId._id === selectedCustomer.value)
        .map((payment) => {
          const correspondingLoan = loans.find(
            (loan) => loan._id === payment.loanId._id
          );
          return correspondingLoan
            ? {
                ...payment,
                monthlyRepayment: correspondingLoan.monthlyRepayment,
                duration: correspondingLoan.duration,
              }
            : payment;
        });

      setCustomerLoansPayments(filteredCustomerPayments);
      setFilteredLoanPayments(filteredLoanPaymentsData);
    } else {
      setCustomerLoans([]);
      setCustomerLoansPayments([]);
      setFilteredLoanPayments([]);
    }
  }, [selectedCustomer, loans, customerPayments, loanPayments]);

  // Handle customer change
  const handleCustomerChange = (selectedOption) => {
    setSelectedCustomer(selectedOption);
    setSelectedLoan(null);
  };

  // Handle loan change
  const handleLoanChange = (selectedOption) => {
    setSelectedLoan(selectedOption);
  };

  // Customer select options
  const customerOptions = loans.reduce((acc, loan) => {
    if (!acc.some((option) => option.value === loan.customerId._id)) {
      acc.push({
        value: loan.customerId._id,
        label: loan.customerId.fullName,
      });
    }
    return acc;
  }, []);

  useEffect(() => {
    if (id && loans.length > 0) {
      const customerOption = customerOptions.find(
        (option) => option.value === id
      );
      if (customerOption) {
        setSelectedCustomer(customerOption);
      }
    }
  }, [id, loans, customerOptions]);

  // Loan select options for the selected customer
  const reversedLoans = customerLoans.slice().reverse();
  const loanOptions = reversedLoans.map((loan, index) => ({
    value: loan._id,
    label: `Loan ID: ${index + 1} | Amount: ${loan.totalRepayment}`,
  }));

  // Filter payments based on the selected loan
  const displayedPayments = selectedLoan
    ? customerLoansPayments.filter(
        (payment) => payment.loanId === selectedLoan.value
      )
    : customerLoansPayments;

  return (
    <div className="page-container">
      <h1 className="page-heading">Single Customer Report</h1>
      <hr className="custom-hr" />

      {loansLoading || paymentsLoading || loanPaymentsLoading ? (
        <LoadingSpinner />
      ) : loansError || paymentsError || loanPaymentsError ? (
        <Alert variant="danger">Failed to load data.</Alert>
      ) : (
        <>
          <Row className="mb-4">
            <Col md={6}>
              <Form.Group controlId="selectCustomer">
                <Form.Label>Select Customer</Form.Label>
                <Select
                  options={customerOptions}
                  onChange={handleCustomerChange}
                  value={selectedCustomer}
                  placeholder="Search and select a customer"
                  isSearchable
                />
              </Form.Group>
            </Col>

            <Col md={6} className="mt-2 m-md-0 ">
              <Form.Group controlId="selectLoan">
                <Form.Label>Select Loan</Form.Label>
                <Select
                  options={loanOptions}
                  onChange={handleLoanChange}
                  placeholder="Select a loan"
                  isSearchable
                  isDisabled={!selectedCustomer}
                />
              </Form.Group>
            </Col>
          </Row>

          {selectedCustomer ? (
            <Row className="justify-content-between">
              {displayedPayments.length > 0 ? (
                <Col xl={12}>
                  <Table responsive bordered>
                    <thead>
                      <tr className="table-info">
                        <th>S.No</th>
                        <th>Date</th>
                        <th>Paid Amount</th>
                        <th>Remaining</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedPayments.map((payment, index) => (
                        <tr key={payment._id}>
                          <td>{index + 1}</td>
                          <td>
                            {new Date(payment.paymentDate).toLocaleDateString()}
                          </td>
                          <td>{payment.credit}</td>
                          <td>{payment.debit}</td>
                          <td>{payment.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Col>
              ) : (
                <Col xl={12}>
                  <Alert variant="info">
                    No payments found for the selected loan.
                  </Alert>
                </Col>
              )}
            </Row>
          ) : (
            <Alert variant="info">
              Please select a customer to view payments.
            </Alert>
          )}
        </>
      )}
    </div>
  );
};

export default SingleCustomerReport;
