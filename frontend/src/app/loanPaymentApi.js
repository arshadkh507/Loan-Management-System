// src/app/loanPaymentApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const loanPaymentApi = createApi({
  reducerPath: "loanPaymentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/loanPayments",
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
      query: ({ id, ...updatedLoanPayment }) => ({
        url: `/update/${id}`,
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
  }),
});

export const {
  useGetAllLoanPaymentsQuery,
  useGetLoanPaymentByIdQuery,
  useGetLoanPaymentReportQuery,
  useCreateLoanPaymentMutation,
  useUpdateLoanPaymentMutation,
  useDeleteLoanPaymentMutation,
} = loanPaymentApi;
