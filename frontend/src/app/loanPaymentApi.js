// src/app/loanPaymentApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Access the backend API base URL from environment variables
const backendBaseUrl = import.meta.env.VITE_LMS_BACKEND_API_BASE_URL;

export const loanPaymentApi = createApi({
  reducerPath: "loanPaymentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${backendBaseUrl}/api/loanPayments`, // Use the environment variable
  }),
  tagTypes: ["Loans"],
  endpoints: (builder) => ({
    getAllLoanPayments: builder.query({
      query: () => "/getAll",
      providesTags: ["Loans"],
    }),
    getLoanPaymentById: builder.query({
      query: (id) => `/getSingle/${id}`,
      invalidatesTags: ["Loans"],
    }),
    createLoanPayment: builder.mutation({
      query: (newLoanPayment) => ({
        url: "/add",
        method: "POST",
        body: newLoanPayment,
      }),
      invalidatesTags: ["Loans"],
    }),
    updateLoanPayment: builder.mutation({
      query: (updatedLoanPayment) => ({
        url: `/update/${updatedLoanPayment.paymentId}`,
        method: "PUT",
        body: updatedLoanPayment,
      }),
      invalidatesTags: ["Loans"],
    }),
    deleteLoanPayment: builder.mutation({
      query: (id) => ({
        url: `/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Loans"],
    }),
    getLoanPaymentReport: builder.query({
      query: () => "/report",
      providesTags: ["Loans"],
    }),
    getLoanPaymentAndLoanById: builder.query({
      query: (id) => `/loan-payment-and-loan/${id}`,
    }),
  }),
});

export const {
  useGetAllLoanPaymentsQuery,
  useGetLoanPaymentByIdQuery,
  useGetLoanPaymentReportQuery,
  useGetLoanPaymentAndLoanByIdQuery,
  useCreateLoanPaymentMutation,
  useUpdateLoanPaymentMutation,
  useDeleteLoanPaymentMutation,
} = loanPaymentApi;
