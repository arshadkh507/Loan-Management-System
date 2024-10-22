// src/app/customerPaymentApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// Access the backend API base URL from environment variables
const backendBaseUrl = import.meta.env.VITE_LMS_BACKEND_API_BASE_URL;
export const customerPaymentApi = createApi({
  reducerPath: "customerPaymentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${backendBaseUrl}/api/customerPayments`, // Use the environment variable
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
