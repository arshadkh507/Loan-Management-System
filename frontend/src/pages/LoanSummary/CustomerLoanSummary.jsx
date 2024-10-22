/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { Form, Row, Col, Alert, Table, Button } from "react-bootstrap";
import Select from "react-select";
import {
  useGetLoansQuery,
  useGetSingleCustomerLoanSummaryQuery,
} from "../../app/loanApi"; // Custom query hooks
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { useReactToPrint } from "react-to-print";
import { formatDate } from "../../utils/dataFuction";
import "./customerLoanSummary.css";

const CustomerLoanSummary = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerData, setCustomerData] = useState({});
  const {
    data: loans = [],
    isLoading: loansLoading,
    isError: loansError,
  } = useGetLoansQuery();
  const {
    data: customerLoanSummary = {},
    isLoading: isSummaryLoading,
    isError: isSummaryError,
  } = useGetSingleCustomerLoanSummaryQuery(
    selectedCustomer ? selectedCustomer.value : null
  );

  const customerOptions = loans.reduce((acc, loan) => {
    if (!acc.some((option) => option.value === loan.customerId._id)) {
      acc.push({ value: loan.customerId._id, label: loan.customerId.fullName });
    }
    return acc;
  }, []);

  console.log("customer loan summary: ", customerLoanSummary);

  useEffect(() => {
    if (customerLoanSummary.loans) {
      setCustomerData(customerLoanSummary.loans[0].customer);
    }
  }, [customerLoanSummary]);

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

      // Check for overdue installments
      if (installmentDate < currentDate && installment.status === "Overdue") {
        filteredInstallments.push(installment);
      }

      // Check for paid installments
      if (
        installment.status === "Paid" &&
        (installmentDate.getMonth() < currentMonth ||
          (installmentDate.getMonth() === currentMonth &&
            installmentDate.getFullYear() === currentYear))
      ) {
        filteredInstallments.push(installment);
      }

      // Check for pending installments
      if (
        installment.status === "Pending" &&
        (installmentDate.getMonth() === currentMonth ||
          installmentDate.getMonth() - 1 === currentMonth) &&
        installmentDate.getFullYear() === currentYear
      ) {
        filteredInstallments.push(installment);
      }

      // Check for partially paid installments
      if (
        installment.status === "Pending - Partially Paid" &&
        (installmentDate.getFullYear() <= currentYear ||
          (installmentDate.getFullYear() === currentYear &&
            installmentDate.getMonth() <= currentMonth))
      ) {
        filteredInstallments.push(installment);
      }
    });

    return filteredInstallments; // Return the filtered installments
  };

  // Calculate the totals above JSX
  const totalLoans = customerLoanSummary.loans?.length || 0;
  const totalLoanAmount = customerLoanSummary.loans
    ? customerLoanSummary.loans
        .reduce(
          (acc, loan) => acc + parseFloat(loan.loanDetails.loanId.loanAmount),
          0
        )
        .toFixed(2)
    : 0;
  const totalRepaymentAmount = customerLoanSummary.loans
    ? customerLoanSummary.loans
        .reduce(
          (acc, loan) =>
            acc + parseFloat(loan.loanDetails.loanId.totalRepayment),
          0
        )
        .toFixed(2)
    : 0;
  const totalPaid = customerLoanSummary.loans
    ? customerLoanSummary.loans
        .reduce((acc, loan) => acc + parseFloat(loan.loanDetails.totalPaid), 0)
        .toFixed(2)
    : 0;
  const totalRemaining = customerLoanSummary.loans
    ? customerLoanSummary.loans
        .reduce((acc, loan) => acc + parseFloat(loan.loanDetails.remaining), 0)
        .toFixed(2)
    : 0;
  const totalOverdueAmount = customerLoanSummary.loans
    ? customerLoanSummary.loans
        .reduce((acc, loan) => acc + parseFloat(loan.status.overdueAmount), 0)
        .toFixed(2)
    : 0;

  return (
    <div className="page-container" ref={printArea}>
      <h1 className="page-heading">Customer Loan Summary</h1>
      <hr className="custom-hr" />

      {(loansLoading || isSummaryLoading) && <LoadingSpinner />}
      {loansError && <Alert variant="danger">Failed to load data.</Alert>}
      {isSummaryError && selectedCustomer && (
        <Alert variant="danger">Failed to load customer loan summary.</Alert>
      )}

      <Row className="mb-4 d-flex align-items-end justify-content-between not-to-print">
        <Col md={6}>
          <Form.Group controlId="selectCustomer" className="not-to-print">
            <Form.Label>Select Customer</Form.Label>
            <Select
              options={customerOptions}
              onChange={setSelectedCustomer}
              value={selectedCustomer}
              placeholder="Search and select a customer"
              isSearchable
            />
          </Form.Group>
        </Col>
        <Col md={3} className="mt-2 not-to-print">
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

      {selectedCustomer && customerLoanSummary.loans ? (
        <div>
          <h2 className="heading-2">Customer Details</h2>
          <Row className="my-3 g-2">
            {Object.entries(customerData)
              .filter(([key]) => !["updatedAt", "__v"].includes(key)) // Exclude updatedAt and __v
              .map(([key, value], index) => (
                <React.Fragment key={key}>
                  <Col xs={6} md={2}>
                    <strong>
                      {key.charAt(0).toUpperCase() + key.slice(1)}:
                    </strong>
                  </Col>
                  <Col xs={6} md={4}>
                    {key === "createdAt" ? formatDate(value) : value}{" "}
                  </Col>
                </React.Fragment>
              ))}
          </Row>

          <hr className="custom-hr" />

          {customerLoanSummary.loans?.map((loan, index) => {
            const filteredInstallments = processInstallments(
              loan.loanDetails.installments
            );

            const overdueAmount = loan.loanDetails.installments
              ?.filter((installment) => installment.status === "Overdue")
              .reduce(
                (sum, installment) => sum + (installment.remainingAmount || 0),
                0
              );

            return (
              <div key={loan.loanDetails.loanId} className="loan-details mb-4">
                <h3 className="heading-3">Loan {index + 1} Details</h3>
                <Table responsive striped bordered hover>
                  <thead>
                    <tr className="table-info">
                      <th>Loan No</th>
                      <th>Loan Amount</th>
                      <th>Date</th>
                      <th>Total Repayment</th>
                      <th>Duration</th>
                      <th>Monthly Repayment</th>
                      <th>Total Paid</th>
                      <th>Total Remaining</th>
                      <th>Overdue Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{index + 1}</td>
                      <td>{loan.loanDetails.loanId.loanAmount}</td>
                      <td>{formatDate(loan.loanDetails.loanId.startDate)}</td>
                      <td>{loan.loanDetails.loanId.totalRepayment}</td>
                      <td>{loan.loanDetails.loanId.duration}</td>
                      <td>{loan.loanDetails.loanId.monthlyRepayment}</td>
                      <td>{loan.loanDetails.totalPaid}</td>
                      <td>{loan.loanDetails.remaining}</td>
                      <td>{loan.status.overdueAmount}</td>{" "}
                    </tr>
                  </tbody>
                </Table>

                <h4 className="heading-4">Monthly Payment Status</h4>
                <Table responsive bordered hover>
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Status</th>
                      <th>Paid Amount</th>
                      <th>Remaining Amount</th>
                      <th>Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInstallments.map((installment, idx) => (
                      <tr key={idx}>
                        <td>{installment.month}</td>
                        <td>{installment.status}</td>
                        <td>{installment.paidAmount || 0}</td>
                        <td>{installment.remainingAmount || 0}</td>
                        <td>
                          {installment.dueDate
                            ? formatDate(installment.dueDate)
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            );
          })}

          <h3 className="heading-3 not-to-print ">Summary Totals</h3>
          <Table responsive striped bordered className="not-to-print ">
            <tbody>
              <tr>
                <th>Total Loans</th>
                <td>{totalLoans}</td>
              </tr>
              <tr>
                <th>Total Loan Amount</th>
                <td>{totalLoanAmount}</td>
              </tr>
              <tr>
                <th>Total Repayment Amount</th>
                <td>{totalRepaymentAmount}</td>
              </tr>
              <tr>
                <th>Total Paid</th>
                <td>{totalPaid}</td>
              </tr>
              <tr>
                <th>Total Remaining</th>
                <td>{totalRemaining}</td>
              </tr>
              <tr>
                <th>Total Overdue Amount</th>
                <td>{totalOverdueAmount}</td>
              </tr>
            </tbody>
          </Table>
        </div>
      ) : (
        <Alert variant="info">
          Please select a customer to view loan summary.
        </Alert>
      )}
    </div>
  );
};

export default CustomerLoanSummary;

// /* eslint-disable no-unused-vars */
// import React, { useState, useEffect, useRef } from "react";
// import { Form, Row, Col, Alert, Table, Button } from "react-bootstrap";
// import Select from "react-select";
// import {
//   useGetLoansQuery,
//   useGetSingleCustomerLoanSummaryQuery,
// } from "../../app/loanApi"; // Custom query hooks
// import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
// import { useReactToPrint } from "react-to-print";
// import { formatDate } from "../../utils/dataFuction";

// const CustomerLoanSummary = () => {
//   const [selectedCustomer, setSelectedCustomer] = useState(null);
//   const [customerData, setCustomerData] = useState({});
//   const {
//     data: loans = [],
//     isLoading: loansLoading,
//     isError: loansError,
//   } = useGetLoansQuery();
//   const {
//     data: customerLoanSummary = {},
//     isLoading: isSummaryLoading,
//     isError: isSummaryError,
//   } = useGetSingleCustomerLoanSummaryQuery(
//     selectedCustomer ? selectedCustomer.value : null
//   );

//   const customerOptions = loans.reduce((acc, loan) => {
//     if (!acc.some((option) => option.value === loan.customerId._id)) {
//       acc.push({ value: loan.customerId._id, label: loan.customerId.fullName });
//     }
//     return acc;
//   }, []);
//   console.log("customer loan summary: ", customerLoanSummary);
//   useEffect(() => {
//     if (customerLoanSummary.loans) {
//       setCustomerData(customerLoanSummary.loans[0].customer);
//     }
//   }, [customerLoanSummary]);

//   const printArea = useRef();
//   const handlePrint = useReactToPrint({
//     content: () => printArea.current,
//   });

//   return (
//     <div className="page-container" ref={printArea}>
//       <h1 className="page-heading">Customer Loan Summary</h1>
//       <hr className="custom-hr" />

//       {(loansLoading || isSummaryLoading) && <LoadingSpinner />}
//       {loansError && <Alert variant="danger">Failed to load data.</Alert>}
//       {isSummaryError && selectedCustomer && (
//         <Alert variant="danger">Failed to load customer loan summary.</Alert>
//       )}

//       <Row className="mb-4 d-flex align-items-end justify-content-between">
//         <Col md={6}>
//           <Form.Group controlId="selectCustomer">
//             <Form.Label>Select Customer</Form.Label>
//             <Select
//               options={customerOptions}
//               onChange={setSelectedCustomer}
//               value={selectedCustomer}
//               placeholder="Search and select a customer"
//               isSearchable
//             />
//           </Form.Group>
//         </Col>
//         <Col md={3} className="mt-2">
//           <Button
//             className="btn btn-lg w-100"
//             onClick={handlePrint}
//             disabled={!selectedCustomer}
//           >
//             Print To PDF
//           </Button>
//         </Col>
//       </Row>

//       <hr />

//       {selectedCustomer && customerLoanSummary.loans ? (
//         <div>
//           <h2 className="heading-2">Customer Details</h2>
//           <Row className="my-3 g-2">
//             {Object.entries(customerData)
//               .filter(([key]) => !["updatedAt", "__v"].includes(key)) // Exclude updatedAt and __v
//               .map(([key, value], index) => (
//                 <React.Fragment key={key}>
//                   <Col xs={6} md={2}>
//                     <strong>
//                       {key.charAt(0).toUpperCase() + key.slice(1)}:
//                     </strong>
//                   </Col>
//                   <Col xs={6} md={4}>
//                     {key === "createdAt" ? formatDate(value) : value}{" "}
//                   </Col>
//                 </React.Fragment>
//               ))}
//           </Row>

//           <hr className="custom-hr" />

//           {customerLoanSummary.loans?.map((loan, index) => {
//             const overdueAmount = loan.loanDetails.installments
//               ?.filter((installment) => installment.status === "Overdue")
//               .reduce(
//                 (sum, installment) => sum + (installment.remainingAmount || 0),
//                 0
//               );

//             return (
//               <div key={loan.loanDetails.loanId} className="loan-details mb-4">
//                 <h3 className="heading-3">Loan {index + 1} Details</h3>
//                 <Table responsive striped bordered hover>
//                   <thead>
//                     <tr className="table-info">
//                       <th>Loan No</th>
//                       <th>Loan Amount</th>
//                       <th>Total Repayment</th>
//                       <th>Monthly Repayment</th>
//                       <th>Total Paid</th>
//                       <th>Total Remaining</th>
//                       <th>Overdue Amount</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     <tr>
//                       <td>{index + 1}</td>
//                       <td>{loan.loanDetails.loanAmount}</td>
//                       <td>{loan.loanDetails.totalRepayment}</td>
//                       <td>{loan.loanDetails.monthlyRepayment}</td>
//                       <td>{loan.loanDetails.totalPaid}</td>
//                       <td>{loan.loanDetails.remaining}</td>
//                       <td>{loan.status.overdueAmount}</td>
//                     </tr>
//                   </tbody>
//                 </Table>

//                 <h4 className="heading-4">Monthly Payment Status</h4>
//                 <Table responsive bordered hover>
//                   <thead>
//                     <tr>
//                       <th>Month</th>
//                       <th>Status</th>
//                       <th>Paid Amount</th>
//                       <th>Remaining Amount</th>
//                       <th>Due Date</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {loan.loanDetails.installments?.map((installment, idx) => (
//                       <tr key={idx}>
//                         <td>{installment.month}</td>
//                         <td>{installment.status}</td>
//                         <td>{installment.paidAmount || 0}</td>
//                         <td>{installment.remainingAmount || 0}</td>
//                         <td>{installment.dueDate || "N/A"}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </Table>
//               </div>
//             );
//           })}

//           <h3 className="heading-3">Summary Totals</h3>
//           <Table responsive striped bordered>
//             <tbody>
//               <tr>
//                 <th>Total Loans</th>
//                 <td>{customerLoanSummary.loans.length}</td>
//               </tr>
//               <tr>
//                 <th>Total Loan Amount</th>
//                 <td>
//                   {customerLoanSummary.loans
//                     .reduce(
//                       (acc, loan) =>
//                         acc + parseFloat(loan.loanDetails.loanAmount),
//                       0
//                     )
//                     .toFixed(2)}
//                 </td>
//               </tr>
//               <tr>
//                 <th>Total Repayment Amount</th>
//                 <td>
//                   {customerLoanSummary.loans
//                     .reduce(
//                       (acc, loan) =>
//                         acc + parseFloat(loan.loanDetails.totalRepayment),
//                       0
//                     )
//                     .toFixed(2)}
//                 </td>
//               </tr>
//               <tr>
//                 <th>Total Paid</th>
//                 <td>
//                   {customerLoanSummary.loans
//                     .reduce(
//                       (acc, loan) =>
//                         acc + parseFloat(loan.loanDetails.totalPaid),
//                       0
//                     )
//                     .toFixed(2)}
//                 </td>
//               </tr>
//               <tr>
//                 <th>Total Remaining</th>
//                 <td>
//                   {customerLoanSummary.loans
//                     .reduce(
//                       (acc, loan) =>
//                         acc + parseFloat(loan.loanDetails.remaining),
//                       0
//                     )
//                     .toFixed(2)}
//                 </td>
//               </tr>
//               <tr>
//                 <th>Total Overdue Amount</th>
//                 <td>
//                   {customerLoanSummary.loans
//                     .reduce(
//                       (acc, loan) =>
//                         acc + parseFloat(loan.status.overdueAmount),
//                       0
//                     )
//                     .toFixed(2)}
//                 </td>
//               </tr>
//             </tbody>
//           </Table>
//         </div>
//       ) : (
//         <Alert variant="info">
//           Please select a customer to view loan summary.
//         </Alert>
//       )}
//     </div>
//   );
// };

// export default CustomerLoanSummary;
