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
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getTodayDate } from "../../utils/dataFuction";

const AddLoan = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
    totalRepayment: "", // Add totalRepayment here
    monthlyRepayment: "", // Add monthlyRepayment here
  });
  const {
    data: customers = [],
    isLoading: customersLoading,
    isError: customersError,
  } = useGetCustomersQuery();

  const [error, setError] = useState(null);

  const [addLoan, { isLoading: isAdding }] = useAddLoanMutation();
  const [updateLoan, { isLoading: isUpdating }] = useUpdateLoanMutation();

  const { data: loanData, isLoading: loanLoading } = useGetLoanByIdQuery(id, {
    skip: !id,
  });

  useEffect(() => {
    if (!location.pathname.includes("/edit")) {
      setLoanDetails({
        loanAmount: "",
        interestRate: "",
        duration: "",
        startDate: getTodayDate(),
        endDate: "",
        additionalInfo: "",
        customer: null,
        totalRepayment: "",
        monthlyRepayment: "",
      });
      setIsEditMode(false);
    }
  }, [id, location.pathname]);

  // Effect to calculate totalRepayment
  useEffect(() => {
    if (loanDetails.loanAmount && loanDetails.interestRate) {
      const principal = parseFloat(loanDetails.loanAmount);
      const rate = parseFloat(loanDetails.interestRate) / 100;
      const total = principal * (1 + rate);

      // Update totalRepayment in loanDetails state
      setLoanDetails((prevDetails) => ({
        ...prevDetails,
        totalRepayment: total.toFixed(2),
      }));
    } else {
      setLoanDetails((prevDetails) => ({
        ...prevDetails,
        totalRepayment: "",
      }));
    }
  }, [loanDetails.loanAmount, loanDetails.interestRate]);

  // Effect to calculate monthlyRepayment
  useEffect(() => {
    if (loanDetails.totalRepayment && loanDetails.duration) {
      const months = parseFloat(loanDetails.duration);
      const monthly = parseFloat(loanDetails.totalRepayment) / months;

      // Update monthlyRepayment in loanDetails state
      setLoanDetails((prevDetails) => ({
        ...prevDetails,
        monthlyRepayment: monthly.toFixed(2),
      }));
    } else {
      setLoanDetails((prevDetails) => ({
        ...prevDetails,
        monthlyRepayment: "",
      }));
    }
  }, [loanDetails.totalRepayment, loanDetails.duration]);

  // Effect to calculate endDate
  useEffect(() => {
    if (loanDetails.startDate && loanDetails.duration) {
      const startDate = new Date(loanDetails.startDate);
      const durationMonths = parseInt(loanDetails.duration, 10);
      const endDate = new Date(
        startDate.setMonth(startDate.getMonth() + durationMonths)
      );

      // Update endDate in loanDetails state
      setLoanDetails((prevDetails) => ({
        ...prevDetails,
        endDate: endDate.toISOString().split("T")[0],
      }));
    }
  }, [loanDetails.startDate, loanDetails.duration]);

  // Effect to check if we're in edit mode and populate the form
  useEffect(() => {
    if (id) {
      setIsEditMode(true);
    }
    if (loanData) {
      console.log("Loan loanData: ", loanData);
      setLoanDetails(() => ({
        loanAmount: loanData.loanAmount,
        interestRate: loanData.interestRate,
        duration: loanData.duration,
        startDate: loanData.startDate.split("T")[0],
        endDate: loanData.endDate.split("T")[0],
        additionalInfo: loanData.additionalInfo || "",
        customer: {
          value: loanData.customerId._id,
          lable: loanData.customerId.fullName,
        },
        totalRepayment: loanData.totalRepayment.toFixed(2),
        monthlyRepayment: loanData.monthlyRepayment.toFixed(2),
      }));
    }
  }, [id, loanData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log("name , value ", name, " ", value);
    setLoanDetails({ ...loanDetails, [name]: value || "" });
  };

  const handleCustomerChange = (selectedOption) => {
    console.log(selectedOption);
    setLoanDetails({ ...loanDetails, customer: selectedOption || null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isCustomerValid = loanDetails.customer && loanDetails.customer.value;

    if (parseFloat(loanDetails.duration) <= 0) {
      setError("Duration must be greater than zero.");
      return;
    }

    if (
      loanDetails.loanAmount &&
      loanDetails.interestRate &&
      loanDetails.duration &&
      loanDetails.startDate &&
      loanDetails.endDate &&
      isCustomerValid
    ) {
      try {
        if (isEditMode) {
          // Edit mode: Update loan
          console.log("what i am sending to edit code: ", {
            id,
            ...loanDetails,
          });

          await updateLoan({
            id,
            ...loanDetails,
          }).unwrap();
          SuccessAlert({ text: "The loan was updated successfully." });
        } else {
          // Add mode: Create new loan
          await addLoan({
            ...loanDetails,
          }).unwrap();
          SuccessAlert({ text: "The loan was added successfully." });
        }
        navigate("/loans/details");
        setLoanDetails({
          loanAmount: "",
          interestRate: "",
          duration: "",
          startDate: getTodayDate(),
          endDate: "",
          additionalInfo: "",
          customer: null,
          totalRepayment: "",
          monthlyRepayment: "",
        });
      } catch (err) {
        console.error("Error adding loan:", err); // Log the full error object
        ErrorAlert({
          title: `Failed to ${isEditMode ? "Update" : "Add"} Loan`,
          text: `Please try again later. ${
            err?.data?.error || err.message || "Unknown error"
          }`, // Access the error message safely
        });
        setError(
          `Failed to ${isEditMode ? "update" : "add"} loan: ${
            err?.data?.error || err.message || "Unknown error"
          }`
        );
      }
      setError(null);
    } else {
      setError("All fields are required");
    }
  };
  const customerOptions = customers.map((customer) => ({
    value: customer._id,
    label: customer.fullName,
  }));

  const loading = isAdding || isUpdating;

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
                <Form.Control
                  type="text"
                  value={
                    loanDetails?.customer?.lable ||
                    loanData?.customerId.fullName ||
                    ""
                  }
                  disabled
                />
              ) : (
                <Select
                  name="customer"
                  value={loanDetails.customer}
                  onChange={handleCustomerChange}
                  options={customerOptions}
                  placeholder="Select customer"
                  required
                  isLoading={customersLoading}
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
                value={loanDetails.loanAmount || ""}
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

          <Col sm={4} md={3}>
            <Form.Group controlId="formTotalRepayment">
              <Form.Label>Total Repayment</Form.Label>
              <Form.Control
                type="text"
                value={loanDetails.totalRepayment}
                placeholder="Total repayment with interest"
                disabled
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
            <Form.Group controlId="formMonthlyRepayment">
              <Form.Label>Monthly Repayment</Form.Label>
              <Form.Control
                type="text"
                value={loanDetails.monthlyRepayment}
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
