// src/features/payments/customerPaymentSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { customerPaymentApi } from "../../app/customerPaymentApi";

const initialState = {
  selectedPayment: null,
  isLoading: false,
  error: null,
};

const customerPaymentSlice = createSlice({
  name: "customerPayment",
  initialState,
  reducers: {
    setSelectedPayment: (state, action) => {
      state.selectedPayment = action.payload;
    },
    clearSelectedPayment: (state) => {
      state.selectedPayment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        customerPaymentApi.endpoints.addCustomerPayment.matchPending,
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        customerPaymentApi.endpoints.addCustomerPayment.matchFulfilled,
        (state) => {
          state.isLoading = false;
        }
      )
      .addMatcher(
        customerPaymentApi.endpoints.addCustomerPayment.matchRejected,
        (state, action) => {
          state.isLoading = false;
          state.error = action.error.message;
        }
      )
      .addMatcher(
        customerPaymentApi.endpoints.updateCustomerPayment.matchPending,
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        customerPaymentApi.endpoints.updateCustomerPayment.matchFulfilled,
        (state) => {
          state.isLoading = false;
        }
      )
      .addMatcher(
        customerPaymentApi.endpoints.updateCustomerPayment.matchRejected,
        (state, action) => {
          state.isLoading = false;
          state.error = action.error.message;
        }
      )
      .addMatcher(
        customerPaymentApi.endpoints.deleteCustomerPayment.matchPending,
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        customerPaymentApi.endpoints.deleteCustomerPayment.matchFulfilled,
        (state) => {
          state.isLoading = false;
        }
      )
      .addMatcher(
        customerPaymentApi.endpoints.deleteCustomerPayment.matchRejected,
        (state, action) => {
          state.isLoading = false;
          state.error = action.error.message;
        }
      );
  },
});

export const { setSelectedPayment, clearSelectedPayment } =
  customerPaymentSlice.actions;

export default customerPaymentSlice.reducer;
