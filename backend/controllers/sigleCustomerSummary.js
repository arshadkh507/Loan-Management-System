const getLoanSummary = async (req, res) => {
  const { customerId } = req.params;
  const currentDate = new Date();

  try {
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const loans = await Loan.find({ customerId });

    // Prepare the summary report
    const loanSummary = await Promise.all(
      loans.map(async (loan) => {
        const loanPayments = await LoanPayment.find({ loanId: loan._id }).sort({
          paymentDate: 1,
        });
        const totalMonths = loan.duration; // Assuming duration is in months
        const monthlyRepayment = loan.monthlyRepayment;

        let status = {
          totalDue: 0,
          paid: 0,
          overdue: 0,
        };

        const loanDetails = {
          loanId: loan._id,
          loanAmount: loan.loanAmount,
          totalRepayment: loan.totalRepayment,
          installments: [],
        };

        for (let month = 1; month <= totalMonths; month++) {
          const paymentMonth = new Date(loan.startDate);
          paymentMonth.setMonth(paymentMonth.getMonth() + month);

          const paymentForMonth = loanPayments.find((payment) => {
            const paymentDate = new Date(payment.paymentDate);
            return (
              paymentDate.getFullYear() === paymentMonth.getFullYear() &&
              paymentDate.getMonth() === paymentMonth.getMonth()
            );
          });

          if (paymentForMonth) {
            loanDetails.installments.push({
              month:
                paymentMonth.toLocaleString("default", { month: "long" }) +
                " " +
                paymentMonth.getFullYear(),
              status: "Paid",
            });
            status.paid += 1;
          } else if (paymentMonth < currentDate) {
            loanDetails.installments.push({
              month:
                paymentMonth.toLocaleString("default", { month: "long" }) +
                " " +
                paymentMonth.getFullYear(),
              status: "Overdue",
            });
            status.overdue += 1;
          } else {
            loanDetails.installments.push({
              month:
                paymentMonth.toLocaleString("default", { month: "long" }) +
                " " +
                paymentMonth.getFullYear(),
              status: "Pending",
            });
            status.totalDue += 1;
          }
        }

        return {
          loanDetails,
          status,
        };
      })
    );

    // Prepare the final response
    res.status(200).json({
      customer: {
        id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phoneNumber: customer.phoneNumber,
      },
      loanSummary,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
