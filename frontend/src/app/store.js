// src/app/store.js
import { configureStore } from "@reduxjs/toolkit";
import customerReducer from "../features/customers/customerSlice";
import loanReducer from "../features/loans/loanSlice";
import { api as customerApi } from "./customerApi";
import { loanApi } from "./loanApi";
import { customerPaymentApi } from "./customerPaymentApi"; // Import the customerPaymentApi
import customerPaymentReducer from "../features/payments/customerPaymentSlice"; // Import the customerPaymentReducer
import { loanPaymentApi } from "./loanPaymentApi"; // Import the loanPaymentApi
import loanPaymentReducer from "../features/payments/loanPaymentSlice"; // Import the loanPaymentReducer

export const store = configureStore({
  reducer: {
    [customerApi.reducerPath]: customerApi.reducer,
    [loanApi.reducerPath]: loanApi.reducer,
    [customerPaymentApi.reducerPath]: customerPaymentApi.reducer,
    [loanPaymentApi.reducerPath]: loanPaymentApi.reducer,
    customers: customerReducer,
    loans: loanReducer,
    customerPayments: customerPaymentReducer,
    loanPayments: loanPaymentReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      customerApi.middleware,
      loanApi.middleware,
      customerPaymentApi.middleware,
      loanPaymentApi.middleware
    ),
});

/*
Component -> dispatches action (useAddCustomerMutation)
    |
    v
RTK Query Middleware -> makes API request
    |
    v
Response
   / \
  /   \
 Success Error (transformErrorResponse)
  |      |
  v      v
State   Error (caught in try/catch in component)
Update  |
        v
     Show alert in component
*/
