const Loan = require("../models/LoanModel");
const LoanPayment = require("../models/LoanPaymentsModel");
const CustomerPayment = require("../models/customerPaymentModel");

// Create a new loan
const createLoan = async (req, res) => {
  try {
    const {
      loanAmount,
      interestRate,
      startDate,
      endDate,
      additionalInfo,
      customer,
      duration,
      totalRepayment,
      monthlyRepayment,
    } = req.body;
    // console.log(customerId);
    const customerId = customer.value;
    console.log(req.body);
    // Create new loan
    const loan = new Loan({
      loanAmount,
      interestRate,
      startDate,
      endDate,
      additionalInfo,
      customerId,
      duration,
      totalRepayment,
      monthlyRepayment,
    });
    const savedLoan = await loan.save();

    // Create LoanPayment entry
    const loanPayment = new LoanPayment({
      loanId: savedLoan._id,
      customerId: customerId,
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
      loanPaymentId: loanPayment._id,
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
    // Extract loan data directly from request body
    const { customer, ...loanData } = req.body;
    console.log("what I am receiving:", req.body);

    const customerId = customer.value;

    // Ensure numeric fields are cast to numbers
    loanData.loanAmount = parseFloat(loanData.loanAmount);
    loanData.totalRepayment = parseFloat(loanData.totalRepayment);
    loanData.monthlyRepayment = parseFloat(loanData.monthlyRepayment);

    // Update the loan
    const loan = await Loan.findByIdAndUpdate(
      req.params.id,
      { ...loanData, customerId },
      { new: true }
    );

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    // Fetch the LoanPayment entry to get the paid amount
    const loanPayment = await LoanPayment.findOne({
      loanId: req.params.id,
      status: "loan",
    });

    if (!loanPayment) {
      return res.status(404).json({ message: "LoanPayment not found" });
    }

    await LoanPayment.updateOne(
      { loanId: req.params.id, status: "loan" },
      {
        totalAmount: loan.totalRepayment,
        remaining: loan.totalRepayment - (loanPayment.paid || 0), // Use the paid amount from the fetched loanPayment
      }
    );

    // Update CustomerPayment entry
    await CustomerPayment.updateOne(
      { loanId: req.params.id, status: "loan" },
      {
        debit: loan.totalRepayment,
      }
    );

    res.status(200).json({ message: "Loan updated successfully", loan });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all loans
const getLoans = async (req, res) => {
  try {
    const loans = await Loan.find()
      .sort({ createdAt: -1 })
      .populate("customerId", "fullName email phoneNumber address"); // Populate with specific fields from Customer
    res.status(200).json(loans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a loan by ID
const getLoanById = async (req, res) => {
  try {
    // Find the loan by ID and populate the customerId with customer details
    const loan = await Loan.findById(req.params.id).populate("customerId");
    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }
    console.log("loan to sent ui, ", loan);
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
