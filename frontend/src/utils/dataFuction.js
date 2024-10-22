const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0"); // Ensure two-digit day
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Ensure two-digit month
  const year = date.getFullYear();
  return `${day}-${month}-${year}`; // Format as dd-mm-yyyy
};

// Helper function to get today's date in 'YYYY-MM-DD' format
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

export { formatDate, getTodayDate };
