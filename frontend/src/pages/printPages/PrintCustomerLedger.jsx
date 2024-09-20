/* eslint-disable react/prop-types */
import { Table } from "react-bootstrap";
import React from "react";

const PrintCustomerLedger = React.forwardRef(
  ({ customer, customerLedgerData, loanTotals }, ref) => {
    return (
      <div className="page-container print-container" id="print_area" ref={ref}>
        <h1 className="page-heading">Customer Ledger</h1>
        <>
          <hr />

          <div>
            <h2 className="heading-2">Customer Details</h2>
            <Table responsive className="customer-ledger-details">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                  <th>Address</th>
                  <th>Created At</th>
                  {customer.additionalInfo && <th>Additional Info</th>}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{customer.fullName}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phoneNumber}</td>
                  <td>{customer.address}</td>
                  <td>{new Date(customer.createdAt).toLocaleDateString()}</td>
                  {customer.additionalInfo && (
                    <td>{customer.additionalInfo}</td>
                  )}
                </tr>
              </tbody>
            </Table>

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
        </>
      </div>
    );
  }
);

// Add display name to the component
PrintCustomerLedger.displayName = "PrintCustomerLedger";

export default PrintCustomerLedger;
