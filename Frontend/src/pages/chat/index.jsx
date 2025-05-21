import '../../App.css';
import { useEffect,useState } from "react";
import {useSelector,useDispatch} from "react-redux";
import { useNavigate } from "react-router-dom";
import ChatContainer from "./chat-container";
import EmptyChatContainer from "./empty-chat-container";
import ContactsContainer from "./contacts-container";

const Chat = () => {
  const { selectedChatType } = useSelector((state) => state.chat);
  const userinfo ={id:1,profilesetup:true , gender:"male",image:"https://avatar.iran.liara.run/public/girl?username=Ash" ,email:"devangshukla119@gmail.com"};
  console.log(userinfo)
  const navigate=useNavigate();
 
  const defaultimg=userinfo.gender=="Male"?"https://avatar.iran.liara.run/public/boy?username=Ash":"https://avatar.iran.liara.run/public/girl?username=Ash";
  const imageUrl = userinfo.image? `/api/image/${userinfo.id}`:defaultimg ;
    return (
      <div className="flex h-[100vh] text-white overflow-hidden ">
        <ContactsContainer/>
        {selectedChatType==undefined?(<EmptyChatContainer/>):( 
        <ChatContainer/>)}
      </div>
    );
  }
  
  export default Chat