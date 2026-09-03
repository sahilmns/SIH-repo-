import {
  Bell,
  UserCircle,
  ChevronDown,
} from "lucide-react";

function Navbar() {
  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8">

      {/* Left Side */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          Legal Metrology Inspection System
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          AI-assisted packaged commodity compliance
        </p>
      </div>


      {/* Right Side */}
      <div className="flex items-center gap-6">

        {/* Notification */}
        <button
          className="relative p-2 rounded-lg text-slate-500
                     hover:bg-slate-100 hover:text-slate-900
                     transition-all duration-200"
        >
          <Bell size={22} />

          {/* Notification Dot */}
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5
                           bg-red-500 rounded-full border-2 border-white">
          </span>
        </button>


        {/* Profile */}
        <button
          className="flex items-center gap-3 px-2 py-1.5 rounded-lg
                     hover:bg-slate-50
                     transition-all duration-200"
        >

          {/* Profile Icon */}
          <div className="w-10 h-10 rounded-full bg-blue-100
                          flex items-center justify-center">
            <UserCircle
              size={25}
              className="text-blue-700"
            />
          </div>


          {/* User Details */}
          <div className="text-left">

            <p className="text-sm font-semibold text-slate-900">
              Inspector
            </p>

            <p className="text-xs text-slate-500">
              Enforcement Officer
            </p>

          </div>


          {/* Dropdown */}
          <ChevronDown
            size={17}
            className="text-slate-400"
          />

        </button>

      </div>

    </header>
  );
}

export default Navbar;