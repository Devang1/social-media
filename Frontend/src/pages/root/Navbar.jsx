
import { IoIosSearch,IoIosNotifications } from "react-icons/io";
import { TiMessages } from "react-icons/ti";
import { useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom'

const Navbar = () => {
  const user = useSelector((state)=>state.userInfo.user)
  console.log(user)
  const navigate  = useNavigate()
  return (
    <>
      <div className="w-full h-16 bg-gray-900 flex p-10 text-white justify-between items-center">
        <h1 className="text-2xl font-bold">Discover</h1>
        <div className="flex text-white p-2 px-5 gap-2 items-center min-w-[40vw] rounded-full outline-none shadow-[4px_4px_8px_rgba(255,255,255,0.1),-4px_-4px_8px_rgba(0,0,0,0.6)]">
          <IoIosSearch />
          <input type="search" placeholder="Search for content " className="outline-none"></input>
        </div>
        <div className="flex items-center gap-2 text-2xl">
          <TiMessages className="cursor-pointer" onClick={()=>{ navigate('/chat')}} />
          <IoIosNotifications />
          <div className="flex items-center gap-0">
            <h2 className="text-sm">{user.username}</h2>
            <img src="https://static.vecteezy.com/system/resources/previews/019/879/186/non_2x/user-icon-on-transparent-background-free-png.png" className="w-12 bg-gray-900"></img>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
