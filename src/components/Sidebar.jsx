import {
  LayoutDashboard,
  Camera,
  History,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  X,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";

import logo from "../assets/labellogo.png";
import { useAuth } from "../context/AuthContext";

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Close sidebar
  const closeMenu = () => {
    setSidebarOpen(false);
  };

  // Logout
  const handleLogout = () => {
    logout();
    setSidebarOpen(false);
    navigate("/login");
  };

  // Sidebar navigation items
  const navItems = [
    {
      to: "/",
      icon: LayoutDashboard,
      label: "Dashboard",
    },
    {
      to: "/new-inspection",
      icon: Camera,
      label: "New Inspection",
    },
    {
      to: "/history",
      icon: History,
      label: "History",
    },
    {
      to: "/analytics",
      icon: BarChart3,
      label: "Analytics",
    },
    {
      to: "/reports",
      icon: FileText,
      label: "Reports",
    },
    {
      to: "/settings",
      icon: Settings,
      label: "Settings",
    },
  ];

  return (
    <>
      {/* ================= OVERLAY ================= */}

      {sidebarOpen && (
        <div
          onClick={closeMenu}
          className="fixed inset-0 bg-black/50 z-40"
          aria-hidden="true"
        />
      )}

      {/* ================= SIDEBAR ================= */}

      <aside
        className={`
          fixed
          left-0
          top-0
          z-50
          w-64
          h-screen
          bg-[#0B1220]
          text-white
          shadow-2xl
          transform
          transition-transform
          duration-300
          ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >

        {/* ================= LOGO ================= */}

        <div className="p-6 border-b border-slate-800">

          <div className="flex items-center justify-between">

            {/* Logo + Name */}

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-white/5">

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

            {/* Close Button */}

            <button
              onClick={closeMenu}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-200"
              aria-label="Close menu"
            >
              <X size={21} />
            </button>

          </div>

        </div>


        {/* ================= NAVIGATION ================= */}

        <nav className="p-4 space-y-2">

          {navItems.map((item) => {

            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-900/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`
                }
              >
                <Icon size={19} />

                <span>{item.label}</span>
              </NavLink>
            );
          })}

        </nav>


        {/* ================= LOGOUT ================= */}

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut size={19} />

            <span>Logout</span>
          </button>

        </div>

      </aside>
    </>
  );
}

export default Sidebar;