import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Access the backend API base URL from environment variables
const backendBaseUrl = import.meta.env.VITE_LMS_BACKEND_API_BASE_URL;

export const loanApi = createApi({
  reducerPath: "loanApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${backendBaseUrl}/api/loans` }), // Use the environment variable
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
    getLoanSummary: builder.query({
      query: () => "/loan-summary",
    }),
    getSingleCustomerLoanSummary: builder.query({
      query: (id) => `/loan-summary/${id}`,
    }),
  }),
});

export const {
  useGetLoansQuery,
  useGetLoanByIdQuery,
  useGetCustomerLedgerQuery,
  useGetDashboardDataQuery,
  useGetLoanSummaryQuery,
  useGetSingleCustomerLoanSummaryQuery,
  useAddLoanMutation,
  useUpdateLoanMutation,
  useDeleteLoanMutation,
} = loanApi;
