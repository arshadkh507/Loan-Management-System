const express = require("express");
const router = express.Router();
const loanPaymentController = require("../controllers/loanPaymentsController");

// Create a new loan payment
router.post("/add", loanPaymentController.createLoanPayment);

// Get all loan payments
router.get("/getAll", loanPaymentController.getAllLoanPayments);

// Get a single loan payment by ID
router.get("/getSingle/:id", loanPaymentController.getLoanPaymentById);

// Update a loan payment
router.put("/update/:id", loanPaymentController.updateLoanPayment);

// Delete a loan payment
router.delete("/delete/:id", loanPaymentController.deleteLoanPayment);

router.get("/report", loanPaymentController.getLoanPaymentReport);

module.exports = router;
