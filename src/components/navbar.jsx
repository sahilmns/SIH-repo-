import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Search,
  Bell,
  UserCircle,
  ChevronDown,
  Accessibility,
  Menu,
  Scale,
  HelpCircle,
  Home,
  ShieldCheck,
  FileText,
  ClipboardCheck,
  BookOpen,
  BarChart3,
  ArrowRight,
} from "lucide-react";


/* =========================================================
   NIYAMDRISHTI LOGO
========================================================= */

function NiyamDrishtiLogo({ className = "" }) {
  const [src, setSrc] = useState("/images/NiyamDrishti.jpeg");

  const logoFiles = [
    "/images/NiyamDrishti.jpeg",
    "/images/NiyamDrishti.jpg",
    "/images/NiyamDrishti.png",
  ];

  const handleError = () => {
    const currentIndex = logoFiles.indexOf(src);

    if (currentIndex < logoFiles.length - 1) {
      setSrc(logoFiles[currentIndex + 1]);
    }
  };

  return (
    <img
      src={src}
      alt="NiyamDrishti Logo"
      onError={handleError}
      className={className}
    />
  );
}


/* =========================================================
   NAVBAR
========================================================= */

function Navbar({ setSidebarOpen }) {

  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);


  useEffect(() => {

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };

  }, []);


  return (

    <header className="relative w-full">


      {/* =====================================================
          STICKY NAVBAR
      ====================================================== */}

      <div
        className={`
          fixed
          top-0
          left-0
          right-0
          z-[100]
          bg-white/95
          backdrop-blur-md
          border-b
          border-slate-200
          shadow-[0_3px_15px_rgba(0,0,0,0.08)]
          transition-all
          duration-500
          ease-out
          ${
            isScrolled
              ? "translate-y-0 opacity-100"
              : "-translate-y-full opacity-0 pointer-events-none"
          }
        `}
      >


        {/* Tricolour */}

        <div className="flex h-[3px] w-full">

          <div className="w-1/3 bg-[#ff9933]" />

          <div className="w-1/3 bg-white" />

          <div className="w-1/3 bg-[#138808]" />

        </div>


        <div className="max-w-[1500px] mx-auto px-5 lg:px-10">

          <div className="h-[70px] flex items-center gap-6">


            {/* LOGO + BRAND */}

            <button
              type="button"
              onClick={() => navigate("/")}
              className="
                flex
                items-center
                gap-3
                shrink-0
                text-left
                group
              "
            >

              <div
                className="
                  w-10
                  h-10
                  rounded-lg
                  bg-white
                  border
                  border-slate-200
                  flex
                  items-center
                  justify-center
                  shadow-sm
                  overflow-hidden
                  group-hover:scale-105
                  transition-transform
                  duration-200
                "
              >

                <NiyamDrishtiLogo
                  className="
                    w-full
                    h-full
                    object-contain
                  "
                />

              </div>


              <div className="hidden sm:block">

                <p
                  className="
                    text-[9px]
                    font-bold
                    tracking-[0.15em]
                    uppercase
                    text-[#073b67]
                  "
                >
                  Department of Consumer Affairs
                </p>


                <p className="text-lg font-extrabold tracking-tight">

                  <span className="text-[#0A4F8F]">
                    Niyam
                  </span>

                  <span className="text-[#2D9CDB]">
                    Drishti
                  </span>

                </p>

              </div>

            </button>


            {/* SEARCH */}

            <div className="hidden md:flex flex-1 max-w-[620px] mx-auto">

              <div
                className="
                  flex
                  w-full
                  h-10
                  bg-slate-50
                  border
                  border-slate-300
                  rounded-lg
                  overflow-hidden
                  focus-within:border-[#1769aa]
                  focus-within:ring-2
                  focus-within:ring-[#1769aa]/10
                  transition
                "
              >

                <div className="flex items-center flex-1 px-4">

                  <Search
                    size={18}
                    className="text-slate-400 mr-3"
                  />

                  <input
                    type="text"
                    placeholder="Search services, rules and resources"
                    className="
                      w-full
                      outline-none
                      bg-transparent
                      text-sm
                      text-slate-700
                      placeholder:text-slate-400
                    "
                  />

                </div>


                <button
                  type="button"
                  onClick={() => navigate("/history")}
                  className="
                    px-6
                    bg-[#1769aa]
                    hover:bg-[#0e527f]
                    text-white
                    text-sm
                    font-semibold
                    transition
                  "
                >
                  Search
                </button>

              </div>

            </div>


            {/* RIGHT SIDE */}

            <div className="flex items-center gap-1.5 ml-auto">


              <button
                type="button"
                className="
                  hidden
                  lg:flex
                  items-center
                  gap-1.5
                  px-3
                  py-2
                  rounded-md
                  text-slate-700
                  hover:bg-slate-100
                  font-medium
                  text-sm
                  transition
                "
              >

                <Accessibility size={18} />

                Accessibility

              </button>


              <button
                type="button"
                className="
                  hidden
                  lg:flex
                  items-center
                  gap-1.5
                  px-3
                  py-2
                  rounded-md
                  text-slate-700
                  hover:bg-slate-100
                  font-medium
                  text-sm
                  transition
                "
              >

                <HelpCircle size={18} />

                Help

              </button>


              <button
                type="button"
                aria-label="Notifications"
                className="
                  relative
                  p-2.5
                  rounded-md
                  text-slate-700
                  hover:bg-slate-100
                  transition
                "
              >

                <Bell size={20} />

                <span
                  className="
                    absolute
                    top-1.5
                    right-1.5
                    w-2
                    h-2
                    bg-red-500
                    rounded-full
                    ring-2
                    ring-white
                  "
                />

              </button>


              {/* INSPECTOR */}

              <div className="hidden xl:flex items-center gap-2 ml-2">

                <div
                  className="
                    w-9
                    h-9
                    rounded-full
                    bg-[#edf5fa]
                    flex
                    items-center
                    justify-center
                  "
                >

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


                <ChevronDown
                  size={15}
                  className="text-slate-400"
                />

              </div>


              {/* MOBILE */}

              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
                className="
                  md:hidden
                  p-2
                  rounded-md
                  text-slate-700
                  hover:bg-slate-100
                  transition
                "
              >

                <Menu size={24} />

              </button>

            </div>

          </div>

        </div>

      </div>



      {/* =====================================================
          GOVERNMENT BAR
      ====================================================== */}

      <div className="bg-[#06345b] text-white">

        <div className="max-w-[1500px] mx-auto px-5 lg:px-10">

          <div className="h-[44px] flex items-center justify-between">


            <div className="flex items-center gap-3">

              <span className="text-sm md:text-base font-bold">
                Government of India
              </span>

              <span className="text-white/30">
                |
              </span>

              <span className="hidden sm:inline text-sm text-white/80">
                Department of Consumer Affairs
              </span>

            </div>


            <div className="hidden md:flex items-center gap-5">


              <button
                type="button"
                className="
                  flex
                  items-center
                  gap-1.5
                  text-xs
                  font-medium
                  text-white/90
                  hover:text-[#8ED8FF]
                  transition
                "
              >

                <Accessibility size={16} />

                Accessibility

              </button>


              <span className="text-white/20">
                |
              </span>


              <button
                type="button"
                className="
                  flex
                  items-center
                  gap-1.5
                  text-xs
                  font-medium
                  text-white/90
                  hover:text-[#8ED8FF]
                  transition
                "
              >

                <HelpCircle size={16} />

                Help

              </button>


              <span className="text-white/20">
                |
              </span>


              <button
                type="button"
                className="
                  text-xs
                  font-medium
                  text-white/90
                  hover:text-[#8ED8FF]
                  transition
                "
              >
                English
              </button>

            </div>

          </div>

        </div>

      </div>



      {/* =====================================================
          MAIN NAVIGATION
      ====================================================== */}

      <nav
        className="
          bg-white
          border-b
          border-slate-200
          shadow-sm
        "
      >

        <div className="max-w-[1500px] mx-auto px-5 lg:px-10">

          <div
            className="
              flex
              items-center
              h-[60px]
              gap-7
              lg:gap-10
              overflow-x-auto
              scrollbar-hide
            "
          >


            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="
                flex
                items-center
                gap-2
                h-full
                px-2
                text-slate-700
                hover:text-[#073b67]
                font-semibold
                text-sm
                whitespace-nowrap
                transition
              "
            >

              <Menu size={18} />

              All Services

            </button>


            <button
              type="button"
              onClick={() => navigate("/")}
              className="
                flex
                items-center
                gap-2
                h-full
                px-2
                text-[#073b67]
                font-bold
                text-sm
                whitespace-nowrap
                border-b-[3px]
                border-[#ff9933]
                transition
              "
            >

              <Home size={18} />

              Home

            </button>


            <button
              type="button"
              onClick={() => navigate("/new-inspection")}
              className="
                flex
                items-center
                gap-2
                h-full
                px-2
                text-slate-700
                hover:text-[#073b67]
                font-semibold
                text-sm
                whitespace-nowrap
                transition
              "
            >

              <ClipboardCheck size={18} />

              Inspections

            </button>


            <button
              type="button"
              onClick={() => navigate("/reports")}
              className="
                flex
                items-center
                gap-2
                h-full
                px-2
                text-slate-700
                hover:text-[#073b67]
                font-semibold
                text-sm
                whitespace-nowrap
                transition
              "
            >

              <BookOpen size={18} />

              Legal Resources

            </button>


            <button
              type="button"
              onClick={() => navigate("/reports")}
              className="
                flex
                items-center
                gap-2
                h-full
                px-2
                text-slate-700
                hover:text-[#073b67]
                font-semibold
                text-sm
                whitespace-nowrap
                transition
              "
            >

              <BarChart3 size={18} />

              Reports

            </button>


            <button
              type="button"
              onClick={() => navigate("/settings")}
              className="
                flex
                items-center
                gap-2
                h-full
                px-2
                text-slate-700
                hover:text-[#073b67]
                font-semibold
                text-sm
                whitespace-nowrap
                transition
              "
            >

              <HelpCircle size={18} />

              Help & Support

            </button>

          </div>

        </div>

      </nav>



      {/* =====================================================
          HERO
      ====================================================== */}

      <section
        className="
          relative
          overflow-hidden
          h-[calc(100vh-108px)]
          min-h-[500px]
          max-h-[680px]
        "
      >


        {/* ===================================================
            BACKGROUND IMAGE
        ==================================================== */}

        <div className="absolute inset-0">


          <img
            src="/images/inspection-5.png"
            alt="Legal Metrology inspection"
            className="
              absolute
              inset-0
              w-full
              h-full
              object-cover
              object-center
            "
          />


          {/* Very subtle blue atmospheric overlay */}

          <div
            className="
              absolute
              inset-0
              bg-[#087FC1]/[0.10]
            "
          />


          {/* Soft readability gradient */}

          <div
            className="
              absolute
              inset-0
              bg-gradient-to-b
              from-[#06345b]/10
              via-transparent
              to-[#031D35]/65
            "
          />


          {/* Local dark-blue glow behind central text */}

          <div
            className="
              absolute
              left-1/2
              top-[8%]
              -translate-x-1/2
              w-[760px]
              h-[430px]
              rounded-full
              bg-[#06345b]/20
              blur-[70px]
            "
          />

        </div>



        {/* ===================================================
            HERO CONTENT
        ==================================================== */}

        <div
          className="
            relative
            z-10
            h-full
            flex
            items-center
            justify-center
          "
        >

          <div
            className="
              w-full
              max-w-[1050px]
              mx-auto
              px-5
              pt-2
              pb-6
              text-center
            "
          >


            {/* =================================================
                LOGO
            ================================================== */}

            <div className="flex justify-center mb-2">


              <div
                className="
                  w-[58px]
                  h-[58px]
                  md:w-[64px]
                  md:h-[64px]
                  rounded-[17px]
                  bg-white
                  p-1.5
                  shadow-[0_8px_24px_rgba(0,35,70,0.28)]
                  border
                  border-white/90
                  overflow-hidden
                  flex
                  items-center
                  justify-center
                "
              >

                <NiyamDrishtiLogo
                  className="
                    w-full
                    h-full
                    object-contain
                    rounded-xl
                  "
                />

              </div>

            </div>



            {/* =================================================
                DEPARTMENT
            ================================================== */}

            <div
              className="
                flex
                items-center
                justify-center
                gap-3
                text-[9px]
                md:text-[10px]
                font-bold
                tracking-[0.20em]
                uppercase
                text-white
                drop-shadow-[0_2px_5px_rgba(0,0,0,0.65)]
              "
            >

              <span className="w-7 h-px bg-white/65" />

              Department of Consumer Affairs

              <span className="w-7 h-px bg-white/65" />

            </div>



            {/* =================================================
                NIYAMDRISHTI
            ================================================== */}

            <h1
              className="
                mt-2
                text-[45px]
                sm:text-[51px]
                md:text-[60px]
                lg:text-[68px]
                font-black
                tracking-[-0.045em]
                leading-[0.95]
                drop-shadow-[0_3px_10px_rgba(0,30,65,0.65)]
              "
            >

              <span
                className="
                  text-[#EAF6FF]
                "
              >
                Niyam
              </span>

              <span
                className="
                  text-[#38BDF8]
                "
              >
                Drishti
              </span>

            </h1>



            {/* =================================================
                SUBTITLE
            ================================================== */}

            <p
              className="
                mt-2
                text-sm
                md:text-[15px]
                font-semibold
                text-white
                tracking-[0.01em]
                drop-shadow-[0_2px_5px_rgba(0,0,0,0.75)]
              "
            >
              Digital Legal Metrology Inspection Portal
            </p>



            {/* =================================================
                TRICOLOUR
            ================================================== */}

            <div
              className="
                flex
                h-[3px]
                w-[105px]
                mt-3
                mx-auto
                overflow-hidden
                rounded-full
                shadow-[0_1px_5px_rgba(0,0,0,0.25)]
              "
            >

              <div className="w-1/3 bg-[#ff9933]" />

              <div className="w-1/3 bg-white" />

              <div className="w-1/3 bg-[#138808]" />

            </div>



            {/* =================================================
                SLOGAN
            ================================================== */}

            <p
              className="
                mt-2
                text-xs
                md:text-sm
                font-bold
                tracking-wide
                text-white
                drop-shadow-[0_2px_5px_rgba(0,0,0,0.75)]
              "
            >

              Check Compliance.

              <span className="text-[#7DD3FC]">
                {" "}Build Trust.
              </span>

            </p>



            {/* =================================================
                DIGITAL GOVERNANCE
            ================================================== */}

            <div className="mt-4">


              <div
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2.5
                  px-4
                  py-1.5
                  rounded-full
                  bg-[#06345b]/80
                  border
                  border-white/30
                  shadow-[0_5px_18px_rgba(0,25,55,0.22)]
                  text-[9px]
                  md:text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.15em]
                  backdrop-blur-[2px]
                "
              >

                <span className="text-[#7DD3FC]">
                  Digital Governance
                </span>

                <span className="text-white/50">
                  •
                </span>

                <span className="text-white">
                  Legal Metrology
                </span>

              </div>



              {/* =================================================
                  MAIN HEADING
              ================================================== */}

              <h2
                className="
                  mt-3
                  text-[26px]
                  sm:text-[29px]
                  md:text-[35px]
                  lg:text-[39px]
                  font-extrabold
                  text-white
                  leading-[1.05]
                  tracking-[-0.025em]
                  drop-shadow-[0_3px_8px_rgba(0,0,0,0.75)]
                "
              >

                Smart Inspection.

                <br />

                Transparent{" "}

                <span className="text-[#7DD3FC]">
                  Compliance.
                </span>

              </h2>



              {/* =================================================
                  DESCRIPTION
              ================================================== */}

              <p
                className="
                  mt-2.5
                  text-[10px]
                  sm:text-[11px]
                  md:text-xs
                  text-white/95
                  leading-relaxed
                  max-w-[680px]
                  mx-auto
                  font-medium
                  drop-shadow-[0_2px_5px_rgba(0,0,0,0.75)]
                "
              >
                AI-assisted inspection and compliance support for packaged
                commodities, helping enforcement officers review declarations
                and maintain accurate digital records.
              </p>

            </div>



            {/* =================================================
                SEARCH BAR
            ================================================== */}

            <div
              className="
                max-w-[690px]
                mx-auto
                mt-3.5
              "
            >

              <div
                className="
                  flex
                  flex-col
                  sm:flex-row
                  rounded-xl
                  overflow-hidden
                  bg-white
                  shadow-[0_8px_25px_rgba(0,25,55,0.28)]
                  border
                  border-white
                "
              >

                <div
                  className="
                    flex-1
                    flex
                    items-center
                    px-4
                    py-2
                  "
                >

                  <Search
                    size={17}
                    className="
                      text-[#1769aa]
                      mr-2.5
                      shrink-0
                    "
                  />

                  <input
                    type="text"
                    placeholder="Search legal metrology services, rules and resources"
                    className="
                      w-full
                      outline-none
                      bg-transparent
                      text-slate-700
                      text-xs
                      placeholder:text-slate-400
                    "
                  />

                </div>


                <button
                  type="button"
                  onClick={() => navigate("/history")}
                  className="
                    sm:w-[115px]
                    px-6
                    py-2.5
                    bg-[#1769aa]
                    hover:bg-[#0e527f]
                    text-white
                    font-bold
                    text-xs
                    transition
                    flex
                    items-center
                    justify-center
                    gap-1.5
                  "
                >

                  Search

                  <ArrowRight size={14} />

                </button>

              </div>


              <p
                className="
                  text-[8px]
                  md:text-[9px]
                  text-white/85
                  mt-1
                  drop-shadow-[0_2px_4px_rgba(0,0,0,0.75)]
                "
              >
                Search rules, declarations, inspections, reports and resources
              </p>

            </div>



            {/* =================================================
                FEATURE CHIPS
            ================================================== */}

            <div
              className="
                flex
                flex-wrap
                justify-center
                items-center
                gap-2
                mt-2.5
              "
            >


              <div
                className="
                  flex
                  items-center
                  gap-1.5
                  px-3
                  py-1.5
                  rounded-full
                  bg-[#06345b]/75
                  border
                  border-white/25
                  text-[8px]
                  md:text-[9px]
                  text-white
                  shadow-[0_3px_10px_rgba(0,25,55,0.20)]
                  backdrop-blur-[2px]
                "
              >

                <ShieldCheck
                  size={12}
                  className="text-[#7DD3FC]"
                />

                Evidence-based inspection

              </div>


              <div
                className="
                  flex
                  items-center
                  gap-1.5
                  px-3
                  py-1.5
                  rounded-full
                  bg-[#06345b]/75
                  border
                  border-white/25
                  text-[8px]
                  md:text-[9px]
                  text-white
                  shadow-[0_3px_10px_rgba(0,25,55,0.20)]
                  backdrop-blur-[2px]
                "
              >

                <FileText
                  size={12}
                  className="text-[#7DD3FC]"
                />

                Digital records

              </div>


              <div
                className="
                  flex
                  items-center
                  gap-1.5
                  px-3
                  py-1.5
                  rounded-full
                  bg-[#06345b]/75
                  border
                  border-white/25
                  text-[8px]
                  md:text-[9px]
                  text-white
                  shadow-[0_3px_10px_rgba(0,25,55,0.20)]
                  backdrop-blur-[2px]
                "
              >

                <Scale
                  size={12}
                  className="text-[#7DD3FC]"
                />

                Legal Metrology

              </div>

            </div>



            {/* =================================================
                TRUST LINE
            ================================================== */}

            <div
              className="
                mt-2
                flex
                items-center
                justify-center
                gap-2
                text-[8px]
                md:text-[9px]
                text-white/70
                uppercase
                tracking-[0.13em]
                font-semibold
                drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]
              "
            >

              <span className="w-6 h-px bg-white/30" />

              Digital • Transparent • Evidence-based

              <span className="w-6 h-px bg-white/30" />

            </div>


          </div>

        </div>

      </section>



      {/* =====================================================
          BOTTOM TRICOLOUR
      ====================================================== */}

      <div className="flex h-[4px] w-full">

        <div className="w-1/3 bg-[#ff9933]" />

        <div className="w-1/3 bg-white" />

        <div className="w-1/3 bg-[#138808]" />

      </div>


    </header>
  );
}

export default Navbar;

