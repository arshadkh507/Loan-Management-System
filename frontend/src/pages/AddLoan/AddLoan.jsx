/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Form, Button, Alert, Row, Col } from "react-bootstrap";
import Select from "react-select";
import "../../assets/css/pagesStyle.css";
import {
  ErrorAlert,
  SuccessAlert,
} from "../../components/AlertComponents/AlertComponents";
import { useGetCustomersQuery } from "../../app/customerApi";
import {
  useAddLoanMutation,
  useGetLoanByIdQuery,
  useUpdateLoanMutation,
} from "../../app/loanApi";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { useNavigate, useParams } from "react-router-dom";

// Helper function to get today's date in 'YYYY-MM-DD' format
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

const AddLoan = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isEditMode, setIsEditMode] = useState(false);
  const [loanDetails, setLoanDetails] = useState({
    loanAmount: "",
    interestRate: "",
    duration: "",
    startDate: getTodayDate(),
    endDate: "",
    additionalInfo: "",
    customer: null,
  });

  const [totalRepayment, setTotalRepayment] = useState("");
  const [monthlyRepayment, setMonthlyRepayment] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    data: customers = [],
    isLoading: customersLoading,
    isError: customersError,
  } = useGetCustomersQuery();

  const [addLoan] = useAddLoanMutation();
  const [updateLoan] = useUpdateLoanMutation();

  // Fetch loan details if in edit mode
  const { data: loanData, isLoading: loanLoading } = useGetLoanByIdQuery(id, {
    skip: !id, // Skip the query if there's no ID (meaning it's an Add mode)
  });

  // Effect to check if we're in edit mode and populate the form
  useEffect(() => {
    if (id) {
      setIsEditMode(true);
    }
    if (loanData) {
      setLoanDetails({
        loanAmount: loanData.loanAmount,
        interestRate: loanData.interestRate,
        duration: loanData.duration,
        startDate: loanData.startDate.split("T")[0], // Ensure proper date format
        endDate: loanData.endDate.split("T")[0],
        additionalInfo: loanData.additionalInfo,
        customer: {
          value: loanData.customerId,
          label: loanData.customerName,
        },
      });
    }
  }, [id, loanData]);

  useEffect(() => {
    if (
      loanDetails.loanAmount &&
      loanDetails.interestRate &&
      loanDetails.duration
    ) {
      const principal = parseFloat(loanDetails.loanAmount);
      const rate = parseFloat(loanDetails.interestRate) / 100;
      const months = parseFloat(loanDetails.duration);
      const total = principal * (1 + rate);
      const monthly = total / months;

      setTotalRepayment(total.toFixed(2));
      setMonthlyRepayment(monthly.toFixed(2));
    } else {
      setTotalRepayment("");
      setMonthlyRepayment("");
    }

    if (loanDetails.startDate && loanDetails.duration) {
      const startDate = new Date(loanDetails.startDate);
      const durationMonths = parseInt(loanDetails.duration, 10);
      const endDate = new Date(
        startDate.setMonth(startDate.getMonth() + durationMonths)
      );
      setLoanDetails((prevDetails) => ({
        ...prevDetails,
        endDate: endDate.toISOString().split("T")[0],
      }));
    }
  }, [
    loanDetails.loanAmount,
    loanDetails.interestRate,
    loanDetails.duration,
    loanDetails.startDate,
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoanDetails({ ...loanDetails, [name]: value });
  };

  const handleCustomerChange = (selectedOption) => {
    setLoanDetails({ ...loanDetails, customer: selectedOption });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isCustomerValid = loanDetails.customer && loanDetails.customer.value;

    if (
      loanDetails.loanAmount &&
      loanDetails.interestRate &&
      loanDetails.duration &&
      loanDetails.startDate &&
      loanDetails.endDate &&
      isCustomerValid
    ) {
      setLoading(true);
      try {
        if (isEditMode) {
          // Edit mode: Update loan
          await updateLoan({
            id,
            ...loanDetails,
            totalRepayment,
            monthlyRepayment,
          }).unwrap();
          SuccessAlert({ text: "The loan was updated successfully." });
        } else {
          // Add mode: Create new loan
          await addLoan({
            ...loanDetails,
            totalRepayment,
            monthlyRepayment,
          }).unwrap();
          SuccessAlert({ text: "The loan was added successfully." });
        }
        navigate("/loans/details");
      } catch (err) {
        ErrorAlert({
          title: `Failed to ${isEditMode ? "Update" : "Add"} Loan`,
          text: `Please try again later. ${err.message}`,
        });
      }
      setLoading(false);
      setLoanDetails({
        loanAmount: "",
        interestRate: "",
        duration: "",
        startDate: getTodayDate(),
        endDate: "",
        additionalInfo: "",
        customer: null,
      });
      setTotalRepayment("");
      setMonthlyRepayment("");
      setError(null);
    } else {
      setError("All fields are required");
    }
  };
  const customerOptions = customers.map((customer) => ({
    value: customer._id,
    label: customer.fullName,
  }));

  return (
    <div className="page-container">
      <h1 className="page-heading">{isEditMode ? "Edit Loan" : "Add Loan"}</h1>
      <hr className="custom-hr" />
      <Form onSubmit={handleSubmit} className="loan-form">
        {error && <Alert variant="danger">{error}</Alert>}
        <Row className="justify-content-between">
          <Col sm={6} md={3}>
            <Form.Group controlId="formCustomer">
              <Form.Label>Customer Name</Form.Label>
              {isEditMode ? (
                // Show a non-editable field in edit mode
                <Form.Control
                  type="text"
                  value={loanDetails.customer?.label || ""}
                  disabled
                />
              ) : customersLoading ? (
                <LoadingSpinner />
              ) : (
                <Select
                  name="customer"
                  value={loanDetails.customer}
                  onChange={handleCustomerChange}
                  options={customerOptions}
                  placeholder="Select customer"
                  required
                />
              )}
              {customersError && (
                <Alert variant="danger">Failed to load customers</Alert>
              )}
            </Form.Group>
          </Col>

          <Col sm={6} md={3}>
            <Form.Group controlId="formLoanAmount">
              <Form.Label>Loan Amount</Form.Label>
              <Form.Control
                type="number"
                name="loanAmount"
                value={loanDetails.loanAmount}
                onChange={handleChange}
                placeholder="Enter loan amount"
                required
              />
            </Form.Group>
          </Col>

          <Col sm={3} md={3}>
            <Form.Group controlId="formInterestRate">
              <Form.Label>Interest Rate (%)</Form.Label>
              <Form.Control
                type="number"
                name="interestRate"
                value={loanDetails.interestRate}
                onChange={handleChange}
                placeholder="Enter interest rate"
                required
              />
            </Form.Group>
          </Col>

          <Col sm={3} md={3}>
            <Form.Group controlId="formDuration">
              <Form.Label>Duration (Months)</Form.Label>
              <Form.Control
                type="number"
                name="duration"
                value={loanDetails.duration}
                onChange={handleChange}
                placeholder="Enter loan duration in months"
                required
              />
            </Form.Group>
          </Col>

          <Col sm={4} md={3}>
            <Form.Group controlId="formTotalRepayment">
              <Form.Label>Total Repayment</Form.Label>
              <Form.Control
                type="text"
                value={totalRepayment}
                placeholder="Total repayment with interest"
                disabled
              />
            </Form.Group>
          </Col>

          <Col sm={4} md={3}>
            <Form.Group controlId="formMonthlyRepayment">
              <Form.Label>Monthly Repayment</Form.Label>
              <Form.Control
                type="text"
                value={monthlyRepayment}
                placeholder="Monthly repayment amount"
                disabled
              />
            </Form.Group>
          </Col>

          <Col sm={4} md={3}>
            <Form.Group controlId="formStartDate">
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                name="startDate"
                value={loanDetails.startDate}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>

          <Col sm={4} md={3}>
            <Form.Group controlId="formEndDate">
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                name="endDate"
                value={loanDetails.endDate}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>

          <Col sm={12} md={6}>
            <Form.Group controlId="formAdditionalInfo">
              <Form.Label>Additional Information</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="additionalInfo"
                value={loanDetails.additionalInfo}
                onChange={handleChange}
                placeholder="Enter any additional information about the loan"
              />
            </Form.Group>
          </Col>

          <Col sm={12} className="text-right my-3">
            <Button
              variant="primary"
              type="submit"
              disabled={loading}
              size="sm"
            >
              {loading
                ? isEditMode
                  ? "Updating..."
                  : "Adding..."
                : isEditMode
                ? "Update Loan"
                : "Add Loan"}
            </Button>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default AddLoan;
