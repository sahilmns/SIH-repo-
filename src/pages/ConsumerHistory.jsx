import { useState } from "react";
import {
  Search,
  Eye,
  FileText,
  CheckCircle,
  AlertTriangle,
  XCircle,
  History as HistoryIcon,
} from "lucide-react";

function ConsumerHistory() {
  const [searchTerm, setSearchTerm] = useState("");

  // Temporary dummy data
  const scans = [
    {
      id: 1,
      product: "Tata Salt",
      brand: "Tata",
      date: "17 Sep 2026",
      status: "Compliant",
    },
    {
      id: 2,
      product: "Aashirvaad Atta",
      brand: "Aashirvaad",
      date: "15 Sep 2026",
      status: "Needs Review",
    },
    {
      id: 3,
      product: "Parle-G Biscuits",
      brand: "Parle",
      date: "12 Sep 2026",
      status: "Non-Compliant",
    },
  ];

  // Search products
  const filteredScans = scans.filter((scan) =>
    `${scan.product} ${scan.brand} ${scan.status}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Status UI
  const getStatusDetails = (status) => {
    if (status === "Compliant") {
      return {
        icon: CheckCircle,
        className: "bg-green-50 text-green-700 border-green-200",
      };
    }

    if (status === "Needs Review") {
      return {
        icon: AlertTriangle,
        className: "bg-yellow-50 text-yellow-700 border-yellow-200",
      };
    }

    return {
      icon: XCircle,
      className: "bg-red-50 text-red-700 border-red-200",
    };
  };

  return (
    <div className="p-6">

      {/* Header */}
      <div className="mb-6">

        <div className="flex items-center gap-3">

          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
            <HistoryIcon
              size={24}
              className="text-[#0070FF]"
            />
          </div>

          <div>

            <h1 className="text-3xl font-bold text-[#081D41]">
              My Scans
            </h1>

            <p className="mt-1 text-gray-600">
              View your previously scanned products and compliance results.
            </p>

          </div>

        </div>

      </div>


      {/* Main Card */}
      <div className="bg-white rounded-xl border shadow-sm">

        {/* Search */}
        <div className="p-5 border-b">

          <div className="relative max-w-md">

            <Search
              size={19}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </div>

        </div>


        {/* Scan List */}
        <div className="overflow-x-auto">

          {filteredScans.length > 0 ? (

            <table className="w-full">

              <thead>

                <tr className="bg-gray-50 border-b">

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                    Product
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                    Brand
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                    Scan Date
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                    Status
                  </th>

                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredScans.map((scan) => {

                  const statusDetails = getStatusDetails(scan.status);
                  const StatusIcon = statusDetails.icon;

                  return (

                    <tr
                      key={scan.id}
                      className="border-b last:border-b-0 hover:bg-gray-50 transition"
                    >

                      {/* Product */}
                      <td className="px-6 py-5">

                        <div className="font-medium text-[#081D41]">
                          {scan.product}
                        </div>

                      </td>


                      {/* Brand */}
                      <td className="px-6 py-5 text-gray-600">
                        {scan.brand}
                      </td>


                      {/* Date */}
                      <td className="px-6 py-5 text-gray-600">
                        {scan.date}
                      </td>


                      {/* Status */}
                      <td className="px-6 py-5">

                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${statusDetails.className}`}
                        >

                          <StatusIcon size={16} />

                          {scan.status}

                        </span>

                      </td>


                      {/* Actions */}
                      <td className="px-6 py-5">

                        <div className="flex items-center justify-end gap-2">

                          <button
                            type="button"
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition text-sm font-medium"
                          >
                            <Eye size={16} />
                            View Result
                          </button>

                          <button
                            type="button"
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition text-sm font-medium"
                          >
                            <FileText size={16} />
                            Report
                          </button>

                        </div>

                      </td>

                    </tr>

                  );

                })}

              </tbody>

            </table>

          ) : (

            /* Empty Search State */
            <div className="py-16 text-center">

              <div className="mx-auto w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">

                <Search
                  size={24}
                  className="text-gray-400"
                />

              </div>

              <h2 className="mt-4 text-lg font-semibold text-[#081D41]">
                No scans found
              </h2>

              <p className="mt-1 text-gray-500">
                Try searching with a different product name or brand.
              </p>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default ConsumerHistory;
