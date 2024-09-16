import { createSlice } from "@reduxjs/toolkit";
import { api } from "../../app/customerApi";

const initialState = {
  customers: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const customerSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(
        api.endpoints.getCustomers.matchFulfilled,
        (state, action) => {
          state.status = "succeeded";
          state.customers = action.payload;
        }
      )
      .addMatcher(api.endpoints.addCustomer.matchFulfilled, (state, action) => {
        state.customers.push(action.payload);
      })
      .addMatcher(
        api.endpoints.updateCustomer.matchFulfilled,
        (state, action) => {
          const index = state.customers.findIndex(
            (c) => c.id === action.payload.id
          );
          if (index !== -1) {
            state.customers[index] = action.payload;
          }
        }
      )
      .addMatcher(
        api.endpoints.deleteCustomer.matchFulfilled,
        (state, action) => {
          state.customers = state.customers.filter(
            (c) => c.id !== action.payload.id
          );
        }
      )
      .addMatcher(api.endpoints.getCustomers.matchPending, (state) => {
        state.status = "loading";
      })
      .addMatcher(api.endpoints.getCustomers.matchRejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default customerSlice.reducer;
