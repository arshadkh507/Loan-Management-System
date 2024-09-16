const Loan = require("../models/LoanModel");
const LoanPayment = require("../models/LoanPaymentsModel");
const CustomerPayment = require("../models/customerPaymentModel");

// Create a new loan
const createLoan = async (req, res) => {
  try {
    const { customer, ...loanData } = req.body;
    const customerId = customer.value;
    const customerName = customer.label;

    // Create new loan
    const loan = new Loan({
      ...loanData,
      customerId,
      customerName,
    });
    const savedLoan = await loan.save();

    // Create LoanPayment entry
    const loanPayment = new LoanPayment({
      loanId: savedLoan._id,
      customerId: customerId,
      customerName: customerName,
      totalAmount: savedLoan.totalRepayment,
      paid: 0,
      remaining: savedLoan.totalRepayment,
      status: "loan",
    });
    await loanPayment.save();

    // Create CustomerPayment entry
    const customerPayment = new CustomerPayment({
      loanId: savedLoan._id,
      customerId: customerId,
      customerName: customerName,
      credit: 0,
      debit: savedLoan.totalRepayment,
      status: "loan",
    });
    await customerPayment.save();

    res
      .status(201)
      .json({ message: "Loan created successfully", loan: savedLoan });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a loan

const updateLoan = async (req, res) => {
  try {
    // Extract the customer object and other loan data
    const { customer, ...loanData } = req.body;
    const customerId = customer.value; // Extract customerId from customer object

    // Ensure numeric fields are cast to numbers
    loanData.loanAmount = parseFloat(loanData.loanAmount);
    loanData.totalRepayment = parseFloat(loanData.totalRepayment);
    loanData.monthlyRepayment = parseFloat(loanData.monthlyRepayment);

    // Update the loan
    const loan = await Loan.findByIdAndUpdate(
      req.params.id,
      { ...loanData, customerId, customerName: customer.label },
      { new: true }
    );

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    console.log(req.body);
    console.log(req.params.id);
    console.log(loan);

    // Update LoanPayment entry (ensure loan.paid is handled)
    await LoanPayment.updateMany(
      { loanId: req.params.id },
      {
        totalAmount: loan.totalRepayment,
        remaining: loan.totalRepayment - (loan.paid || 0),
      }
    );

    // Update CustomerPayment entry
    await CustomerPayment.updateMany(
      { loanId: req.params.id },
      { debit: loan.totalRepayment }
    );

    res.status(200).json({ message: "Loan updated successfully", loan });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all loans
const getLoans = async (req, res) => {
  try {
    const loans = await Loan.find().sort({ createdAt: -1 });
    res.status(200).json(loans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a loan by ID
const getLoanById = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }
    res.status(200).json(loan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteLoan = async (req, res) => {
  try {
    const loan = await Loan.findByIdAndDelete(req.params.id);
    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    console.log("Loan ", loan);
    console.log("Loan Id ", req.params.id);

    // Delete associated LoanPayments
    await LoanPayment.deleteMany({ loanId: req.params.id });

    // Delete associated CustomerPayments
    await CustomerPayment.deleteMany({ loanId: req.params.id });

    res
      .status(200)
      .json({ message: "Loan and associated payments deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createLoan,
  updateLoan,
  getLoans,
  getLoanById,
  deleteLoan,
};
