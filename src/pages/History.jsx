import {
  Search,
  Filter,
  Eye,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  CalendarDays,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";


// ============================================================
// API
// ============================================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";


// ============================================================
// HELPERS
// ============================================================

function normalizeStatus(status) {
  const value = String(status || "").toUpperCase();

  if (
    value === "COMPLIANT" ||
    value === "PASS" ||
    value === "PASSED"
  ) {
    return "Verified Compliant";
  }

  if (
    value === "PARTIAL" ||
    value === "UNCERTAIN" ||
    value === "REVIEW" ||
    value === "NEEDS REVIEW" ||
    value === "REQUIRES_ADDITIONAL_IMAGE"
  ) {
    return "Needs Review";
  }

  if (
    value === "NON-COMPLIANT" ||
    value === "NON_COMPLIANT" ||
    value === "VIOLATION" ||
    value === "FAIL" ||
    value === "FAILED"
  ) {
    return "Potential Violation";
  }

  return "Needs Review";
}


function getStatusConfig(status) {
  if (status === "Verified Compliant") {
    return {
      icon: <CheckCircle2 size={16} />,
      className:
        "text-green-700 bg-green-50 border-green-200",
    };
  }

  if (status === "Potential Violation") {
    return {
      icon: <AlertTriangle size={16} />,
      className:
        "text-red-700 bg-red-50 border-red-200",
    };
  }

  return {
    icon: <Clock size={16} />,
    className:
      "text-amber-700 bg-amber-50 border-amber-200",
  };
}


function formatDate(dateValue) {
  if (!dateValue) {
    return "Not recorded";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return String(dateValue);
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}


function getCompliancePercentage(inspection) {
  const value =
    inspection?.compliance_percentage;

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  return Math.round(number);
}


// ============================================================
// HISTORY
// ============================================================

function History() {
  const navigate = useNavigate();


  // ==========================================================
  // STATE
  // ==========================================================

  const [
    inspections,
    setInspections,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("All");

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);


  const ITEMS_PER_PAGE = 6;


  // ==========================================================
  // LOAD INSPECTIONS
  // ==========================================================

  const loadInspections = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/inspections`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to load inspections (${response.status})`
        );
      }

      const data = await response.json();

      const records =
        Array.isArray(data)
          ? data
          : Array.isArray(data?.inspections)
          ? data.inspections
          : [];

      setInspections(records);

    } catch (err) {
      console.error(
        "NiyamDrishti history loading error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load inspection history."
      );

      setInspections([]);

    } finally {
      setLoading(false);
    }
  };


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadInspections();
  }, []);


  // ==========================================================
  // NORMALIZED INSPECTIONS
  // ==========================================================

  const normalizedInspections =
    useMemo(() => {
      return inspections.map(
        (inspection) => {

          const rawStatus =
            inspection?.overall_status ||
            inspection?.status ||
            "REVIEW";

          return {
            ...inspection,

            databaseId:
              inspection?.id,

            inspectionId:
              inspection?.inspection_code ||
              inspection?.inspectionCode ||
              inspection?.id ||
              "Not assigned",

            product:
              inspection?.product_name ||
              inspection?.productName ||
              "Product name not detected",

            brand:
              inspection?.brand_name ||
              inspection?.brandName ||
              "Not available",

            date:
              formatDate(
                inspection?.created_at ||
                inspection?.createdAt
              ),

            rawDate:
              inspection?.created_at ||
              inspection?.createdAt,

            status:
              normalizeStatus(
                rawStatus
              ),

            inspector:
              inspection?.inspector_name ||
              inspection?.inspectorName ||
              "Enforcement Officer",

            compliance:
              getCompliancePercentage(
                inspection
              ),
          };
        }
      );
    }, [inspections]);


  // ==========================================================
  // COUNTS
  // ==========================================================

  const totalInspections =
    normalizedInspections.length;


  const compliantCount =
    normalizedInspections.filter(
      (inspection) =>
        inspection.status ===
        "Verified Compliant"
    ).length;


  const reviewCount =
    normalizedInspections.filter(
      (inspection) =>
        inspection.status ===
        "Needs Review"
    ).length;


  const violationCount =
    normalizedInspections.filter(
      (inspection) =>
        inspection.status ===
        "Potential Violation"
    ).length;


  // ==========================================================
  // SEARCH + FILTER
  // ==========================================================

  const filteredInspections =
    useMemo(() => {

      const searchValue =
        search.trim().toLowerCase();

      return normalizedInspections.filter(
        (inspection) => {

          const matchesSearch =
            !searchValue ||
            String(
              inspection.inspectionId
            )
              .toLowerCase()
              .includes(searchValue) ||
            String(
              inspection.product
            )
              .toLowerCase()
              .includes(searchValue) ||
            String(
              inspection.brand
            )
              .toLowerCase()
              .includes(searchValue);

          const matchesStatus =
            statusFilter === "All" ||
            inspection.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );

    }, [
      normalizedInspections,
      search,
      statusFilter,
    ]);


  // ==========================================================
  // PAGINATION
  // ==========================================================

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredInspections.length /
          ITEMS_PER_PAGE
      )
    );


  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [
    currentPage,
    totalPages,
  ]);


  const paginatedInspections =
    filteredInspections.slice(
      (currentPage - 1) *
        ITEMS_PER_PAGE,
      currentPage *
        ITEMS_PER_PAGE
    );


  const startIndex =
    filteredInspections.length === 0
      ? 0
      : (currentPage - 1) *
          ITEMS_PER_PAGE +
        1;


  const endIndex =
    Math.min(
      currentPage *
        ITEMS_PER_PAGE,
      filteredInspections.length
    );


  // ==========================================================
  // OPEN REPORT
  // ==========================================================

  const openReport = (
    inspection
  ) => {

    if (!inspection?.databaseId) {
      console.error(
        "Inspection has no database ID:",
        inspection
      );

      return;
    }

    navigate(
      `/report?id=${encodeURIComponent(
        inspection.databaseId
      )}`
    );
  };


  // ==========================================================
  // SEARCH RESET
  // ==========================================================

  const handleSearchChange = (
    event
  ) => {
    setSearch(
      event.target.value
    );

    setCurrentPage(1);
  };


  const handleStatusChange = (
    event
  ) => {
    setStatusFilter(
      event.target.value
    );

    setCurrentPage(1);
  };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="p-8">

        <div className="flex items-center justify-center min-h-[500px]">

          <div className="text-center">

            <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto" />

            <p className="text-slate-600 font-medium mt-4">
              Loading inspection history...
            </p>

            <p className="text-sm text-slate-400 mt-1">
              Retrieving records from NiyamDrishti
            </p>

          </div>

        </div>

      </div>
    );
  }


  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="p-4 sm:p-6 lg:p-8">


      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">

        <div>

          <button
            onClick={() =>
              navigate("/")
            }
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mb-3"
          >

            <ArrowLeft size={17} />

            Back to Dashboard

          </button>


          <h1 className="text-2xl font-bold text-slate-900">
            Inspection History
          </h1>


          <p className="text-sm text-slate-500 mt-1">
            Search and manage previous compliance inspections
          </p>

        </div>


        <div className="flex gap-3">

          <button
            onClick={loadInspections}
            className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition"
          >

            <RefreshCw size={17} />

            Refresh

          </button>


          <button
            onClick={() =>
              navigate(
                "/new-inspection"
              )
            }
            className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
          >

            <FileText size={18} />

            New Inspection

          </button>

        </div>

      </div>


      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (

        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">

          <div className="flex items-start gap-3">

            <AlertTriangle
              size={20}
              className="text-red-600 mt-0.5"
            />

            <div>

              <p className="font-semibold text-red-800">
                Unable to load inspection history
              </p>

              <p className="text-sm text-red-700 mt-1">
                {error}
              </p>

              <button
                onClick={loadInspections}
                className="mt-3 text-sm font-semibold text-red-700 hover:underline"
              >
                Try again
              </button>

            </div>

          </div>

        </div>

      )}


      {/* ======================================================
          SUMMARY CARDS
      ====================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">


        {/* Total */}

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Total Inspections
          </p>

          <p className="text-2xl font-bold text-slate-900 mt-2">
            {totalInspections}
          </p>

        </div>


        {/* Compliant */}

        <div className="bg-white border border-green-200 rounded-2xl p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Verified Compliant
          </p>

          <p className="text-2xl font-bold text-green-600 mt-2">
            {compliantCount}
          </p>

        </div>


        {/* Review */}

        <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Needs Review
          </p>

          <p className="text-2xl font-bold text-amber-600 mt-2">
            {reviewCount}
          </p>

        </div>


        {/* Violations */}

        <div className="bg-white border border-red-200 rounded-2xl p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Potential Violations
          </p>

          <p className="text-2xl font-bold text-red-600 mt-2">
            {violationCount}
          </p>

        </div>

      </div>


      {/* ======================================================
          SEARCH + FILTER
      ====================================================== */}

      <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 shadow-sm">

        <div className="flex flex-col md:flex-row gap-4">


          {/* Search */}

          <div className="relative flex-1">

            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={
                handleSearchChange
              }
              placeholder="Search by product, brand or inspection ID..."
              className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </div>


          {/* Status */}

          <div className="relative">

            <Filter
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />

            <select
              value={statusFilter}
              onChange={
                handleStatusChange
              }
              className="appearance-none pl-11 pr-10 py-3 border border-slate-200 rounded-xl text-sm text-slate-600 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 min-w-[190px]"
            >

              <option value="All">
                All Statuses
              </option>

              <option value="Verified Compliant">
                Verified Compliant
              </option>

              <option value="Needs Review">
                Needs Review
              </option>

              <option value="Potential Violation">
                Potential Violation
              </option>

            </select>

          </div>


          {/* Date */}

          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("All");
              setCurrentPage(1);
            }}
            className="flex items-center justify-center gap-2 px-5 py-3 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50"
          >

            <CalendarDays size={17} />

            Clear Filters

          </button>

        </div>

      </div>


      {/* ======================================================
          TABLE
      ====================================================== */}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">


        {/* Table Header */}

        <div className="px-6 py-5 border-b border-slate-200">

          <h2 className="font-bold text-lg text-slate-900">
            Recent Inspections
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Inspection records stored in the NiyamDrishti system
          </p>

        </div>


        {/* ====================================================
            EMPTY STATE
        ==================================================== */}

        {paginatedInspections.length === 0 ? (

          <div className="py-16 text-center">

            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto">

              <Search
                size={25}
                className="text-slate-400"
              />

            </div>


            <h3 className="font-semibold text-slate-800 mt-4">
              No inspections found
            </h3>


            <p className="text-sm text-slate-500 mt-1">
              {search ||
              statusFilter !== "All"
                ? "Try changing your search or filters."
                : "Completed inspections will appear here."}
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[950px]">

              <thead className="bg-slate-50">

                <tr className="text-left">


                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Inspection ID
                  </th>


                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Product
                  </th>


                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Brand
                  </th>


                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Date
                  </th>


                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Status
                  </th>


                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Inspector
                  </th>


                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">
                    Action
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-slate-100">

                {paginatedInspections.map(
                  (inspection) => {

                    const status =
                      getStatusConfig(
                        inspection.status
                      );


                    return (

                      <tr
                        key={
                          inspection.databaseId
                        }
                        className="hover:bg-slate-50 transition"
                      >


                        {/* ID */}

                        <td className="px-6 py-5">

                          <p className="text-sm font-semibold text-blue-600">
                            {inspection.inspectionId}
                          </p>

                        </td>


                        {/* Product */}

                        <td className="px-6 py-5">

                          <p className="text-sm font-semibold text-slate-800">
                            {inspection.product}
                          </p>

                        </td>


                        {/* Brand */}

                        <td className="px-6 py-5">

                          <p className="text-sm text-slate-600">
                            {inspection.brand}
                          </p>

                        </td>


                        {/* Date */}

                        <td className="px-6 py-5">

                          <p className="text-sm text-slate-600">
                            {inspection.date}
                          </p>

                        </td>


                        {/* Status */}

                        <td className="px-6 py-5">

                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${status.className}`}
                          >

                            {status.icon}

                            {inspection.status}

                          </span>

                        </td>


                        {/* Inspector */}

                        <td className="px-6 py-5">

                          <p className="text-sm text-slate-600">
                            {inspection.inspector}
                          </p>

                        </td>


                        {/* Actions */}

                        <td className="px-6 py-5">

                          <div className="flex justify-end gap-2">


                            {/* Eye */}

                            <button
                              onClick={() =>
                                openReport(
                                  inspection
                                )
                              }
                              title="View Report"
                              className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                            >

                              <Eye
                                size={18}
                              />

                            </button>


                            {/* Report */}

                            <button
                              onClick={() =>
                                openReport(
                                  inspection
                                )
                              }
                              title="Open Report"
                              className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                            >

                              <FileText
                                size={18}
                              />

                            </button>

                          </div>

                        </td>

                      </tr>

                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        )}


        {/* ====================================================
            PAGINATION
        ==================================================== */}

        {filteredInspections.length > 0 && (

          <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">


            <p className="text-sm text-slate-500">

              Showing{" "}

              <span className="font-semibold text-slate-700">
                {startIndex}–{endIndex}
              </span>{" "}

              of{" "}

              <span className="font-semibold text-slate-700">
                {filteredInspections.length}
              </span>{" "}

              inspections

            </p>


            <div className="flex gap-2">


              {/* Previous */}

              <button
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.max(
                        1,
                        page - 1
                      )
                  )
                }
                disabled={
                  currentPage === 1
                }
                className="px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:text-slate-300 disabled:hover:bg-white disabled:cursor-not-allowed"
              >
                Previous
              </button>


              {/* Page numbers */}

              {Array.from(
                {
                  length: totalPages,
                },
                (_, index) =>
                  index + 1
              ).map((page) => (

                <button
                  key={page}
                  onClick={() =>
                    setCurrentPage(
                      page
                    )
                  }
                  className={`px-4 py-2 text-sm rounded-lg ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >

                  {page}

                </button>

              ))}


              {/* Next */}

              <button
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.min(
                        totalPages,
                        page + 1
                      )
                  )
                }
                disabled={
                  currentPage ===
                  totalPages
                }
                className="px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:text-slate-300 disabled:hover:bg-white disabled:cursor-not-allowed"
              >
                Next
              </button>

            </div>

          </div>

        )}

      </div>


      {/* ======================================================
          INFORMATION
      ====================================================== */}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">

        <p className="text-sm text-blue-800">

          <span className="font-semibold">
            Audit-ready records:
          </span>{" "}

          Each completed inspection is retrieved from the
          NiyamDrishti database and can be opened as an
          individual inspection report.

        </p>

      </div>

    </div>
  );
}


export default History;