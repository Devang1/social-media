import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { io } from "socket.io-client";
import { addMessage } from "../redux/chat-slice";

const socketContext = createContext(null);
export const useSocket = () => useContext(socketContext);

export const SocketProvider = ({ children }) => {
  const userinfo = useSelector((state) => state.chat.userinfo);
  const { selectedChatData, selectedChatType } = useSelector((state) => state.chat);
  const socket = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (userinfo?.user_id && !socket.current) {
      console.log("Connecting socket for user:", userinfo);
      socket.current = io("http://localhost:3000", {
        withCredentials: true,
        query: { userid: userinfo.user_id },
      });

      socket.current.on("connect", () => {
        console.log("Socket connected:", socket.current.id);
        setIsConnected(true);
      });

      socket.current.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message);
        setIsConnected(false);
      });

      const handleReceiveMessage = (message) => {
        console.log("Message received:", message);
        if (
          selectedChatType !== undefined &&
          (selectedChatData?.user_id === message.sender ||
            selectedChatData?.channel_id === message.reciever)
        ) {
          dispatch(addMessage(message));
        }
      };

      socket.current.on("receiveMessage", handleReceiveMessage);

      return () => {
        if (socket.current) {
          console.log("Socket disconnected");
          socket.current.disconnect();
          socket.current = null;
          setIsConnected(false);
        }
      };
    }
  }, [userinfo, selectedChatData, selectedChatType, dispatch]);

  return (
    <socketContext.Provider value={socket.current}>
      {children}
    </socketContext.Provider>
  );
};

