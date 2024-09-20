const Customer = require("../models/customerModel");
const CustomerPayment = require("../models/customerPaymentModel");
const Loan = require("../models/LoanModel");
const LoanPayment = require("../models/LoanPaymentsModel");

// ***************************
//  For Customer Ledger Page
// ***************************

const getCustomerLedger = async (req, res) => {
  const { id: customerId } = req.params;
  try {
    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    console.log(customer);

    // Fetch all loans for the customer
    const loans = await Loan.find({ customerId });

    // Fetch all payments for each loan
    const loanPaymentsPromises = loans.map((loan) =>
      LoanPayment.find({ loanId: loan._id })
    );

    const customerPaymentsPromises = loans.map(
      (loan) => CustomerPayment.find({ loanId: loan._id }) // Fetch installment payments from CustomerPayment
    );

    // const allPayments = await Promise.all(loanPaymentsPromises);

    const allLoanPayments = await Promise.all(loanPaymentsPromises);
    const allCustomerPayments = await Promise.all(customerPaymentsPromises);

    // Separate payments into loanPayments and installmentPayments
    const categorizedPayments = loans.map((loan, index) => {
      const loanPayments = allLoanPayments[index].filter(
        (payment) => payment.status === "loan"
      );
      const installmentPayments = allCustomerPayments[index].filter(
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
        installmentPayments: installmentPayments.map((installment) => ({
          ...installment._doc,
          totalRepayment: loan.totalRepayment, // Add totalRepayment to each installment
        })),
      };
    });

    // Prepare the response
    const report = {
      customer: customer,
      loans: categorizedPayments,
    };

    console.log(report);

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ***************************
//  For Dashboard
// ***************************

// Controller to fetch dashboard data
const getDashboardData = async (req, res) => {
  try {
    // 1. Total Loans Issued (Sum of all loan amounts)
    const totalLoans = await Loan.aggregate([
      { $group: { _id: null, totalLoanAmount: { $sum: "$loanAmount" } } },
    ]);

    // 2. Total Users (Count of customers)
    const totalUsers = await Customer.countDocuments();

    // 3. Monthly Payments (Sum of payments in the current month)
    const currentMonth = new Date().getMonth() + 1; // Current month
    const currentYear = new Date().getFullYear(); // Current year

    const monthlyPayments = await LoanPayment.aggregate([
      {
        $match: {
          status: "installment", // Only include documents where the status is "installment"
          paymentDate: {
            $gte: new Date(`${currentYear}-${currentMonth}-01`),
            $lt: new Date(`${currentYear}-${currentMonth + 1}-01`),
          },
        },
      },
      {
        $group: {
          _id: null,
          totalMonthlyPayments: { $sum: "$paid" }, // Sum of "paid" amounts for the month
        },
      },
    ]);

    // 4. Outstanding Loans (Total remaining balance)
    const outstandingLoans = await LoanPayment.aggregate([
      {
        $match: {
          status: "loan",
        },
      },
      {
        $group: {
          _id: null,
          totalOutstanding: { $sum: "$remaining" }, // Sum of remaining balance for loans
        },
      },
    ]);

    // 5. Total Reports (Assuming reports are based on loan payments made)
    const totalReports = await LoanPayment.countDocuments();

    // Prepare the response data
    const dashboardData = {
      totalLoans: totalLoans.length ? totalLoans[0].totalLoanAmount : 0,
      totalUsers,
      monthlyPayments: monthlyPayments.length
        ? monthlyPayments[0].totalMonthlyPayments
        : 0,
      outstandingLoans: outstandingLoans.length
        ? outstandingLoans[0].totalOutstanding
        : 0,
      totalReports,
    };

    // Send the response
    res.status(200).json(dashboardData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { getCustomerLedger, getDashboardData };
