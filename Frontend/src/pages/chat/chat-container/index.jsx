import EmojiPicker from 'emoji-picker-react';
import { useEffect, useRef, useState } from "react";
import {useSelector,useDispatch} from "react-redux";
import { useSocket } from '../../../context/socketContext';
import axios from "axios";
import { Toaster, toast } from 'sonner';
import { setSelectedChatMessages, setSelectedChatType, closeChat } from '../../../redux/chat-slice';
function ChatContainer() {
  const emojiref=useRef();
  const socket=useSocket();
  const userinfo = useSelector((state) => state.chat.userinfo);
  const [emojipicker,setemojipicker]=useState(false);
  const [message, setMessage] = useState("");
  const [imgclick, setimgclick] = useState("");
  const [images, setimages] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
 
  const handelemoji=(emoji)=>{
    setMessage((msg)=>msg+emoji.emoji);
  }
  const emptymessage = () => {
    toast.error("Empty message can't be send!", {
      duration: 1500,
      position: 'bottom-right',
      style: {
        background: '#FF5C5C',
        color: '#fff',
      },
    });
  };
  useEffect(()=>{
    const handelclickoutside=(event)=>{
      if(emojiref.current && !emojiref.current.contains(event.target)){
        setemojipicker(false);
      }
    }
    document.addEventListener("mousedown",handelclickoutside);
    return ()=>{
      document.removeEventListener("mousedown",handelclickoutside);
    }
  },[emojiref])
const { selectedChatData, selectedChatMessages, selectedChatType } = useSelector((state) => state.chat);
const dispatch = useDispatch();
  let defaultimg=selectedChatData.gender=="Male"?"https://avatar.iran.liara.run/public/boy?username=Ash":"https://avatar.iran.liara.run/public/girl?username=Ash";
  let tempimageUrl = selectedChatData.image? `/api/image/${selectedChatData.id}`:defaultimg;
  const handleSendMessage=()=>{
    if(message!=""){
      if(selectedChatType==="direct"){
    socket.emit("sendMessage",{
      sender:userinfo.user_id,
      content:message,
      reciever:selectedChatData.user_id,
      message_type:"text",
      file_url:undefined
    })
    setMessage("");
  }
  }else{
    emptymessage();
  }
  }
  function timeAgo(isoTime) {
    const time = new Date(isoTime);
    const now = new Date();
  
    // Ensure valid date
    if (isNaN(time.getTime())) return '';
  
    const diffInSeconds = Math.floor((now - time) / 1000);
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  
    if (!isFinite(diffInSeconds)) return '';
  
    if (diffInSeconds < 60) return rtf.format(-diffInSeconds, 'second');
    if (diffInSeconds < 3600) return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
    if (diffInSeconds < 86400) return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
    return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
  }
  useEffect(()=>{
    const getrecentimages=async()=>{
      const response = await axios.post('/api/getImages', {
        sender:userinfo.user_id,
        reciever:selectedChatData.user_id,
      });
      setimages(response.data);
    }
    if(selectedChatType=="direct"){
      getrecentimages()
    }
  },[selectedChatMessages,selectedChatData,userinfo,selectedChatType])
  useEffect(() => {
    const handleGetMessages=async()=>{
      const response = await axios.post('/api/getMessages', {
        sender:userinfo.user_id,
        reciever:selectedChatData.user_id,
      });
      dispatch(setSelectedChatMessages(response.data));
    }
    
    if(selectedChatType=="direct"){
      handleGetMessages()
    }
  }, [selectedChatMessages,selectedChatData,selectedChatType,userinfo,setSelectedChatMessages,dispatch]);
  const messageEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const handleImagePreview = (url) => {
    setimgclick(url);
  };
  // Track scroll position
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;

    // Check if the user is at the bottom
    setIsAtBottom(scrollHeight - scrollTop <= clientHeight + 10);
  };

  useEffect(() => {
    const isNewMessage = selectedChatMessages.length > lastMessageCount;
    setLastMessageCount(selectedChatMessages.length);

    // Auto-scroll on new message OR if user is at the bottom
    if (isAtBottom || isNewMessage) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChatMessages,isAtBottom,lastMessageCount]);
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if(!file)return;
    const uploadType = file.type.startsWith("image/") ? "image" : "raw";
    const fdata=new FormData();
    fdata.append("file",file);
    fdata.append("upload_preset","chitchat");
    fdata.append("cloud_name","dbi0iqr0h")
    const { data } = await axios.post(
      `https://api.cloudinary.com/v1_1/dbi0iqr0h/${uploadType}/upload`,
      fdata
    );
    setSelectedFile(data.secure_url); // This is asynchronous
    console.log("File Selected:", data.secure_url); // Logs the correct file object
    try {
      if(selectedChatType==="direct"){
      const info = await axios.post("/api/postfile", {
        file: data.secure_url,
        sender: userinfo.id,
        content:"",
        receiver:selectedChatData.id,
        type:"file",
        headers: { 'Content-Type': 'application/json' },
      });
  
      console.log("File uploaded successfully:", info.data);
    }
    } catch (err) {
      console.error("Error uploading file:", err);
    }
  };
  const [isOpen, setIsOpen] = useState(false);
  const toggleModal = () => setIsOpen(!isOpen);
  const downloadImage = async () => {
    try {
      // Fetch the image as a Blob
      const response = await fetch(imgclick);
      const blob = await response.blob();

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "downloaded-image.jpg";

      // Trigger the download
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };
  return selectedChatType==="direct"?(
    <div className={`h-[100vh] w-[100vw] flex md:h-screen bg-black text-white md:w-[80vw] `}>
      <main className="flex-1 flex flex-col bg-gray-900/80 backdrop-blur-lg border-l border-gray-700">
        <header className="p-4 font-bold text-lg border-b border-gray-700 text-cyan-400 flex justify-between px-10 items-center">
          <div className="flex gap-5 items-center">
            <img
              src={tempimageUrl}
              alt="profile image"
              className="w-[10vw] h-[10vw] md:w-[3vw] md:h-[3vw] rounded-full"
            />
            <h2>{`${selectedChatData.fullname}`}</h2>
          </div>
          <i
            className="fa-solid fa-xmark text-3xl cursor-pointer"
            onClick={() => {
              dispatch(closeChat());
            }}
          ></i>
        </header>
        <section
          className="flex-1 p-4 overflow-auto"
          ref={chatContainerRef}
          onScroll={handleScroll}
        >
          {imgclick && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center" >
          <i className="fa-solid fa-xmark text-4xl absolute top-15 right-15 cursor-pointer" onClick={() => setimgclick(null)}></i>
          <i className="fa-solid fa-download text-3xl absolute top-15 right-30 cursor-pointer" onClick={downloadImage}></i>
          <img src={imgclick} alt="Preview" className="max-w-full max-h-full"  />
        </div>
      )}
      
          {selectedChatMessages.length===0?(<div className='flex items-center justify-center h-[100%]'><h1 className='text-3xl text-cyan-600 font-medium'>Be first to send message</h1></div>):(selectedChatMessages.map(
            (msg, index) => (
              msg.message_type != "file" ?(
                <div key={index} className="my-4 relative">
                  <div
                    key={index}
                    className={`p-3 md:p-4 my-2 w-[60vw] md:max-w-xs h-auto break-words  ${
                      msg.sender === userinfo.user_id
                        ? "ml-auto bg-cyan-600"
                        : "bg-gray-700"
                    } rounded-4xl shadow-md shadow-cyan-400/30`}
                  >
                    <p>{msg.content}</p>
                  </div>
                  <p
                    className={`text-slate-400 my-1 max-w-xs text-sm  ${
                      msg.sender === userinfo.user_id ? "ml-auto text-right mr-3 " : "text-left ml-3"
                    }`}
                  >
                    {timeAgo(msg.timestamp)}
                  </p>
                </div>
              ) :(
                <div className="my-4 relative" key={index}>
                <div
                  key={index}
                  className={`md:p-2 p-1 max-w-[40vw] my-2 md:max-w-[19vw] h-auto flex items-center justify-center  ${
                    msg.sender === userinfo.user_id
                      ? "ml-auto bg-cyan-600"
                      : "bg-gray-700"
                  } rounded-4xl shadow-md shadow-cyan-400/30`}
                >
                    <img
                      src={msg.file_url}
                      alt="image"
                      className="rounded-4xl"
                      onClick={() => handleImagePreview(msg.file_url)}
                    />
                 </div >
                 <p
                    className={`text-slate-400 my-1 max-w-xs text-sm  ${
                      msg.sender === userinfo.user_id ? "ml-auto text-right mr-3 " : "text-left ml-3"
                    }`}
                  >
                  {timeAgo(msg.timestamp)}
                </p>
                </div>
              )
            ))
          )}
          <div ref={messageEndRef} />
        </section>
        <footer className="p-4 flex border-t border-gray-700 gap-2 items-center">
          <input
            className="flex-1 p-2 rounded-4xl bg-gray-800 text-white outline-none border border-gray-700 focus:border-cyan-400 px-5"
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
            }}
          />
          <input
            type="file"
             accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            name="file"
            id="file"
          />
          <label htmlFor="file">
            <i className="fa-solid fa-image text-xl cursor-pointer"></i>
          </label>
          <button onClick={() => setemojipicker(true)}>
            <i className="fa-regular fa-face-grin-wide text-xl cursor-pointer"></i>
          </button>
          <div className="absolute bottom-16 right-0" ref={emojiref}>
            <EmojiPicker
              theme="dark"
              open={emojipicker}
              onEmojiClick={handelemoji}
              autoFocusSearch={false}
            />
          </div>
          <button
            className="ml-2 bg-cyan-600 px-4 py-2 rounded-xl hover:bg-cyan-500 transition"
            onClick={handleSendMessage}
          >
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </footer>
      </main>
      <aside className="hidden md:block w-1/4 bg-gray-900/80 backdrop-blur-lg p-4 border-l border-gray-700">
        <h3 className="text-lg font-bold text-cyan-400">Conversation Info</h3>
        <div className="mt-4">
          <h4 className="font-semibold text-cyan-300">Recent Photos</h4>
          <div className="h-140 bg-gray-700 rounded my-2 shadow-md shadow-cyan-400/30 p-5">
  {images.length === 0 ? (
    <h1>No image found</h1>
  ) : (
    images.map((img, index) => (
      <div
        className="p-2 my-2 max-w-[19vw] h-auto flex items-center justify-center bg-cyan-600 rounded-4xl"
        key={index}
        onClick={() => handleImagePreview(img.file_url)}
      >
        <img
          src={img.file_url}
          alt="image"
          className="rounded-4xl w-[70%]"
        />
      </div>
    ))
  )}
</div>
          
        </div>
      </aside>
      <Toaster />
    </div>
  ):(
    <div className="flex h-screen bg-black text-white w-[80vw] ">
      <main className="flex-1 flex flex-col bg-gray-900/80 backdrop-blur-lg border-l border-gray-700">
        <header className="p-4 font-bold text-lg border-b border-gray-700 text-cyan-400 flex justify-between px-10 items-center">
          <div className="flex gap-5 items-center">
            <img
              src="group.png"
              alt="profile image"
              className="w-[3vw] h-[3vw] rounded-full"
            />
            <h2>{selectedChatData.name}</h2>
          </div>
          <i
            className="fa-solid fa-xmark text-3xl cursor-pointer"
            onClick={() => {
              dispatch(closeChat());
            }}
          ></i>
        </header>
        <section
          className="flex-1 p-4 overflow-auto"
          ref={chatContainerRef}
          onScroll={handleScroll}
        >
          {imgclick && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center" >
          <i className="fa-solid fa-xmark text-4xl absolute top-15 right-15 cursor-pointer" onClick={() => setimgclick(null)}></i>
          <i className="fa-solid fa-download text-3xl absolute top-15 right-30 cursor-pointer" onClick={downloadImage}></i>
          <img src={imgclick} alt="Preview" className="max-w-full max-h-full"  />
        </div>
      )}
      
          {selectedChatMessages.length===0?(<div className='flex items-center justify-center h-[100%]'><h1 className='text-3xl text-cyan-600 font-medium'>Be first to send message</h1></div>):(selectedChatMessages.map(
            (msg, index) => (
              msg.message_type != "file" ?(
                <div key={index} className="my-4 relative">
                  <div
                    key={index}
                    className={`p-4 my-2 max-w-xs h-auto break-words  ${
                      msg.sender === userinfo.user_id
                        ? "ml-auto bg-cyan-600"
                        : "bg-gray-700"
                    } rounded-4xl shadow-md shadow-cyan-400/30`}
                  >
                    <p>{msg.content}</p>
                  </div>
                  <p
                    className={`text-slate-400 my-1 max-w-xs text-sm  ${
                      msg.sender === userinfo.user_id ? "ml-auto text-right mr-3 " : "text-left ml-3"
                    }`}
                  >
                    {timeAgo(msg.timestamp)}
                  </p>
                </div>
              ) :(
                <div className="my-4 relative" key={index}>
                <div
                  key={index}
                  className={`p-2  my-2 max-w-[19vw] h-auto flex items-center justify-center  ${
                    msg.sender === userinfo.user_id
                      ? "ml-auto bg-cyan-600"
                      : "bg-gray-700"
                  } rounded-4xl shadow-md shadow-cyan-400/30`}
                >
                    <img
                      src={msg.file_url}
                      alt="image"
                      className="rounded-4xl"
                      onClick={() => handleImagePreview(msg.file_url)}
                    />
                 </div >
                 <p
                    className={`text-slate-400 my-1 max-w-xs text-sm  ${
                      msg.sender === userinfo.user_id ? "ml-auto text-right mr-3 " : "text-left ml-3"
                    }`}
                  >
                  {timeAgo(msg.timestamp)}
                </p>
                </div>
              )
            ))
          )}
          <div ref={messageEndRef} />
        </section>
        <footer className="p-4 flex border-t border-gray-700 gap-2 items-center">
          <input
            className="flex-1 p-2 rounded-4xl bg-gray-800 text-white outline-none border border-gray-700 focus:border-cyan-400 px-5"
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
            }}
          />
          <input
            type="file"
             accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            name="file"
            id="file"
          />
          <label htmlFor="file">
            <i className="fa-solid fa-image text-xl cursor-pointer"></i>
          </label>
          <button onClick={() => setemojipicker(true)}>
            <i className="fa-regular fa-face-grin-wide text-xl cursor-pointer"></i>
          </button>
          <div className="absolute bottom-16 right-0" ref={emojiref}>
            <EmojiPicker
              theme="dark"
              open={emojipicker}
              onEmojiClick={handelemoji}
              autoFocusSearch={false}
            />
          </div>
          <button
            className="ml-2 bg-cyan-600 px-4 py-2 rounded-xl hover:bg-cyan-500 transition"
            onClick={handleSendMessage}
          >
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </footer>
      </main>
      <aside className="w-1/4 bg-gray-900/80 backdrop-blur-lg p-4 border-l border-gray-700">
        <h3 className="text-lg font-bold text-cyan-400">Conversation Info</h3>
        <div className="mt-4">
          <h4 className="font-semibold text-cyan-300">Recent Photos</h4>
          <div className="h-140 bg-gray-700 rounded my-2 shadow-md shadow-cyan-400/30 p-5">
  {images.length === 0 ? (
    <h1>No image found</h1>
  ) : (
    images.map((img, index) => (
      <div
        className="p-2 my-2 max-w-[19vw] h-auto flex items-center justify-center bg-cyan-600 rounded-4xl"
        key={index}
        onClick={() => handleImagePreview(img.file_url)}
      >
        <img
          src={img.file_url}
          alt="image"
          className="rounded-4xl w-[70%]"
        />
      </div>
    ))
  )}
</div> 
        </div>
      </aside>
      <Toaster />
    </div>
  )
}


export default ChatContainer;
