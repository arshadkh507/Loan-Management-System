// src/components/SpinnerComponent.js
import { Spinner } from "react-bootstrap";

const LoadingSpinner = () => {
  return (
    <div className="text-center my-4">
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
};

export default LoadingSpinner;
