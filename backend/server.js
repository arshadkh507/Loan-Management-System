const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const customerRoutes = require("./routes/customerRoutes");
const loanRoutes = require("./routes/loanRoutes");
const loanPaymentsRoutes = require("./routes/loanPaymentsRoutes");
const customerPaymentRoutes = require("./routes/customerPaymentRoutes");

const app = express();
dotenv.config();

connectDB();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173", // Fallback to default
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use("/api/customers", customerRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/loanPayments", loanPaymentsRoutes);
app.use("/api/customerPayments", customerPaymentRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
