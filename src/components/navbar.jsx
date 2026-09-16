import {
  Menu,
  Bell,
  UserCircle,
  ChevronDown,
} from "lucide-react";

function Navbar({ setSidebarOpen }) {
  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8">

      {/* ================= LEFT SIDE ================= */}

      <div className="flex items-center min-w-0">

        {/* MENU BUTTON */}

        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 mr-3 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200"
          aria-label="Open menu"
        >
          <Menu size={25} />
        </button>

        {/* TITLE */}

        <div className="min-w-0">

          <h1 className="text-lg md:text-xl font-bold text-slate-900 truncate">
            Legal Metrology Inspection System
          </h1>

          <p className="text-xs md:text-sm text-slate-500 mt-1 truncate">
            AI-assisted packaged commodity compliance
          </p>

        </div>

      </div>


      {/* ================= RIGHT SIDE ================= */}

      <div className="flex items-center gap-2 md:gap-6">

        {/* NOTIFICATION */}

        <button
          className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200"
          aria-label="Notifications"
        >
          <Bell size={21} />

          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>


        {/* USER */}

        <button
          className="flex items-center gap-2 md:gap-3 px-1 md:px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-all duration-200"
        >

          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-blue-100 flex items-center justify-center">

            <UserCircle
              size={23}
              className="text-blue-700"
            />

          </div>


          {/* USER DETAILS */}

          <div className="text-left hidden sm:block">

            <p className="text-sm font-semibold text-slate-900">
              Inspector
            </p>

            <p className="text-xs text-slate-500">
              Enforcement Officer
            </p>

          </div>


          <ChevronDown
            size={17}
            className="text-slate-400 hidden sm:block"
          />

        </button>

      </div>

    </header>
  );
}

export default Navbar;