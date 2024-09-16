// src/models/customerPaymentModel.js
const mongoose = require("mongoose");

const customerPaymentSchema = new mongoose.Schema({
  loanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Loan",
    required: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  credit: {
    type: Number,
    default: 0,
  },
  debit: {
    type: Number,
    default: 0,
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  details: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    required: true,
    enum: ["loan", "installment"],
  },
});

const CustomerPayment = mongoose.model(
  "CustomerPayment",
  customerPaymentSchema
);

module.exports = CustomerPayment;
