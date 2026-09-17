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
} from "lucide-react";

function Navbar({ setSidebarOpen }) {
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 120);
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
          fixed top-0 left-0 right-0 z-[100]
          bg-white/95 backdrop-blur-xl
          border-b border-slate-200/80
          shadow-lg
          transition-all duration-500 ease-out
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

          <div className="h-[72px] flex items-center gap-6">

            {/* Logo */}

            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex items-center gap-3 shrink-0 text-left group"
            >

              <div
                className="
                  w-11 h-11
                  rounded-full
                  bg-[#073b67]
                  flex items-center justify-center
                  shadow-md
                  group-hover:shadow-lg
                  group-hover:scale-105
                  transition-all duration-200
                "
              >
                <Scale
                  size={23}
                  className="text-white"
                />
              </div>

              <div className="hidden sm:block">

                <p
                  className="
                    text-[10px]
                    font-bold
                    tracking-widest
                    uppercase
                    text-[#073b67]
                  "
                >
                  Department of Consumer Affairs
                </p>

                <p className="text-xl font-bold text-[#073b67]">
                  NiyamDrishti
                </p>

              </div>

            </button>


            {/* Sticky Search */}

            <div className="hidden md:flex flex-1 max-w-[650px] mx-auto">

              <div
                className="
                  flex
                  w-full
                  h-11
                  bg-slate-50
                  border border-slate-300
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
                    size={19}
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
                    px-7
                    bg-[#1769aa]
                    hover:bg-[#0b4f82]
                    text-white
                    text-sm
                    font-bold
                    transition
                  "
                >
                  Search
                </button>

              </div>

            </div>


            {/* Right Side */}

            <div className="flex items-center gap-2 ml-auto">

              {/* Accessibility */}

              <button
                type="button"
                className="
                  hidden lg:flex
                  items-center gap-2
                  px-3 py-2
                  rounded-lg
                  text-slate-700
                  hover:bg-slate-100
                  font-semibold
                  text-sm
                  transition
                "
              >
                <Accessibility size={20} />
                Accessibility
              </button>


              {/* Help */}

              <button
                type="button"
                className="
                  hidden lg:flex
                  items-center gap-2
                  px-3 py-2
                  rounded-lg
                  text-slate-700
                  hover:bg-slate-100
                  font-semibold
                  text-sm
                  transition
                "
              >
                <HelpCircle size={20} />
                Help
              </button>


              {/* Notifications */}

              <button
                type="button"
                aria-label="Notifications"
                className="
                  relative
                  p-2.5
                  rounded-lg
                  text-slate-700
                  hover:bg-slate-100
                  transition
                "
              >

                <Bell size={21} />

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


              {/* User */}

              <div className="hidden xl:flex items-center gap-2 ml-2">

                <div
                  className="
                    w-9 h-9
                    rounded-full
                    bg-[#edf5fa]
                    flex items-center justify-center
                  "
                >
                  <UserCircle
                    size={23}
                    className="text-[#073b67]"
                  />
                </div>

                <div>

                  <p className="text-sm font-bold text-slate-800">
                    Inspector
                  </p>

                  <p className="text-[11px] text-slate-500">
                    Enforcement Officer
                  </p>

                </div>

                <ChevronDown
                  size={15}
                  className="text-slate-400"
                />

              </div>


              {/* Mobile Menu */}

              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
                className="
                  md:hidden
                  p-2
                  rounded-lg
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
          GOVERNMENT TOP BAR
      ====================================================== */}

      <div className="bg-[#06345b] text-white">

        <div className="max-w-[1500px] mx-auto px-5 lg:px-10">

          <div className="min-h-[46px] flex items-center justify-between">

            {/* Government Identity */}

            <div className="flex items-center gap-3 sm:gap-4">

              <span className="text-sm md:text-base lg:text-lg font-bold">
                Government of India
              </span>

              <span className="text-white/30">
                |
              </span>

              <span className="hidden sm:inline text-sm md:text-base lg:text-lg text-white/90">
                Department of Consumer Affairs
              </span>

            </div>


            {/* Top Links */}

            <div className="hidden md:flex items-center gap-5">

              <button
                type="button"
                className="
                  flex items-center gap-2
                  text-sm
                  font-semibold
                  hover:text-[#ffcc80]
                  transition
                "
              >
                <Accessibility size={18} />
                Accessibility
              </button>

              <span className="text-white/25">
                |
              </span>

              <button
                type="button"
                className="
                  flex items-center gap-2
                  text-sm
                  font-semibold
                  hover:text-[#ffcc80]
                  transition
                "
              >
                <HelpCircle size={17} />
                Help
              </button>

              <span className="text-white/25">
                |
              </span>

              <button
                type="button"
                className="
                  text-sm
                  font-semibold
                  hover:text-[#ffcc80]
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
          border-b border-slate-200
          shadow-sm
        "
      >

        <div className="max-w-[1500px] mx-auto px-5 lg:px-10">

          <div
            className="
              flex
              items-center
              justify-start
              h-[62px]
              gap-7
              lg:gap-10
              overflow-x-auto
              scrollbar-hide
            "
          >

            {/* All Services */}

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
                text-base
                whitespace-nowrap
                transition
              "
            >

              <Menu size={19} />

              All Services

            </button>


            {/* Home */}

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
                hover:text-[#e5232e]
                font-bold
                text-base
                whitespace-nowrap
                border-b-[3px]
                border-[#ff9933]
                transition
              "
            >

              <Home size={19} />

              Home

            </button>


            {/* Inspections */}

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
                text-base
                whitespace-nowrap
                transition
              "
            >

              <ClipboardCheck size={18} />

              Inspections

            </button>


            {/* Legal Resources */}

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
                text-base
                whitespace-nowrap
                transition
              "
            >

              <BookOpen size={18} />

              Legal Resources

            </button>


            {/* Reports */}

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
                text-base
                whitespace-nowrap
                transition
              "
            >

              <BarChart3 size={18} />

              Reports

            </button>


            {/* Help & Support */}

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
                text-base
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
    HERO SECTION
    COMPACT GLASSMORPHISM DESIGN
====================================================== */}

<section
  className="
    relative
    overflow-hidden
    min-h-[470px]
    md:min-h-[500px]
  "
>
  {/* ===================================================
      BACKGROUND IMAGE
  ==================================================== */}

  <div className="absolute inset-0">

    <img
      src="/images/inspection-4.jpeg"
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

    {/* Very subtle dark overlay */}
    <div className="absolute inset-0 bg-black/10" />

    {/* Bottom readability */}
    <div
      className="
        absolute
        inset-0
        bg-gradient-to-t
        from-black/45
        via-transparent
        to-black/5
      "
    />

  </div>


  {/* ===================================================
      HERO CONTENT
  ==================================================== */}

  <div className="relative z-10 h-full">

    <div
      className="
        max-w-[1500px]
        mx-auto
        px-5
        lg:px-10
        py-5
        md:py-6
      "
    >

      {/* =================================================
          COMPACT GLASS CARD
      ================================================== */}

      <div
        className="
          max-w-4xl
          mx-auto
          rounded-2xl
          bg-white/[0.14]
          backdrop-blur-sm
          border
          border-white/30
          shadow-[0_20px_60px_rgba(0,0,0,0.25)]
          px-5
          sm:px-8
          md:px-10
          py-5
          md:py-6
        "
      >

        {/* =================================================
            BRAND
        ================================================== */}

        <div className="flex flex-col items-center text-center">

          {/* Logo */}

          <div
            className="
              w-12
              h-12
              md:w-14
              md:h-14
              rounded-full
              bg-white/95
              flex
              items-center
              justify-center
              shadow-lg
              border
              border-white/70
            "
          >
            <Scale
              size={27}
              className="text-[#073b67]"
            />
          </div>


          {/* Department */}

          <p
            className="
              mt-2
              text-[9px]
              md:text-[10px]
              font-bold
              tracking-[0.2em]
              uppercase
              text-white
              drop-shadow-md
            "
          >
            Department of Consumer Affairs
          </p>


          {/* Brand */}

          <h1
            className="
              mt-0.5
              text-2xl
              md:text-3xl
              lg:text-4xl
              font-bold
              text-white
              tracking-tight
              drop-shadow-lg
            "
          >
            NiyamDrishti
          </h1>


          {/* Subtitle */}

          <p
            className="
              mt-0.5
              text-xs
              md:text-sm
              text-white/90
              drop-shadow-md
            "
          >
            Digital Legal Metrology Inspection Portal
          </p>


          {/* Tricolour */}

          <div
            className="
              flex
              h-[3px]
              w-24
              mt-2.5
              overflow-hidden
              rounded-full
              shadow
            "
          >
            <div className="w-1/3 bg-[#ff9933]" />
            <div className="w-1/3 bg-white" />
            <div className="w-1/3 bg-[#138808]" />
          </div>

        </div>


        {/* =================================================
            MAIN MESSAGE
        ================================================== */}

        <div
          className="
            flex
            flex-col
            items-center
            text-center
            mt-4
          "
        >

          {/* Label */}

          <div
            className="
              inline-flex
              items-center
              px-3
              py-1
              rounded-full
              bg-white/15
              backdrop-blur-sm
              border
              border-white/25
              text-[#ffd28a]
              text-[10px]
              md:text-xs
              font-bold
              uppercase
              tracking-[0.12em]
              shadow-sm
            "
          >
            Digital Governance
            <span className="mx-1.5 text-white/50">•</span>
            Legal Metrology
          </div>


          {/* Heading */}

          <h2
            className="
              mt-2.5
              text-2xl
              md:text-3xl
              lg:text-4xl
              font-bold
              text-white
              leading-[1.15]
              max-w-2xl
              drop-shadow-lg
            "
          >
            Smart Inspection.
            <br />
            Transparent Compliance.
          </h2>


          {/* Description */}

          <p
            className="
              mt-2.5
              text-xs
              md:text-sm
              text-white/90
              leading-relaxed
              max-w-xl
              drop-shadow-md
            "
          >
            AI-assisted inspection and compliance support for
            packaged commodities, helping enforcement officers
            review declarations and maintain digital records.
          </p>

        </div>


        {/* =================================================
            SEARCH
        ================================================== */}

        <div
          className="
            max-w-3xl
            mx-auto
            mt-4
          "
        >

          <div
            className="
              flex
              flex-col
              sm:flex-row
              rounded-xl
              overflow-hidden
              bg-white/90
              backdrop-blur-md
              border
              border-white/70
              shadow-xl
            "
          >

            {/* Input */}

            <div
              className="
                flex-1
                flex
                items-center
                px-3.5
                py-2.5
              "
            >

              <Search
                size={18}
                className="
                  text-slate-500
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
                  md:text-sm
                  placeholder:text-slate-500
                "
              />

            </div>


            {/* Search Button */}

            <button
              type="button"
              onClick={() => navigate("/history")}
              className="
                px-7
                py-2.5
                bg-[#e5232e]
                hover:bg-[#c91d27]
                text-white
                font-bold
                text-xs
                md:text-sm
                transition
              "
            >
              Search
            </button>

          </div>


          {/* Hint */}

          <p
            className="
              text-[10px]
              md:text-xs
              text-white/80
              mt-1.5
              text-center
              drop-shadow-md
            "
          >
            Search for rules, declarations, inspections, reports and resources
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
            mt-4
          "
        >

          {/* Evidence */}

          <div
            className="
              flex
              items-center
              gap-1.5
              px-3
              py-1.5
              rounded-full
              bg-black/20
              backdrop-blur-md
              border
              border-white/25
              text-[10px]
              md:text-xs
              text-white
              hover:bg-white/20
              transition
            "
          >
            <ShieldCheck size={13} />
            Evidence-based inspection
          </div>


          {/* Digital Records */}

          <div
            className="
              flex
              items-center
              gap-1.5
              px-3
              py-1.5
              rounded-full
              bg-black/20
              backdrop-blur-md
              border
              border-white/25
              text-[10px]
              md:text-xs
              text-white
              hover:bg-white/20
              transition
            "
          >
            <FileText size={13} />
            Digital records
          </div>


          {/* Legal Metrology */}

          <div
            className="
              flex
              items-center
              gap-1.5
              px-3
              py-1.5
              rounded-full
              bg-black/20
              backdrop-blur-md
              border
              border-white/25
              text-[10px]
              md:text-xs
              text-white
              hover:bg-white/20
              transition
            "
          >
            <Scale size={13} />
            Legal Metrology
          </div>

        </div>

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