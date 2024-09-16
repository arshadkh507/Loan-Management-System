// src/routes/customerPaymentRoutes.js
const express = require("express");
const router = express.Router();
const {
  addCustomerPayment,
  getCustomerPayments,
  getCustomerPaymentById,
  updateCustomerPayment,
  deleteCustomerPayment,
  getCustomerPaymentReport,
} = require("../controllers/customerPaymentController");

// Add a new customer payment
router.post("/add", addCustomerPayment);

// Get all customer payments
router.get("/getAll", getCustomerPayments);

// Get a customer payment by ID
router.get("/getSingle/:id", getCustomerPaymentById);

// Update a customer payment by ID
router.put("/update/:id", updateCustomerPayment);

// Delete a customer payment by ID
router.delete("/delete/:id", deleteCustomerPayment);
router.get("/report/:id", getCustomerPaymentReport);

module.exports = router;
