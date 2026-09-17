import { useEffect, useState } from "react";

import {
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  Camera,
  BarChart3,
  ArrowRight,
  ShieldCheck,
  FileSearch,
  Bell,
  Search,
  Scale,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  BookOpen,
  FileText,
  PackageCheck,
  Gavel,
  Globe,
  Activity,
} from "lucide-react";

import { useNavigate } from "react-router-dom";


/* =========================================================
   HERO SLIDES
========================================================= */

const heroSlides = [
  {
    image: "/images/inspection-1.jpeg",
    title: "Digital Legal Metrology Inspection",
    description:
      "Inspect packaged commodities, verify mandatory declarations and maintain evidence-based inspection records.",
    button: "Start New Inspection",
    link: "/new-inspection",
  },

  {
    image: "/images/inspection-2.jpeg",
    title: "Verify Package Label Compliance",
    description:
      "Review mandatory declarations such as manufacturer details, net quantity, MRP and consumer care information.",
    button: "Check Product Label",
    link: "/new-inspection",
  },

  {
    image: "/images/inspection-3.jpeg",
    title: "Evidence-Based Compliance Review",
    description:
      "Use extracted label information and inspection evidence to identify potential compliance issues.",
    button: "View Inspection Records",
    link: "/history",
  },
];


/* =========================================================
   TRENDING SEARCHES
========================================================= */

const trendingSearches = [
  "Packaged Commodities Rules",
  "MRP",
  "Net Quantity",
  "Mandatory Declarations",
  "Legal Metrology Act",
];


/* =========================================================
   SERVICES
========================================================= */

const services = [
  {
    title: "Start New Inspection",
    description:
      "Capture or upload package images and begin a new compliance inspection.",
    icon: Camera,
    path: "/new-inspection",
  },

  {
    title: "Inspection Records",
    description:
      "Search and review previously completed inspection records and findings.",
    icon: FileSearch,
    path: "/history",
  },

  {
    title: "Reports & Analytics",
    description:
      "View inspection trends, compliance statistics and analytical insights.",
    icon: BarChart3,
    path: "/analytics",
  },

  {
    title: "Online Product Review",
    description:
      "Review packaged commodity information available through an online product listing.",
    icon: Globe,
    path: "/online-product-review",
  },
];


/* =========================================================
   LEGAL METROLOGY INFORMATION
========================================================= */

const informationCards = [
  {
    title: "Legal Metrology Act, 2009",
    description:
      "Reference the principal legal framework governing legal metrology.",
    icon: Gavel,
    link:
      "https://consumeraffairs.gov.in/pages/legal-metrology-act",
  },

  {
    title: "Packaged Commodities Rules, 2011",
    description:
      "Review requirements relating to declarations on packaged commodities.",
    icon: PackageCheck,
    link:
      "https://consumeraffairs.gov.in/public/upload/admin/cmsfiles/whatsnews/Book_on_Legal_Metrology_Packaged_Commodities_Rules%2C2011_with_all_amendments_whatsnews.pdf",
  },

  {
    title: "Legal Metrology Overview",
    description:
      "Understand the department's legal metrology framework and activities.",
    icon: BookOpen,
    link:
      "https://consumeraffairs.gov.in/pages/legal-metrology-overview",
  },

  {
    title: "Inspection Documentation",
    description:
      "Access inspection-related documents and compliance information.",
    icon: FileText,
    path: "/reports",
  },
];


/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard() {

  const navigate = useNavigate();

  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);


  /* =========================================================
     AUTOMATIC CAROUSEL
     Changes slide every 5 seconds
  ========================================================== */

  useEffect(() => {

    if (isPaused) return;

    const interval = setInterval(() => {

      setActiveSlide((current) => {

        return (current + 1) % heroSlides.length;

      });

    }, 5000);

    return () => clearInterval(interval);

  }, [isPaused]);


  /* =========================================================
     NEXT SLIDE
  ========================================================== */

  const nextSlide = () => {

    setActiveSlide((current) =>
      (current + 1) % heroSlides.length
    );

  };


  /* =========================================================
     PREVIOUS SLIDE
  ========================================================== */

  const previousSlide = () => {

    setActiveSlide((current) =>
      (current - 1 + heroSlides.length) %
      heroSlides.length
    );

  };


  /* =========================================================
     CURRENT SLIDE
  ========================================================== */

  const currentSlide = heroSlides[activeSlide];


  return (

    <main className="min-h-screen bg-[#f5f7f9] text-slate-800">


      {/* =====================================================
          IMPORTANT NOTICE
      ====================================================== */}

      <div className="bg-[#fff8e8] border-b border-amber-200">

        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">

          <div className="py-3 flex items-start gap-3">

            <Bell
              size={18}
              className="text-amber-600 mt-0.5 shrink-0"
            />

            <div className="text-sm">

              <span className="font-bold text-amber-800">
                Important Notice:
              </span>

              <span className="ml-2 text-amber-700">
                AI-generated findings assist the inspection process.
                Final compliance decisions must be verified by an
                authorized officer.
              </span>

            </div>

          </div>

        </div>

      </div>


      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-6">


        {/* =====================================================
            WELCOME
        ====================================================== */}

        <section className="mb-5">

          <div
            className="flex flex-col md:flex-row
                       md:items-end
                       md:justify-between
                       gap-3"
          >

            <div>

              <div className="flex items-center gap-2 mb-1">

                <div
                  className="w-2 h-2
                             rounded-full
                             bg-green-500"
                />

                <span
                  className="text-xs
                             font-semibold
                             uppercase
                             tracking-wider
                             text-green-700"
                >
                  Portal Operational
                </span>

              </div>


              <h2
                className="text-2xl
                           sm:text-3xl
                           font-bold
                           text-[#123b63]"
              >
                Welcome to NiyamDrishti
              </h2>


              <p
                className="text-sm
                           sm:text-base
                           text-slate-500
                           mt-2"
              >
                Digital inspection and compliance support for
                packaged commodities.
              </p>

            </div>


            <div
              className="text-xs
                         text-slate-400
                         flex items-center
                         gap-2"
            >

              <Activity size={14} />

              Last updated: Today

            </div>

          </div>

        </section>


        {/* =====================================================
            TRENDING SEARCHES
        ====================================================== */}

        <section
          className="bg-white
                     border border-slate-200
                     rounded-lg
                     mb-6"
        >

          <div className="px-4 sm:px-5 py-4">

            <div
              className="flex flex-col
                         sm:flex-row
                         sm:items-center
                         gap-3"
            >

              <div
                className="flex items-center
                           gap-2 shrink-0"
              >

                <Search
                  size={17}
                  className="text-[#1769aa]"
                />

                <span
                  className="font-semibold
                             text-sm
                             text-slate-800"
                >
                  Trending Searches
                </span>

              </div>


              <div className="flex flex-wrap gap-2">

                {trendingSearches.map((item) => (

                  <button
                    key={item}
                    className="px-3 py-1.5
                               rounded-full
                               bg-[#f0f5f9]
                               border border-slate-200
                               text-xs sm:text-sm
                               text-[#1769aa]
                               hover:bg-[#e5eff6]
                               transition"
                  >
                    {item}
                  </button>

                ))}

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            HERO CAROUSEL
        ====================================================== */}

        <section className="mb-7">

          <div
            className="relative
                       overflow-hidden
                       rounded-xl
                       h-[330px]
                       sm:h-[380px]
                       lg:h-[410px]
                       shadow-sm
                       group"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >


            {/* =================================================
                SLIDING IMAGES
            ================================================== */}

            <div className="absolute inset-0 overflow-hidden">

              <div
                className="flex
                           h-full
                           transition-transform
                           duration-700
                           ease-in-out"
                style={{
                  transform:
                    `translateX(-${activeSlide * 100}%)`,
                }}
              >

                {heroSlides.map((slide) => (

                  <div
                    key={slide.image}
                    className="relative
                               min-w-full
                               h-full
                               shrink-0"
                  >

                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="absolute
                                 inset-0
                                 w-full
                                 h-full
                                 object-cover"
                    />


                    {/* LIGHT OVERLAY */}

                    <div
                      className="absolute
                                 inset-0
                                 bg-black/10"
                    />


                    {/* TEXT AREA GRADIENT */}

                    <div
                      className="absolute
                                 inset-0
                                 bg-gradient-to-r
                                 from-black/65
                                 via-black/25
                                 to-transparent"
                    />

                  </div>

                ))}

              </div>

            </div>


            {/* =================================================
                HERO TEXT
            ================================================== */}

            <div
              className="relative
                         z-20
                         h-full
                         flex
                         items-center"
            >

              <div
                className="p-6
                           sm:p-9
                           lg:p-12
                           max-w-2xl"
              >


                {/* BADGE */}

                <span
                  className="inline-flex
                             items-center
                             gap-2
                             px-3
                             py-1.5
                             rounded-full
                             bg-white/15
                             backdrop-blur-sm
                             border border-white/25
                             text-xs
                             text-white
                             mb-4"
                >

                  <ShieldCheck size={14} />

                  Digital Inspection Platform

                </span>


                {/* TITLE */}

                <h1
                  key={`title-${activeSlide}`}
                  className="text-3xl
                             sm:text-4xl
                             lg:text-5xl
                             font-bold
                             text-white
                             leading-tight
                             drop-shadow-sm"
                >

                  {currentSlide.title}

                </h1>


                {/* DESCRIPTION */}

                <p
                  key={`description-${activeSlide}`}
                  className="mt-4
                             text-sm
                             sm:text-base
                             text-white/90
                             leading-relaxed
                             max-w-xl
                             drop-shadow-sm"
                >

                  {currentSlide.description}

                </p>


                {/* BUTTON */}

                <button
                  onClick={() =>
                    navigate(currentSlide.link)
                  }
                  className="mt-6
                             inline-flex
                             items-center
                             gap-2
                             px-5
                             py-3
                             rounded-md
                             bg-white
                             text-[#123b63]
                             font-semibold
                             text-sm
                             hover:bg-blue-50
                             hover:shadow-lg
                             transition
                             shadow"
                >

                  {currentSlide.button}

                  <ArrowRight size={17} />

                </button>

              </div>

            </div>


            {/* =================================================
                PREVIOUS BUTTON
            ================================================== */}

            <button
              onClick={previousSlide}
              className="absolute
                         left-3
                         sm:left-4
                         top-1/2
                         -translate-y-1/2
                         z-30
                         w-9
                         h-9
                         sm:w-10
                         sm:h-10
                         rounded-full
                         bg-black/30
                         hover:bg-black/55
                         text-white
                         flex
                         items-center
                         justify-center
                         transition
                         opacity-80
                         group-hover:opacity-100"
              aria-label="Previous slide"
            >

              <ChevronLeft size={20} />

            </button>


            {/* =================================================
                NEXT BUTTON
            ================================================== */}

            <button
              onClick={nextSlide}
              className="absolute
                         right-3
                         sm:right-4
                         top-1/2
                         -translate-y-1/2
                         z-30
                         w-9
                         h-9
                         sm:w-10
                         sm:h-10
                         rounded-full
                         bg-black/30
                         hover:bg-black/55
                         text-white
                         flex
                         items-center
                         justify-center
                         transition
                         opacity-80
                         group-hover:opacity-100"
              aria-label="Next slide"
            >

              <ChevronRight size={20} />

            </button>


            {/* =================================================
                SLIDE INDICATORS
            ================================================== */}

            <div
              className="absolute
                         bottom-5
                         left-1/2
                         -translate-x-1/2
                         z-30
                         flex
                         items-center
                         gap-2"
            >

              {heroSlides.map((_, index) => (

                <button
                  key={index}
                  onClick={() =>
                    setActiveSlide(index)
                  }
                  className={`
                    h-2
                    rounded-full
                    transition-all
                    duration-300
                    ${
                      index === activeSlide
                        ? "w-8 bg-white"
                        : "w-2 bg-white/50 hover:bg-white/80"
                    }
                  `}
                  aria-label={`Go to slide ${index + 1}`}
                />

              ))}

            </div>


            {/* =================================================
                SLIDE NUMBER
            ================================================== */}

            <div
              className="absolute
                         bottom-5
                         right-5
                         z-30
                         hidden
                         sm:flex
                         items-center
                         gap-1
                         px-3
                         py-1.5
                         rounded-full
                         bg-black/25
                         backdrop-blur-sm
                         text-xs
                         text-white"
            >

              <span className="font-semibold">
                {String(activeSlide + 1).padStart(2, "0")}
              </span>

              <span className="text-white/50">
                /
              </span>

              <span className="text-white/70">
                {String(heroSlides.length).padStart(2, "0")}
              </span>

            </div>

          </div>

        </section>


        {/* =====================================================
            STATISTICS
        ====================================================== */}

        <section className="mb-8">

          <div
            className="flex
                       items-center
                       justify-between
                       mb-4"
          >

            <div>

              <h2
                className="text-xl
                           font-bold
                           text-[#123b63]"
              >
                Inspection Overview
              </h2>

              <p
                className="text-sm
                           text-slate-500
                           mt-1"
              >
                Current inspection activity
              </p>

            </div>


            <button
              onClick={() =>
                navigate("/analytics")
              }
              className="text-sm
                         font-semibold
                         text-[#1769aa]
                         hover:underline"
            >
              View details →
            </button>

          </div>


          <div
            className="grid
                       grid-cols-2
                       lg:grid-cols-4
                       gap-3
                       sm:gap-4"
          >


            {/* TOTAL */}

            <div
              className="bg-white
                         border
                         border-slate-200
                         border-l-4
                         border-l-[#1769aa]
                         rounded-lg
                         p-4
                         sm:p-5"
            >

              <div className="flex justify-between">

                <div>

                  <p
                    className="text-xs
                               text-slate-500
                               font-semibold"
                  >
                    Total Inspections
                  </p>

                  <p
                    className="text-2xl
                               sm:text-3xl
                               font-bold
                               text-[#123b63]
                               mt-2"
                  >
                    128
                  </p>

                </div>

                <ClipboardList
                  size={25}
                  className="text-[#1769aa]"
                />

              </div>

            </div>


            {/* COMPLIANT */}

            <div
              className="bg-white
                         border
                         border-slate-200
                         border-l-4
                         border-l-green-500
                         rounded-lg
                         p-4
                         sm:p-5"
            >

              <div className="flex justify-between">

                <div>

                  <p
                    className="text-xs
                               text-slate-500
                               font-semibold"
                  >
                    Verified Compliant
                  </p>

                  <p
                    className="text-2xl
                               sm:text-3xl
                               font-bold
                               text-green-600
                               mt-2"
                  >
                    94
                  </p>

                  <p
                    className="text-xs
                               text-green-600
                               mt-1"
                  >
                    73.4%
                  </p>

                </div>

                <CheckCircle2
                  size={25}
                  className="text-green-600"
                />

              </div>

            </div>


            {/* REVIEW */}

            <div
              className="bg-white
                         border
                         border-slate-200
                         border-l-4
                         border-l-amber-500
                         rounded-lg
                         p-4
                         sm:p-5"
            >

              <div className="flex justify-between">

                <div>

                  <p
                    className="text-xs
                               text-slate-500
                               font-semibold"
                  >
                    Needs Review
                  </p>

                  <p
                    className="text-2xl
                               sm:text-3xl
                               font-bold
                               text-amber-600
                               mt-2"
                  >
                    21
                  </p>

                  <p
                    className="text-xs
                               text-amber-600
                               mt-1"
                  >
                    Manual verification
                  </p>

                </div>

                <AlertTriangle
                  size={25}
                  className="text-amber-600"
                />

              </div>

            </div>


            {/* VIOLATIONS */}

            <div
              className="bg-white
                         border
                         border-slate-200
                         border-l-4
                         border-l-red-500
                         rounded-lg
                         p-4
                         sm:p-5"
            >

              <div className="flex justify-between">

                <div>

                  <p
                    className="text-xs
                               text-slate-500
                               font-semibold"
                  >
                    Potential Violations
                  </p>

                  <p
                    className="text-2xl
                               sm:text-3xl
                               font-bold
                               text-red-600
                               mt-2"
                  >
                    13
                  </p>

                  <p
                    className="text-xs
                               text-red-600
                               mt-1"
                  >
                    Requires attention
                  </p>

                </div>

                <AlertTriangle
                  size={25}
                  className="text-red-600"
                />

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            ONLINE SERVICES
        ====================================================== */}

        <section className="mb-8">

          <div
            className="flex
                       items-end
                       justify-between
                       mb-4"
          >

            <div>

              <h2
                className="text-xl
                           font-bold
                           text-[#123b63]"
              >
                Online Services
              </h2>

              <p
                className="text-sm
                           text-slate-500
                           mt-1"
              >
                Frequently used Legal Metrology services
              </p>

            </div>

          </div>


          <div
            className="grid
                       grid-cols-1
                       sm:grid-cols-2
                       xl:grid-cols-4
                       gap-4"
          >

            {services.map((service) => {

              const Icon = service.icon;

              return (

                <button
                  key={service.title}
                  onClick={() =>
                    navigate(service.path)
                  }
                  className="group
                             text-left
                             bg-white
                             border
                             border-slate-200
                             rounded-lg
                             p-5
                             hover:border-[#9ec3dc]
                             hover:shadow-md
                             transition"
                >

                  <div
                    className="flex
                               items-center
                               justify-between"
                  >

                    <div
                      className="w-11
                                 h-11
                                 rounded-lg
                                 bg-[#edf5fa]
                                 flex
                                 items-center
                                 justify-center"
                    >

                      <Icon
                        size={22}
                        className="text-[#1769aa]"
                      />

                    </div>


                    <ArrowRight
                      size={18}
                      className="text-slate-300
                                 group-hover:text-[#1769aa]
                                 group-hover:translate-x-1
                                 transition"
                    />

                  </div>


                  <h3
                    className="font-bold
                               text-slate-900
                               mt-5"
                  >
                    {service.title}
                  </h3>


                  <p
                    className="text-sm
                               text-slate-500
                               mt-2
                               leading-relaxed"
                  >
                    {service.description}
                  </p>


                  <p
                    className="text-xs
                               font-semibold
                               text-[#1769aa]
                               mt-4"
                  >
                    Access Service →
                  </p>

                </button>

              );

            })}

          </div>

        </section>


        {/* =====================================================
            LEGAL METROLOGY INFORMATION
        ====================================================== */}

        <section className="mb-8">

          <div className="mb-4">

            <h2
              className="text-xl
                         font-bold
                         text-[#123b63]"
            >
              Legal Metrology Information
            </h2>

            <p
              className="text-sm
                         text-slate-500
                         mt-1"
            >
              Important legal and inspection resources
            </p>

          </div>


          <div
            className="grid
                       grid-cols-1
                       sm:grid-cols-2
                       lg:grid-cols-4
                       gap-4"
          >

            {informationCards.map((card) => {

              const Icon = card.icon;


              const handleClick = () => {

                if (card.path) {

                  navigate(card.path);

                  return;

                }

                window.open(
                  card.link,
                  "_blank",
                  "noopener,noreferrer"
                );

              };


              return (

                <button
                  key={card.title}
                  onClick={handleClick}
                  className="group
                             bg-white
                             border
                             border-slate-200
                             rounded-lg
                             p-5
                             text-left
                             hover:shadow-md
                             hover:border-[#9ec3dc]
                             transition"
                >

                  <div
                    className="flex
                               items-start
                               justify-between"
                  >

                    <div
                      className="w-10
                                 h-10
                                 rounded-lg
                                 bg-[#eef5f9]
                                 flex
                                 items-center
                                 justify-center"
                    >

                      <Icon
                        size={20}
                        className="text-[#1769aa]"
                      />

                    </div>


                    <ExternalLink
                      size={16}
                      className="text-slate-300
                                 group-hover:text-[#1769aa]"
                    />

                  </div>


                  <h3
                    className="font-bold
                               text-slate-900
                               mt-4"
                  >
                    {card.title}
                  </h3>


                  <p
                    className="text-sm
                               text-slate-500
                               mt-2
                               leading-relaxed"
                  >
                    {card.description}
                  </p>

                </button>

              );

            })}

          </div>

        </section>


        {/* =====================================================
            SEARCH + SYSTEM STATUS
        ====================================================== */}

        <section
          className="grid
                     grid-cols-1
                     lg:grid-cols-3
                     gap-5
                     mb-8"
        >


          {/* SEARCH */}

          <div
            className="lg:col-span-2
                       bg-white
                       border
                       border-slate-200
                       rounded-lg
                       p-5"
          >

            <div
              className="flex
                         items-center
                         gap-3
                         mb-4"
            >

              <div
                className="w-10
                           h-10
                           rounded-lg
                           bg-[#edf5fa]
                           flex
                           items-center
                           justify-center"
              >

                <Search
                  size={19}
                  className="text-[#1769aa]"
                />

              </div>


              <div>

                <h2
                  className="font-bold
                             text-slate-900"
                >
                  Search Inspection Records
                </h2>

                <p
                  className="text-xs
                             text-slate-500
                             mt-1"
                >
                  Quickly locate an inspection by ID or product
                </p>

              </div>

            </div>


            <div
              className="flex
                         flex-col
                         sm:flex-row
                         gap-3"
            >

              <input
                type="text"
                placeholder="Enter inspection ID or product name"
                className="flex-1
                           px-4
                           py-3
                           border
                           border-slate-300
                           rounded-md
                           text-sm
                           outline-none
                           focus:border-[#1769aa]
                           focus:ring-2
                           focus:ring-blue-100"
              />


              <button
                onClick={() =>
                  navigate("/history")
                }
                className="px-5
                           py-3
                           rounded-md
                           bg-[#1769aa]
                           hover:bg-[#0b4f82]
                           text-white
                           text-sm
                           font-semibold
                           transition"
              >
                Search
              </button>

            </div>

          </div>


          {/* SYSTEM STATUS */}

          <div
            className="bg-[#edf5fa]
                       border
                       border-blue-100
                       rounded-lg
                       p-5"
          >

            <div
              className="flex
                         items-center
                         gap-3
                         mb-4"
            >

              <ShieldCheck
                size={21}
                className="text-[#1769aa]"
              />

              <h2
                className="font-bold
                           text-slate-900"
              >
                System Status
              </h2>

            </div>


            <div
              className="space-y-3
                         text-sm"
            >

              <div
                className="flex
                           justify-between"
              >

                <span className="text-slate-500">
                  Portal
                </span>

                <span
                  className="font-semibold
                             text-slate-800"
                >
                  NiyamDrishti
                </span>

              </div>


              <div
                className="flex
                           justify-between"
              >

                <span className="text-slate-500">
                  Module
                </span>

                <span
                  className="font-semibold
                             text-slate-800"
                >
                  Legal Metrology
                </span>

              </div>


              <div
                className="flex
                           justify-between"
              >

                <span className="text-slate-500">
                  Status
                </span>

                <span
                  className="font-semibold
                             text-green-600"
                >
                  Operational
                </span>

              </div>


              <div
                className="flex
                           justify-between"
              >

                <span className="text-slate-500">
                  Version
                </span>

                <span
                  className="font-semibold
                             text-slate-800"
                >
                  1.0.0
                </span>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            FOOTER
        ====================================================== */}

        <footer
          className="mt-14
                     bg-[#06345b]
                     rounded-t-xl
                     overflow-hidden"
        >

          {/* TRICOLOUR LINE */}

          <div className="flex h-1">

            <div className="flex-1 bg-[#ff9933]" />

            <div className="flex-1 bg-white" />

            <div className="flex-1 bg-[#138808]" />

          </div>


          {/* FOOTER CONTENT */}

          <div className="px-5 sm:px-8 py-9">

            <div
              className="flex
                         flex-col
                         items-center
                         text-center"
            >


              {/* LOGO */}

              <div
                className="flex
                           items-center
                           gap-3
                           mb-4"
              >

                <div
                  className="w-12
                             h-12
                             rounded-full
                             bg-white
                             flex
                             items-center
                             justify-center
                             shadow-md"
                >

                  <Scale
                    size={25}
                    className="text-[#06345b]"
                  />

                </div>


                <div className="text-left">

                  <p
                    className="text-[10px]
                               uppercase
                               tracking-widest
                               text-white/60
                               font-semibold"
                  >
                    Digital Legal Metrology Portal
                  </p>

                  <p
                    className="text-xl
                               font-bold
                               text-white"
                  >
                    NiyamDrishti
                  </p>

                </div>

              </div>


              {/* DIVIDER */}

              <div
                className="w-20
                           h-px
                           bg-white/20
                           my-3"
              />


              {/* MADE BY */}

              <div
                className="flex
                           items-center
                           justify-center
                           gap-1.5
                           text-sm"
              >

                <span className="text-white/70">
                  Made with
                </span>

                <span
                  className="text-lg
                             animate-pulse"
                  aria-label="love"
                >
                  ❤️
                </span>

                <span className="text-white/70">
                  by
                </span>

                <span
                  className="font-bold
                             text-white
                             ml-1"
                >
                  Metra-X
                </span>

              </div>


              {/* DESCRIPTION */}

              <p
                className="text-xs
                           text-white/45
                           mt-2"
              >
                Digital inspection and compliance support platform
              </p>


              {/* BOTTOM LINE */}

              <div
                className="mt-6
                           pt-4
                           border-t
                           border-white/10
                           w-full
                           max-w-2xl"
              >

                <p
                  className="text-[11px]
                             text-white/40"
                >
                  NiyamDrishti • Legal Metrology Inspection & Compliance
                </p>

              </div>

            </div>

          </div>

        </footer>


      </div>

    </main>

  );

}


export default Dashboard;