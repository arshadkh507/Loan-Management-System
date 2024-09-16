import {
  ADD_LOAN_REQUEST,
  ADD_LOAN_SUCCESS,
  ADD_LOAN_FAILURE,
} from "./loanActions";

const initialState = {
  loading: false,
  success: false,
  error: null,
};

const loanReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_LOAN_REQUEST:
      return { ...state, loading: true };
    case ADD_LOAN_SUCCESS:
      return { ...state, loading: false, success: true };
    case ADD_LOAN_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default loanReducer;
