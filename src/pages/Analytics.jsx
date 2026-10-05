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

  const [dashboardStats, setDashboardStats] =
    useState({
      total_inspections: 0,
      compliant: 0,
      needs_review: 0,
      potential_violations: 0,
      compliance_rate: 0,
    });

  const [ruleResults, setRuleResults] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // ==========================================================
  // FETCH REAL DATABASE DATA
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError("");

        // ----------------------------------------------------
        // Fetch dashboard statistics
        //
        // IMPORTANT:
        // Dashboard and Analytics now use the exact same
        // backend statistics endpoint. This prevents the
        // two pages from calculating different totals/statuses.
        // ----------------------------------------------------

        const statsResponse = await fetch(
          `${API_URL}/dashboard/stats`
        );

        if (!statsResponse.ok) {
          throw new Error(
            `Failed to fetch dashboard statistics (${statsResponse.status})`
          );
        }

        const statsData = await statsResponse.json();

        if (cancelled) return;

        setDashboardStats({
          total_inspections:
            Number(statsData?.total_inspections) || 0,

          compliant:
            Number(statsData?.compliant) || 0,

          needs_review:
            Number(statsData?.needs_review) || 0,

          potential_violations:
            Number(statsData?.potential_violations) || 0,

          compliance_rate:
            Number(
              statsData?.compliance_rate ??
              statsData?.compliance_percentage
            ) || 0,
        });

        // ----------------------------------------------------
        // Fetch all inspections
        //
        // Used for monthly trend data and inspection-level
        // timestamps. Summary cards do NOT recalculate these
        // values independently.
        // ----------------------------------------------------

        const response = await fetch(
          `${API_URL}/inspections`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch inspections (${response.status})`
          );
        }

        const data = await response.json();

        const inspections = Array.isArray(
          data?.inspections
        )
          ? data.inspections
          : [];

        if (cancelled) return;

        setDatabaseInspections(inspections);


        // ----------------------------------------------------
        // No inspections
        // ----------------------------------------------------

        if (inspections.length === 0) {
          setRuleResults([]);
          return;
        }


        // ----------------------------------------------------
        // Fetch detailed inspection records
        //
        // Rule results are stored at the inspection level,
        // so they are retrieved from the real backend.
        // ----------------------------------------------------

        const detailResponses =
          await Promise.all(
            inspections.map(async (inspection) => {
              try {
                const detailResponse =
                  await fetch(
                    `${API_URL}/inspections/${inspection.id}`
                  );

                if (!detailResponse.ok) {
                  console.error(
                    `Failed to fetch inspection ${inspection.id}: ${detailResponse.status}`
                  );

                  return null;
                }

                return await detailResponse.json();

              } catch (detailError) {
                console.error(
                  `Failed to fetch inspection ${inspection.id}:`,
                  detailError
                );

                return null;
              }
            })
          );


        if (cancelled) return;


        // ----------------------------------------------------
        // Extract actual rule results
        // ----------------------------------------------------

        const allRuleResults =
          detailResponses
            .filter(Boolean)
            .flatMap((inspection) =>
              Array.isArray(
                inspection?.rule_results
              )
                ? inspection.rule_results
                : []
            );


        if (!cancelled) {
          setRuleResults(allRuleResults);
        }

      } catch (err) {
        console.error(
          "Analytics data fetch error:",
          err
        );

        if (!cancelled) {
          setError(
            "Unable to load live inspection data."
          );

          setDatabaseInspections([]);
          setRuleResults([]);
        }

      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };


    fetchAnalyticsData();


    return () => {
      cancelled = true;
    };

  }, []);


  // ==========================================================
  // BUILD ANALYTICS FROM DATABASE DATA
  // ==========================================================

  const analyticsData = useMemo(() => {

    // --------------------------------------------------------
    // SUMMARY STATISTICS
    //
    // These values come from /dashboard/stats so Dashboard
    // and Analytics always display the same database truth.
    // --------------------------------------------------------

    const totalInspections =
      Number(dashboardStats?.total_inspections) || 0;

    const compliant =
      Number(dashboardStats?.compliant) || 0;

    const potentialViolations =
      Number(dashboardStats?.potential_violations) || 0;

    const needsReview =
      Number(dashboardStats?.needs_review) || 0;

    const complianceRate =
      Number(
        dashboardStats?.compliance_rate
      ) || 0;


    // --------------------------------------------------------
    // MONTHLY INSPECTION TREND
    // --------------------------------------------------------

    const monthlyMap = {};


    databaseInspections.forEach(
      (inspection) => {

        if (!inspection?.created_at) {
          return;
        }


        const date =
          new Date(
            inspection.created_at
          );


        if (
          Number.isNaN(
            date.getTime()
          )
        ) {
          return;
        }


        const year =
          date.getFullYear();

        const month =
          date.getMonth();


        const key =
          `${year}-${String(
            month + 1
          ).padStart(2, "0")}`;


        if (!monthlyMap[key]) {

          monthlyMap[key] = {
            key,
            month:
              date.toLocaleDateString(
                "en-IN",
                {
                  month: "short",
                }
              ),
            year,
            inspections: 0,
          };

        }


        monthlyMap[key].inspections += 1;

      }
    );


    const monthlyInspections =
      Object.values(monthlyMap)
        .sort((a, b) =>
          a.key.localeCompare(
            b.key
          )
        )
        .map((item) => ({
          ...item,

          // Show the year when more than one year
          // exists in the dataset.
          label: item.month,
        }));


    // --------------------------------------------------------
    // REAL VIOLATION CATEGORIES
    //
    // Only actual rule results marked as VIOLATION
    // are counted.
    // --------------------------------------------------------

    const violationMap = {};


    ruleResults.forEach((rule) => {

      const status =
        normalizeStatus(
          rule?.status
        );


      if (status !== "VIOLATION") {
        return;
      }


      const ruleName =
        rule?.rule_name ||
        rule?.rule_code ||
        "Unknown rule";


      if (!violationMap[ruleName]) {
        violationMap[ruleName] = 0;
      }


      violationMap[ruleName] += 1;

    });


    const totalViolationCount =
      Object.values(
        violationMap
      ).reduce(
        (sum, count) =>
          sum + count,
        0
      );


    const violationCategories =
      Object.entries(
        violationMap
      )
        .map(
          ([name, count]) => ({
            name,
            count,

            percentage:
              totalViolationCount > 0
                ? Math.round(
                    (count /
                      totalViolationCount) *
                      100
                  )
                : 0,
          })
        )
        .sort(
          (a, b) =>
            b.count - a.count
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

  }, [
    databaseInspections,
    ruleResults,
    dashboardStats,
  ]);


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
            (item) =>
              item.inspections
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
              Average compliance score
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
            REAL INSPECTION TREND
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


          {monthlyInspections.length === 0 ? (

            <div className="h-64 flex items-center justify-center">

              <p className="text-sm text-slate-400">
                No inspection data available yet.
              </p>

            </div>

          ) : (

            <div
              className="h-64 flex items-end justify-center
                         gap-10 px-4 overflow-x-auto"
            >

              {monthlyInspections.map((item) => {

                const height =
                  maxMonthlyInspections > 0
                    ? (item.inspections /
                        maxMonthlyInspections) *
                      100
                    : 0;

                return (
                  <div
                    key={item.key}
                    className="h-full w-20 shrink-0
                               flex flex-col items-center
                               justify-end gap-3"
                  >

                    <span className="text-xs font-semibold text-slate-600">
                      {item.inspections}
                    </span>

                    <div
                      className="w-14
                                 bg-blue-500
                                 rounded-t-lg
                                 hover:bg-blue-600
                                 transition-all duration-200"
                      style={{
                        height: `${Math.max(
                          height,
                          5
                        )}%`,
                      }}
                      title={`${item.inspections} inspections`}
                    ></div>

                    <span className="text-xs text-slate-500">
                      {item.label}
                    </span>

                  </div>
                );

              })}

            </div>

          )}

        </div>


        {/* ----------------------------------------------------
            REAL COMPLIANCE BREAKDOWN
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
                  #22c55e 0% ${
                    totalInspections > 0
                      ? (compliant /
                          totalInspections) *
                        100
                      : 0
                  }%,
                  #f59e0b ${
                    totalInspections > 0
                      ? (compliant /
                          totalInspections) *
                        100
                      : 0
                  }% ${
                    totalInspections > 0
                      ? ((compliant +
                          needsReview) /
                          totalInspections) *
                        100
                      : 0
                  }%,
                  #ef4444 ${
                    totalInspections > 0
                      ? ((compliant +
                          needsReview) /
                          totalInspections) *
                        100
                      : 0
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
                  Avg. Score
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
          REAL COMMON VIOLATIONS
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


          {violationCategories.length === 0 ? (

            <div className="py-8 text-center">

              <CheckCircle2
                size={30}
                className="mx-auto text-green-500"
              />

              <p className="text-sm text-slate-400 mt-3">
                No rule violations recorded yet.
              </p>

            </div>

          ) : (

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
                        width: `${Math.max(
                          item.percentage,
                          4
                        )}%`,
                      }}
                    ></div>

                  </div>

                </div>

              ))}

            </div>

          )}

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

          <p className="text-xs text-red-500">
            {error}
          </p>

        ) : (

          <p className="text-xs text-slate-400">
            Analytics summary is based on{" "}
            {dashboardStats.total_inspections} live inspections
            from the database.
          </p>

        )}

      </div>


    </main>
  );
}

export default Analytics;
