import {
  LayoutDashboard,
  Camera,
  History,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";

import logo from "../assets/labellogo.png";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMobileOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

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
      {/* ================= MOBILE MENU BUTTON ================= */}

      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden w-11 h-11 bg-[#0B1220] text-white rounded-xl flex items-center justify-center shadow-lg"
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>


      {/* ================= MOBILE OVERLAY ================= */}

      {mobileOpen && (
        <div
          onClick={closeMobileMenu}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />
      )}


      {/* ================= SIDEBAR ================= */}

      <aside
        className={`
          w-64 min-h-screen bg-[#0B1220] text-white fixed left-0 top-0 z-50
          transform transition-transform duration-300
          md:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >

        {/* ================= LOGO ================= */}

        <div className="p-6 border-b border-slate-800">

          <div className="flex items-center justify-between">

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


            {/* Mobile close button */}

            <button
              onClick={closeMobileMenu}
              className="md:hidden text-slate-400 hover:text-white"
              aria-label="Close menu"
            >
              <X size={22} />
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
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-900/30"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`
                }
              >
                <Icon size={19} />

                {item.label}
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

            Logout

          </button>

        </div>

      </aside>
    </>
  );
}

export default Sidebar;
