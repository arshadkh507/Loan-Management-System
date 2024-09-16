// src/components/AlertComponents

import Swal from "sweetalert2";

// Success Alert Component
export const SuccessAlert = ({ title, text }) => {
  return Swal.fire({
    title: title || "Success!",
    text: text || "Operation completed successfully.",
    icon: "success",
    confirmButtonText: "OK",
    timer: 2000,
    showConfirmButton: false,
  });
};

// Error Alert Component
export const ErrorAlert = ({ title, text }) => {
  return Swal.fire({
    title: title || "Error!",
    text: text || "Something went wrong.",
    icon: "error",
    confirmButtonText: "OK",
  });
};

// Confirmation Alert Component
export const ConfirmationAlert = async ({
  title,
  text,
  confirmButtonText,
  cancelButtonText,
}) => {
  const result = await Swal.fire({
    title: title || "Are you sure?",
    text: text || "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: confirmButtonText || "Yes, do it!",
    cancelButtonText: cancelButtonText || "Cancel",
    reverseButtons: true,
  });

  return result.isConfirmed;
};
