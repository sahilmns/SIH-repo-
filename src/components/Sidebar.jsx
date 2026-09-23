import {
  LayoutDashboard,
  Camera,
  History,
  BarChart3,
  FileText,
  MessageSquareWarning,
  Settings,
  LogOut,
  X,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

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

  // Role based sidebar navigation
  const navItems =
    user?.role === "consumer"
      ? [
          {
            to: "/consumer-dashboard",
            icon: LayoutDashboard,
            label: "Dashboard",
          },
          {
            to: "/consumer-scan",
            icon: Camera,
            label: "Scan Product",
          },
          {
            to: "/consumer-history",
            icon: History,
            label: "My Scans",
          },
          {
            to: "/consumer-reports",
            icon: FileText,
            label: "Reports",
          },
          {
            to: "/consumer-report-issue",
            icon: MessageSquareWarning,
            label: "Report an Issue",
          },
          {
            to: "/consumer-settings",
            icon: Settings,
            label: "Settings",
          },
        ]
      : [
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
      {/* =====================================================
          OVERLAY
      ====================================================== */}

      {sidebarOpen && (
        <div
          onClick={closeMenu}
          className="fixed inset-0 bg-black/50 z-40"
          aria-hidden="true"
        />
      )}

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

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

        {/* =================================================
            LOGO AREA
        ================================================== */}

        <div className="p-5 border-b border-slate-800">

          <div className="flex items-center justify-between gap-3">

            {/* NEW LOGO */}

            <button
              type="button"
              onClick={() => {
                closeMenu();
                navigate("/");
              }}
              className="
                flex
                items-center
                justify-start
                flex-1
                min-w-0
                bg-transparent
                border-0
                p-0
                cursor-pointer
              "
              aria-label="NiyamDrishti Home"
            >

              <img
                src="/images/Newlogo.png"
                alt="NiyamDrishti"
                className="
                  w-[210px]
                  h-auto
                  max-h-[80px]
                  object-contain
                  object-left
                "
                onError={(e) => {
                  console.error(
                    "Sidebar logo not found:",
                    e.currentTarget.src
                  );
                }}
              />
              

            </button>


            {/* CLOSE BUTTON */}

            <button
              type="button"
              onClick={closeMenu}
              className="
                shrink-0
                w-9
                h-9
                flex
                items-center
                justify-center
                rounded-lg
                text-slate-400
                hover:text-white
                hover:bg-slate-800
                transition-all
                duration-200
              "
              aria-label="Close menu"
              title="Close menu"
            >
              <X size={21} />
            </button>

          </div>

        </div>


        {/* =================================================
            NAVIGATION
        ================================================== */}

        <nav className="p-4 space-y-2">

          {navItems.map((item) => {

            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
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


        {/* =================================================
            LOGOUT
        ================================================== */}

        <div
          className="
            absolute
            bottom-0
            left-0
            right-0
            p-4
            border-t
            border-slate-800
          "
        >

          <button
            type="button"
            onClick={handleLogout}
            className="
              w-full
              flex
              items-center
              gap-3
              px-4
              py-3
              rounded-xl
              text-red-400
              hover:text-red-300
              hover:bg-red-500/20
              hover:shadow-lg
              hover:shadow-red-900/20
              hover:translate-x-1
              transition-all
              duration-200
            "
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

