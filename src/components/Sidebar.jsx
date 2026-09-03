import {
  LayoutDashboard,
  Camera,
  History,
  BarChart3,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";

import logo from "../assets/LableLens.png";

import { useAuth } from "../context/AuthContext";


function Sidebar() {

  const navigate = useNavigate();

  const { logout } = useAuth();


  const handleLogout = () => {

    logout();

    navigate("/login");

  };


  return (

    <aside className="w-64 min-h-screen bg-[#0B1220] text-white fixed left-0 top-0">

      {/* ================= LOGO ================= */}

      <div className="p-6 border-b border-slate-800">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center">

            <img
              src={logo}
              alt="LabelLens Logo"
              className="w-full h-full object-contain"
            />

          </div>


          <div>

            <h2 className="text-xl font-bold tracking-tight">

              Label<span className="text-cyan-400">Lens</span>

            </h2>


            <p className="text-xs text-slate-400 mt-0.5">

              Compliance Intelligence

            </p>

          </div>

        </div>

      </div>


      {/* ================= NAVIGATION ================= */}

      <nav className="p-4 space-y-2">

        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              isActive
                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-900/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`
          }
        >

          <LayoutDashboard size={19} />

          Dashboard

        </NavLink>


        <NavLink
          to="/new-inspection"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              isActive
                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-900/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`
          }
        >

          <Camera size={19} />

          New Inspection

        </NavLink>


        <NavLink
          to="/history"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              isActive
                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-900/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`
          }
        >

          <History size={19} />

          History

        </NavLink>


        <NavLink
          to="/analytics"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              isActive
                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-900/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`
          }
        >

          <BarChart3 size={19} />

          Analytics

        </NavLink>


        <NavLink
          to="/reports"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              isActive
                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-900/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`
          }
        >

          <FileText size={19} />

          Reports

        </NavLink>


        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              isActive
                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-900/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`
          }
        >

          <Settings size={19} />

          Settings

        </NavLink>

      </nav>


      {/* ================= LOGOUT ================= */}

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >

          <LogOut size={19} />

          Logout

        </button>

      </div>

    </aside>

  );

}


export default Sidebar;