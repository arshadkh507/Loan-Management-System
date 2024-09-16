const Customer = require("../models/customerModel");
const CustomerPayment = require("../models/customerPaymentModel");
const Loan = require("../models/LoanModel");
const LoanPayment = require("../models/LoanPaymentsModel");

const getCustomerLedger = async (req, res) => {
  const { id: customerId } = req.params;
  try {
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

module.exports = { getCustomerLedger };

/* 
 // Assuming the CustomerPayment model exists
  try {


    // Separate payments into loans and installments
    // const categorizedPayments = loans.map((loan, index) => {
    //   const payments = allPayments[index];
    //   const loanPayments = payments.filter(
    //     (payment) => payment.status === "loan"
    //   );
    //   const installmentPayments = payments.filter(
    //     (payment) => payment.status === "installment"
    //   );
    //   const totalPaid = loanPayments.reduce(
    //     (sum, payment) => sum + payment.paid,
    //     0
    //   );
    //   const totalRemaining = loanPayments.reduce(
    //     (sum, payment) => sum + payment.remaining,
    //     0
    //   );
    
      return {
        ...loan._doc,
        totalPaid,
        totalRemaining,
        loanPayments,
        installmentPayments, // Include fetched installment payments here
      };
    });

    // Prepare the response with customer info and loan details
    const report = {
      customer,
      loans: categorizedPayments,
    };

    // Send the response back to the client
    res.status(200).json(report);

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



*/
