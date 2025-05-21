import '../../App.css';
import { useEffect,useState } from "react";
import {useSelector,useDispatch} from "react-redux";
import { useNavigate } from "react-router-dom";
import ChatContainer from "./chat-container";
import EmptyChatContainer from "./empty-chat-container";
import ContactsContainer from "./contacts-container";
import axios from 'axios';
import { setuserinfo} from '../../redux/chat-slice';
const Chat = () => {  
  const dispatch = useDispatch()
  const user = useSelector((state)=>state.userInfo.user.username)
  useEffect(() => {
     const fetchUser = async () => {
      try {
        const response = await axios.get("/api/isAuth", {
                            params: { user}, 
                            withCredentials: true,
                          });
          dispatch(setuserinfo(response.data));
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
  fetchUser();
}, [dispatch,user]);
  const { selectedChatType } = useSelector((state) => state.chat);
  const userinfo = useSelector((state) => state.chat.userinfo);
  // const defaultimg=userinfo.gender=="Male"?"https://avatar.iran.liara.run/public/boy?username=Ash":"https://avatar.iran.liara.run/public/girl?username=Ash";
  // const imageUrl = userinfo.image? `/api/image/${userinfo.id}`:defaultimg ;
    return (
      <div className="flex h-[100vh] text-white overflow-hidden ">
        <ContactsContainer/>
        {selectedChatType==undefined?(<EmptyChatContainer/>):( 
        <ChatContainer/>)}
      </div>
    );
  }
  
  export default Chat