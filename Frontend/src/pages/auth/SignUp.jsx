import React, { useState } from 'react'
import { FaUser, FaEye, FaEyeSlash } from 'react-icons/fa'
import { AiOutlineUser } from 'react-icons/ai'
import img from '../../assets/EduSphere_Left_Part.jpeg'
import { useSelector, useDispatch } from "react-redux";
import { share } from '../../redux/slice'
import { useNavigate } from 'react-router-dom'
import { setuserinfo} from '../../redux/chat-slice';
import axios from "axios";
const SignUp = () => {
  const [username, setUsername] = useState("")
  const [pass, setPass] = useState("")
  const [cpass, setCPass] = useState("")
  const [fullname, setFullname] = useState("")
  const [login, setLogin] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const fetchUser = async () => {
      try {
        const response = await axios.get("/api/isAuth", {
                            params: { username }, 
                            withCredentials: true,
                          });
        if (response.data !== "not authenticated") {
          dispatch(setuserinfo(response.data)); 
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
  // const userInfo = useSelector((state)=> state.userInfo.user)
  const handleSignup = async (e) => {
    e.preventDefault();
  
    if (pass !== cpass) {
      alert("Passwords do not match");
      return;
    }
  
    const user = {
      username,
      fullname,
      password: pass,
      cpassword: cpass,
    };
  
    try {
      const response = await fetch("/api/createAccount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(user),
      });
  
      const message = await response.text();
  
      if (response.ok) {
        alert("Signup successful");
        console.log(user)
        navigate("/home");
        fetchUser()
      } else {
        alert("Signup failed: " + message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Server error");
    }
  
    // Reset form
    setUsername("");
    setFullname("");
    setPass("");
    setCPass("");
  };
  
  const handleComponent = (e)=>{
      e.preventDefault()
      setLogin(!login)
      console.log(login)
      dispatch(share(!login))
    }
  return (
    <>
      <h1 className='font-medium text-2xl text-center'>EduSphere</h1>
      <form className='flex flex-col p-2 gap-4 items-center'>
        <div className='flex bg-white rounded-lg text-black px-2 justify-between items-center'>
          <input type="text" name="username" id="username" placeholder='Username' className='bg-white rounded-lg text-black p-1 px-2 outline-none' value={username} onChange={(e) => setUsername(e.target.value)} />
          <FaUser />
        </div>
        <div className='flex bg-white rounded-lg text-black px-2 justify-between items-center'>
          <input type="text" name="fullname" id="fullname" placeholder='Full Name' className='bg-white rounded-lg text-black p-1 px-2 outline-none' value={fullname} onChange={(e) => setFullname(e.target.value)} />
          <AiOutlineUser />
        </div>
        <div className='flex bg-white rounded-lg text-black px-2 justify-between items-center'>
          <input type="password" name="password" id="password" placeholder='Password' className='bg-white rounded-lg text-black p-1 px-2 outline-none' value={pass} onChange={(e) => setPass(e.target.value)} required/>
          <FaEye />
        </div>
        <div className='flex bg-white rounded-lg text-black px-2 justify-between items-center'>
          <input type="password" name="cpassword" id="cpassword" placeholder='Confirm Password' className='bg-white rounded-lg text-black p-1 px-2 outline-none' value={cpass} onChange={(e) => setCPass(e.target.value)} required/>
          <FaEyeSlash />
        </div>
        <p className='text-sm'>Already have a account? <a className='text-xs text-blue-400 cursor-pointer' onClick={handleComponent}>Login</a></p>
        <button onClick={handleSignup} className='bg-gray-800 w-fit px-4 py-1 rounded-2xl'>Create Account</button>
      </form>
    </>
  )
}

export default SignUp