import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// ============================================================
// STATUS HELPERS
// ============================================================

function normalizeStatus(inspection) {
  const value = String(
    inspection?.overall_status ||
      inspection?.status ||
      ""
  ).toUpperCase();

  if (
    value === "COMPLIANT" ||
    value === "PASS" ||
    value === "PASSED"
  ) {
    return "compliant";
  }

  if (
    value === "NON-COMPLIANT" ||
    value === "NON_COMPLIANT" ||
    value === "VIOLATION" ||
    value === "FAILED" ||
    value === "FAIL"
  ) {
    return "potential_violation";
  }

  return "needs_review";
}

const statusConfig = {
  compliant: {
    label: "Verified Compliant",
    className: "bg-green-50 text-green-700",
    icon: CheckCircle2,
  },

  potential_violation: {
    label: "Potential Violation",
    className: "bg-red-50 text-red-700",
    icon: AlertTriangle,
  },

  needs_review: {
    label: "Needs Review",
    className: "bg-amber-50 text-amber-700",
    icon: Clock3,
  },
};

// ============================================================
// DATE FORMATTER
// ============================================================

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ============================================================
// REPORTS PAGE
// ============================================================

function Reports() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================================
  // LOAD REAL INSPECTIONS FROM BACKEND
  // ==========================================================

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/inspections`);

      if (!response.ok) {
        throw new Error(
          `Failed to load inspections (${response.status})`
        );
      }

      const data = await response.json();

      const inspections = Array.isArray(data)
        ? data
        : data.inspections || [];

      setReports(inspections);
    } catch (err) {
      console.error("NiyamDrishti reports error:", err);

      setError(
        err.message ||
          "Unable to load inspection reports."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  // ==========================================================
  // NORMALIZE BACKEND DATA FOR UI
  // ==========================================================

  const normalizedReports = useMemo(() => {
    return reports.map((inspection) => ({
      ...inspection,

      // IMPORTANT:
      // Preserve the real PostgreSQL inspection ID.
      // This is required when opening Report.jsx.
      databaseId: inspection.id,

      uiStatus: normalizeStatus(inspection),

      // Display inspection code in the table.
      id:
        inspection.inspection_code ||
        inspection.id ||
        "—",

      product:
        inspection.product_name ||
        "Product inspection",

      brand:
        inspection.brand_name ||
        "—",

      category:
        inspection.category ||
        "—",

      date:
        inspection.created_at ||
        inspection.completed_at,

      compliance:
        inspection.compliance_percentage !== null &&
        inspection.compliance_percentage !== undefined
          ? Number(inspection.compliance_percentage)
          : null,
    }));
  }, [reports]);

  // ==========================================================
  // FILTER REPORTS
  // ==========================================================

  const filteredReports = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return normalizedReports.filter((report) => {
      const matchesSearch =
        !search ||
        String(report.id)
          .toLowerCase()
          .includes(search) ||
        String(report.product)
          .toLowerCase()
          .includes(search) ||
        String(report.brand)
          .toLowerCase()
          .includes(search);

      const matchesStatus =
        statusFilter === "all" ||
        report.uiStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [
    normalizedReports,
    searchTerm,
    statusFilter,
  ]);

  // ==========================================================
  // SUMMARY COUNTS
  // ==========================================================

  const totalReports = normalizedReports.length;

  const compliantReports = normalizedReports.filter(
    (report) => report.uiStatus === "compliant"
  ).length;

  const attentionRequired = normalizedReports.filter(
    (report) =>
      report.uiStatus === "potential_violation" ||
      report.uiStatus === "needs_review"
  ).length;

  // ==========================================================
  // VIEW REPORT
  // ==========================================================

  const handleViewReport = (report) => {
    /*
      IMPORTANT:

      Pass the PostgreSQL database inspection ID
      to Report.jsx.

      report.id is only the display inspection_code.

      report.databaseId is the actual database primary key.
    */

    navigate(
      `/report?id=${encodeURIComponent(report.databaseId)}`
    );
  };

  // ==========================================================
  // DOWNLOAD
  // ==========================================================

  const handleDownload = (report) => {
    alert(
      `PDF download for ${report.id} will be connected next.`
    );
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <main className="p-8 bg-[#F6F8FC] min-h-[calc(100vh-80px)]">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <section className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText
                size={20}
                className="text-blue-600"
              />

              <span className="text-sm font-medium text-blue-600">
                Inspection Reports
              </span>
            </div>

            <h1 className="text-3xl font-bold text-slate-900">
              Reports
            </h1>

            <p className="text-slate-500 mt-2">
              View, search, and manage generated inspection reports.
            </p>
          </div>

          <div className="flex items-center gap-3">

            <button
              onClick={loadReports}
              disabled={loading}
              className="flex items-center gap-2
                         px-4 py-2.5
                         rounded-xl
                         border border-slate-200
                         bg-white
                         text-slate-600
                         hover:text-slate-900
                         hover:bg-slate-50
                         transition-all
                         disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />

              Refresh
            </button>

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
                         transition-all"
            >
              <ArrowLeft size={18} />

              Dashboard
            </button>

          </div>

        </div>
      </section>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <section className="mb-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center justify-between gap-4">

              <div>
                <p className="font-semibold text-red-700">
                  Unable to load reports
                </p>

                <p className="text-sm text-red-600 mt-1">
                  {error}
                </p>
              </div>

              <button
                onClick={loadReports}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm"
              >
                Retry
              </button>

            </div>
          </div>
        </section>
      )}

      {/* ======================================================
          SUMMARY CARDS
      ====================================================== */}

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        {/* Total */}

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Reports
              </p>

              <h2 className="text-3xl font-bold text-slate-900 mt-2">
                {totalReports}
              </h2>
            </div>

            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <FileText size={22} />
            </div>

          </div>
        </div>

        {/* Compliant */}

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Compliant Reports
              </p>

              <h2 className="text-3xl font-bold text-green-600 mt-2">
                {compliantReports}
              </h2>
            </div>

            <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
              <CheckCircle2 size={22} />
            </div>

          </div>
        </div>

        {/* Attention */}

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Attention Required
              </p>

              <h2 className="text-3xl font-bold text-red-600 mt-2">
                {attentionRequired}
              </h2>
            </div>

            <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              <AlertTriangle size={22} />
            </div>

          </div>
        </div>

      </section>

      {/* ======================================================
          SEARCH + FILTER
      ====================================================== */}

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">

        <div className="flex flex-col lg:flex-row gap-4">

          {/* Search */}

          <div className="relative flex-1">

            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search by inspection ID, product, or brand..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              className="w-full
                         pl-11 pr-4 py-3
                         rounded-xl
                         border border-slate-200
                         bg-slate-50
                         text-sm
                         outline-none
                         focus:bg-white
                         focus:border-blue-400
                         focus:ring-2
                         focus:ring-blue-100
                         transition-all"
            />

          </div>

          {/* Status */}

          <div className="relative">

            <Filter
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="appearance-none
                         pl-11 pr-10 py-3
                         rounded-xl
                         border border-slate-200
                         bg-white
                         text-sm text-slate-600
                         outline-none
                         focus:border-blue-400
                         focus:ring-2
                         focus:ring-blue-100"
            >
              <option value="all">
                All Statuses
              </option>

              <option value="compliant">
                Verified Compliant
              </option>

              <option value="potential_violation">
                Potential Violation
              </option>

              <option value="needs_review">
                Needs Review
              </option>
            </select>

          </div>

        </div>

      </section>

      {/* ======================================================
          REPORT TABLE
      ====================================================== */}

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="px-6 py-5 border-b border-slate-200">

          <h2 className="text-xl font-bold text-slate-900">
            Generated Reports
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            {loading
              ? "Loading reports..."
              : `${filteredReports.length} report${
                  filteredReports.length !== 1
                    ? "s"
                    : ""
                } found`}
          </p>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">

                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Inspection
                </th>

                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Product
                </th>

                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Date
                </th>

                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Compliance
                </th>

                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>

                <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Actions
                </th>

              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">

              {/* Loading */}

              {loading && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-16 text-center"
                  >
                    <RefreshCw
                      size={28}
                      className="mx-auto text-blue-500 animate-spin"
                    />

                    <p className="text-sm text-slate-500 mt-3">
                      Loading inspection history...
                    </p>
                  </td>
                </tr>
              )}

              {/* Data */}

              {!loading &&
                filteredReports.map((report) => {

                  const status =
                    statusConfig[report.uiStatus] ||
                    statusConfig.needs_review;

                  const StatusIcon = status.icon;

                  return (
                    <tr
                      key={report.databaseId}
                      className="hover:bg-slate-50 transition-colors"
                    >

                      {/* Inspection ID */}

                      <td className="px-6 py-5">

                        <p className="text-sm font-semibold text-slate-900">
                          {report.id}
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                          Physical Inspection
                        </p>

                      </td>

                      {/* Product */}

                      <td className="px-6 py-5">

                        <p className="text-sm font-medium text-slate-800">
                          {report.product}
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          {report.brand}
                        </p>

                      </td>

                      {/* Date */}

                      <td className="px-6 py-5">

                        <span className="text-sm text-slate-600">
                          {formatDate(report.date)}
                        </span>

                      </td>

                      {/* Compliance */}

                      <td className="px-6 py-5">

                        <span className="text-sm font-semibold text-slate-700">
                          {report.compliance !== null &&
                          !Number.isNaN(report.compliance)
                            ? `${report.compliance.toFixed(
                                1
                              )}%`
                            : "—"}
                        </span>

                      </td>

                      {/* Status */}

                      <td className="px-6 py-5">

                        <span
                          className={`inline-flex items-center gap-2
                                      px-3 py-1.5
                                      rounded-full
                                      text-xs font-semibold
                                      ${status.className}`}
                        >

                          <StatusIcon size={14} />

                          {status.label}

                        </span>

                      </td>

                      {/* Actions */}

                      <td className="px-6 py-5">

                        <div className="flex items-center justify-end gap-2">

                          <button
                            onClick={() =>
                              handleViewReport(report)
                            }
                            className="p-2 rounded-lg
                                       text-slate-500
                                       hover:text-blue-600
                                       hover:bg-blue-50
                                       transition-all"
                            title="View Report"
                          >
                            <Eye size={18} />
                          </button>

                          <button
                            onClick={() =>
                              handleDownload(report)
                            }
                            className="p-2 rounded-lg
                                       text-slate-500
                                       hover:text-blue-600
                                       hover:bg-blue-50
                                       transition-all"
                            title="Download Report"
                          >
                            <Download size={18} />
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                })}

              {/* Empty */}

              {!loading &&
                filteredReports.length === 0 && (

                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-16 text-center"
                    >

                      <FileText
                        size={40}
                        className="mx-auto text-slate-300"
                      />

                      <h3 className="text-lg font-semibold text-slate-700 mt-4">
                        No reports found
                      </h3>

                      <p className="text-sm text-slate-500 mt-1">
                        {reports.length === 0
                          ? "Complete an inspection to create your first report."
                          : "Try changing your search or filter."}
                      </p>

                    </td>
                  </tr>
                )}

            </tbody>

          </table>

        </div>

      </section>

    </main>
  );
}

export default Reports;