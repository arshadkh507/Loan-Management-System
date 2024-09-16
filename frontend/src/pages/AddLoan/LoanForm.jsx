import { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
// import "./loanForm.css";
import { addLoan } from "../../redux/actions/loanActions";

const LoanForm = () => {
  const dispatch = useDispatch();
  const [loanDetails, setLoanDetails] = useState({
    loanAmount: "",
    interestRate: "",
    term: "",
    borrowerName: "",
  });
  const [error, setError] = useState(null);
  const { success, loading } = useSelector((state) => state.loan);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoanDetails({ ...loanDetails, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      loanDetails.loanAmount &&
      loanDetails.interestRate &&
      loanDetails.term &&
      loanDetails.borrowerName
    ) {
      dispatch(addLoan(loanDetails));
    } else {
      setError("All fields are required");
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="loan-form">
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">Loan added successfully!</Alert>}
      <Form.Group controlId="formLoanAmount">
        <Form.Label>Loan Amount</Form.Label>
        <Form.Control
          type="number"
          name="loanAmount"
          value={loanDetails.loanAmount}
          onChange={handleChange}
          placeholder="Enter loan amount"
        />
      </Form.Group>

      <Form.Group controlId="formInterestRate">
        <Form.Label>Interest Rate (%)</Form.Label>
        <Form.Control
          type="number"
          name="interestRate"
          value={loanDetails.interestRate}
          onChange={handleChange}
          placeholder="Enter interest rate"
        />
      </Form.Group>

      <Form.Group controlId="formTerm">
        <Form.Label>Term (Months)</Form.Label>
        <Form.Control
          type="number"
          name="term"
          value={loanDetails.term}
          onChange={handleChange}
          placeholder="Enter loan term in months"
        />
      </Form.Group>

      <Form.Group controlId="formBorrowerName">
        <Form.Label>Borrower Name</Form.Label>
        <Form.Control
          type="text"
          name="borrowerName"
          value={loanDetails.borrowerName}
          onChange={handleChange}
          placeholder="Enter borrower's name"
        />
      </Form.Group>

      <Button variant="primary" type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add Loan"}
      </Button>
    </Form>
  );
};

export default LoanForm;
