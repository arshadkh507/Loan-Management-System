// src/App.js
import { Routes, Route } from "react-router-dom";
import NotFound from "./components/NotFound/NotFound";
import Layout from "./layout/Layout";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import AddLoan from "./pages/AddLoan/AddLoan";
import AddCustomer from "./pages/AddCustomer/AddCustomer";
import LoanDetails from "./pages/LoanDetails/LoanDetails";
import CustomerDetails from "./pages/CustomerDetails/CustomerDetails";
import AddLoanPayment from "./pages/payments/AddLoanPayment";
import LoanPayment from "./pages/payments/LoanPayment";
import LoanPaymentsDetails from "./pages/payments/LoanPaymentsDetails";
import CustomerReport from "./pages/reports/CustomerReport";
import LoanReport from "./pages/reports/loanReport";
import SingleCustomerReport from "./pages/reports/SingleCustomerReport";
import CustomerLedger from "./pages/reports/CustomerLedger";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <DashboardPage />
            </Layout>
          }
        />
        <Route
          path="/loans/add"
          element={
            <Layout>
              <AddLoan />
            </Layout>
          }
        />
        <Route
          path="/loans/details"
          element={
            <Layout>
              <LoanDetails />
            </Layout>
          }
        />
        <Route
          path="/loans/details/:id"
          element={
            <Layout>
              <LoanDetails />
            </Layout>
          }
        />
        <Route
          path="/customers/add"
          element={
            <Layout>
              <AddCustomer />
            </Layout>
          }
        />
        {/* Route for editing a customer */}
        <Route
          path="/customers/edit/:id"
          element={
            <Layout>
              <AddCustomer />
            </Layout>
          }
        />
        <Route
          path="/loan/edit/:id"
          element={
            <Layout>
              <AddLoan />
            </Layout>
          }
        />
        <Route
          path="/customers/details"
          element={
            <Layout>
              <CustomerDetails />
            </Layout>
          }
        />
        <Route
          path="/loan-payments"
          element={
            <Layout>
              <LoanPayment />
            </Layout>
          }
        />
        <Route
          path="/loan-payments/details"
          element={
            <Layout>
              <LoanPaymentsDetails />
            </Layout>
          }
        />
        <Route
          path="/loan-payments/add/:id"
          element={
            <Layout>
              <AddLoanPayment />
            </Layout>
          }
        />
        <Route
          path="/loan-payments/edit/:id"
          element={
            <Layout>
              <AddLoanPayment />
            </Layout>
          }
        />
        <Route
          path="/reports/customer-report"
          element={
            <Layout>
              <CustomerReport />
            </Layout>
          }
        />
        <Route
          path="/reports/loan-report"
          element={
            <Layout>
              <LoanReport />
            </Layout>
          }
        />
        <Route
          path="/reports/single-customer-report"
          element={
            <Layout>
              <SingleCustomerReport />
            </Layout>
          }
        />
        <Route
          path="/reports/single-customer-ledger"
          element={
            <Layout>
              <CustomerLedger />
            </Layout>
          }
        />
        <Route
          path="/reports/single-customer-report/:id"
          element={
            <Layout>
              <SingleCustomerReport />
            </Layout>
          }
        />

        <Route
          path="*"
          element={
            <Layout>
              <NotFound />
            </Layout>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
