const LoanPayment = require("../models/LoanPaymentsModel");
const LoanModel = require("../models/LoanModel"); // Import Loan Model
const CustomerPayment = require("../models/customerPaymentModel");

// Create a new loan payment and update the loan amounts
exports.createLoanPayment = async (req, res) => {
  try {
    const {
      paymentId,
      loanId,
      customerId,
      customerName,
      totalAmount,
      paidAmount,
      details,
      paymentDate,
    } = req.body;

    const loanPayment = await LoanPayment.findById(paymentId);
    if (!loanPayment) {
      return res.status(404).json({ message: "Loan Payment not found" });
    }
    // Calculate updated paid and remaining amounts
    const newPaidAmount = loanPayment.paid + parseFloat(paidAmount);
    const newRemainingAmount = loanPayment.remaining - parseFloat(paidAmount);

    const newLoanPayment = new LoanPayment({
      loanId,
      customerId,
      customerName,
      totalAmount: totalAmount,
      paid: newPaidAmount,
      remaining: newRemainingAmount,
      details,
      paymentDate,
      status: "installment",
    });

    const savedLoanPayment = await newLoanPayment.save();

    // Create a corresponding customer payment
    const newCustomerPayment = new CustomerPayment({
      loanId,
      customerId,
      customerName,
      credit: parseFloat(paidAmount),
      debit: newRemainingAmount,
      details,
      paymentDate,
      status: "installment",
    });

    await newCustomerPayment.save();

    const updatedLoanPayment = await LoanPayment.findByIdAndUpdate(
      paymentId,
      {
        $set: {
          paid: newPaidAmount,
          remaining: newRemainingAmount,
        },
      },
      { new: true } // This option returns the updated document
    );

    if (!updatedLoanPayment) {
      throw new Error("Loan Payment not found");
    }

    res.status(201).json({
      message: "Loan payment created successfully!",
      loanPayment: savedLoanPayment,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all loan payments
exports.getAllLoanPayments = async (req, res) => {
  try {
    const loanPayments = await LoanPayment.find().sort({ createdAt: -1 });
    res.status(200).json(loanPayments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single loan payment by ID
exports.getLoanPaymentById = async (req, res) => {
  try {
    const loanPayment = await LoanPayment.findById(req.params.id);
    if (!loanPayment) {
      return res.status(404).json({ message: "Loan Payment not found" });
    }
    res.status(200).json(loanPayment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a loan payment
exports.updateLoanPayment = async (req, res) => {
  try {
    const { updatePayment } = req.body;

    const updatedLoanPayment = await LoanPayment.findByIdAndUpdate(
      req.params.id,
      updatePayment,
      { new: true, runValidators: true }
    );

    if (!updatedLoanPayment) {
      return res.status(404).json({ message: "Loan Payment not found" });
    }

    res.status(200).json(updatedLoanPayment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a loan payment
exports.deleteLoanPayment = async (req, res) => {
  try {
    const loanPayment = await LoanPayment.findByIdAndDelete(req.params.id);
    if (!loanPayment) {
      return res.status(404).json({ message: "Loan Payment not found" });
    }
    res.status(200).json({ message: "Loan Payment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLoanPaymentReport = async (req, res) => {
  try {
    // Fetch loan payments where status is "loan" and populate customer and loan details
    const loanPayments = await LoanPayment.find({ status: "loan" }) // Filter payments with status "loan"
      .populate("customerId", "fullName email") // Populate customer details
      .populate(
        "loanId",
        "loanAmount interestRate duration totalRepayment monthlyRepayment startDate endDate"
      ) // Populate loan details
      .sort({ createdAt: -1 });

    res.status(200).json(loanPayments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
