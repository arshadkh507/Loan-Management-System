// src/controllers/customerPaymentController.js
const Customer = require("../models/customerModel");
const CustomerPayment = require("../models/customerPaymentModel");
const Loan = require("../models/LoanModel");
const LoanPayment = require("../models/LoanPaymentsModel");

// Add a new customer payment
const addCustomerPayment = async (req, res) => {
  try {
    const {
      loanId,
      customerId,
      customerName,
      credit,
      debit,
      date,
      details,
      status,
    } = req.body;

    const newPayment = new CustomerPayment({
      loanId,
      customerId,
      customerName,
      credit,
      debit,
      date,
      details,
      status, // Add status here
    });

    const savedPayment = await newPayment.save();
    res.status(201).json(savedPayment);
  } catch (error) {
    res.status(500).json({ message: "Error adding payment", error });
  }
};

// Get all customer payments
const getCustomerPayments = async (req, res) => {
  try {
    // const payments = await CustomerPayment.find().populate("loanId customerId");
    const payments = await CustomerPayment.find().sort({ createdAt: -1 });
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payments", error });
  }
};

// Get a single customer payment by ID
const getCustomerPaymentById = async (req, res) => {
  try {
    const payment = await CustomerPayment.findById(req.params.id).populate(
      "loanId customerId"
    );

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payment", error });
  }
};

// Update a customer payment
const updateCustomerPayment = async (req, res) => {
  try {
    const { loanId, customerId, credit, debit, date, details, status } =
      req.body;

    const updatedPayment = await CustomerPayment.findByIdAndUpdate(
      req.params.id,
      { loanId, customerId, credit, debit, date, details, status }, // Update with status
      { new: true }
    );

    if (!updatedPayment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.status(200).json(updatedPayment);
  } catch (error) {
    res.status(500).json({ message: "Error updating payment", error });
  }
};

// Delete a customer payment
const deleteCustomerPayment = async (req, res) => {
  try {
    const deletedPayment = await CustomerPayment.findByIdAndDelete(
      req.params.id
    );

    if (!deletedPayment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.status(200).json({ message: "Payment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting payment", error });
  }
};

const getCustomerPaymentReport = async (req, res) => {
  const { id: customerId } = req.params;
  try {
    console.log(customerId);
    // Fetch customer details
    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Fetch all loans for the customer
    const loans = await Loan.find({ customerId });

    // Fetch all payments for each loan
    const loanPaymentsPromises = loans.map((loan) =>
      LoanPayment.find({ loanId: loan._id })
    );

    const allPayments = await Promise.all(loanPaymentsPromises);

    // Separate payments into loans and installments
    const categorizedPayments = loans.map((loan, index) => {
      const payments = allPayments[index];
      const loanPayments = payments.filter(
        (payment) => payment.status === "loan"
      );
      const installmentPayments = payments.filter(
        (payment) => payment.status === "installment"
      );
      const totalPaid = loanPayments.reduce(
        (sum, payment) => sum + payment.paid,
        0
      );
      const totalRemaining = loanPayments.reduce(
        (sum, payment) => sum + payment.remaining,
        0
      );

      return {
        ...loan._doc,
        totalPaid,
        totalRemaining,
        loanPayments,
        installmentPayments,
      };
    });

    // Prepare the response
    const report = {
      customer: {
        fullName: customer.fullName,
        email: customer.email,
        phoneNumber: customer.phoneNumber,
        address: customer.address,
      },
      loans: categorizedPayments,
    };

    console.log(report);

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  addCustomerPayment,
  getCustomerPayments,
  getCustomerPaymentById,
  getCustomerPaymentReport,
  updateCustomerPayment,
  deleteCustomerPayment,
};
