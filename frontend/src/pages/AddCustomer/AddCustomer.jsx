/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { Form, Button, Alert, Container, Row, Col } from "react-bootstrap";
import "../../assets/css/pagesStyle.css";
import {
  ErrorAlert,
  SuccessAlert,
} from "../../components/AlertComponents/AlertComponents";
import {
  useAddCustomerMutation,
  useGetCustomerByIdQuery,
  useUpdateCustomerMutation,
} from "../../app/customerApi";
import { useNavigate, useParams } from "react-router-dom";

const AddCustomer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customerDetails, setCustomerDetails] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
    additionalInfo: "",
  });

  // const [error, setError] = useState(null);
  const [addCustomer, { isLoading: isAdding }] = useAddCustomerMutation();
  const [updateCustomer, { isLoading: isUpdating }] =
    useUpdateCustomerMutation();
  const { data: customerData, isSuccess } = useGetCustomerByIdQuery(id, {
    skip: !id,
  });

  useEffect(() => {
    if (isSuccess && customerData) {
      setCustomerDetails({
        fullName: customerData.fullName || "",
        email: customerData.email || "",
        phoneNumber: customerData.phoneNumber || "",
        address: customerData.address || "",
        additionalInfo: customerData.additionalInfo || "",
      });
    }
  }, [isSuccess, customerData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomerDetails({ ...customerDetails, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      customerDetails.fullName &&
      customerDetails.email &&
      customerDetails.phoneNumber &&
      customerDetails.address
    ) {
      try {
        if (id) {
          await updateCustomer({ id, ...customerDetails }).unwrap();
          SuccessAlert({ text: "Customer updated successfully." });
          navigate("/customers/details");
        } else {
          await addCustomer(customerDetails).unwrap();
          SuccessAlert({ text: "Customer added successfully." });
          setCustomerDetails({
            fullName: "",
            email: "",
            phoneNumber: "",
            address: "",
            additionalInfo: "",
          });
          navigate("/customers/details");
        }
      } catch (err) {
        if (err.message === "Customer with this email already exists") {
          ErrorAlert({
            title: "Failed to Add Customer",
            text: "Customer with this email already exists",
          });
        } else {
          ErrorAlert({
            title: "Failed to Add Customer",
            text: err.message || "Please try again later.",
          });
        }
      }
    } else {
      ErrorAlert({ text: "All fields are required" });
    }
  };

  return (
    <Container className="page-container">
      <h1 className="page-heading">{id ? "Edit Customer" : "Add Customer"}</h1>
      <hr className="custome-hr" />
      <Form onSubmit={handleSubmit} className="customer-form">
        {/* {error && <Alert variant="danger">{error}</Alert>} */}
        <Row className="">
          <Col sm={6} md={3}>
            <Form.Group controlId="formFullName">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="fullName"
                value={customerDetails.fullName}
                onChange={handleChange}
                placeholder="Enter full name"
                required
              />
            </Form.Group>
          </Col>

          <Col sm={6} md={3}>
            <Form.Group controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={customerDetails.email}
                onChange={handleChange}
                placeholder="Enter email"
                required
              />
            </Form.Group>
          </Col>

          <Col sm={6} md={3}>
            <Form.Group controlId="formPhoneNumber">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="tel"
                name="phoneNumber"
                value={customerDetails.phoneNumber}
                onChange={handleChange}
                placeholder="Enter phone number"
                required
              />
            </Form.Group>
          </Col>

          <Col sm={12} md={6}>
            <Form.Group controlId="formAddress">
              <Form.Label>Address</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="address"
                value={customerDetails.address}
                onChange={handleChange}
                placeholder="Enter address"
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
                value={customerDetails.additionalInfo}
                onChange={handleChange}
                placeholder="Enter any additional information"
              />
            </Form.Group>
          </Col>

          <Col sm={12} className="text-right my-3">
            <Button
              variant="primary"
              type="submit"
              disabled={isAdding || isUpdating}
              size="sm"
            >
              {isAdding || isUpdating
                ? id
                  ? "Updating..."
                  : "Adding..."
                : id
                ? "Update Customer"
                : "Add Customer"}
            </Button>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default AddCustomer;
