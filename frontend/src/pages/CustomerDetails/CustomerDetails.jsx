import { useEffect, useState } from "react";
import { Table, Button, Spinner, Alert } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import EntriesSelectorAndSearch from "../../components/EntriesSelectorAndSearch/EntriesSelectorAndSearch";
import EntriesInfoAndPagination from "../../components/EntriesInfoAndPagination/EntriesInfoAndPagination";
import { FaEdit, FaTrash } from "react-icons/fa";
import {
  ConfirmationAlert,
  SuccessAlert,
  ErrorAlert,
} from "../../components/AlertComponents/AlertComponents";
import {
  useGetCustomersQuery,
  useDeleteCustomerMutation,
} from "../../app/customerApi";

const CustomerDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Pagination and Filtering States
  const [filter, setFilter] = useState("");
  const [entriesToShow, setEntriesToShow] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch Customers
  const {
    data: customerData = [],
    error: fetchError,
    isLoading,
    isSuccess,
    refetch,
  } = useGetCustomersQuery();
  // Delete Customer Mutation
  const [
    deleteCustomer,
    { isLoading: isDeleting, isSuccess: isDeleteSuccess },
  ] = useDeleteCustomerMutation();

  useEffect(() => {
    refetch();
  }, [refetch, location]);

  useEffect(() => {
    if (isDeleteSuccess) {
      refetch();
    }
  }, [isDeleteSuccess, refetch]);

  // Apply Filtering
  const filteredCustomers = isSuccess
    ? customerData.filter((customer) =>
        customer.fullName.toLowerCase().includes(filter.toLowerCase())
      )
    : [];

  // Apply Pagination
  const totalPages = Math.ceil(filteredCustomers.length / entriesToShow);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * entriesToShow,
    currentPage * entriesToShow
  );

  // Handle Page Change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle Delete Customer
  const handleDeleteCustomer = async (id) => {
    console.log(id);
    const isConfirmed = await ConfirmationAlert({
      title: "Are you sure?",
      text: "Do you want to delete the selected customer?",
    });

    if (isConfirmed) {
      try {
        await deleteCustomer(id).unwrap();
        SuccessAlert({ title: "Deleted!", text: "Customer has been deleted." });
        // Optionally refetch customers
        refetch();
      } catch (err) {
        ErrorAlert({
          title: "Error!",
          text: err.message || "Failed to delete customer.",
        });
      }
    }
  };

  const handleEditCustomer = (id) => {
    navigate(`/customers/edit/${id}`); // Navigate to the AddCustomer page with the ID
  };

  return (
    <div className="page-container">
      <h1 className="page-heading">Customer Details</h1>
      <hr className="custom-hr" />

      <EntriesSelectorAndSearch
        entriesToShow={entriesToShow}
        setEntriesToShow={setEntriesToShow}
        filter={filter}
        setFilter={setFilter}
        setCurrentPage={setCurrentPage}
      />

      {isLoading && (
        <div className="text-center my-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}

      {fetchError && (
        <Alert variant="danger">
          {fetchError.data?.message || "Failed to load customers."}
        </Alert>
      )}

      {isSuccess && (
        <>
          <Table responsive bordered className="table-sm">
            <thead>
              <tr className="table-info">
                <th>S.No</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>Address</th>
                <th>Additional Info</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCustomers.map((customer, index) => (
                <tr key={customer._id}>
                  <td>{(currentPage - 1) * entriesToShow + index + 1}</td>
                  {/* Serial Number */}
                  <td className="customer-name">{customer.fullName}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phoneNumber}</td>
                  <td>{customer.address}</td>
                  <td>{customer.additionalInfo}</td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEditCustomer(customer._id)}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteCustomer(customer._id)}
                      disabled={isDeleting}
                    >
                      <FaTrash className="deleteIcon" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <EntriesInfoAndPagination
            paginatedItems={paginatedCustomers}
            totalItems={filteredCustomers}
            currentPage={currentPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default CustomerDetails;
