// routes/loanRoutes.js
const Loan = require("../models/LoanModel");
const CustomerPayment = require("../models/customerPaymentModel");
const LoanPayment = require("../models/LoanPaymentsModel");

const getCustomerLoanOverview = async (req, res) => {
  try {
    // Fetch all data related to the customer
    const loans = await Loan.find({ customerId });
    const customerPayments = await CustomerPayment.find({ customerId });
    const loanPayments = await LoanPayment.find({ customerId });

    // Prepare the response
    const response = {
      loans,
      customerPayments,
      loanPayments,
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch data", error });
  }
};
