const Customer = require("../models/customerModel");
const Loan = require("../models/LoanModel");
const LoanPayment = require("../models/LoanPaymentsModel");

// @desc    Get all customers
// @route   GET /api/customers
// @access  Public
const getCustomers = async (req, res) => {
  const customers = await Customer.find().sort({ createdAt: -1 });
  res.json(customers);
};

// @desc    Add a new customer
// @route   POST /api/customers
// @access  Public
const createCustomer = async (req, res) => {
  const { fullName, email, phoneNumber, address, additionalInfo } = req.body;

  try {
    // Check if customer with the given email already exists
    const customerExists = await Customer.findOne({ email });

    if (customerExists) {
      return res
        .status(400)
        .json({ message: "Customer with this email already exists" });
    }

    // Create a new customer if no existing customer with the same email
    const customer = new Customer({
      fullName,
      email,
      phoneNumber,
      address,
      additionalInfo,
    });

    const createdCustomer = await customer.save();
    res.status(201).json(createdCustomer);
  } catch (error) {
    // Handle unexpected errors
    res.status(500).json({
      message: "An error occurred while creating the customer",
      error: error.message,
    });
  }
};

// @desc    Get a customer by ID
// @route   GET /api/customers/:id
// @access  Public
const getCustomerById = async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (customer) {
    res.json(customer);
  } else {
    res.status(404);
    throw new Error("Customer not found");
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Public
const updateCustomer = async (req, res) => {
  const { fullName, email, phoneNumber, address, additionalInfo } = req.body;

  const customer = await Customer.findById(req.params.id);

  if (customer) {
    customer.fullName = fullName || customer.fullName;
    customer.email = email || customer.email;
    customer.phoneNumber = phoneNumber || customer.phoneNumber;
    customer.address = address || customer.address;
    customer.additionalInfo = additionalInfo || customer.additionalInfo;

    const updatedCustomer = await customer.save();
    res.json(updatedCustomer);
  } else {
    res.status(404);
    throw new Error("Customer not found");
  }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Public

// controllers/customerController.js
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCustomerReport = async (req, res) => {
  try {
    // Find customers who have taken at least one loan
    const loanCustomers = await Loan.find().distinct("customerId"); // Fetch distinct customerIds from loans

    // Fetch only those customers who have loans
    const customers = await Customer.find({ _id: { $in: loanCustomers } });

    const customerReports = await Promise.all(
      customers.map(async (customer) => {
        // Fetch the loans for the current customer
        const loans = await Loan.find({ customerId: customer._id });

        // Calculate total loans and loan amount
        const totalLoans = loans.length;
        const totalLoanAmount = loans.reduce(
          (sum, loan) => sum + loan.totalRepayment,
          0
        );

        // Fetch loan payments for the current customer
        const loanPayments = await LoanPayment.find({
          customerId: customer._id,
          status: "loan",
        });

        console.log(loanPayments);

        // Calculate total paid and remaining balance
        const totalPaid = loanPayments.reduce(
          (sum, payment) => sum + payment.paid,
          0
        );

        // console.log(totalPaid);

        const totalRemaining = loanPayments.reduce(
          (sum, payment) => sum + payment.remaining,
          0
        );

        // Return the customer report
        return {
          id: customer._id,
          fullName: customer.fullName,
          email: customer.email,
          phoneNumber: customer.phoneNumber,
          address: customer.address,
          totalLoans,
          totalLoanAmount,
          totalPaid,
          totalRemaining,
        };
      })
    );

    res.status(200).json(customerReports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getCustomers,
  createCustomer,
  getCustomerById,
  getCustomerReport,
  updateCustomer,
  deleteCustomer,
};
