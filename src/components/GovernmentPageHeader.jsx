import {
  Scale,
  Accessibility,
  HelpCircle,
  Bell,
  UserCircle,
  ChevronRight,
  Home,
} from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";

function GovernmentPageHeader() {
  const location = useLocation();
  const navigate = useNavigate();

  const pageNames = {
    "/new-inspection": "New Inspection",
    "/image-review": "Image Review",
    "/online-product-review": "Online Product Review",
    "/analysis": "Inspection Analysis",
    "/compliance-result": "Compliance Result",
    "/evidence-review": "Evidence Review",
    "/report": "Inspection Report",
    "/history": "Inspection History",
    "/analytics": "Analytics",
    "/reports": "Reports",
    "/settings": "Settings",
  };

  const currentPage =
    pageNames[location.pathname] || "Inspection Portal";

  return (
    <header className="w-full">

      {/* =====================================================
          GOVERNMENT TOP BAR
      ====================================================== */}

      <div className="bg-[#06345b] text-white">

        <div className="max-w-[1500px] mx-auto px-5 lg:px-10">

          <div className="min-h-[44px] flex items-center justify-between">

            <div className="flex items-center gap-3">

              <span className="text-sm md:text-base font-bold">
                Government of India
              </span>

              <span className="text-white/40">
                |
              </span>

              <span className="text-sm md:text-base text-white/85">
                Department of Consumer Affairs
              </span>

            </div>


            <div className="hidden md:flex items-center gap-5 text-sm">

              <button className="flex items-center gap-2 hover:text-[#ffcc80] transition">
                <Accessibility size={17} />
                Accessibility
              </button>

              <span className="text-white/30">|</span>

              <button className="flex items-center gap-2 hover:text-[#ffcc80] transition">
                <HelpCircle size={17} />
                Help
              </button>

              <span className="text-white/30">|</span>

              <button className="hover:text-[#ffcc80] transition">
                English
              </button>

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          PORTAL HEADER
      ====================================================== */}

      <div className="bg-white border-b border-slate-200 shadow-sm">

        <div className="max-w-[1500px] mx-auto px-5 lg:px-10">

          <div className="min-h-[82px] flex items-center justify-between">

            {/* BRAND */}

            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-3 text-left group"
            >

              <div className="
                w-12
                h-12
                rounded-full
                bg-[#073b67]
                flex
                items-center
                justify-center
                shadow-sm
                group-hover:shadow-md
                transition
              ">

                <Scale
                  size={25}
                  className="text-white"
                />

              </div>


              <div>

                <p className="
                  text-[9px]
                  md:text-[10px]
                  font-bold
                  tracking-[0.16em]
                  uppercase
                  text-[#073b67]
                ">
                  Department of Consumer Affairs
                </p>

                <p className="
                  text-xl
                  md:text-2xl
                  font-bold
                  text-[#073b67]
                  leading-tight
                ">
                  NiyamDrishti
                </p>

                <p className="
                  text-[11px]
                  md:text-xs
                  text-slate-500
                ">
                  Digital Legal Metrology Inspection Portal
                </p>

              </div>

            </button>


            {/* RIGHT SIDE */}

            <div className="flex items-center gap-3 md:gap-5">

              <button
                className="
                  hidden md:flex
                  items-center gap-2
                  text-slate-600
                  hover:text-[#073b67]
                  transition
                  text-sm
                  font-semibold
                "
              >

                <Accessibility size={20} />

                Accessibility

              </button>


              <button
                className="
                  hidden md:flex
                  items-center gap-2
                  text-slate-600
                  hover:text-[#073b67]
                  transition
                  text-sm
                  font-semibold
                "
              >

                <HelpCircle size={20} />

                Help

              </button>


              <button
                className="
                  relative
                  p-2
                  rounded-lg
                  text-slate-600
                  hover:bg-slate-100
                  transition
                "
              >

                <Bell size={21} />

                <span className="
                  absolute
                  top-1
                  right-1
                  w-2
                  h-2
                  bg-[#e5232e]
                  rounded-full
                " />

              </button>


              {/* USER */}

              <div className="hidden sm:flex items-center gap-2">

                <div className="
                  w-9
                  h-9
                  rounded-full
                  bg-[#edf5fa]
                  flex
                  items-center
                  justify-center
                ">

                  <UserCircle
                    size={22}
                    className="text-[#073b67]"
                  />

                </div>

                <div>

                  <p className="text-sm font-bold text-slate-800">
                    Inspector
                  </p>

                  <p className="text-[10px] text-slate-500">
                    Enforcement Officer
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          TRICOLOUR LINE
      ====================================================== */}

      <div className="flex h-[3px]">

        <div className="w-1/3 bg-[#ff9933]" />

        <div className="w-1/3 bg-white border-y border-slate-100" />

        <div className="w-1/3 bg-[#138808]" />

      </div>


      {/* =====================================================
          BREADCRUMB / PAGE TITLE
      ====================================================== */}

      <div className="bg-[#f4f7fa] border-b border-slate-200">

        <div className="max-w-[1500px] mx-auto px-5 lg:px-10">

          <div className="py-5">

            {/* Breadcrumb */}

            <div className="
              flex
              items-center
              gap-2
              text-xs
              md:text-sm
              text-slate-500
              mb-3
            ">

              <button
                onClick={() => navigate("/")}
                className="
                  flex
                  items-center
                  gap-1.5
                  hover:text-[#073b67]
                  transition
                "
              >

                <Home size={14} />

                Home

              </button>


              <ChevronRight size={14} />


              <span className="text-[#073b67] font-medium">
                {currentPage}
              </span>

            </div>


            {/* PAGE TITLE */}

            <div className="flex items-center justify-between">

              <div>

                <h1 className="
                  text-2xl
                  md:text-3xl
                  font-bold
                  text-[#102a43]
                ">
                  {currentPage}
                </h1>

                <p className="
                  mt-1
                  text-sm
                  md:text-base
                  text-slate-500
                ">
                  NiyamDrishti • Digital Legal Metrology Inspection System
                </p>

              </div>


              {/* Portal status */}

              <div className="
                hidden md:flex
                items-center gap-2
                px-3 py-2
                bg-white
                border
                border-slate-200
                rounded-md
                shadow-sm
              ">

                <span className="
                  w-2
                  h-2
                  bg-[#138808]
                  rounded-full
                " />

                <span className="
                  text-xs
                  font-semibold
                  text-slate-600
                ">
                  Portal Active
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>

    </header>
  );
}

export default GovernmentPageHeader;