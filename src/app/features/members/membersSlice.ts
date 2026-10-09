
import { createSlice } from "@reduxjs/toolkit";

import { sampleMembers } from "../../../data/sampleData";

const membersSlice = createSlice({
  name: "members",
  initialState: sampleMembers,
  reducers: {},
});

export default membersSlice.reducer;
