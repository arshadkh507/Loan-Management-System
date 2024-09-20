const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0"); // Ensure two-digit day
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Ensure two-digit month
  const year = date.getFullYear();
  return `${day}-${month}-${year}`; // Format as dd-mm-yyyy
};

export { formatDate };