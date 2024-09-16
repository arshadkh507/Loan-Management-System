import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loans: [],
};

const loanSlice = createSlice({
  name: "loan",
  initialState,
  reducers: {
    addLoan: (state, action) => {
      state.loans.push(action.payload);
    },
    // Add more reducers as needed (e.g., updateLoan, deleteLoan)
  },
});

export const { addLoan } = loanSlice.actions;
export default loanSlice.reducer;
