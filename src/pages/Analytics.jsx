import {
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  ArrowLeft,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";


// ============================================================
// API
// ============================================================

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";


// ============================================================
// DEMO GRAPH DATA
//
// These values are used ONLY for the visual analytics charts.
// They are NOT added to the database and do NOT affect the
// actual inspection count or compliance statistics.
// ============================================================

const demoAnalyticsData = {
  monthlyInspections: [
    { month: "Mar", inspections: 4 },
    { month: "Apr", inspections: 5 },
    { month: "May", inspections: 3 },
    { month: "Jun", inspections: 6 },
    { month: "Jul", inspections: 4 },
    { month: "Aug", inspections: 6 },
  ],

  violationCategories: [
    {
      name: "Mandatory declarations",
      count: 4,
    },
    {
      name: "MRP declaration",
      count: 2,
    },
    {
      name: "Net quantity",
      count: 1,
    },
    {
      name: "Consumer care details",
      count: 1,
    },
    {
      name: "Other",
      count: 0,
    },
  ],
};


// ============================================================
// STATUS NORMALIZATION
// ============================================================

const normalizeStatus = (status) => {
  if (!status) return "REVIEW";

  const value = String(status)
    .trim()
    .toUpperCase()
    .replace(/[-\s]+/g, "_");

  if (
    [
      "PASS",
      "PASSED",
      "COMPLIANT",
      "VERIFIED_COMPLIANT",
      "COMPLIANT_WITH_ALL_CHECKS",
    ].includes(value)
  ) {
    return "COMPLIANT";
  }

  if (
    [
      "VIOLATION",
      "VIOLATIONS",
      "FAILED",
      "FAIL",
      "NON_COMPLIANT",
      "NON-COMPLIANT",
    ].includes(value)
  ) {
    return "VIOLATION";
  }

  return "REVIEW";
};


// ============================================================
// ANALYTICS PAGE
// ============================================================

function Analytics() {
  const navigate = useNavigate();

  const [databaseInspections, setDatabaseInspections] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // ==========================================================
  // FETCH REAL INSPECTIONS
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    const fetchInspections = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/inspections`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch inspections (${response.status})`
          );
        }

        const data = await response.json();

        if (!cancelled) {
          setDatabaseInspections(
            Array.isArray(data?.inspections)
              ? data.inspections
              : []
          );
        }
      } catch (err) {
        console.error(
          "Analytics inspection fetch error:",
          err
        );

        if (!cancelled) {
          setError(
            "Unable to load live inspection data."
          );

          setDatabaseInspections([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchInspections();

    return () => {
      cancelled = true;
    };
  }, []);


  // ==========================================================
  // BUILD ANALYTICS DATA
  //
  // IMPORTANT:
  //
  // Summary statistics come from the REAL DATABASE.
  //
  // Graphs use DEMO DATA for presentation purposes.
  // ==========================================================

  const analyticsData = useMemo(() => {

    // --------------------------------------------------------
    // REAL DATABASE STATUS COUNTS
    // --------------------------------------------------------

    let realCompliant = 0;
    let realReview = 0;
    let realViolations = 0;

    databaseInspections.forEach((inspection) => {
      const status = normalizeStatus(
        inspection?.overall_status ||
        inspection?.status
      );

      if (status === "COMPLIANT") {
        realCompliant += 1;
      } else if (status === "VIOLATION") {
        realViolations += 1;
      } else {
        realReview += 1;
      }
    });


    // --------------------------------------------------------
    // REAL DATABASE TOTAL
    // --------------------------------------------------------

    const totalInspections =
      databaseInspections.length;

    const compliant =
      realCompliant;

    const potentialViolations =
      realViolations;

    const needsReview =
      realReview;


    // --------------------------------------------------------
    // REAL DATABASE COMPLIANCE RATE
    // --------------------------------------------------------

    const complianceRate =
      totalInspections > 0
        ? Number(
            (
              (compliant / totalInspections) *
              100
            ).toFixed(1)
          )
        : 0;


    // --------------------------------------------------------
    // DEMO MONTHLY GRAPH
    //
    // This is intentionally NOT connected to the database.
    // --------------------------------------------------------

    const monthlyInspections =
      demoAnalyticsData.monthlyInspections;


    // --------------------------------------------------------
    // DEMO VIOLATION GRAPH
    //
    // This is intentionally NOT connected to the database.
    // --------------------------------------------------------

    const totalViolationCategoryCount =
      demoAnalyticsData.violationCategories.reduce(
        (sum, item) =>
          sum + item.count,
        0
      );

    const violationCategories =
      demoAnalyticsData.violationCategories.map(
        (item) => ({
          ...item,

          percentage:
            totalViolationCategoryCount > 0
              ? Math.round(
                  (item.count /
                    totalViolationCategoryCount) *
                    100
                )
              : 0,
        })
      );


    return {
      totalInspections,
      compliant,
      potentialViolations,
      needsReview,
      complianceRate,
      monthlyInspections,
      violationCategories,
    };

  }, [databaseInspections]);


  // ============================================================
  // DESTRUCTURE
  // ============================================================

  const {
    totalInspections,
    compliant,
    potentialViolations,
    needsReview,
    complianceRate,
    monthlyInspections,
    violationCategories,
  } = analyticsData;


  // ============================================================
  // CHART SCALING
  // ============================================================

  const maxMonthlyInspections =
    monthlyInspections.length > 0
      ? Math.max(
          ...monthlyInspections.map(
            (item) => item.inspections
          )
        )
      : 1;


  // ============================================================
  // UI
  // ============================================================

  return (
    <main className="p-8 bg-[#F6F8FC] min-h-[calc(100vh-80px)]">


      {/* ======================================================
          HEADER
      ====================================================== */}

      <section className="mb-8">

        <div className="flex items-center justify-between">

          <div>

            <div className="flex items-center gap-2 mb-2">

              <BarChart3
                size={20}
                className="text-blue-600"
              />

              <span className="text-sm font-medium text-blue-600">
                Inspection Analytics
              </span>

            </div>

            <h1 className="text-3xl font-bold text-slate-900">
              Analytics
            </h1>

            <p className="text-slate-500 mt-2">
              Monitor inspection performance, compliance trends,
              and potential violation patterns.
            </p>

          </div>


          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2
                       px-4 py-2.5
                       rounded-xl
                       border border-slate-200
                       bg-white
                       text-slate-600
                       hover:text-slate-900
                       hover:bg-slate-50
                       transition-all duration-200"
          >

            <ArrowLeft size={18} />

            Dashboard

          </button>

        </div>

      </section>


      {/* ======================================================
          OVERVIEW STATISTICS
      ====================================================== */}

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">


        {/* Total Inspections */}

        <div
          className="bg-white p-6 rounded-2xl
                     border border-slate-200
                     shadow-sm
                     hover:shadow-md
                     hover:-translate-y-1
                     transition-all duration-200"
        >

          <div className="flex items-start justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Total Inspections
              </p>

              <h2 className="text-3xl font-bold text-slate-900 mt-3">
                {totalInspections}
              </h2>

            </div>

            <div
              className="w-11 h-11 rounded-xl
                         bg-blue-50
                         flex items-center justify-center
                         text-blue-600"
            >
              <ClipboardList size={22} />
            </div>

          </div>

          <div className="flex items-center gap-2 mt-4">

            <TrendingUp
              size={16}
              className="text-green-600"
            />

            <span className="text-sm font-medium text-green-600">
              Inspection activity
            </span>

          </div>

        </div>


        {/* Compliance Rate */}

        <div
          className="bg-white p-6 rounded-2xl
                     border border-slate-200
                     shadow-sm
                     hover:shadow-md
                     hover:-translate-y-1
                     transition-all duration-200"
        >

          <div className="flex items-start justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Compliance Rate
              </p>

              <h2 className="text-3xl font-bold text-green-600 mt-3">
                {complianceRate}%
              </h2>

            </div>

            <div
              className="w-11 h-11 rounded-xl
                         bg-green-50
                         flex items-center justify-center
                         text-green-600"
            >
              <CheckCircle2 size={22} />
            </div>

          </div>

          <div className="flex items-center gap-2 mt-4">

            <span className="text-sm font-medium text-green-600">
              {compliant} verified compliant
            </span>

          </div>

        </div>


        {/* Needs Review */}

        <div
          className="bg-white p-6 rounded-2xl
                     border border-slate-200
                     shadow-sm
                     hover:shadow-md
                     hover:-translate-y-1
                     transition-all duration-200"
        >

          <div className="flex items-start justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Needs Review
              </p>

              <h2 className="text-3xl font-bold text-amber-500 mt-3">
                {needsReview}
              </h2>

            </div>

            <div
              className="w-11 h-11 rounded-xl
                         bg-amber-50
                         flex items-center justify-center
                         text-amber-600"
            >
              <Clock3 size={22} />
            </div>

          </div>

          <div className="flex items-center gap-2 mt-4">

            <span className="text-sm font-medium text-amber-600">
              Manual verification
            </span>

          </div>

        </div>


        {/* Potential Violations */}

        <div
          className="bg-white p-6 rounded-2xl
                     border border-slate-200
                     shadow-sm
                     hover:shadow-md
                     hover:-translate-y-1
                     transition-all duration-200"
        >

          <div className="flex items-start justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Potential Violations
              </p>

              <h2 className="text-3xl font-bold text-red-600 mt-3">
                {potentialViolations}
              </h2>

            </div>

            <div
              className="w-11 h-11 rounded-xl
                         bg-red-50
                         flex items-center justify-center
                         text-red-600"
            >
              <AlertTriangle size={22} />
            </div>

          </div>

          <div className="flex items-center gap-2 mt-4">

            <TrendingDown
              size={16}
              className="text-red-600"
            />

            <span className="text-sm font-medium text-red-600">
              Requires attention
            </span>

          </div>

        </div>

      </section>


      {/* ======================================================
          CHARTS
      ====================================================== */}

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">


        {/* ----------------------------------------------------
            INSPECTION TREND
        ---------------------------------------------------- */}

        <div
          className="bg-white rounded-2xl
                     border border-slate-200
                     shadow-sm p-6"
        >

          <div className="flex items-center justify-between mb-6">

            <div>

              <h2 className="text-xl font-bold text-slate-900">
                Inspection Trends
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Number of inspections over recent months
              </p>

            </div>

            <div
              className="w-10 h-10 rounded-xl
                         bg-blue-50
                         flex items-center justify-center
                         text-blue-600"
            >
              <TrendingUp size={20} />
            </div>

          </div>


          {/* Bar Chart */}

          <div className="h-64 flex items-end justify-between gap-4 px-2">

            {monthlyInspections.map((item) => {

              const height =
                maxMonthlyInspections > 0
                  ? (item.inspections /
                      maxMonthlyInspections) *
                    100
                  : 0;

              return (
                <div
                  key={item.month}
                  className="flex-1 h-full flex flex-col
                             items-center justify-end gap-3"
                >

                  <span className="text-xs font-semibold text-slate-600">
                    {item.inspections}
                  </span>

                  <div
                    className="w-full max-w-10
                               bg-blue-500
                               rounded-t-lg
                               hover:bg-blue-600
                               transition-all duration-200"
                    style={{
                      height: `${height}%`,
                    }}
                    title={`${item.inspections} inspections`}
                  ></div>

                  <span className="text-xs text-slate-500">
                    {item.month}
                  </span>

                </div>
              );

            })}

          </div>

        </div>


        {/* ----------------------------------------------------
            COMPLIANCE BREAKDOWN
        ---------------------------------------------------- */}

        <div
          className="bg-white rounded-2xl
                     border border-slate-200
                     shadow-sm p-6"
        >

          <div className="flex items-center justify-between mb-6">

            <div>

              <h2 className="text-xl font-bold text-slate-900">
                Compliance Breakdown
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Current inspection status distribution
              </p>

            </div>

            <div
              className="w-10 h-10 rounded-xl
                         bg-green-50
                         flex items-center justify-center
                         text-green-600"
            >
              <PieChart size={20} />
            </div>

          </div>


          {/* Compliance visual */}

          <div className="flex items-center gap-8">

            {/* Circular visual */}

            <div
              className="relative w-40 h-40 rounded-full
                         flex items-center justify-center"
              style={{
                background: `conic-gradient(
                  #22c55e 0% ${complianceRate}%,
                  #f59e0b ${complianceRate}% ${
                    complianceRate +
                    (needsReview /
                      Math.max(totalInspections, 1)) *
                      100
                  }%,
                  #ef4444 ${
                    complianceRate +
                    (needsReview /
                      Math.max(totalInspections, 1)) *
                      100
                  }% 100%
                )`,
              }}
            >

              <div
                className="w-28 h-28
                           rounded-full
                           bg-white
                           flex flex-col
                           items-center justify-center"
              >

                <span className="text-2xl font-bold text-slate-900">
                  {complianceRate}%
                </span>

                <span className="text-xs text-slate-500">
                  Compliant
                </span>

              </div>

            </div>


            {/* Legend */}

            <div className="flex-1 space-y-5">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <span className="w-3 h-3 rounded-full bg-green-500"></span>

                  <span className="text-sm text-slate-600">
                    Verified Compliant
                  </span>

                </div>

                <span className="text-sm font-semibold text-slate-900">
                  {compliant}
                </span>

              </div>


              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <span className="w-3 h-3 rounded-full bg-amber-500"></span>

                  <span className="text-sm text-slate-600">
                    Needs Review
                  </span>

                </div>

                <span className="text-sm font-semibold text-slate-900">
                  {needsReview}
                </span>

              </div>


              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <span className="w-3 h-3 rounded-full bg-red-500"></span>

                  <span className="text-sm text-slate-600">
                    Potential Violations
                  </span>

                </div>

                <span className="text-sm font-semibold text-slate-900">
                  {potentialViolations}
                </span>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ======================================================
          COMMON VIOLATIONS
      ====================================================== */}

      <section>

        <div
          className="bg-white rounded-2xl
                     border border-slate-200
                     shadow-sm p-6"
        >

          <div className="flex items-center justify-between mb-6">

            <div>

              <h2 className="text-xl font-bold text-slate-900">
                Common Potential Violations
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Frequently detected compliance issues
              </p>

            </div>

            <AlertTriangle
              size={22}
              className="text-red-500"
            />

          </div>


          <div className="space-y-5">

            {violationCategories.map((item) => (

              <div key={item.name}>

                <div className="flex items-center justify-between mb-2">

                  <span className="text-sm font-medium text-slate-700">
                    {item.name}
                  </span>

                  <span className="text-sm font-semibold text-slate-900">
                    {item.count}
                  </span>

                </div>


                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">

                  <div
                    className="h-full bg-red-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percentage}%`,
                    }}
                  ></div>

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* ======================================================
          DATA STATUS
      ====================================================== */}

      <div className="mt-6 text-center">

        {loading ? (
          <p className="text-xs text-slate-400">
            Loading live inspection data...
          </p>
        ) : error ? (
          <p className="text-xs text-amber-500">
            {error} Showing demo analytics data.
          </p>
        ) : (
          <p className="text-xs text-slate-400">
            Analytics summary is based on{" "}
            {databaseInspections.length} live inspections.
          </p>
        )}

      </div>


    </main>
  );
}

export default Analytics;