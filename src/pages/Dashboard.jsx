import {
  Plus,
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  Camera,
  BarChart3,
  ArrowRight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <main className="p-4 sm:p-6 lg:p-8">

      {/* Welcome Section */}
      <section className="mb-6 lg:mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 lg:p-7">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 lg:gap-6">

            {/* Welcome Text */}
            <div className="min-w-0">

              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>

                <span className="text-sm font-medium text-green-600">
                  Inspection system online
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Good evening, Inspector 👋
              </h1>

              <p className="text-sm sm:text-base text-slate-500 mt-2 max-w-xl leading-relaxed">
                Monitor and manage packaged commodity inspections,
                identify potential compliance issues, and review
                inspection evidence.
              </p>

            </div>


            {/* New Inspection Button */}
            <button
              onClick={() => navigate("/new-inspection")}
              className="w-full lg:w-auto flex items-center justify-center gap-3
                         bg-blue-600 hover:bg-blue-700
                         text-white font-semibold
                         px-5 sm:px-6 py-3.5
                         rounded-xl
                         shadow-sm hover:shadow-md
                         transition-all duration-200
                         whitespace-nowrap"
            >
              <Plus size={20} />

              <span>
                Start New Inspection
              </span>
            </button>

          </div>

        </div>
      </section>


      {/* Statistics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mb-6 lg:mb-8">


        {/* Total Inspections */}
        <div className="group bg-white p-5 sm:p-6 rounded-2xl border border-slate-200
                        shadow-sm hover:shadow-md hover:-translate-y-1
                        transition-all duration-200">

          <div className="flex items-start justify-between gap-3">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Inspections
              </p>

              <h2 className="text-3xl font-bold text-slate-900 mt-3">
                128
              </h2>
            </div>

            <div className="w-11 h-11 shrink-0 rounded-xl bg-blue-50
                            flex items-center justify-center
                            text-blue-600">

              <ClipboardList size={22} />

            </div>

          </div>

          <div className="flex items-center gap-2 mt-4">
            <span className="text-sm font-medium text-blue-600">
              All inspections
            </span>
          </div>

        </div>


        {/* Verified Compliant */}
        <div className="group bg-white p-5 sm:p-6 rounded-2xl border border-slate-200
                        shadow-sm hover:shadow-md hover:-translate-y-1
                        transition-all duration-200">

          <div className="flex items-start justify-between gap-3">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Verified Compliant
              </p>

              <h2 className="text-3xl font-bold text-green-600 mt-3">
                94
              </h2>
            </div>

            <div className="w-11 h-11 shrink-0 rounded-xl bg-green-50
                            flex items-center justify-center
                            text-green-600">

              <CheckCircle2 size={22} />

            </div>

          </div>

          <div className="flex items-center gap-2 mt-4 flex-wrap">

            <span className="text-sm font-medium text-green-600">
              Verified
            </span>

            <span className="text-xs text-slate-400">
              • 73.4% of total
            </span>

          </div>

        </div>


        {/* Needs Review */}
        <div className="group bg-white p-5 sm:p-6 rounded-2xl border border-slate-200
                        shadow-sm hover:shadow-md hover:-translate-y-1
                        transition-all duration-200">

          <div className="flex items-start justify-between gap-3">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Needs Review
              </p>

              <h2 className="text-3xl font-bold text-amber-500 mt-3">
                21
              </h2>
            </div>

            <div className="w-11 h-11 shrink-0 rounded-xl bg-amber-50
                            flex items-center justify-center
                            text-amber-600">

              <AlertTriangle size={22} />

            </div>

          </div>

          <div className="flex items-center gap-2 mt-4">
            <span className="text-sm font-medium text-amber-600">
              Manual verification
            </span>
          </div>

        </div>


        {/* Potential Violations */}
        <div className="group bg-white p-5 sm:p-6 rounded-2xl border border-slate-200
                        shadow-sm hover:shadow-md hover:-translate-y-1
                        transition-all duration-200">

          <div className="flex items-start justify-between gap-3">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Potential Violations
              </p>

              <h2 className="text-3xl font-bold text-red-600 mt-3">
                13
              </h2>
            </div>

            <div className="w-11 h-11 shrink-0 rounded-xl bg-red-50
                            flex items-center justify-center
                            text-red-600">

              <AlertTriangle size={22} />

            </div>

          </div>

          <div className="flex items-center gap-2 mt-4">
            <span className="text-sm font-medium text-red-600">
              Requires attention
            </span>
          </div>

        </div>

      </section>


      {/* Quick Actions */}
      <section className="mb-6 lg:mb-8">

        <div className="flex items-center justify-between mb-4">

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Quick Actions
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Access frequently used inspection tools
            </p>
          </div>

        </div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">


          {/* New Inspection */}
          <button
            onClick={() => navigate("/new-inspection")}
            className="group bg-white border border-slate-200
                       rounded-2xl p-5 sm:p-6 text-left
                       shadow-sm hover:shadow-md
                       hover:-translate-y-1
                       transition-all duration-200"
          >

            <div className="flex items-center justify-between">

              <div className="w-12 h-12 rounded-xl bg-blue-50
                              flex items-center justify-center
                              text-2xl text-blue-600">

                <Camera size={24} />

              </div>

              <ArrowRight
                size={20}
                className="text-slate-300 group-hover:text-blue-600
                           group-hover:translate-x-1 transition-all"
              />

            </div>

            <h3 className="text-lg font-semibold text-slate-900 mt-5">
              New Inspection
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Scan or upload a packaged commodity
            </p>

          </button>


          {/* Inspection History */}
          <button
            onClick={() => navigate("/history")}
            className="group bg-white border border-slate-200
                       rounded-2xl p-5 sm:p-6 text-left
                       shadow-sm hover:shadow-md
                       hover:-translate-y-1
                       transition-all duration-200"
          >

            <div className="flex items-center justify-between">

              <div className="w-12 h-12 rounded-xl bg-purple-50
                              flex items-center justify-center
                              text-purple-600">

                <ClipboardList size={22} />

              </div>

              <ArrowRight
                size={20}
                className="text-slate-300 group-hover:text-purple-600
                           group-hover:translate-x-1 transition-all"
              />

            </div>

            <h3 className="text-lg font-semibold text-slate-900 mt-5">
              Inspection History
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              View and search previous inspections
            </p>

          </button>


          {/* Analytics */}
          <button
            onClick={() => navigate("/analytics")}
            className="group bg-white border border-slate-200
                       rounded-2xl p-5 sm:p-6 text-left
                       shadow-sm hover:shadow-md
                       hover:-translate-y-1
                       transition-all duration-200"
          >

            <div className="flex items-center justify-between">

              <div className="w-12 h-12 rounded-xl bg-emerald-50
                              flex items-center justify-center
                              text-emerald-600">

                <BarChart3 size={24} />

              </div>

              <ArrowRight
                size={20}
                className="text-slate-300 group-hover:text-emerald-600
                           group-hover:translate-x-1 transition-all"
              />

            </div>

            <h3 className="text-lg font-semibold text-slate-900 mt-5">
              Analytics
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              View inspection trends and insights
            </p>

          </button>

        </div>

      </section>

    </main>
  );
}

export default Dashboard;