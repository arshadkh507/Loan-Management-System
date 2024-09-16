// src/features/payments/loanPaymentSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { loanPaymentApi } from "../../app/loanPaymentApi";

const loanPaymentSlice = createSlice({
  name: "loanPayments",
  initialState: {
    data: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(
        loanPaymentApi.endpoints.getAllLoanPayments.matchFulfilled,
        (state, action) => {
          state.data = action.payload;
          state.status = "succeeded";
        }
      )
      .addMatcher(
        loanPaymentApi.endpoints.getAllLoanPayments.matchPending,
        (state) => {
          state.status = "loading";
        }
      )
      .addMatcher(
        loanPaymentApi.endpoints.getAllLoanPayments.matchRejected,
        (state, action) => {
          state.status = "failed";
          state.error = action.error.message;
        }
      )
      .addMatcher(
        loanPaymentApi.endpoints.createLoanPayment.matchFulfilled,
        (state, action) => {
          state.data.push(action.payload);
        }
      )
      .addMatcher(
        loanPaymentApi.endpoints.updateLoanPayment.matchFulfilled,
        (state, action) => {
          const index = state.data.findIndex(
            (payment) => payment._id === action.payload._id
          );
          if (index !== -1) {
            state.data[index] = action.payload;
          }
        }
      )
      .addMatcher(
        loanPaymentApi.endpoints.deleteLoanPayment.matchFulfilled,
        (state, action) => {
          state.data = state.data.filter(
            (payment) => payment._id !== action.payload._id
          );
        }
      );
  },
});

export default loanPaymentSlice.reducer;
