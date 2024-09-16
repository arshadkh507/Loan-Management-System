const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");

// Create a new customer
router.post("/add", customerController.createCustomer);

// Get all customers
router.get("/getAll", customerController.getCustomers);

// Get a specific customer by ID
router.get("/getSingle/:id", customerController.getCustomerById);

// Update a customer by ID
router.put("/update/:id", customerController.updateCustomer);

// Delete a customer by ID
router.delete("/delete/:id", customerController.deleteCustomer);
router.get("/report", customerController.getCustomerReport);

module.exports = router;
