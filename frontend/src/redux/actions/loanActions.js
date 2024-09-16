import axios from "axios";

export const ADD_LOAN_REQUEST = "ADD_LOAN_REQUEST";
export const ADD_LOAN_SUCCESS = "ADD_LOAN_SUCCESS";
export const ADD_LOAN_FAILURE = "ADD_LOAN_FAILURE";

export const addLoan = (loanDetails) => async (dispatch) => {
  dispatch({ type: ADD_LOAN_REQUEST });
  try {
    await axios.post("/api/loans", loanDetails);
    dispatch({ type: ADD_LOAN_SUCCESS });
  } catch (error) {
    dispatch({ type: ADD_LOAN_FAILURE, payload: error.message });
  }
};
