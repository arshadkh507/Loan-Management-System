/* eslint-disable no-unused-vars */
import { useState, useEffect, useMemo, useRef } from "react";
import { Form, Row, Col, Alert, Table, Button } from "react-bootstrap";
import Select from "react-select";
import { useGetCustomerLedgerQuery, useGetLoansQuery } from "../../app/loanApi";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import "./customerLedger.css";
import { useLocation } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import PrintCustomerLedger from "../printPages/PrintCustomerLedger";
import { formatDate } from "../../utils/dataFuction";

const CustomerLedger = () => {
  const location = useLocation();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerData, setCustomerData] = useState([]);
  const [customer, setCustomer] = useState([]);
  const {
    data: loans = [],
    isLoading: loansLoading,
    isError: loansError,
    refetch: loanRefetch,
  } = useGetLoansQuery();
  console.log("loans : ", loans);
  const {
    data: customerLedgerData = [],
    isLoading: isLedgerDataLoading,
    isError: isLedgerDataError,
    refetch: customerLedgerRefetch,
  } = useGetCustomerLedgerQuery(
    selectedCustomer ? selectedCustomer.value : null
  );
  console.log("customerLedgerData : ", customerLedgerData);
  useEffect(() => {
    if (selectedCustomer) {
      customerLedgerRefetch();
      loanRefetch();
    }
  }, [customerLedgerRefetch, loanRefetch, location, selectedCustomer]);

  useEffect(() => {
    if (selectedCustomer && customerLedgerData && customerLedgerData.customer) {
      setCustomer(customerLedgerData.customer);
    }
    console.log(customerLedgerData);
  }, [customerLedgerData, selectedCustomer]);

  const handleCustomerChange = (selectedOption) => {
    setSelectedCustomer(selectedOption);
  };

  const customerOptions = loans.reduce((acc, loan) => {
    if (!acc.some((options) => options.value === loan.customerId._id)) {
      acc.push({
        value: loan.customerId._id,
        label: loan.customerId.fullName,
      });
    }
    return acc;
  }, []);

  const loanTotals = useMemo(() => {
    if (!customerLedgerData.loans) return {};

    const totalLoans = customerLedgerData.loans?.length;
    const totalLoanAmount = customerLedgerData.loans.reduce(
      (acc, loan) => acc + loan.loanAmount,
      0
    );
    const totalRepayment = customerLedgerData.loans.reduce(
      (acc, loan) => acc + loan.totalRepayment,
      0
    );
    const totalPaid = customerLedgerData.loans.reduce(
      (acc, loan) => acc + loan.totalPaid,
      0
    );
    const totalRemaining = customerLedgerData.loans.reduce(
      (acc, loan) => acc + loan.totalRemaining,
      0
    );

    return {
      totalLoanAmount,
      totalRepayment,
      totalPaid,
      totalRemaining,
      totalLoans,
    };
  }, [customerLedgerData.loans]);
  const printArea = useRef();
  const handlePrint = useReactToPrint({
    content: () => printArea.current,
  });

  console.log(customer.createdAt);
  return (
    <div className="page-container" id="print_area" ref={printArea}>
      <h1 className="page-heading">Customer Ledger</h1>
      <hr className="custom-hr" />

      {loansLoading && <LoadingSpinner />}
      {loansError && <Alert variant="danger">Failed to load data.</Alert>}
      <>
        <Row className="mb-4 d-flex align-items-end justify-content-between print-not-show">
          <Col md={6} className="print-not-show">
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
          <Col md={3} className="mt-2 m-md-0  print-not-show">
            <Button
              className="btn btn-lg w-100"
              onClick={handlePrint}
              disabled={!selectedCustomer}
            >
              Print To PDF
            </Button>
          </Col>
        </Row>

        <hr />

        {selectedCustomer && customerLedgerData ? (
          <div>
            <h2 className="heading-2 print-not-show">Customer Details</h2>
            <Row className="my-3 g-2">
              <Col xs={6} md={2}>
                <strong>Full Name:</strong>
              </Col>
              <Col xs={6} md={4}>
                {customer.fullName}
              </Col>
              <Col xs={6} md={2}>
                <strong>Email:</strong>
              </Col>
              <Col xs={6} md={4}>
                {customer.email}
              </Col>
              <Col xs={6} md={2}>
                <strong>Phone Number:</strong>
              </Col>
              <Col xs={6} md={4}>
                {customer.phoneNumber}
              </Col>
              <Col xs={6} md={2}>
                <strong>Address:</strong>
              </Col>
              <Col xs={6} md={4}>
                {customer.address}
              </Col>
              <Col xs={6} md={2}>
                <strong>Created At:</strong>
              </Col>
              <Col xs={6} md={4}>
                {formatDate(customer.createdAt)}
              </Col>
              {customer.additionalInfo && (
                <>
                  <Col xs={6} md={2}>
                    <strong>Additional Info:</strong>
                  </Col>
                  <Col xs={6} md={4}>
                    {customer.additionalInfo}
                  </Col>
                </>
              )}
            </Row>

            <hr className="custom-hr" />

            {customerLedgerData.loans?.map((loan, index) => (
              <div key={loan._id} className="loan-details mb-4">
                <h3 className="heading-3">Loan {index + 1} Details</h3>
                <Table responsive striped bordered hover>
                  <thead>
                    <tr className="table-info">
                      <th>Loan No</th>
                      <th>Loan Amount</th>
                      <th>Interest Rate</th>
                      <th>Duration</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Total Repayment</th>
                      <th>Monthly Repayment</th>
                      <th>Total Paid</th>
                      <th>Total Remaining</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{index + 1}</td>
                      <td>{loan.loanAmount}</td>
                      <td>{loan.interestRate}%</td>
                      <td>{loan.duration} months</td>
                      <td>{new Date(loan.startDate).toLocaleDateString()}</td>
                      <td>{new Date(loan.endDate).toLocaleDateString()}</td>
                      <td>{loan.totalRepayment}</td>
                      <td>{loan.monthlyRepayment}</td>
                      <td>{loan.totalPaid}</td>
                      <td>{loan.totalRemaining}</td>
                    </tr>
                  </tbody>
                </Table>

                {/* <h4 className="heading-4 text-center">
                  Loan {index + 1} Payments
                </h4> */}
                {/* PAYMENTS TABLE */}
                {loan.installmentPayments?.length > 0 ? (
                  <Table responsive bordered hover>
                    <thead>
                      <tr>
                        <th>S. No</th>
                        <th>Total Repayment</th>
                        <th>Paid</th>
                        <th>Remaining</th>
                        <th>Payment Date</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loan.installmentPayments.map((payment, idx) => (
                        <tr key={payment._id}>
                          <td>{idx + 1}</td>
                          <td>{payment.totalRepayment}</td>
                          <td>{payment.credit}</td>
                          <td>{payment.debit}</td>
                          <td>
                            {new Date(payment.paymentDate).toLocaleDateString()}
                          </td>
                          <td>{payment.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <Alert variant="secondary">
                    The customer have no payments for this loan.
                  </Alert>
                )}
                {index + 1 < customerLedgerData.loans?.length && (
                  <hr className="custom-hr" />
                )}
              </div>
            ))}

            <h3 className="heading-3">Loan Total</h3>
            <Table responsive striped style={{ maxWidth: "500px" }} bordered>
              <tbody>
                <tr>
                  <th>Total Loan Taken</th>
                  <td>{loanTotals.totalLoans}</td>
                </tr>
                <tr>
                  <th>Total Loan Amount</th>
                  <td>{loanTotals.totalLoanAmount}</td>
                </tr>
                <tr>
                  <th>Total Repayment Amount</th>
                  <td>{loanTotals.totalRepayment}</td>
                </tr>
                <tr>
                  <th>Total Paid</th>
                  <td>{loanTotals.totalPaid}</td>
                </tr>
                <tr>
                  <th>Total Remaining</th>
                  <td>{loanTotals.totalRemaining}</td>
                </tr>
              </tbody>
            </Table>
          </div>
        ) : (
          <Alert variant="info">
            Please select a customer to view payments.
          </Alert>
        )}
      </>
    </div>
  );
};

export default CustomerLedger;
