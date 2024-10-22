/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Form, Button, Col, Alert, Row } from "react-bootstrap";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAddCustomerPaymentMutation } from "../../app/customerPaymentApi";
import {
  useCreateLoanPaymentMutation,
  useGetLoanPaymentAndLoanByIdQuery,
  useGetLoanPaymentByIdQuery,
  useUpdateLoanPaymentMutation,
} from "../../app/loanPaymentApi";
import "../../assets/css/pagesStyle.css";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import {
  ErrorAlert,
  SuccessAlert,
} from "../../components/AlertComponents/AlertComponents";
import { useGetLoanByIdQuery } from "../../app/loanApi";

const getTodayDate = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const AddLoanPayment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine if this is edit or add mode
  const isEditMode = location.pathname.includes("/edit");

  const {
    data: loanAndPayment = [],
    error: loanAndPaymentError,
    isLoading: isLoanAndPaymentLoading,
    isError: isLoanAndPaymentError,
    refetch,
  } = useGetLoanPaymentAndLoanByIdQuery(id);

  console.log("loanAndPayment: ", loanAndPayment);

  const [formData, setFormData] = useState({
    paidAmount: "",
    details: "",
    date: getTodayDate(),
  });

  const [
    createLoanPayment,
    {
      isLoading: isCreatingLoanPayment,
      isError: isLoanPaymentError,
      error: loanPaymentError,
    },
  ] = useCreateLoanPaymentMutation();

  const [updateLoanPayment, { isLoading: isUpdatingLoanPayment }] =
    useUpdateLoanPaymentMutation();

  useEffect(() => {
    if (loanAndPayment && isEditMode) {
      console.log("loanAndPayment  ", loanAndPayment);

      // Handle unset values using optional chaining and fallback values
      const paymentDate =
        loanAndPayment?.loanPayment?.paymentDate || getTodayDate();

      // Ensure all necessary properties are available, otherwise use empty strings or default values
      const paidAmount = loanAndPayment?.loanPayment?.paid || "";
      const details = loanAndPayment?.loanPayment?.details || "";

      setFormData({
        paidAmount,
        details,
        date: paymentDate.split("T")[0], // Split to get the date part
      });
    }
  }, [loanAndPayment, isEditMode]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    const paidAmount = parseFloat(formData.paidAmount);

    // Check if the amount is a valid number, greater than 0, and doesn't exceed the previous amount
    if (isNaN(paidAmount) || paidAmount <= 0) {
      ErrorAlert({ text: "Paid amount must be a positive number." });
      return false;
    }

    if (paidAmount > previousAmount) {
      ErrorAlert({ text: "Paid amount cannot exceed the previous amount." });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      ErrorAlert({ text: "Invalid payment amount." });
      return;
    }
    const loanPaymentData = {
      paymentId: id,
      loanId: loanAndPayment.loanPayment.loanId._id,
      customerId: loanAndPayment.loanPayment.customerId._id,
      totalAmount: loanAndPayment.loanPayment.totalAmount,
      paidAmount: parseFloat(formData.paidAmount),
      details: formData.details,
      paymentDate: formData.date,
    };

    try {
      if (isEditMode) {
        // Edit loan payment
        await updateLoanPayment({ ...loanPaymentData }).unwrap();
        SuccessAlert({ text: "Payment updated successfully." });
      } else {
        // Add new loan payment
        await createLoanPayment(loanPaymentData).unwrap();
        SuccessAlert({ text: "Payment added successfully." });
      }

      // Clear form after success
      setFormData({ paidAmount: "", details: "", date: getTodayDate() });
      refetch();
      navigate("/loan-payments/details");
    } catch (error) {
      console.error("Error adding/updating payment:", error);
      ErrorAlert({ text: "Failed to process payment. Please try again." });
    }
  };

  const previousAmount = isEditMode
    ? (loanAndPayment?.statusLoanPayment?.remaining || 0) +
      (loanAndPayment?.loanPayment?.paid || 0)
    : loanAndPayment?.loanPayment?.remaining || 0;

  const paidAmount = parseFloat(formData.paidAmount) || 0;
  const remainingAmount = previousAmount - paidAmount;

  const loading = isLoanAndPaymentLoading;
  const processingLoading = isCreatingLoanPayment || isUpdatingLoanPayment;

  return (
    <div className="page-container">
      <h1 className="page-heading">
        {" "}
        {isEditMode ? "Edit Loan Payment" : "Add Loan Payment"}
      </h1>
      <hr className="custom-hr" />

      {loading && <LoadingSpinner />}

      {isLoanAndPaymentError && (
        <Alert variant="danger">
          {loanAndPaymentError?.data?.message ||
            "Failed to load loan payment details."}
        </Alert>
      )}

      {loanAndPayment && (
        <Form onSubmit={handleSubmit}>
          <Row className="align-items-end">
            <Col md={4} lg={3} sm={6}>
              <Form.Group controlId="customerName">
                <Form.Label>Customer Name</Form.Label>
                <Form.Control
                  type="text"
                  value={loanAndPayment.loanPayment?.customerId.fullName}
                  disabled
                />
              </Form.Group>
            </Col>

            <Col md={4} lg={3} sm={6}>
              <Form.Group controlId="date">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={4} lg={3} sm={6}>
              <Form.Group controlId="monthlyRepayment">
                <Form.Label>Monthly Repayment</Form.Label>
                <Form.Control
                  type="text"
                  value={loanAndPayment?.loanPayment?.loanId?.monthlyRepayment}
                  disabled
                />
              </Form.Group>
            </Col>

            <Col md={4} lg={3} sm={6}>
              <Form.Group controlId="previousAmount">
                <Form.Label>Previous Amount</Form.Label>
                <Form.Control type="text" value={previousAmount} disabled />
              </Form.Group>
            </Col>

            <Col md={4} lg={3} sm={6}>
              <Form.Group controlId="paidAmount">
                <Form.Label>Paid Amount</Form.Label>
                <Form.Control
                  type="number"
                  name="paidAmount"
                  value={formData.paidAmount}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={4} lg={3} sm={6}>
              <Form.Group controlId="remainingAmount">
                <Form.Label>Remaining Amount</Form.Label>
                <Form.Control type="text" value={remainingAmount} disabled />
              </Form.Group>
            </Col>

            <Col md={4} lg={6} sm={6}>
              <Form.Group controlId="details">
                <Form.Label>Details</Form.Label>
                <Form.Control
                  as="textarea"
                  name="details"
                  value={formData.details}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={4} lg={3} sm={6}>
              <Button
                variant="primary"
                type="submit"
                className="mt-3"
                disabled={processingLoading}
              >
                {processingLoading
                  ? isEditMode
                    ? "Updating Payment..."
                    : "Adding Payment..."
                  : isEditMode
                  ? "Update Payment"
                  : "Add Payment"}
              </Button>
            </Col>
          </Row>
        </Form>
      )}
    </div>
  );
};

export default AddLoanPayment;
