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
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useState } from "react";


// ============================================================
// DEMO REPORT DATA
// Later this can be replaced with data received from the API.
// ============================================================

const reportData = [
  {
    id: "INS-00128",
    product: "Packaged Rice",
    brand: "Sample Foods",
    date: "28 Aug 2026",
    status: "compliant",
    inspector: "Inspector",
  },
  {
    id: "INS-00127",
    product: "Cooking Oil",
    brand: "Daily Choice",
    date: "27 Aug 2026",
    status: "potential_violation",
    inspector: "Inspector",
  },
  {
    id: "INS-00126",
    product: "Packaged Sugar",
    brand: "PureHarvest",
    date: "26 Aug 2026",
    status: "needs_review",
    inspector: "Inspector",
  },
  {
    id: "INS-00125",
    product: "Tea Powder",
    brand: "FreshLeaf",
    date: "25 Aug 2026",
    status: "compliant",
    inspector: "Inspector",
  },
  {
    id: "INS-00124",
    product: "Biscuits",
    brand: "Daily Bites",
    date: "24 Aug 2026",
    status: "potential_violation",
    inspector: "Inspector",
  },
];


// ============================================================
// STATUS CONFIGURATION
// Keeps status styling separate from the report data.
// ============================================================

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
// REPORTS PAGE
// ============================================================

function Reports() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");


  // ==========================================================
  // FILTER REPORTS
  // ==========================================================

  const filteredReports = reportData.filter((report) => {

    const matchesSearch =
      report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.brand.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      report.status === statusFilter;

    return matchesSearch && matchesStatus;
  });


  // ==========================================================
  // REPORT ACTIONS
  // ==========================================================

  const handleViewReport = (report) => {
    // For now, open the existing report page.
    // Later this can pass a report ID to the backend/report page.
    navigate("/report");
  };


  const handleDownload = (report) => {
    // Placeholder for future backend-generated PDF.
    alert(`Download report ${report.id}`);
  };


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
          SUMMARY CARDS
      ====================================================== */}

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">


        {/* Total Reports */}

        <div
          className="bg-white p-6 rounded-2xl
                     border border-slate-200
                     shadow-sm"
        >

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Total Reports
              </p>

              <h2 className="text-3xl font-bold text-slate-900 mt-2">
                {reportData.length}
              </h2>

            </div>

            <div
              className="w-11 h-11 rounded-xl
                         bg-blue-50
                         flex items-center justify-center
                         text-blue-600"
            >
              <FileText size={22} />
            </div>

          </div>

        </div>


        {/* Compliant Reports */}

        <div
          className="bg-white p-6 rounded-2xl
                     border border-slate-200
                     shadow-sm"
        >

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Compliant Reports
              </p>

              <h2 className="text-3xl font-bold text-green-600 mt-2">
                {
                  reportData.filter(
                    (report) => report.status === "compliant"
                  ).length
                }
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

        </div>


        {/* Attention Required */}

        <div
          className="bg-white p-6 rounded-2xl
                     border border-slate-200
                     shadow-sm"
        >

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Attention Required
              </p>

              <h2 className="text-3xl font-bold text-red-600 mt-2">
                {
                  reportData.filter(
                    (report) =>
                      report.status === "potential_violation" ||
                      report.status === "needs_review"
                  ).length
                }
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

        </div>

      </section>


      {/* ======================================================
          SEARCH + FILTER
      ====================================================== */}

      <section
        className="bg-white rounded-2xl
                   border border-slate-200
                   shadow-sm p-5 mb-6"
      >

        <div className="flex flex-col lg:flex-row gap-4">


          {/* Search */}

          <div className="relative flex-1">

            <Search
              size={19}
              className="absolute left-4 top-1/2
                         -translate-y-1/2
                         text-slate-400"
            />

            <input
              type="text"
              placeholder="Search by report ID, product, or brand..."
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


          {/* Status Filter */}

          <div className="relative">

            <Filter
              size={18}
              className="absolute left-4 top-1/2
                         -translate-y-1/2
                         text-slate-400
                         pointer-events-none"
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

      <section
        className="bg-white rounded-2xl
                   border border-slate-200
                   shadow-sm overflow-hidden"
      >

        {/* Table Header */}

        <div className="px-6 py-5 border-b border-slate-200">

          <h2 className="text-xl font-bold text-slate-900">
            Generated Reports
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            {filteredReports.length} report
            {filteredReports.length !== 1 ? "s" : ""} found
          </p>

        </div>


        {/* Table */}

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="bg-slate-50 border-b border-slate-200">

                <th className="text-left px-6 py-4
                               text-xs font-semibold
                               text-slate-500 uppercase
                               tracking-wider">
                  Report
                </th>

                <th className="text-left px-6 py-4
                               text-xs font-semibold
                               text-slate-500 uppercase
                               tracking-wider">
                  Product
                </th>

                <th className="text-left px-6 py-4
                               text-xs font-semibold
                               text-slate-500 uppercase
                               tracking-wider">
                  Date
                </th>

                <th className="text-left px-6 py-4
                               text-xs font-semibold
                               text-slate-500 uppercase
                               tracking-wider">
                  Status
                </th>

                <th className="text-right px-6 py-4
                               text-xs font-semibold
                               text-slate-500 uppercase
                               tracking-wider">
                  Actions
                </th>

              </tr>

            </thead>


            <tbody className="divide-y divide-slate-100">

              {filteredReports.map((report) => {

                const status = statusConfig[report.status];

                const StatusIcon = status.icon;

                return (

                  <tr
                    key={report.id}
                    className="hover:bg-slate-50 transition-colors"
                  >

                    {/* Report ID */}

                    <td className="px-6 py-5">

                      <p className="text-sm font-semibold text-slate-900">
                        {report.id}
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        {report.inspector}
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
                        {report.date}
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


              {/* Empty State */}

              {filteredReports.length === 0 && (

                <tr>

                  <td
                    colSpan="5"
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
                      Try changing your search or filter.
                    </p>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </section>


      {/* ======================================================
          PROTOTYPE NOTE
      ====================================================== */}

      <div className="mt-6 text-center">

        <p className="text-xs text-slate-400">
          Reports shown using prototype data. Final reports and
          downloads will be generated from the inspection backend.
        </p>

      </div>


    </main>
  );
}

export default Reports;