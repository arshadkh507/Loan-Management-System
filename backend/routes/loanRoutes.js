const express = require("express");
const {
  createLoan,
  getLoans,
  getLoanById,
  updateLoan,
  deleteLoan,
} = require("../controllers/loanController");
const { getCustomerLedger } = require("../controllers/loanReports");

const router = express.Router();

// Loan routes
router.post("/add", createLoan);
router.get("/getAll", getLoans);
// router.get("/getSignle/:id", getLoanById);
router.get("/getSingle/:id", getLoanById);
router.put("/update/:id", updateLoan);
router.delete("/delete/:id", deleteLoan);
router.get("/report/customer-ledger/:id", getCustomerLedger);

module.exports = router;
