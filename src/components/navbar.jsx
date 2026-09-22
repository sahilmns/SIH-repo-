import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
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
  BarChart3,
  ArrowRight,
  ExternalLink,
  ChevronDown as LanguageChevron,
  Check,
  X,
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

  /* =======================================================
     STATES
  ======================================================= */

  const [isScrolled, setIsScrolled] = useState(false);

  const [fontScale, setFontScale] = useState(() => {
    const savedScale = localStorage.getItem(
      "niyamdrishti-font-scale"
    );

    return savedScale ? Number(savedScale) : 100;
  });

  const [accessibilityOpen, setAccessibilityOpen] =
    useState(false);

  const [highContrast, setHighContrast] = useState(() => {
    return (
      localStorage.getItem(
        "niyamdrishti-high-contrast"
      ) === "true"
    );
  });

  const [underlineLinks, setUnderlineLinks] = useState(() => {
    return (
      localStorage.getItem(
        "niyamdrishti-underline-links"
      ) === "true"
    );
  });

  const [languageOpen, setLanguageOpen] = useState(false);

  const [language, setLanguage] = useState("English");

  const [notificationsOpen, setNotificationsOpen] =
    useState(false);

  /* =======================================================
     SCROLL DETECTION
  ======================================================= */

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /* =======================================================
     FONT SIZE
  ======================================================= */

  useEffect(() => {
    const root = document.documentElement;

    root.style.fontSize = `${fontScale}%`;

    localStorage.setItem(
      "niyamdrishti-font-scale",
      fontScale
    );
  }, [fontScale]);

  /* =======================================================
     HIGH CONTRAST
  ======================================================= */

  useEffect(() => {
    document.body.classList.toggle(
      "accessibility-high-contrast",
      highContrast
    );

    localStorage.setItem(
      "niyamdrishti-high-contrast",
      highContrast
    );
  }, [highContrast]);

  /* =======================================================
     UNDERLINE LINKS
  ======================================================= */

  useEffect(() => {
    document.body.classList.toggle(
      "accessibility-underline-links",
      underlineLinks
    );

    localStorage.setItem(
      "niyamdrishti-underline-links",
      underlineLinks
    );
  }, [underlineLinks]);

  /* =======================================================
     FONT FUNCTIONS
  ======================================================= */

  const decreaseFont = () => {
    setFontScale((current) =>
      Math.max(80, current - 10)
    );
  };

  const resetFont = () => {
    setFontScale(100);
  };

  const increaseFont = () => {
    setFontScale((current) =>
      Math.min(140, current + 10)
    );
  };

  /* =======================================================
     RESET ACCESSIBILITY
  ======================================================= */

  const resetAccessibility = () => {
    setFontScale(100);
    setHighContrast(false);
    setUnderlineLinks(false);
  };

  /* =======================================================
     SKIP TO MAIN CONTENT
  ======================================================= */

  const skipToMainContent = () => {
    const mainContent =
      document.getElementById("main-content");

    if (mainContent) {
      mainContent.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      mainContent.focus();
    }
  };

  /* =======================================================
     LANGUAGE
  ======================================================= */

  const selectLanguage = (selectedLanguage) => {
    setLanguage(selectedLanguage);
    setLanguageOpen(false);
  };

  /* =======================================================
     RETURN
  ======================================================= */

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
          shadow-[0_6px_25px_rgba(0,0,0,0.14)]
          transition-all
          duration-500
          ease-out

          ${
            isScrolled
              ? "translate-y-0 opacity-100 scale-[1]"
              : "-translate-y-full opacity-0 scale-[0.98] pointer-events-none"
          }
        `}
      >

        {/* TRICOLOUR */}

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

            {/* RIGHT SIDE */}

            <div className="flex items-center gap-1.5 ml-auto">

              {/* HELP */}

              <button
                type="button"
                onClick={() => navigate("/settings")}
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
                Help
              </button>

              {/* NOTIFICATIONS */}

              <div className="relative">

                <button
                  type="button"
                  aria-label="Notifications"
                  onClick={() =>
                    setNotificationsOpen(
                      (current) => !current
                    )
                  }
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

                {notificationsOpen && (
                  <div
                    className="
                      absolute
                      right-0
                      top-12
                      w-[300px]
                      bg-white
                      border
                      border-slate-200
                      rounded-xl
                      shadow-xl
                      p-4
                      z-[200]
                    "
                  >

                    <div className="flex items-center justify-between mb-3">

                      <h3 className="font-bold text-slate-800">
                        Notifications
                      </h3>

                      <button
                        type="button"
                        onClick={() =>
                          setNotificationsOpen(false)
                        }
                        className="
                          p-1
                          rounded-md
                          hover:bg-slate-100
                        "
                      >
                        <X size={16} />
                      </button>

                    </div>

                    <div
                      className="
                        p-3
                        rounded-lg
                        bg-[#edf5fa]
                        border
                        border-[#d5e8f4]
                      "
                    >

                      <p className="text-sm font-semibold text-[#073b67]">
                        System ready
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        NiyamDrishti inspection portal is ready
                        for inspection.
                      </p>

                    </div>

                  </div>
                )}

              </div>

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

              {/* INDIAN FLAG */}

              <div
                className="
                  relative
                  w-[30px]
                  h-[20px]
                  overflow-hidden
                  rounded-[2px]
                  shadow-sm
                  shrink-0
                "
                aria-label="Indian Flag"
                title="Indian Flag"
              >

                <div className="h-1/3 w-full bg-[#FF9933]" />

                <div
                  className="
                    relative
                    h-1/3
                    w-full
                    bg-white
                    flex
                    items-center
                    justify-center
                  "
                >

                  <svg
                    viewBox="0 0 100 100"
                    className="w-[11px] h-[11px]"
                    aria-label="Ashoka Chakra"
                  >

                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#000080"
                      strokeWidth="5"
                    />

                    <g
                      stroke="#000080"
                      strokeWidth="3"
                      strokeLinecap="round"
                    >

                      {Array.from(
                        { length: 24 },
                        (_, i) => (
                          <line
                            key={i}
                            x1="50"
                            y1="50"
                            x2="50"
                            y2="15"
                            transform={`rotate(${i * 15} 50 50)`}
                          />
                        )
                      )}

                    </g>

                    <circle
                      cx="50"
                      cy="50"
                      r="5"
                      fill="#000080"
                    />

                  </svg>

                </div>

                <div className="h-1/3 w-full bg-[#138808]" />

              </div>

              {/* GOVERNMENT OF INDIA */}

              <span className="text-sm md:text-base font-bold whitespace-nowrap">
                Government of India
              </span>

              <ExternalLink
                size={14}
                strokeWidth={2}
                className="text-white/80"
              />

              <span className="text-white/30 hidden sm:inline">
                |
              </span>

              <span className="hidden lg:inline text-sm text-white/80">
                Department of Consumer Affairs
              </span>

            </div>

            {/* ACCESSIBILITY AREA */}

            <div
              className="
                hidden
                md:flex
                items-center
                gap-3
                text-white
              "
            >

              <button
                type="button"
                onClick={skipToMainContent}
                className="
                  text-xs
                  lg:text-sm
                  font-medium
                  text-white/95
                  hover:text-white
                  hover:underline
                  transition
                  whitespace-nowrap
                "
              >
                Skip to main content
              </button>

              <span className="text-white/25">
                |
              </span>

              <button
                type="button"
                onClick={decreaseFont}
                aria-label="Decrease font size"
                title="Decrease font size"
                disabled={fontScale <= 80}
                className={`
                  text-sm
                  lg:text-base
                  font-semibold
                  text-white/90
                  hover:text-white
                  transition
                  whitespace-nowrap
                  ${
                    fontScale <= 80
                      ? "opacity-40 cursor-not-allowed"
                      : ""
                  }
                `}
              >
                A−
              </button>

              <button
                type="button"
                onClick={resetFont}
                aria-label="Reset font size"
                title="Reset font size"
                className={`
                  w-[28px]
                  h-[28px]
                  flex
                  items-center
                  justify-center
                  border
                  rounded-[3px]
                  text-sm
                  font-medium
                  transition

                  ${
                    fontScale === 100
                      ? "border-white bg-white/10 text-white"
                      : "border-white/50 text-white hover:bg-white/10 hover:border-white"
                  }
                `}
              >
                A
              </button>

              <button
                type="button"
                onClick={increaseFont}
                aria-label="Increase font size"
                title="Increase font size"
                disabled={fontScale >= 140}
                className={`
                  text-sm
                  lg:text-base
                  font-semibold
                  text-white/90
                  hover:text-white
                  transition
                  whitespace-nowrap
                  ${
                    fontScale >= 140
                      ? "opacity-40 cursor-not-allowed"
                      : ""
                  }
                `}
              >
                A+
              </button>

              <span className="text-white/25">
                |
              </span>

              {/* ACCESSIBILITY */}

              <button
                type="button"
                aria-label="Accessibility options"
                title="Accessibility options"
                onClick={() =>
                  setAccessibilityOpen(
                    (current) => !current
                  )
                }
                className={`
                  flex
                  items-center
                  justify-center
                  text-[20px]
                  leading-none
                  transition

                  ${
                    accessibilityOpen
                      ? "text-[#8ED8FF]"
                      : "text-white hover:text-[#8ED8FF]"
                  }
                `}
              >
                <Accessibility size={21} />
              </button>

              <span className="text-white/25">
                |
              </span>

              {/* LANGUAGE */}

              <div className="relative">

                <button
                  type="button"
                  onClick={() =>
                    setLanguageOpen(
                      (current) => !current
                    )
                  }
                  className="
                    flex
                    items-center
                    gap-2
                    text-xs
                    lg:text-sm
                    font-medium
                    text-white/95
                    hover:text-white
                    transition
                    whitespace-nowrap
                  "
                >

                  <span className="text-[18px] leading-none">
                    🌐
                  </span>

                  <span>
                    {language}
                  </span>

                  <LanguageChevron
                    size={15}
                    strokeWidth={2}
                    className={`
                      mt-0.5
                      transition-transform
                      ${
                        languageOpen
                          ? "rotate-180"
                          : ""
                      }
                    `}
                  />

                </button>

                {languageOpen && (
                  <div
                    className="
                      absolute
                      right-0
                      top-8
                      w-[140px]
                      bg-white
                      text-slate-800
                      rounded-lg
                      border
                      border-slate-200
                      shadow-xl
                      overflow-hidden
                      z-[200]
                    "
                  >

                    <button
                      type="button"
                      onClick={() =>
                        selectLanguage("English")
                      }
                      className="
                        w-full
                        px-4
                        py-2.5
                        text-left
                        text-sm
                        hover:bg-slate-100
                        flex
                        items-center
                        justify-between
                      "
                    >

                      English

                      {language === "English" && (
                        <Check size={15} />
                      )}

                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        selectLanguage("हिन्दी")
                      }
                      className="
                        w-full
                        px-4
                        py-2.5
                        text-left
                        text-sm
                        hover:bg-slate-100
                        flex
                        items-center
                        justify-between
                      "
                    >

                      हिन्दी

                      {language === "हिन्दी" && (
                        <Check size={15} />
                      )}

                    </button>

                  </div>
                )}

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          ACCESSIBILITY PANEL
      ====================================================== */}

      {accessibilityOpen && (
        <div
          className="
            fixed
            top-[50px]
            right-5
            z-[300]
            w-[310px]
            bg-white
            rounded-xl
            border
            border-slate-200
            shadow-[0_15px_45px_rgba(0,0,0,0.18)]
            overflow-hidden
          "
        >

          <div
            className="
              bg-[#06345b]
              text-white
              px-5
              py-4
              flex
              items-center
              justify-between
            "
          >

            <div>

              <p className="font-bold text-base">
                Accessibility
              </p>

              <p className="text-xs text-white/70 mt-0.5">
                Customize your viewing experience
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                setAccessibilityOpen(false)
              }
              className="
                p-1.5
                rounded-md
                hover:bg-white/10
              "
            >
              <X size={18} />
            </button>

          </div>

          <div className="p-4 space-y-4">

            <div>

              <p className="text-sm font-bold text-slate-800 mb-2">
                Text Size
              </p>

              <div className="flex items-center gap-2">

                <button
                  type="button"
                  onClick={decreaseFont}
                  className="
                    flex-1
                    h-10
                    rounded-lg
                    border
                    border-slate-300
                    font-bold
                    text-slate-700
                    hover:bg-slate-100
                    transition
                  "
                >
                  A−
                </button>

                <button
                  type="button"
                  onClick={resetFont}
                  className="
                    flex-1
                    h-10
                    rounded-lg
                    border
                    border-[#1769aa]
                    bg-[#edf5fa]
                    text-[#073b67]
                    font-bold
                    hover:bg-[#dceef8]
                    transition
                  "
                >
                  A
                </button>

                <button
                  type="button"
                  onClick={increaseFont}
                  className="
                    flex-1
                    h-10
                    rounded-lg
                    border
                    border-slate-300
                    font-bold
                    text-slate-700
                    hover:bg-slate-100
                    transition
                  "
                >
                  A+
                </button>

              </div>

              <p className="text-[11px] text-slate-500 mt-2">
                Current size: {fontScale}%
              </p>

            </div>

            {/* HIGH CONTRAST */}

            <div
              className="
                flex
                items-center
                justify-between
                py-2
              "
            >

              <div>

                <p className="text-sm font-semibold text-slate-800">
                  High Contrast
                </p>

                <p className="text-[11px] text-slate-500">
                  Improve color contrast
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setHighContrast(
                    (current) => !current
                  )
                }
                className={`
                  relative
                  w-11
                  h-6
                  rounded-full
                  transition

                  ${
                    highContrast
                      ? "bg-[#1769aa]"
                      : "bg-slate-300"
                  }
                `}
              >

                <span
                  className={`
                    absolute
                    top-1
                    w-4
                    h-4
                    bg-white
                    rounded-full
                    shadow
                    transition

                    ${
                      highContrast
                        ? "left-6"
                        : "left-1"
                    }
                  `}
                />

              </button>

            </div>

            {/* UNDERLINE LINKS */}

            <div
              className="
                flex
                items-center
                justify-between
                py-2
              "
            >

              <div>

                <p className="text-sm font-semibold text-slate-800">
                  Underline Links
                </p>

                <p className="text-[11px] text-slate-500">
                  Make links easier to identify
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setUnderlineLinks(
                    (current) => !current
                  )
                }
                className={`
                  relative
                  w-11
                  h-6
                  rounded-full
                  transition

                  ${
                    underlineLinks
                      ? "bg-[#1769aa]"
                      : "bg-slate-300"
                  }
                `}
              >

                <span
                  className={`
                    absolute
                    top-1
                    w-4
                    h-4
                    bg-white
                    rounded-full
                    shadow
                    transition

                    ${
                      underlineLinks
                        ? "left-6"
                        : "left-1"
                    }
                  `}
                />

              </button>

            </div>

            {/* RESET */}

            <button
              type="button"
              onClick={resetAccessibility}
              className="
                w-full
                h-10
                rounded-lg
                border
                border-slate-300
                text-sm
                font-semibold
                text-slate-700
                hover:bg-slate-100
                transition
              "
            >
              Reset Accessibility
            </button>

          </div>

        </div>
      )}

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

            {/* ALL SERVICES */}

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

            {/* HOME */}

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
                hover:text-[#073b67]
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

            {/* INSPECTIONS */}

            <button
              type="button"
              onClick={() =>
                navigate("/new-inspection")
              }
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

            {/* REPORTS */}

            <button
              type="button"
              onClick={() =>
                navigate("/reports")
              }
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

            {/* HELP & SUPPORT */}

            <button
              type="button"
              onClick={() =>
                navigate("/settings")
              }
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

            {/* GET STARTED */}

            <button
              type="button"
              onClick={() =>
                navigate("/login")
              }
              className="
                ml-auto
                shrink-0
                flex
                items-center
                justify-center
                gap-2
                h-[42px]
                px-6
                rounded-lg
                bg-[#1769aa]
                text-white
                text-sm
                font-bold
                shadow-sm
                hover:bg-[#0e527f]
                hover:shadow-md
                transition-all
                duration-200
                whitespace-nowrap
              "
            >

              Get Started

              <ArrowRight
                size={17}
                strokeWidth={2.2}
              />

            </button>

          </div>

        </div>

      </nav>

      {/* =====================================================
          HERO / MAIN CONTENT
      ====================================================== */}

      <section
        id="main-content"
        tabIndex="-1"
        className="
          relative
          overflow-hidden
          h-[calc(100vh-108px)]
          min-h-[500px]
          max-h-[680px]
          outline-none
        "
      >

        {/* ===================================================
            BACKGROUND IMAGE
        ==================================================== */}

        <div className="absolute inset-0">

          <img
            src="/images/backgroundinspection.png"
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
                ASHOKA LOGO
            ================================================== */}

            <div className="flex justify-center mb-2">

              <div
                className="
                  w-[210px]
                  h-[210px]
                  md:w-[240px]
                  md:h-[240px]
                  flex
                  items-center
                  justify-center
                  overflow-hidden
                "
              >

                <img
                  src="/images/ashokawhite.png"
                  alt="Ashoka Lion Capital"
                  className="
                    w-full
                    h-full
                    object-contain
                    scale-110
                  "
                />

              </div>

            </div>

            {/* NIYAMDRISHTI */}

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
                drop-shadow-[0_3px_10px_rgba(7,59,103,0.65)]
              "
            >

              <span className="text-[#EAF6FF]">
                Niyam
              </span>

              <span className="text-[#8ED8FF]">
                Drishti
              </span>

            </h1>

            {/* SUBTITLE */}

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

            {/* TRICOLOUR */}

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

            {/* SLOGAN */}

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

              <span className="text-[#8ED8FF]">
                {" "}Build Trust.
              </span>

            </p>

            {/* DIGITAL GOVERNANCE */}

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
                  bg-[#1769AA]/85
                  border
                  border-white/30
                  shadow-[0_5px_18px_rgba(7,59,103,0.28)]
                  text-[9px]
                  md:text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.15em]
                  backdrop-blur-[2px]
                "
              >

                <span className="text-[#8ED8FF]">
                  Digital Governance
                </span>

                <span className="text-white/50">
                  •
                </span>

                <span className="text-white">
                  Legal Metrology
                </span>

              </div>

              {/* MAIN HEADING */}

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

                <span className="text-[#8ED8FF]">
                  Compliance.
                </span>

              </h2>

            </div>

            {/* FEATURE CHIPS */}

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

              {/* EVIDENCE */}

              <div
                className="
                  flex
                  items-center
                  gap-1.5
                  px-3
                  py-1.5
                  rounded-full
                  bg-[#1769AA]/80
                  border
                  border-white/25
                  text-[8px]
                  md:text-[9px]
                  text-white
                  shadow-[0_3px_10px_rgba(7,59,103,0.25)]
                  backdrop-blur-[2px]
                "
              >

                <ShieldCheck
                  size={12}
                  className="text-[#8ED8FF]"
                />

                Evidence-based inspection

              </div>

              {/* DIGITAL RECORDS */}

              <div
                className="
                  flex
                  items-center
                  gap-1.5
                  px-3
                  py-1.5
                  rounded-full
                  bg-[#1769AA]/80
                  border
                  border-white/25
                  text-[8px]
                  md:text-[9px]
                  text-white
                  shadow-[0_3px_10px_rgba(7,59,103,0.25)]
                  backdrop-blur-[2px]
                "
              >

                <FileText
                  size={12}
                  className="text-[#8ED8FF]"
                />

                Digital records

              </div>

              {/* LEGAL METROLOGY */}

              <div
                className="
                  flex
                  items-center
                  gap-1.5
                  px-3
                  py-1.5
                  rounded-full
                  bg-[#1769AA]/80
                  border
                  border-white/25
                  text-[8px]
                  md:text-[9px]
                  text-white
                  shadow-[0_3px_10px_rgba(7,59,103,0.25)]
                  backdrop-blur-[2px]
                "
              >

                <Scale
                  size={12}
                  className="text-[#8ED8FF]"
                />

                Legal Metrology

              </div>

            </div>

            {/* TRUST LINE */}

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

      {/* =====================================================
          ACCESSIBILITY GLOBAL STYLE
      ====================================================== */}

      <style>{`

        body.accessibility-high-contrast {
          filter: contrast(1.12);
        }

        body.accessibility-high-contrast
        input,
        body.accessibility-high-contrast
        button {
          border-color: #111827;
        }

        body.accessibility-underline-links
        a {
          text-decoration: underline !important;
          text-underline-offset: 3px;
        }

      `}</style>

    </header>
  );
}

export default Navbar;

