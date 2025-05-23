import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedChatType: undefined,
  selectedChatData: undefined,
  selectedChatMessages: [],
  userinfo:undefined,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setSelectedChatType: (state, action) => {
      state.selectedChatType = action.payload;
    },
    setSelectedChatData: (state, action) => {
      state.selectedChatData = action.payload;
    },
    setSelectedChatMessages: (state, action) => {
      state.selectedChatMessages = action.payload;
    },
    setuserinfo: (state, action) => {
      state.userinfo = action.payload;
    },
    addMessage: (state, action) => {
      const message = action.payload;
      state.selectedChatMessages.push({
        ...message,
        sender: message.sender,
        reciever: message.reciever,
      });
    },
    closeChat: (state) => {
      state.selectedChatType = undefined;
      state.selectedChatData = undefined;
      state.selectedChatMessages = [];
    },
  },
});

export const {
  setSelectedChatType,
  setSelectedChatData,
  setSelectedChatMessages,
  addMessage,
  closeChat,
  setuserinfo,
} = chatSlice.actions;

export default chatSlice.reducer;
