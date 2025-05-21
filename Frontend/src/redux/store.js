import { configureStore } from "@reduxjs/toolkit";
import reducer from "./slice";
import userReducer from "./userSlice";
import exploreReducer from "./exploreSlice";
import chatReducer from './chat-slice';

const store = configureStore({
  reducer: {
    counter: reducer, // Add reducers here
    userInfo: userReducer,
    explore: exploreReducer,
    chat: chatReducer,
  },
});

export default store;
