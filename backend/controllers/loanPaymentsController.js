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
      paid: parseFloat(paidAmount),
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
    const {
      paymentId,
      loanId,
      customerId,
      customerName,
      paidAmount, // Payment made in this transaction (installment or loan)
      details,
      paymentDate,
      status, // Can be "installment" or "loan"
    } = req.body;

    console.log("Received request body: ", req.body);

    // Fetch the existing loan payment being edited
    const existingLoanPayment = await LoanPayment.findById(req.params.id);
    if (!existingLoanPayment) {
      return res.status(404).json({ message: "Loan Payment not found" });
    }

    console.log("Existing loan payment: ", existingLoanPayment);

    const previousPaidAmount = existingLoanPayment.paid; // Original paid amount
    const previousRemainingAmount = existingLoanPayment.remaining; // Original remaining amount
    console.log("Previous paid amount: ", previousPaidAmount);
    console.log("Previous remaining amount: ", previousRemainingAmount);

    // After updating the installment, update the main loan record
    const loanPaymentStatusLoan = await LoanPayment.findOne({
      loanId,
      status: "loan",
    });

    // Calculate the new paid and remaining amounts for the installment being edited
    const newPaidAmount = parseFloat(paidAmount);
    let remainingAmount = loanPaymentStatusLoan.remaining - newPaidAmount;

    // Ensure the remaining amount doesn't go below 0
    if (remainingAmount < 0) {
      console.warn(
        `Remaining amount for installment calculated as ${remainingAmount}, adjusting to 0.`
      );
      remainingAmount = 0;
    }

    console.log("New paid amount for installment: ", newPaidAmount);
    console.log(
      "New remaining amount for installment (after validation): ",
      remainingAmount
    );

    // Update the specific installment payment record
    const updatedInstallment = await LoanPayment.findByIdAndUpdate(
      req.params.id,
      {
        paid: newPaidAmount,
        remaining: remainingAmount,
        details: details,
        paymentDate,
        status: "installment", // Keep status as installment
      },
      { new: true, runValidators: true }
    );

    if (!updatedInstallment) {
      console.error("Installment update failed");
      return res.status(500).json({ message: "Installment update failed" });
    }

    console.log("Updated installment payment: ", updatedInstallment);

    if (!loanPaymentStatusLoan) {
      return res.status(404).json({ message: "Main loan payment not found" });
    }

    // Calculate the new total paid and remaining amounts for the loan
    const totalPaidAmount =
      loanPaymentStatusLoan.paid - previousPaidAmount + newPaidAmount;
    let totalRemainingAmount =
      loanPaymentStatusLoan.remaining + previousPaidAmount - newPaidAmount;

    // Ensure the total remaining amount for the loan doesn't go below 0
    if (totalRemainingAmount < 0) {
      console.warn(
        `Total remaining amount for loan calculated as ${totalRemainingAmount}, adjusting to 0.`
      );
      totalRemainingAmount = 0;
    }

    console.log(
      "Loan total paid amount before update: ",
      loanPaymentStatusLoan.paid
    );
    console.log(
      "Loan total remaining amount before update: ",
      loanPaymentStatusLoan.remaining
    );
    console.log("New loan paid amount: ", totalPaidAmount);
    console.log(
      "New loan remaining amount (after validation): ",
      totalRemainingAmount
    );

    // Update the main loan payment record
    const updatedLoan = await LoanPayment.findByIdAndUpdate(
      loanPaymentStatusLoan._id,
      { paid: totalPaidAmount, remaining: totalRemainingAmount },
      { new: true }
    );

    if (!updatedLoan) {
      console.error("Main loan update failed");
      return res.status(500).json({ message: "Main loan update failed" });
    }

    console.log("Updated main loan payment: ", updatedLoan);

    res.status(200).json(updatedInstallment);
  } catch (error) {
    console.error("Error updating loan payment: ", error);
    res.status(400).json({ message: error.message });
  }
};

// exports.updateLoanPayment = async (req, res) => {
//   try {
//     const {
//       paymentId,
//       loanId,
//       customerId,
//       customerName,
//       // totalAmount (not needed for update),
//       paidAmount,
//       details,
//       paymentDate,
//     } = req.body;

//     console.log("request body: ", req.body);

//     const existingLoanPayment = await LoanPayment.findById(req.params.id);
//     if (!existingLoanPayment) {
//       return res.status(404).json({ message: "Loan Payment not found" });
//     }
//     // console.log("existing loan payment: ", existingLoanPayment);
//     // Calculate remaining amount based on updated paid amount
//     const remainingAmount =
//       existingLoanPayment.remaining - parseFloat(paidAmount);

//     const updatedLoanPayment = await LoanPayment.findByIdAndUpdate(
//       req.params.id,
//       {
//         paid: paidAmount,
//         remaining: remainingAmount,
//         details: details,
//         paymentDate,
//       },
//       { new: true, runValidators: true }
//     );

//     if (!updatedLoanPayment) {
//       console.error("Loan payment update failed", error);
//       return res.status(500).json({ message: "Loan payment update failed" });
//     }

//     console.log("updated loan payment: ", updatedLoanPayment);
//     // Update loan "paid" and "remaining" values if loanId matches
//     const loanPaymentStatusLoan = await LoanPayment.find({
//       loanId,
//       status: "loan",
//     });
//     const newPaidAmount =
//       loanPaymentStatusLoan?.paid -
//       existingLoanPayment?.paid +
//       parseFloat(paidAmount);
//     const newRemainingAmount =
//       loanPaymentStatusLoan?.remaining +
//       existingLoanPayment?.paidAmount -
//       parseFloat(paidAmount);
//     const updatedLoan = await LoanPayment.findByIdAndUpdate(
//       loanId,
//       { paid: newPaidAmount, remaining: newRemainingAmount },
//       { new: true } // Return the updated document
//     );

//     // console.log("updated status loan payment: ", updatedLoan); // error found here..

//     if (!updatedLoanPayment || !updatedLoan) {
//       return res.status(500).json({ message: "Update failed" });
//     }

//     res.status(200).json(updatedLoanPayment);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// Delete a loan payment
exports.deleteLoanPayment = async (req, res) => {
  try {
    const loanPayment = await LoanPayment.findById(req.params.id);
    if (!loanPayment || loanPayment.status !== "installment") {
      return res
        .status(404)
        .json({ message: "Loan Payment not found or not an installment" });
    }

    // Find the corresponding customer payment to delete
    const customerPayment = await CustomerPayment.findOne({
      loanId: loanPayment.loanId,
      customerId: loanPayment.customerId,
      status: "installment",
      credit: loanPayment.paid,
    });

    if (!customerPayment) {
      return res.status(404).json({ message: "Customer Payment not found" });
    }

    // Find the original loan record and update its previous paid and remaining amounts
    const loan = await LoanPayment.findOne({
      loanId: loanPayment.loanId,
      status: "loan",
    });

    if (!loan) {
      return res.status(404).json({ message: "Original loan not found" });
    }

    // Revert the paid and remaining amounts
    loan.paid -= loanPayment.paid; // Subtract the paid amount from the original loan
    loan.remaining += loanPayment.paid; // Add the paid amount back to the remaining

    // Save the reverted loan amounts
    await loan.save();

    // Delete the loan payment with status "installment"
    await LoanPayment.findByIdAndDelete(req.params.id);

    // Delete the corresponding customer payment
    await CustomerPayment.findByIdAndDelete(customerPayment._id);

    res.status(200).json({
      message:
        "Loan Payment and Customer Payment deleted, loan updated successfully",
    });
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
