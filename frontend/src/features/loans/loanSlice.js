// src/features/loans/loanSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { loanApi } from "../../app/loanApi";

const loanSlice = createSlice({
  name: "loans",
  initialState: {
    loans: [],
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {}, // You can add custom reducers if you need specific actions, like resetting state
  extraReducers: (builder) => {
    builder
      .addMatcher(loanApi.endpoints.getLoans.matchPending, (state) => {
        state.status = "loading";
      })
      .addMatcher(
        loanApi.endpoints.getLoans.matchFulfilled,
        (state, action) => {
          state.status = "succeeded";
          state.loans = action.payload;
        }
      )
      .addMatcher(loanApi.endpoints.getLoans.matchRejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addMatcher(loanApi.endpoints.addLoan.matchFulfilled, (state, action) => {
        state.loans.push(action.payload);
      })
      .addMatcher(
        loanApi.endpoints.updateLoan.matchFulfilled,
        (state, action) => {
          const index = state.loans.findIndex(
            (loan) => loan.id === action.payload.id
          );
          if (index !== -1) {
            state.loans[index] = action.payload;
          }
        }
      )
      .addMatcher(
        loanApi.endpoints.deleteLoan.matchFulfilled,
        (state, action) => {
          state.loans = state.loans.filter(
            (loan) => loan.id !== action.meta.arg
          );
        }
      );
  },
});

export default loanSlice.reducer;
