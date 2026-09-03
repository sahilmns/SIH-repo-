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
} from "lucide-react";

import { useNavigate } from "react-router-dom";

function History() {
  const navigate = useNavigate();

  const inspections = [
    {
      id: "MTX-2026-00128",
      product: "Premium Basmati Rice",
      brand: "Example Foods",
      date: "26 Aug 2026",
      status: "Potential Violation",
      inspector: "Enforcement Officer",
    },
    {
      id: "MTX-2026-00127",
      product: "Fortune Sunflower Oil",
      brand: "Adani Wilmar",
      date: "25 Aug 2026",
      status: "Verified Compliant",
      inspector: "Enforcement Officer",
    },
    {
      id: "MTX-2026-00126",
      product: "Tata Salt",
      brand: "Tata Consumer",
      date: "24 Aug 2026",
      status: "Needs Review",
      inspector: "Enforcement Officer",
    },
    {
      id: "MTX-2026-00125",
      product: "Aashirvaad Atta",
      brand: "ITC",
      date: "23 Aug 2026",
      status: "Verified Compliant",
      inspector: "Enforcement Officer",
    },
    {
      id: "MTX-2026-00124",
      product: "Tea Premium Pack",
      brand: "Example Foods",
      date: "22 Aug 2026",
      status: "Needs Review",
      inspector: "Enforcement Officer",
    },
    {
      id: "MTX-2026-00123",
      product: "Refined Sugar",
      brand: "Example Foods",
      date: "21 Aug 2026",
      status: "Verified Compliant",
      inspector: "Enforcement Officer",
    },
  ];

  const getStatus = (status) => {
    if (status === "Verified Compliant") {
      return {
        icon: <CheckCircle2 size={16} />,
        className: "text-green-700 bg-green-50 border-green-200",
      };
    }

    if (status === "Potential Violation") {
      return {
        icon: <AlertTriangle size={16} />,
        className: "text-red-700 bg-red-50 border-red-200",
      };
    }

    return {
      icon: <Clock size={16} />,
      className: "text-amber-700 bg-amber-50 border-amber-200",
    };
  };

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">

        <div>
          <button
            onClick={() => navigate("/")}
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

        <button
          onClick={() => navigate("/new-inspection")}
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
        >
          <FileText size={18} />
          New Inspection
        </button>

      </div>


      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Inspections
          </p>

          <p className="text-2xl font-bold text-slate-900 mt-2">
            128
          </p>
        </div>


        <div className="bg-white border border-green-200 rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Verified Compliant
          </p>

          <p className="text-2xl font-bold text-green-600 mt-2">
            94
          </p>
        </div>


        <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Needs Review
          </p>

          <p className="text-2xl font-bold text-amber-600 mt-2">
            21
          </p>
        </div>


        <div className="bg-white border border-red-200 rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Potential Violations
          </p>

          <p className="text-2xl font-bold text-red-600 mt-2">
            13
          </p>
        </div>

      </div>


      {/* Search and Filters */}
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
              placeholder="Search by product, brand or inspection ID..."
              className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </div>


          {/* Status Filter */}
          <button className="flex items-center justify-center gap-2 px-5 py-3 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50">
            <Filter size={17} />
            Status
          </button>


          {/* Date Filter */}
          <button className="flex items-center justify-center gap-2 px-5 py-3 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50">
            <CalendarDays size={17} />
            Date
          </button>

        </div>

      </div>


      {/* History Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

        <div className="px-6 py-5 border-b border-slate-200">

          <h2 className="font-bold text-lg text-slate-900">
            Recent Inspections
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Inspection records stored in the Metra-X system
          </p>

        </div>


        <div className="overflow-x-auto">

          <table className="w-full">

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

              {inspections.map((inspection) => {

                const status = getStatus(inspection.status);

                return (
                  <tr
                    key={inspection.id}
                    className="hover:bg-slate-50 transition"
                  >

                    <td className="px-6 py-5">

                      <p className="text-sm font-semibold text-blue-600">
                        {inspection.id}
                      </p>

                    </td>


                    <td className="px-6 py-5">

                      <p className="text-sm font-semibold text-slate-800">
                        {inspection.product}
                      </p>

                    </td>


                    <td className="px-6 py-5">

                      <p className="text-sm text-slate-600">
                        {inspection.brand}
                      </p>

                    </td>


                    <td className="px-6 py-5">

                      <p className="text-sm text-slate-600">
                        {inspection.date}
                      </p>

                    </td>


                    <td className="px-6 py-5">

                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${status.className}`}
                      >
                        {status.icon}
                        {inspection.status}
                      </span>

                    </td>


                    <td className="px-6 py-5">

                      <p className="text-sm text-slate-600">
                        {inspection.inspector}
                      </p>

                    </td>


                    <td className="px-6 py-5">

                      <div className="flex justify-end gap-2">

                        <button
                          onClick={() => navigate("/report")}
                          title="View Report"
                          className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          onClick={() => navigate("/report")}
                          title="Open Report"
                          className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                        >
                          <FileText size={18} />
                        </button>

                      </div>

                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>

        </div>


        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">

          <p className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-700">1–6</span> of{" "}
            <span className="font-semibold text-slate-700">128</span> inspections
          </p>

          <div className="flex gap-2">

            <button
              disabled
              className="px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-400"
            >
              Previous
            </button>

            <button
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg"
            >
              1
            </button>

            <button
              className="px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
            >
              2
            </button>

            <button
              className="px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
            >
              Next
            </button>

          </div>

        </div>

      </div>


      {/* Information */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">

        <p className="text-sm text-blue-800">
          <span className="font-semibold">
            Audit-ready records:
          </span>{" "}
          Each inspection can store product images, extracted
          declarations, AI findings, inspector verification and
          the final inspection report.
        </p>

      </div>

    </div>
  );
}

export default History;