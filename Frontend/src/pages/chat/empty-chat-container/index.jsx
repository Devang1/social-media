import '../../../App.css'
function EmptyChatContainer() {
  return (
    <div className="flex flex-col items-center justify-center bg-gray-900 w-[80vw] h-[100vh] gap-10">
      <div className="flex flex-col items-center justify-center bg-gray-900 w-[80vw] h-[100vh] gap-10">
      <img src="logo.png" alt="logo" className="w-20 h-20 rounded-full" />
      <h1 className="text-5xl text-white font-medium">START A <span className="text-cyan-400">CHAT!</span></h1>
      </div>
    </div>
  )
}

export default EmptyChatContainer;
