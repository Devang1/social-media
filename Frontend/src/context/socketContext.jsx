import { createContext, useContext, useEffect, useRef, useState } from "react";
import {useSelector,useDispatch} from "react-redux";
import { io } from "socket.io-client";

// Create socket context
const socketContext = createContext(null);

// Custom hook to use the socket context
export const useSocket = () => {
  return useContext(socketContext);
};

// Socket provider component
export const SocketProvider = ({ children }) => {
  const socket = useRef(null);
  const { userinfo, addMessage, selectedChatType, selectedChatData } = useappstore();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Ensure userinfo exists and socket is not already connected
    if (userinfo && !socket.current) {
      console.log("Connecting socket for user:", userinfo);

      socket.current = io("http://localhost:3000", {
        withCredentials: true,
        query: { userid: userinfo.id },
      });

      // Handle successful connection
      socket.current.on("connect", () => {
        console.log("Socket connected:", socket.current.id);
        setIsConnected(true);
      });

      // Handle connection error
      socket.current.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message);
        setIsConnected(false);
      });

      // Handle received message
      const handleReceiveMessage = (message) => {
        console.log("Message received:", message);

        // Check if the message is relevant to the selected chat
        if (
          selectedChatType !== undefined &&
          (selectedChatData?.id === message.sender ||
            selectedChatData.channel_id === message.reciever)
        ) {
          addMessage(message);
        }
      };
      const handleReceiveChannelMessage= (message) => {
        console.log("Message received:", message);
        // Check if the message is relevant to the selected chat
        if (
          selectedChatType !== undefined &&selectedChatData?.id === message.reciever) 
          {
          addMessage(message);
        }
      };
      socket.current.on("receiveMessage", handleReceiveMessage);
      socket.current.on("receiveChannelMessage", handleReceiveChannelMessage);

      // Cleanup on unmount or userinfo change
      return () => {
        if (socket.current) {
          console.log("Socket disconnected");
          socket.current.disconnect();
          socket.current = null;
          setIsConnected(false);
        }
      };
    }
  }, [userinfo, addMessage, selectedChatType, selectedChatData]);

  return (
    <socketContext.Provider value={socket.current}>
      {children}
    </socketContext.Provider>
  );
};
