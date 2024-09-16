/* eslint-disable react/prop-types */
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const CustomerLoanItem = ({ loan, loanIndex, onLoanClick }) => {
  const navigate = useNavigate();

  return (
    <div className="loan-details-item">
      <div className="detail-item p-0">
        <button
          className="btn btn-outline-primary text-center w-100 fw-bolder m-0 p-3"
          onClick={() => onLoanClick(loan, loanIndex)} // Pass loan and its index
        >
          Loan {loanIndex}
        </button>
      </div>
      <div className="detail-item">
        <span className="label">Loan Amount:</span>
        <span className="value">{loan.totalAmount}</span>
      </div>
      <div className="detail-item">
        <span className="label">Monthly Repayment:</span>
        <span className="value">{loan.monthlyRepayment}</span>
      </div>
      <div className="detail-item">
        <span className="label">Total Months:</span>
        <span className="value">{loan.duration}</span>
      </div>
      <div className="detail-item">
        <span className="label">Paid:</span>
        <span className="value">{loan.paid || 0}</span>
      </div>
      <div className="detail-item">
        <span className="label">Remaining:</span>
        <span className="value">{loan.remaining || 0}</span>
      </div>
      <Button
        className="add-payment-btn"
        variant="primary"
        onClick={() => navigate(`/loan-payments/add/${loan._id}`)}
      >
        Add Loan Payment
      </Button>
    </div>
  );
};

export default CustomerLoanItem;

// /* eslint-disable react/prop-types */
// import { Button } from "react-bootstrap";
// import { useNavigate } from "react-router-dom";

// const CustomerLoanItem = ({ loan }) => {
//   const navigate = useNavigate();

//   return (
//     <div className="loan-details-item">
//       <div className="detail-item p-0">
//       <button
//   className="btn btn-outline-primary text-center w-100 fw-bolder m-0 p-3"
//   onClick={() => onLoanClick(loan)}
// >
//   Loan {loan._id}
// </button>

//       </div>
//       <div className="detail-item">
//         <span className="label">Loan Amount:</span>
//         <span className="value">{loan.totalAmount}</span>
//       </div>
//       <div className="detail-item">
//         <span className="label">Monthly Repayment:</span>
//         <span className="value">{loan.monthlyRepayment}</span>
//       </div>
//       <div className="detail-item">
//         <span className="label">Total Months:</span>
//         <span className="value">{loan.duration}</span>
//       </div>
//       <div className="detail-item">
//         <span className="label">Paid:</span>
//         <span className="value">{loan.paid || 0}</span>
//       </div>
//       <div className="detail-item">
//         <span className="label">Remaining:</span>
//         <span className="value">{loan.remaining || 0}</span>
//       </div>
//       <Button
//         className="add-payment-btn"
//         variant="primary"
//         onClick={() => navigate(`/loan-payments/add/${loan._id}`)}
//       >
//         Add Loan Payment
//       </Button>
//     </div>
//   );
// };

// export default CustomerLoanItem;
