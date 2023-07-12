const Sidebar = () => {
  return (
    <div className="w-60 bg-slate-600 text-slate-50">
       <ul className="px-4 py-2 m-0">
          <li  className="pl-4 py-5 font-semibold border-b hover:bg-slate-400 focus:bg-indigo-100">PROFILE</li>
          <li  className="pl-4 py-2 font-semibold hover:bg-slate-400 focus:bg-indigo-100">Manage My AI</li>
          <li  className="pl-4 py-2 font-semibold hover:bg-slate-400 focus:bg-indigo-100">Chat Messages</li>
          <ul className="px-4 py-2 font-medium">
            <li className="px-2 py-2 hover:bg-slate-400 focus:bg-indigo-100">Chat 1</li>
            <li className="px-2 py-2 hover:bg-slate-400 focus:bg-indigo-100">Chat 2</li>
            <li className="px-2 py-2 hover:bg-slate-400 focus:bg-indigo-100">Chat 3</li>
          </ul>
      </ul>
    </div>
  )
}

export default Sidebar
