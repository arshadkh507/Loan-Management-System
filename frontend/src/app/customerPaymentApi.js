// src/app/customerPaymentApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const customerPaymentApi = createApi({
  reducerPath: "customerPaymentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/customerPayments",
  }),
  tagTypes: ["CustomerPayment"],
  endpoints: (builder) => ({
    getCustomerPayments: builder.query({
      query: () => "/getAll",
      providesTags: ["CustomerPayment"],
    }),
    getCustomerPaymentById: builder.query({
      query: (id) => `/getSingle/${id}`,
      providesTags: (result, error, id) => [{ type: "CustomerPayment", id }],
    }),
    addCustomerPayment: builder.mutation({
      query: (newPayment) => ({
        url: "/add",
        method: "POST",
        body: newPayment,
      }),
      invalidatesTags: ["CustomerPayment"],
    }),
    updateCustomerPayment: builder.mutation({
      query: ({ id, ...updateData }) => ({
        url: `/update/${id}`,
        method: "PUT",
        body: updateData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "CustomerPayment", id },
      ],
    }),
    deleteCustomerPayment: builder.mutation({
      query: (id) => ({
        url: `/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "CustomerPayment", id }],
    }),
    getCustomerPaymentReport: builder.query({
      query: (id) => `/report/${id}`,
      providesTags: (result, error, id) => [{ type: "CustomerPayment", id }],
    }),
  }),
});

export const {
  useGetCustomerPaymentsQuery,
  useGetCustomerPaymentByIdQuery,
  useGetCustomerPaymentReportQuery,
  useAddCustomerPaymentMutation,
  useUpdateCustomerPaymentMutation,
  useDeleteCustomerPaymentMutation,
} = customerPaymentApi;
