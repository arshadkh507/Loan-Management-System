// // loanApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const loanApi = createApi({
  reducerPath: "loanApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:5000/api/loans" }),
  tagTypes: ["Loans"], // Add tagTypes here to manage invalidation
  endpoints: (builder) => ({
    getLoans: builder.query({
      query: () => "/getAll",
      providesTags: ["Loans"], // Provide "Loans" tag
    }),
    getLoanById: builder.query({
      query: (id) => `/getSingle/${id}`,
    }),
    addLoan: builder.mutation({
      query: (loan) => ({
        url: "/add",
        method: "POST",
        body: loan,
      }),
      invalidatesTags: ["Loans"],
    }),
    updateLoan: builder.mutation({
      query: ({ id, ...loan }) => ({
        url: `/update/${id}`,
        method: "PUT",
        body: loan,
      }),
      invalidatesTags: ["Loans"],
    }),
    deleteLoan: builder.mutation({
      query: (id) => ({
        url: `/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Loans"],
    }),
    getCustomerLedger: builder.query({
      query: (id) => `/report/customer-ledger/${id}`,
    }),
    getDashboardData: builder.query({
      query: () => "dashboard",
    }),
  }),
});

export const {
  useGetLoansQuery,
  useGetLoanByIdQuery,
  useGetCustomerLedgerQuery,
  useGetDashboardDataQuery,
  useAddLoanMutation,
  useUpdateLoanMutation,
  useDeleteLoanMutation,
} = loanApi;
