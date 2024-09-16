import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "customerApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:5000/api/customers" }),
  endpoints: (builder) => ({
    getCustomers: builder.query({
      query: () => "/getAll",
    }),
    getCustomerById: builder.query({
      query: (id) => `/getSingle/${id}`,
    }),
    addCustomer: builder.mutation({
      query: (newCustomer) => ({
        url: "/add",
        method: "POST",
        body: newCustomer,
      }),
      // Transform response error into a more user-friendly message
      transformErrorResponse: (response) => {
        if (response.status === 400) {
          return { message: response.data?.message || "An error occurred" };
        }
        return { message: "An unexpected error occurred" };
      },
    }),
    updateCustomer: builder.mutation({
      query: ({ id, ...updatedCustomer }) => ({
        url: `/update/${id}`,
        method: "PUT",
        body: updatedCustomer,
      }),
      transformErrorResponse: (response) => {
        if (response.status === 500) {
          return { message: response.data?.message || "An error occurred" };
        }
        return { message: "An unexpected error occurred" };
      },
    }),
    deleteCustomer: builder.mutation({
      query: (id) => ({
        url: `/delete/${id}`,
        method: "DELETE",
      }),
      transformErrorResponse: (response) => {
        if (response.status === 400) {
          return { message: response.data?.message || "An error occurred" };
        }
        return { message: "An unexpected error occurred" };
      },
    }),
    getCustomerReport: builder.query({
      query: () => "/report",
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
  useGetCustomerReportQuery,
  useAddCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} = api;
