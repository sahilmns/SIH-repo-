import { useNavigate } from "react-router-dom";

function ConsumerDashboard() {
  const navigate = useNavigate();

  return (
    <div className="p-6">

      {/* Header */}
      <div className="mb-6">

        <h1 className="text-3xl font-bold text-[#081D41]">
          Consumer Dashboard
        </h1>

        <p className="mt-2 text-gray-600">
          Check packaged product compliance and view product information.
        </p>

      </div>


      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">


        {/* Scan Product */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">

          <h2 className="text-xl font-semibold text-[#081D41]">
            Scan Product
          </h2>

          <p className="mt-2 text-gray-600">
            Scan a product label to check its compliance.
          </p>

          <button
            type="button"
            onClick={() => navigate("/consumer-scan")}
            className="mt-4 px-5 py-2 bg-[#0070FF] text-white rounded-lg hover:bg-blue-700 transition"
          >
            Scan Product
          </button>

        </div>


        {/* Previous Scans */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">

          <h2 className="text-xl font-semibold text-[#081D41]">
            Previous Scans
          </h2>

          <p className="mt-2 text-gray-600">
            View your previously scanned products.
          </p>

          <button
            type="button"
            onClick={() => navigate("/consumer-history")}
            className="mt-4 px-5 py-2 bg-[#081D41] text-white rounded-lg hover:bg-slate-800 transition"
          >
            View History
          </button>

        </div>


        {/* Report Issue */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">

          <h2 className="text-xl font-semibold text-[#081D41]">
            Report an Issue
          </h2>

          <p className="mt-2 text-gray-600">
            Report a problem with a packaged commodity.
          </p>

          <button
            type="button"
            onClick={() => navigate("/consumer-report-issue")}
            className="mt-4 px-5 py-2 bg-[#0070FF] text-white rounded-lg hover:bg-blue-700 transition"
          >
            Report Issue
          </button>

        </div>

      </div>

    </div>
  );
}

export default ConsumerDashboard;

