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
      customer: {
        ...customer._doc,
        createdAt: customer.createdAt,
      },
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

// ***************************
//  Loan Summaray Single Customers
// ***************************

const getLoanSummaryByCustomerId = async (req, res) => {
  const currentDate = new Date();
  const { customerId } = req.params;

  try {
    // Fetch the customer
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Fetch the loans for this customer
    const loans = await Loan.find({ customerId });
    if (loans.length === 0) {
      return res
        .status(404)
        .json({ message: "No loans found for this customer" });
    }

    // Initialize an array to store summaries for this customer's loans
    const customerLoanSummaries = [];

    // Loop through each loan and generate its summary
    for (const loan of loans) {
      // Fetch payments made for this loan
      const loanPayments = await LoanPayment.find({
        loanId: loan._id,
        status: "installment",
      }).sort({ paymentDate: 1 });

      const totalMonths = loan.duration;
      const monthlyRepayment = loan.monthlyRepayment;

      // Calculate the total paid amount for the loan
      const loanTotalPaidDoc = await LoanPayment.findOne({
        loanId: loan._id,
        status: "loan",
      });
      const totalPaidAmount = loanTotalPaidDoc ? loanTotalPaidDoc.paid : 0;

      let status = {
        totalDue: 0,
        paid: 0,
        overdue: 0,
        overdueAmount: 0,
      };

      const loanDetails = {
        loanId: loan,
        totalPaid: totalPaidAmount.toFixed(2),
        remaining: (loan.totalRepayment - totalPaidAmount).toFixed(2),
        installments: [],
      };

      let carryOver = 0; // To carry over excess payments
      let overduePayments = []; // Array to hold overdue months

      // Loop through each month
      for (let month = 0; month < totalMonths; month++) {
        const installmentStart = new Date(loan.startDate);
        installmentStart.setMonth(installmentStart.getMonth() + month);
        const dueDate = new Date(installmentStart);
        dueDate.setMonth(installmentStart.getMonth() + 1);

        // Check payments falling within this period
        let paidAmountThisMonth = loanPayments
          .filter((payment) => {
            const paymentDate = new Date(payment.paymentDate);
            return paymentDate >= installmentStart && paymentDate < dueDate;
          })
          .reduce((total, payment) => total + payment.paid, 0);

        paidAmountThisMonth += carryOver; // Add carryover from the previous month

        // Determine remaining amount for this month
        let remainingThisMonth = monthlyRepayment - paidAmountThisMonth;

        // Check for overdue payment
        if (currentDate > dueDate && remainingThisMonth > 0) {
          overduePayments.push({
            month: installmentStart,
            amountDue: remainingThisMonth,
          });
        }

        // Handle payments and statuses
        if (paidAmountThisMonth >= monthlyRepayment) {
          // Case 1: Full payment or overpayment
          loanDetails.installments.push({
            month:
              installmentStart.toLocaleString("default", { month: "long" }) +
              " " +
              installmentStart.getFullYear(),
            status: "Paid",
            paidAmount: monthlyRepayment.toFixed(2),
            remainingAmount: 0,
            dueDate: dueDate.toISOString().split("T")[0],
          });
          status.paid += 1;

          // Determine how to use the carry over
          carryOver = paidAmountThisMonth - monthlyRepayment;

          // // Cover overdue payments first
          // while (carryOver > 0 && overduePayments.length > 0) {
          //   const overduePayment = overduePayments[0];
          //   if (carryOver >= overduePayment.amountDue) {
          //     carryOver -= overduePayment.amountDue;
          //     overduePayments.shift(); // Remove the covered overdue payment
          //     status.overdue += 1; // Count this as covered overdue
          //   } else {
          //     overduePayment.amountDue -= carryOver;
          //     carryOver = 0; // All carry over used
          //   }
          // }

          // Cover overdue payments first
          while (carryOver > 0 && overduePayments.length > 0) {
            const overduePayment = overduePayments[0]; // Get the first overdue payment

            if (carryOver >= overduePayment.amountDue) {
              // Case 1: CarryOver is enough to fully cover this overdue payment
              carryOver -= overduePayment.amountDue; // Subtract overdue amount from carryOver

              // Find the installment corresponding to this overdue payment's month and update it
              const overdueInstallment = loanDetails.installments.find(
                (installment) =>
                  new Date(installment.month).getTime() ===
                  overduePayment.month.getTime()
              );

              if (overdueInstallment) {
                overdueInstallment.status = "Paid"; // Update status to Paid
                overdueInstallment.paidAmount = monthlyRepayment.toFixed(2); // Mark it as fully paid
                overdueInstallment.remainingAmount = "0.00"; // No remaining amount
              }

              overduePayments.shift(); // Remove the fully paid overdue payment from the array
              status.overdue += 1; // Mark the overdue payment as fully paid in the status
            } else {
              // Case 2: CarryOver is not enough to fully cover the overdue payment
              overduePayment.amountDue -= carryOver; // Reduce the overdue amount by the carryOver

              // Find the installment corresponding to this overdue payment's month and update it
              const overdueInstallment = loanDetails.installments.find(
                (installment) =>
                  new Date(installment.month).getTime() ===
                  overduePayment.month.getTime()
              );

              if (overdueInstallment) {
                overdueInstallment.status = "Pending - Partially Paid"; // Mark the installment as partially paid
                overdueInstallment.paidAmount = (
                  monthlyRepayment - overduePayment.amountDue
                ).toFixed(2); // Update paid amount
                overdueInstallment.remainingAmount =
                  overduePayment.amountDue.toFixed(2); // Update remaining amount
              }

              carryOver = 0; // All of the carryOver is used up
            }
          }
        } else if (paidAmountThisMonth > 0 && currentDate <= dueDate) {
          // Case 2: Partial payment, but within the due date
          loanDetails.installments.push({
            month:
              installmentStart.toLocaleString("default", { month: "long" }) +
              " " +
              installmentStart.getFullYear(),
            status: "Pending - Partially Paid",
            paidAmount: paidAmountThisMonth.toFixed(2),
            remainingAmount: remainingThisMonth.toFixed(2),
            dueDate: dueDate.toISOString().split("T")[0],
          });
          status.totalDue += 1;
          carryOver = 0; // No carryover for partial payment
        } else if (currentDate > dueDate) {
          // Case 3: Overdue
          loanDetails.installments.push({
            month:
              installmentStart.toLocaleString("default", { month: "long" }) +
              " " +
              installmentStart.getFullYear(),
            status: "Overdue",
            paidAmount: paidAmountThisMonth.toFixed(2),
            remainingAmount: remainingThisMonth.toFixed(2),
            dueDate: dueDate.toISOString().split("T")[0],
          });
          status.overdue += 1;
          status.overdueAmount += remainingThisMonth;
          carryOver = 0; // No carryover for overdue months
        } else {
          // Case 4: Pending (before payment is due)
          loanDetails.installments.push({
            month:
              installmentStart.toLocaleString("default", { month: "long" }) +
              " " +
              installmentStart.getFullYear(),
            status: "Pending",
            paidAmount: paidAmountThisMonth.toFixed(2),
            remainingAmount: remainingThisMonth.toFixed(2),
            dueDate: dueDate.toISOString().split("T")[0],
          });
          status.totalDue += 1;
          carryOver = 0; // No carryover for pending months
        }
      }

      // Finalize the loan details for response
      customerLoanSummaries.push({
        customer,
        loanDetails,
        status,
      });
    }

    // Return the final summary for the specified customer's loans
    res.status(200).json({
      loans: customerLoanSummaries,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// const getLoanSummaryByCustomerId = async (req, res) => {
//   const currentDate = new Date();
//   const { customerId } = req.params;

//   try {
//     // Fetch the customer
//     const customer = await Customer.findById(customerId);
//     if (!customer) {
//       return res.status(404).json({ message: "Customer not found" });
//     }

//     // Fetch the loans for this customer
//     const loans = await Loan.find({ customerId });
//     if (loans.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No loans found for this customer" });
//     }

//     // Initialize an array to store summaries for this customer's loans
//     const customerLoanSummaries = [];

//     // Loop through each loan and generate its summary
//     for (const loan of loans) {
//       // Fetch payments made for this loan
//       const loanPayments = await LoanPayment.find({
//         loanId: loan._id,
//         status: "installment",
//       }).sort({ paymentDate: 1 });

//       const totalMonths = loan.duration;
//       const monthlyRepayment = loan.monthlyRepayment;

//       // Calculate the total paid amount for the loan
//       const loanTotalPaidDoc = await LoanPayment.findOne({
//         loanId: loan._id,
//         status: "loan",
//       });
//       const totalPaidAmount = loanTotalPaidDoc ? loanTotalPaidDoc.paid : 0;

//       let status = {
//         totalDue: 0,
//         paid: 0,
//         overdue: 0,
//         overdueAmount: 0,
//       };

//       const loanDetails = {
//         loanId: loan,
//         totalPaid: totalPaidAmount.toFixed(2),
//         remaining: (loan.totalRepayment - totalPaidAmount).toFixed(2),
//         installments: [],
//       };

//       let carryOver = 0; // To carry over excess payments
//       let overduePayments = []; // Array to hold overdue months

//       // Loop through each month
//       for (let month = 0; month < totalMonths; month++) {
//         const paymentMonth = new Date(loan.startDate);
//         paymentMonth.setMonth(paymentMonth.getMonth() + month);
//         const dueDate = new Date(loan.startDate);
//         dueDate.setMonth(dueDate.getMonth() + month + 1);
//         dueDate.setDate(loan.startDate.getDate());

//         // Filter payments for this month
//         let paidAmountThisMonth = loanPayments
//           .filter((payment) => {
//             const paymentDate = new Date(payment.paymentDate);
//             return (
//               paymentDate.getFullYear() === paymentMonth.getFullYear() &&
//               paymentDate.getMonth() === paymentMonth.getMonth()
//             );
//           })
//           .reduce((total, payment) => total + payment.paid, 0);

//         paidAmountThisMonth += carryOver; // Add carryover from the previous month

//         // Determine remaining amount for this month
//         let remainingThisMonth = monthlyRepayment - paidAmountThisMonth;

//         // Check for overdue payment
//         if (currentDate > dueDate && remainingThisMonth > 0) {
//           overduePayments.push({
//             month: paymentMonth,
//             amountDue: remainingThisMonth,
//           });
//         }

//         // Handle payments
//         if (paidAmountThisMonth >= monthlyRepayment) {
//           // Case 1: Full payment or overpayment
//           loanDetails.installments.push({
//             month:
//               paymentMonth.toLocaleString("default", { month: "long" }) +
//               " " +
//               paymentMonth.getFullYear(),
//             status: "Paid",
//             paidAmount: monthlyRepayment.toFixed(2),
//             remainingAmount: 0,
//             dueDate: dueDate.toISOString().split("T")[0],
//           });
//           status.paid += 1;

//           // Determine how to use the carry over
//           carryOver = paidAmountThisMonth - monthlyRepayment;

//           // Cover overdue payments first
//           while (carryOver > 0 && overduePayments.length > 0) {
//             const overduePayment = overduePayments[0];
//             if (carryOver >= overduePayment.amountDue) {
//               carryOver -= overduePayment.amountDue;
//               overduePayments.shift(); // Remove the covered overdue payment
//               status.overdue += 1; // Count this as covered overdue
//             } else {
//               overduePayment.amountDue -= carryOver;
//               carryOver = 0; // All carry over used
//             }
//           }
//         } else if (
//           paidAmountThisMonth > 0 &&
//           currentDate >= paymentMonth &&
//           currentDate < dueDate
//         ) {
//           // Case 2: Partial payment, but within the due date
//           loanDetails.installments.push({
//             month:
//               paymentMonth.toLocaleString("default", { month: "long" }) +
//               " " +
//               paymentMonth.getFullYear(),
//             status: "Pending - Partially Paid",
//             paidAmount: paidAmountThisMonth.toFixed(2),
//             remainingAmount: remainingThisMonth.toFixed(2),
//             dueDate: dueDate.toISOString().split("T")[0],
//           });
//           status.totalDue += 1;
//           carryOver = 0; // No carryover for partial payment
//         } else if (currentDate > dueDate) {
//           // Case 3: Overdue
//           loanDetails.installments.push({
//             month:
//               paymentMonth.toLocaleString("default", { month: "long" }) +
//               " " +
//               paymentMonth.getFullYear(),
//             status: "Overdue",
//             paidAmount: paidAmountThisMonth.toFixed(2),
//             remainingAmount: remainingThisMonth.toFixed(2),
//             dueDate: dueDate.toISOString().split("T")[0],
//           });
//           status.overdue += 1;
//           status.overdueAmount += remainingThisMonth;
//           carryOver = 0; // No carryover for overdue months
//         } else {
//           // Case 4: Pending (before payment is due)
//           loanDetails.installments.push({
//             month:
//               paymentMonth.toLocaleString("default", { month: "long" }) +
//               " " +
//               paymentMonth.getFullYear(),
//             status: "Pending",
//             paidAmount: paidAmountThisMonth.toFixed(2),
//             remainingAmount: remainingThisMonth.toFixed(2),
//             dueDate: dueDate.toISOString().split("T")[0],
//           });
//           status.totalDue += 1;
//           carryOver = 0; // No carryover for pending months
//         }
//       }

//       // Finalize the loan details for response
//       customerLoanSummaries.push({
//         customer,
//         loanDetails,
//         status,
//       });
//     }

//     // Return the final summary for the specified customer's loans
//     res.status(200).json({
//       loans: customerLoanSummaries,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// ! First Priority
// const getLoanSummaryByCustomerId = async (req, res) => {
//   const currentDate = new Date();
//   const { customerId } = req.params;
//   try {
//     // Fetch the customer
//     const customer = await Customer.findById(customerId);

//     if (!customer) {
//       return res.status(404).json({ message: "Customer not found" });
//     }

//     // Fetch the loans for this customer
//     const loans = await Loan.find({ customerId });

//     if (loans.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No loans found for this customer" });
//     }

//     // Initialize an array to store summaries for this customer's loans
//     const customerLoanSummaries = [];

//     // Loop through each loan and generate its summary
//     for (const loan of loans) {
//       // Fetch payments made for this loan
//       const loanPayments = await LoanPayment.find({
//         loanId: loan._id,
//         status: "installment",
//       }).sort({ paymentDate: 1 });

//       const totalMonths = loan.duration;
//       const monthlyRepayment = loan.monthlyRepayment;

//       // Calculate the total paid amount for the loan
//       const loanTotalPaidDoc = await LoanPayment.findOne({
//         loanId: loan._id,
//         status: "loan",
//       });
//       const totalPaidAmount = loanTotalPaidDoc ? loanTotalPaidDoc.paid : 0;

//       let status = {
//         totalDue: 0,
//         paid: 0,
//         overdue: 0,
//         overdueAmount: 0,
//       };

//       const loanDetails = {
//         loanId: loan._id,
//         loanAmount: loan.loanAmount.toFixed(2),
//         totalRepayment: loan.totalRepayment.toFixed(2),
//         totalPaid: totalPaidAmount.toFixed(2),
//         monthlyRepayment: loan.monthlyRepayment.toFixed(2),
//         remaining: (loan.totalRepayment - totalPaidAmount).toFixed(2),
//         installments: [],
//       };

//       // Tracking overpaid amount to carry forward
//       let carryOver = 0;

//       // Loop through each month
//       for (let month = 0; month < totalMonths; month++) {
//         const paymentMonth = new Date(loan.startDate);
//         paymentMonth.setMonth(paymentMonth.getMonth() + month);
//         const dueDate = new Date(loan.startDate);
//         dueDate.setMonth(dueDate.getMonth() + month + 1);
//         dueDate.setDate(loan.startDate.getDate());

//         // Filter payments for this month
//         let paidAmountThisMonth = loanPayments
//           .filter((payment) => {
//             const paymentDate = new Date(payment.paymentDate);
//             return (
//               paymentDate.getFullYear() === paymentMonth.getFullYear() &&
//               paymentDate.getMonth() === paymentMonth.getMonth()
//             );
//           })
//           .reduce((total, payment) => total + payment.paid, 0);

//         paidAmountThisMonth += carryOver; // Add carryover from the previous month

//         // Determine remaining amount for this month
//         let remainingThisMonth = monthlyRepayment - paidAmountThisMonth;

//         // Handle different cases based on the amount paid and the current date
//         if (paidAmountThisMonth >= monthlyRepayment) {
//           // Case 1: Full payment or overpayment
//           loanDetails.installments.push({
//             month:
//               paymentMonth.toLocaleString("default", { month: "long" }) +
//               " " +
//               paymentMonth.getFullYear(),
//             status: "Paid",
//             paidAmount: monthlyRepayment.toFixed(2),
//             remainingAmount: 0,
//             dueDate: dueDate.toISOString().split("T")[0],
//           });
//           status.paid += 1;

//           // Carry over the excess amount to the next month
//           carryOver = paidAmountThisMonth - monthlyRepayment;
//         } else if (
//           paidAmountThisMonth > 0 &&
//           currentDate >= paymentMonth &&
//           currentDate < dueDate
//         ) {
//           // Case 2: Partial payment, but within the due date
//           loanDetails.installments.push({
//             month:
//               paymentMonth.toLocaleString("default", { month: "long" }) +
//               " " +
//               paymentMonth.getFullYear(),
//             status: "Pending - Partially Paid",
//             paidAmount: paidAmountThisMonth.toFixed(2),
//             remainingAmount: remainingThisMonth.toFixed(2),
//             dueDate: dueDate.toISOString().split("T")[0],
//           });
//           status.totalDue += 1;
//           carryOver = 0; // No carryover for partial payment
//         } else if (currentDate > dueDate) {
//           // Case 3: Overdue
//           loanDetails.installments.push({
//             month:
//               paymentMonth.toLocaleString("default", { month: "long" }) +
//               " " +
//               paymentMonth.getFullYear(),
//             status: "Overdue",
//             paidAmount: paidAmountThisMonth.toFixed(2),
//             remainingAmount: remainingThisMonth.toFixed(2),
//             dueDate: dueDate.toISOString().split("T")[0],
//           });
//           status.overdue += 1;
//           status.overdueAmount += remainingThisMonth;
//           carryOver = 0; // No carryover for overdue months
//         } else {
//           // Case 4: Pending (before payment is due)
//           loanDetails.installments.push({
//             month:
//               paymentMonth.toLocaleString("default", { month: "long" }) +
//               " " +
//               paymentMonth.getFullYear(),
//             status: "Pending",
//             paidAmount: paidAmountThisMonth.toFixed(2),
//             remainingAmount: remainingThisMonth.toFixed(2),
//             dueDate: dueDate.toISOString().split("T")[0],
//           });
//           status.totalDue += 1;
//           carryOver = 0; // No carryover for pending months
//         }
//       }

//       // Finalize the loan details for response
//       customerLoanSummaries.push({
//         customer,
//         loanDetails,
//         status,
//       });
//     }

//     // Return the final summary for the specified customer's loans
//     res.status(200).json({
//       loans: customerLoanSummaries,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// const getLoanSummaryByCustomerId = async (req, res) => {
//   const currentDate = new Date();
//   const { customerId } = req.params;
//   try {
//     // Fetch the customer
//     const customer = await Customer.findById(customerId);

//     if (!customer) {
//       return res.status(404).json({ message: "Customer not found" });
//     }

//     // Fetch the loans for this customer
//     const loans = await Loan.find({ customerId });

//     if (loans.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No loans found for this customer" });
//     }

//     // Initialize an array to store summaries for this customer's loans
//     const customerLoanSummaries = [];

//     // Loop through each loan and generate its summary
//     for (const loan of loans) {
//       // Fetch payments made for this loan
//       const loanPayments = await LoanPayment.find({
//         loanId: loan._id,
//         status: "installment",
//       }).sort({ paymentDate: 1 });

//       const totalMonths = loan.duration;
//       const monthlyRepayment = loan.monthlyRepayment;

//       // Calculate the total paid amount for the loan
//       const loanTotalPaidDoc = await LoanPayment.findOne({
//         loanId: loan._id,
//         status: "loan",
//       });
//       const totalPaidAmount = loanTotalPaidDoc ? loanTotalPaidDoc.paid : 0;

//       let status = {
//         totalDue: 0,
//         paid: 0,
//         overdue: 0,
//         overdueAmount: 0,
//       };

//       const loanDetails = {
//         loanId: loan._id,
//         loanAmount: loan.loanAmount.toFixed(2),
//         totalRepayment: loan.totalRepayment.toFixed(2),
//         totalPaid: totalPaidAmount.toFixed(2),
//         monthlyRepayment: loan.monthlyRepayment.toFixed(2),
//         remaining: (loan.totalRepayment - totalPaidAmount).toFixed(2),
//         installments: [],
//       };

//       // Check if the loan has been fully paid
//       if (totalPaidAmount >= loan.totalRepayment) {
//         // Mark all months as Paid
//         for (let month = 0; month < totalMonths; month++) {
//           const paymentMonth = new Date(loan.startDate);
//           paymentMonth.setMonth(paymentMonth.getMonth() + month);
//           const dueDate = new Date(loan.startDate);
//           dueDate.setMonth(dueDate.getMonth() + month + 1); // Setting due date to one month after the payment month
//           dueDate.setDate(loan.startDate.getDate()); // Set due date to the loan start day

//           loanDetails.installments.push({
//             month:
//               paymentMonth.toLocaleString("default", { month: "long" }) +
//               " " +
//               paymentMonth.getFullYear(),
//             status: "Paid",
//             paidAmount: monthlyRepayment.toFixed(2),
//             remainingAmount: 0,
//             dueDate: dueDate.toISOString().split("T")[0],
//           });
//           status.paid += 1;
//         }

//         loanDetails.remaining = 0; // Set remaining amount to 0
//       } else {
//         // If not fully paid, calculate payment status for each month
//         for (let month = 0; month < totalMonths; month++) {
//           const paymentMonth = new Date(loan.startDate);
//           paymentMonth.setMonth(paymentMonth.getMonth() + month);
//           const dueDate = new Date(loan.startDate);
//           dueDate.setMonth(dueDate.getMonth() + month + 1); // Setting due date to one month after the payment month
//           dueDate.setDate(loan.startDate.getDate()); // Set due date to the loan start day

//           // let paidAmountThisMonth = loanPayments.find((payment) => {
//           //   const paymentDate = new Date(payment.paymentDate);
//           //   return (
//           //     paymentDate.getFullYear() === paymentMonth.getFullYear() &&
//           //     paymentDate.getMonth() === paymentMonth.getMonth()
//           //   );
//           // });

//           // ! new added
//           let paidAmountThisMonth = loanPayments
//             .filter((payment) => {
//               const paymentDate = new Date(payment.paymentDate);
//               return (
//                 paymentDate.getFullYear() === paymentMonth.getFullYear() &&
//                 paymentDate.getMonth() === paymentMonth.getMonth()
//               );
//             })
//             .reduce((total, payment) => total + payment.paid, 0);

//           paidAmountThisMonth = paidAmountThisMonth
//             ? paidAmountThisMonth.paid
//             : 0;

//           let remainingThisMonth = monthlyRepayment - paidAmountThisMonth;

//           // Adjusted logic for determining status
//           if (currentDate > dueDate) {
//             // Check if current date is past due date for overdue
//             loanDetails.installments.push({
//               month:
//                 paymentMonth.toLocaleString("default", { month: "long" }) +
//                 " " +
//                 paymentMonth.getFullYear(),
//               status: "Overdue",
//               paidAmount: paidAmountThisMonth.toFixed(2),
//               remainingAmount: remainingThisMonth.toFixed(2),
//               dueDate: dueDate.toISOString().split("T")[0],
//             });
//             status.overdue += 1;
//             status.overdueAmount += remainingThisMonth;
//           } else if (currentDate >= paymentMonth && currentDate < dueDate) {
//             // Current date is between the payment month and the due date
//             loanDetails.installments.push({
//               month:
//                 paymentMonth.toLocaleString("default", { month: "long" }) +
//                 " " +
//                 paymentMonth.getFullYear(),
//               status: "Pending",
//               paidAmount: paidAmountThisMonth.toFixed(2),
//               remainingAmount: remainingThisMonth.toFixed(2),
//               dueDate: dueDate.toISOString().split("T")[0],
//             });
//             status.totalDue += 1; // Count this month as due
//           } else {
//             // Before the payment month
//             loanDetails.installments.push({
//               month:
//                 paymentMonth.toLocaleString("default", { month: "long" }) +
//                 " " +
//                 paymentMonth.getFullYear(),
//               status: "Pending",
//               paidAmount: paidAmountThisMonth.toFixed(2),
//               remainingAmount: remainingThisMonth.toFixed(2),
//               dueDate: dueDate.toISOString().split("T")[0],
//             });
//             status.totalDue += 1; // Count this month as due
//           }
//         }
//       }

//       // Finalize the loan details for response
//       customerLoanSummaries.push({
//         customer,
//         loanDetails,
//         status,
//       });
//     }

//     // Return the final summary for the specified customer's loans
//     res.status(200).json({
//       loans: customerLoanSummaries,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// const getLoanSummaryByCustomerId = async (req, res) => {
//   const { customerId } = req.params;
//   const currentDate = new Date();

//   try {
//     // Fetch the customer by their ID
//     const customer = await Customer.findById(customerId);

//     if (!customer) {
//       return res.status(404).json({ message: "Customer not found" });
//     }

//     // Fetch the loans for this customer
//     const loans = await Loan.find({ customerId: customer._id });

//     if (loans.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No loans found for this customer" });
//     }

//     // Initialize the total overdue amount for all loans
//     let totalOverdueAmount = 0;

//     // Prepare loan summaries for the customer
//     const loanSummaries = await Promise.all(
//       loans.map(async (loan) => {
//         // Fetch payments made for this loan
//         const loanPayments = await LoanPayment.find({
//           loanId: loan._id,
//           status: "installment",
//         }).sort({ paymentDate: 1 });

//         const totalMonths = loan.duration;
//         const monthlyRepayment = loan.monthlyRepayment;

//         // Calculate the total paid amount for the loan
//         const loanTotalPaid = await LoanPayment.aggregate([
//           { $match: { loanId: loan._id, status: "loan" } },
//           {
//             $group: {
//               _id: null,
//               totalPaid: { $sum: "$paid" },
//             },
//           },
//         ]);

//         // Extract the total amount paid so far
//         const totalPaidAmount =
//           loanTotalPaid.length > 0 ? loanTotalPaid[0].totalPaid : 0;
//         let remainingPaidAmount = totalPaidAmount;

//         let status = {
//           totalDue: 0,
//           paid: 0,
//           overdue: 0,
//           overdueAmount: 0, // Initialize the overdue amount for this loan
//         };

//         const loanDetails = {
//           loanId: loan._id,
//           loanAmount: loan.loanAmount,
//           totalRepayment: loan.totalRepayment,
//           totalPaid: totalPaidAmount,
//           monthlyRepayment: loan.monthlyRepayment,
//           remaining: loan.totalRepayment - totalPaidAmount,
//           installments: [],
//         };

//         // Iterate over the loan duration in months and determine payment status for each month
//         // Iterate over the loan duration in months and determine payment status for each month
//         for (let month = 1; month <= totalMonths; month++) {
//           const paymentMonth = new Date(loan.startDate);
//           paymentMonth.setMonth(paymentMonth.getMonth() + month);

//           // Determine the due date for the current month
//           const dueDate = new Date(paymentMonth);
//           dueDate.setDate(30); // Assuming payment is due on the 30th of each month

//           let paidAmountThisMonth = loanPayments.find((payment) => {
//             const paymentDate = new Date(payment.paymentDate);
//             return (
//               paymentDate.getFullYear() === paymentMonth.getFullYear() &&
//               paymentDate.getMonth() === paymentMonth.getMonth()
//             );
//           });

//           paidAmountThisMonth = paidAmountThisMonth
//             ? paidAmountThisMonth.paid
//             : 0;
//           let remainingThisMonth = monthlyRepayment - paidAmountThisMonth;

//           // Adjust remainingPaidAmount based on previous months
//           if (remainingPaidAmount > 0) {
//             if (remainingPaidAmount >= monthlyRepayment) {
//               // Fully cover this month's repayment
//               loanDetails.installments.push({
//                 month:
//                   paymentMonth.toLocaleString("default", { month: "long" }) +
//                   " " +
//                   paymentMonth.getFullYear(),
//                 status: "Paid",
//                 paidAmount: monthlyRepayment,
//                 remainingAmount: 0,
//                 dueDate: dueDate.toISOString().split("T")[0],
//               });
//               remainingPaidAmount -= monthlyRepayment; // Deduct full repayment
//               status.paid += 1;
//             } else {
//               // Partially cover this month's repayment
//               loanDetails.installments.push({
//                 month:
//                   paymentMonth.toLocaleString("default", { month: "long" }) +
//                   " " +
//                   paymentMonth.getFullYear(),
//                 status: "Partially Paid",
//                 paidAmount: remainingPaidAmount,
//                 remainingAmount: monthlyRepayment - remainingPaidAmount,
//                 dueDate: dueDate.toISOString().split("T")[0],
//               });
//               remainingPaidAmount = 0; // All remaining amount used
//               status.paid += 1;
//             }
//           } else if (paymentMonth < currentDate) {
//             // If the month is overdue
//             loanDetails.installments.push({
//               month:
//                 paymentMonth.toLocaleString("default", { month: "long" }) +
//                 " " +
//                 paymentMonth.getFullYear(),
//               status: "Overdue",
//               paidAmount: paidAmountThisMonth,
//               remainingAmount: remainingThisMonth,
//               dueDate: dueDate.toISOString().split("T")[0],
//             });
//             status.overdue += 1;
//             status.overdueAmount += remainingThisMonth; // Add to overdue amount
//           } else {
//             // Pending months
//             loanDetails.installments.push({
//               month:
//                 paymentMonth.toLocaleString("default", { month: "long" }) +
//                 " " +
//                 paymentMonth.getFullYear(),
//               status: "Pending",
//               paidAmount: paidAmountThisMonth,
//               remainingAmount: remainingThisMonth,
//               dueDate: dueDate.toISOString().split("T")[0],
//             });
//             status.totalDue += 1;
//           }
//         }

//         // Finalize the loan details for response
//         totalOverdueAmount += status.overdueAmount;

//         return {
//           loanDetails,
//           status,
//         };
//       })
//     );

//     // Return the final summary for the customer, including the total overdue amount
//     res.status(200).json({
//       customer: customer,
//       loans: loanSummaries,
//       totalOverdueAmount: totalOverdueAmount, // Total overdue amount across all loans
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// ***************************
//  Loan Summaray All Customers
// ***************************

const getLoanSummary = async (req, res) => {
  const currentDate = new Date();

  try {
    // Fetch all customers who have taken loans
    const customersWithLoans = await Loan.distinct("customerId");

    if (customersWithLoans.length === 0) {
      return res.status(404).json({ message: "No customers with loans found" });
    }

    // Initialize an array to store summaries for all loans
    const allLoanSummaries = [];

    // Loop through each customer with loans
    for (const customerId of customersWithLoans) {
      // Fetch the customer
      const customer = await Customer.findById(customerId);

      if (!customer) {
        continue; // Skip if the customer doesn't exist
      }

      // Fetch the loans for this customer
      const loans = await Loan.find({ customerId });

      if (loans.length === 0) {
        continue; // Skip if no loans are found for the customer
      }

      // Loop through each loan and generate its summary
      for (const loan of loans) {
        // Fetch payments made for this loan
        const loanPayments = await LoanPayment.find({
          loanId: loan._id,
          status: "installment",
        }).sort({ paymentDate: 1 });

        const totalMonths = loan.duration;
        const monthlyRepayment = loan.monthlyRepayment;

        // Calculate the total paid amount for the loan
        const loanTotalPaid = await LoanPayment.aggregate([
          { $match: { loanId: loan._id, status: "loan" } },
          {
            $group: {
              _id: null,
              totalPaid: { $sum: "$paid" },
            },
          },
        ]);

        // Extract the total amount paid so far
        const totalPaidAmount =
          loanTotalPaid.length > 0 ? loanTotalPaid[0].totalPaid : 0;

        let status = {
          totalDue: 0,
          paid: 0,
          overdue: 0,
          overdueAmount: 0,
        };

        const loanDetails = {
          loanId: loan._id,
          loanAmount: loan.loanAmount.toFixed(2),
          totalRepayment: loan.totalRepayment.toFixed(2),
          totalPaid: totalPaidAmount.toFixed(2),
          monthlyRepayment: loan.monthlyRepayment.toFixed(2),
          remaining: (loan.totalRepayment - totalPaidAmount).toFixed(2),
          installments: [],
        };

        // Check if the loan has been fully paid
        if (totalPaidAmount >= loan.totalRepayment) {
          // Mark all months as Paid
          for (let month = 0; month < totalMonths; month++) {
            const paymentMonth = new Date(loan.startDate);
            paymentMonth.setMonth(paymentMonth.getMonth() + month);
            const dueDate = new Date(loan.startDate);
            dueDate.setMonth(dueDate.getMonth() + month);
            dueDate.setDate(loan.startDate.getDate()); // Set due date to the loan start day

            loanDetails.installments.push({
              month:
                paymentMonth.toLocaleString("default", { month: "long" }) +
                " " +
                paymentMonth.getFullYear(),
              status: "Paid",
              paidAmount: monthlyRepayment.toFixed(2),
              remainingAmount: 0,
              dueDate: dueDate.toISOString().split("T")[0],
            });
            status.paid += 1;
          }

          loanDetails.remaining = 0; // Set remaining amount to 0
        } else {
          // If not fully paid, calculate payment status for each month
          let remainingPaidAmount = totalPaidAmount;

          for (let month = 0; month < totalMonths; month++) {
            const paymentMonth = new Date(loan.startDate);
            paymentMonth.setMonth(paymentMonth.getMonth() + month);
            const dueDate = new Date(loan.startDate);
            dueDate.setMonth(dueDate.getMonth() + month + 1); // Setting due date to one month after the payment month
            dueDate.setDate(loan.startDate.getDate()); // Set due date to the loan start day

            let paidAmountThisMonth = loanPayments.find((payment) => {
              const paymentDate = new Date(payment.paymentDate);
              return (
                paymentDate.getFullYear() === paymentMonth.getFullYear() &&
                paymentDate.getMonth() === paymentMonth.getMonth()
              );
            });

            paidAmountThisMonth = paidAmountThisMonth
              ? paidAmountThisMonth.paid
              : 0;

            let remainingThisMonth = monthlyRepayment - paidAmountThisMonth;

            // Adjusted logic for determining status
            if (currentDate > dueDate) {
              // Check if current date is past due date for overdue
              loanDetails.installments.push({
                month:
                  paymentMonth.toLocaleString("default", { month: "long" }) +
                  " " +
                  paymentMonth.getFullYear(),
                status: "Overdue",
                paidAmount: paidAmountThisMonth.toFixed(2),
                remainingAmount: remainingThisMonth.toFixed(2),
                dueDate: dueDate.toISOString().split("T")[0],
              });
              status.overdue += 1;
              status.overdueAmount += remainingThisMonth;
            } else if (currentDate >= paymentMonth && currentDate < dueDate) {
              // Current date is between the payment month and the due date
              loanDetails.installments.push({
                month:
                  paymentMonth.toLocaleString("default", { month: "long" }) +
                  " " +
                  paymentMonth.getFullYear(),
                status: "Pending",
                paidAmount: paidAmountThisMonth.toFixed(2),
                remainingAmount: remainingThisMonth.toFixed(2),
                dueDate: dueDate.toISOString().split("T")[0],
              });
              status.totalDue += 1; // Count this month as due
            } else {
              // Before the payment month
              loanDetails.installments.push({
                month:
                  paymentMonth.toLocaleString("default", { month: "long" }) +
                  " " +
                  paymentMonth.getFullYear(),
                status: "Pending",
                paidAmount: paidAmountThisMonth.toFixed(2),
                remainingAmount: remainingThisMonth.toFixed(2),
                dueDate: dueDate.toISOString().split("T")[0],
              });
              status.totalDue += 1; // Count this month as due
            }
          }
        }

        // Finalize the loan details for response
        allLoanSummaries.push({
          customer,
          loanDetails,
          status,
        });
      }
    }

    // Return the final summary for all loans
    res.status(200).json({
      loans: allLoanSummaries,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getCustomerLedger,
  getDashboardData,
  getLoanSummary,
  getLoanSummaryByCustomerId,
};
