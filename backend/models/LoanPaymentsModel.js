const mongoose = require("mongoose");

const LoanPaymentSchema = new mongoose.Schema(
  {
    loanId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Loan",
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Customer",
    },
    customerName: {
      type: String,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paid: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    remaining: {
      type: Number,
      required: true,
      min: 0,
    },
    details: {
      type: String,
      required: false,
    },
    paymentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      required: true,
      enum: ["loan", "installment"], // Only "loan" or "installment" are allowed
    },
  },
  {
    timestamps: true,
  }
);
const LoanPayment = mongoose.model("LoanPayment", LoanPaymentSchema);

module.exports = LoanPayment;

//Loan Payment with Status "loan": This represents the primary loan payment record.
//Installment Payments with Status "installment": These represent partial payments or installments towards the loan.
