/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Form, Row, Col, Alert, Table } from "react-bootstrap";
import Select from "react-select";
import { useGetLoansQuery } from "../../app/loanApi";
import { useGetCustomerPaymentsQuery } from "../../app/customerPaymentApi";
import "../../assets/css/pagesStyle.css";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { useLocation, useNavigate } from "react-router-dom";
import "./loanPayment.css"; // Importing custom styles
import CustomerLoanItem from "./CustomerLoanItem";
import { useGetAllLoanPaymentsQuery } from "../../app/loanPaymentApi";

const LoanPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    data: loans = [],
    isLoading: loansLoading,
    isError: loansError,
    // refetch,
  } = useGetLoansQuery();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [filteredCustomerLoans, setFilteredCustomerLoans] = useState([]);
  const [filteredInstallmentPayments, setFilteredInstallmentPayments] =
    useState([]);

  const [loanPaymentsWithDetails, setLoanPaymentsWithDetails] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);

  const {
    data: allCustomerPayments = [],
    isLoading: paymentsLoading,
    isError: paymentsError,
  } = useGetCustomerPaymentsQuery(
    selectedCustomer ? selectedCustomer.value : null
  );
  const {
    data: allLoanPayments = [],
    isLoading: loanPaymentsLoading,
    isError: loanPaymentsError,
    refetch,
  } = useGetAllLoanPaymentsQuery(
    selectedCustomer ? selectedCustomer.value : null
  );

  useEffect(() => {
    if (selectedCustomer || location) {
      refetch();
    }
  }, [location, refetch, selectedCustomer]);

  useEffect(() => {
    if (selectedCustomer) {
      const filteredLoans = loans.filter(
        (loan) => loan.customerId === selectedCustomer.value
      );

      const filteredInstallments = allCustomerPayments.filter(
        (payment) =>
          payment.customerId === selectedCustomer.value &&
          payment.status === "installment"
      );

      // console.log("all customer payments ; ", allCustomerPayments);
      // console.log("Installmetns; ", filteredInstallments);

      const loanPayments = allLoanPayments.filter(
        (payment) =>
          payment.customerId === selectedCustomer.value &&
          payment.status === "loan"
      );

      const loanPaymentsWithExtraDetails = loanPayments.map((payment) => {
        const correspondingLoan = loans.find(
          (loan) => loan._id === payment.loanId
        );
        if (correspondingLoan) {
          return {
            ...payment,
            monthlyRepayment: correspondingLoan.monthlyRepayment,
            duration: correspondingLoan.duration,
          };
        }
        return payment;
      });

      // Reverse the order of the loanPaymentsWithExtraDetails array
      const reversedLoanPayments = [...loanPaymentsWithExtraDetails].reverse();

      // console.log("reverse loan apyments : ", reversedLoanPayments);

      setFilteredCustomerLoans(filteredLoans);
      setFilteredInstallmentPayments(filteredInstallments);
      setLoanPaymentsWithDetails(reversedLoanPayments);
    } else {
      setFilteredCustomerLoans([]);
      setFilteredInstallmentPayments([]);
      setLoanPaymentsWithDetails([]);
    }
  }, [selectedCustomer, loans, allCustomerPayments, allLoanPayments]);

  const handleCustomerChange = (selectedOption) => {
    setSelectedCustomer(selectedOption);
    setSelectedLoan(null);
  };

  // Handle loan selection (clicked button)
  const handleLoanClick = (loan, index) => {
    setSelectedLoan({ ...loan, index }); // Set the selected loan with index
    const filteredPayments = allCustomerPayments.filter(
      (payment) =>
        payment.loanId === loan.loanId && payment.status === "installment"
    );
    setFilteredInstallmentPayments(filteredPayments);
  };

  const customerOptions = loans.reduce((acc, loan) => {
    if (!acc.some((option) => option.value === loan.customerId)) {
      acc.push({
        value: loan.customerId,
        label: loan.customerName,
      });
    }
    return acc;
  }, []);

  return (
    <div className="page-container">
      <h1 className="page-heading">Add Loan Payments</h1>
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
                  placeholder="Search and select a customer"
                  isSearchable
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="justify-content-between">
            {loanPaymentsWithDetails.length > 0 ? (
              <>
                <Col xl={5}>
                  <div className="customer-details-container">
                    <h2>{selectedCustomer?.label}</h2>
                    <div className="loan-details-list">
                      {loanPaymentsWithDetails.map((loan, index) => (
                        <CustomerLoanItem
                          key={loan.loanId}
                          loan={loan}
                          loanIndex={index + 1} // Passing loan index
                          onLoanClick={handleLoanClick}
                        />
                      ))}
                    </div>
                  </div>
                </Col>

                <Col xl={7}>
                  <Table responsive bordered className="table-sm caption-top">
                    <caption className="text-center table-caption text-light fw-bolder ">
                      {selectedLoan
                        ? `Loan ${selectedLoan.index} Payment Details`
                        : "All Payments"}
                    </caption>
                    <thead>
                      <tr>
                        <th>S.No</th>
                        <th>Date</th>
                        <th>Paid Amount</th>
                        <th>Remaining</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInstallmentPayments.length > 0 ? (
                        filteredInstallmentPayments.map((payment, index) => (
                          <tr key={payment._id}>
                            <td>{index + 1}</td>
                            <td>
                              {new Date(
                                payment.paymentDate
                              ).toLocaleDateString()}
                            </td>
                            <td>{payment.credit}</td>
                            <td>{payment.debit}</td>
                            <td>{payment.details}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center">
                            No payments found for the selected loan
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Col>
              </>
            ) : (
              <Alert variant="info">
                Please select a customer to view loans and payments.
              </Alert>
            )}
          </Row>
        </>
      )}
    </div>
  );
};

export default LoanPayment;
/*
customerLoans → filteredCustomerLoans
customerLoansPayments → filteredInstallmentPayments
filteredLoanPayments → loanPaymentsWithDetails
loanPayments → allLoanPayments
customerPayments → allCustomerPayments
*/
