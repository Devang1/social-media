import {useSelector,useDispatch} from "react-redux";
import { setSelectedChatData, setSelectedChatMessages, setSelectedChatType, closeChat } from '../../../redux/chat-slice';
import { useNavigate } from "react-router-dom";
import { useEffect,useState,useCallback } from "react";
import { Toaster, toast } from 'sonner';
import axios from "axios";
function ContactsContainer() {
  const navigate=useNavigate();
  const userinfo = useSelector((state) => state.chat.userinfo);
  const { selectedChatData, selectedChatMessages, selectedChatType } = useSelector((state) => state.chat);
  const[Totalcontacts,setTotalcontacts]=useState([])
  const dispatch = useDispatch();
  const[contacts,setcontacts]=useState([])
  const[search,setsearch]=useState([])
  const[imageUrl,setimageUrl]=useState(null)
  const logout=async()=>{
    await axios.get('/api/logout', {
      withCredentials: true, 
    }).then((response)=>{
      if(response.data=="logout"){
        navigate("/auth")
      }
    })
  }
  const getcontacts = useCallback(async () => {
    try {
      const fetched_contacts = await axios.get("/api/contacts", {
        params: { email: userinfo.username },
        withCredentials: true,
      });
      setTotalcontacts(fetched_contacts.data);
      setcontacts(fetched_contacts.data);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  }, [userinfo.email]); 
  const handelContactClick=(data)=>{
    dispatch(setSelectedChatType("direct"));
    dispatch(setSelectedChatData(data));
  }
  useEffect(()=>{
    let defaultimg=userinfo.gender=="Male"?"https://avatar.iran.liara.run/public/boy?username=Ash":"https://avatar.iran.liara.run/public/girl?username=Ash";
    let tempimageUrl = userinfo.image? `/api/image/${userinfo.id}`:defaultimg;
    setimageUrl(tempimageUrl);
  },[userinfo]);
  useEffect(()=>{
    getcontacts()
  },[getcontacts]);
  useEffect(() => {
    setcontacts([]);
    setcontacts(Totalcontacts.filter((contact) => contact.fullname.startsWith(search)));
  }, [search,Totalcontacts]);


  return (
    <div>
        <div className={`${selectedChatType==undefined?"w-[100vw] block " : "hidden" } md:block md:w-[20vw] h-[100vh] bg-gray-900/80 backdrop-blur-lg p-4 border-r border-gray-700`}>
          <img src="ChitChat.svg" alt="" className="w-30"/>
        <input className="w-full p-2 mt-2 bg-gray-800 text-white rounded-2xl outline-none border border-gray-700 focus:border-cyan-400" type="text" placeholder="Search..." onChange={(e)=>{setsearch(e.target.value)}} />
        <h2 className="text-cyan-700 font-bold">Direct Messages</h2>
        <ul className="mt-4 space-y-2 overflow-y-scroll  h-[30vh] ">
          {contacts.length>0?(contacts.map((chat, index) => (
            <li key={index} className="p-2 bg-gray-800 rounded-xl hover:bg-cyan-400/20 transition flex items-center gap-2" onClick={()=>{handelContactClick(chat)}}>
              <img src={chat.image? `/api/image/${chat.id}`:chat.gender=="Male"?"https://avatar.iran.liara.run/public/boy?username=Ash":"https://avatar.iran.liara.run/public/girl?username=Ash"} alt="User" className="w-10 h-10 rounded-full" />
              <strong className="text-cyan-300 ">{chat.fullname}</strong>
            </li>
          ))):<h1>User not found</h1>}
        </ul>
        <hr className="border-2 border-gray-500 mt-2 mx-auto shadow-lg shadow-cyan-400/30" />
        <hr className="border-2 border-gray-500 mx-auto shadow-lg shadow-cyan-400/30" />
        <div className="flex gap-2 mt-10 items-center ">
        <img src={imageUrl} alt="User" className="w-10 h-10 rounded-full" />
        <h1 className="font-medium">{`${userinfo.username}`}</h1>
        <i className="fa-solid fa-pencil cursor-pointer text-xl text-cyan-400" onClick={()=>{navigate("/profile")}}></i>
        <i className="fa-solid fa-power-off text-cyan-400 cursor-pointer ml-5" onClick={()=>{logout()}}></i>
      </div>
      </div>
      <Toaster />
    </div>
  )
}

export default ContactsContainer