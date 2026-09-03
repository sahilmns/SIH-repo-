import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Eye,
  FileText,
  RotateCcw,
  MapPin,
  Info,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

function EvidenceReview() {

  const navigate = useNavigate();

  return (
    <main className="p-6 lg:p-8 bg-[#F6F8FC] min-h-[calc(100vh-80px)]">

      {/* Header */}
      <div className="mb-8">

        <button
          onClick={() => navigate("/compliance-result")}
          className="flex items-center gap-2 text-sm text-slate-500
                     hover:text-blue-600 transition-colors mb-4"
        >
          <ArrowLeft size={17} />
          Back to Compliance Result
        </button>

        <div className="flex flex-col lg:flex-row lg:items-center
                        lg:justify-between gap-4">

          <div>

            <p className="text-sm font-medium text-blue-600 mb-1">
              Inspection #MTX-2026-00128
            </p>

            <h1 className="text-3xl font-bold text-slate-900">
              Evidence Review
            </h1>

            <p className="text-slate-500 mt-2">
              Review AI findings and verify the evidence before finalizing
              the inspection.
            </p>

          </div>

          <div
            className="flex items-center gap-2 px-4 py-2.5
                       rounded-xl bg-amber-50
                       border border-amber-200"
          >
            <AlertTriangle size={19} className="text-amber-600" />

            <span className="text-sm font-semibold text-amber-700">
              Verification Required
            </span>
          </div>

        </div>

      </div>


      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

        {/* Evidence Image */}
        <section
          className="xl:col-span-3 bg-white
                     border border-slate-200
                     rounded-2xl shadow-sm p-7"
        >

          <div className="flex items-center justify-between mb-5">

            <div>

              <h2 className="text-xl font-bold text-slate-900">
                Evidence Image
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Front package image
              </p>

            </div>

            <span
              className="text-xs font-medium
                         px-3 py-1.5 rounded-full
                         bg-red-50 text-red-700"
            >
              1 flagged region
            </span>

          </div>


          {/* Image Placeholder */}
          <div
            className="relative min-h-[500px]
                       bg-slate-100 rounded-2xl
                       border border-slate-200
                       overflow-hidden
                       flex items-center justify-center"
          >

            {/* Simulated Package */}
            <div
              className="w-64 h-80 bg-white
                         border border-slate-300
                         rounded-lg shadow-md
                         flex flex-col items-center
                         justify-center relative"
            >

              <div
                className="absolute top-8 left-5 right-5
                           text-center"
              >

                <p className="text-lg font-bold text-slate-800">
                  PREMIUM RICE
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Basmati Rice
                </p>

              </div>


              <div
                className="mt-12 text-center"
              >

                <p className="text-2xl font-bold text-slate-700">
                  1 kg
                </p>

              </div>


              {/* Simulated Highlight */}
              <div
                className="absolute bottom-12 left-7 right-7
                           h-16 rounded-lg
                           border-2 border-red-500
                           bg-red-500/10"
              >

                <div
                  className="absolute -top-7 left-0
                             bg-red-600 text-white
                             text-xs font-semibold
                             px-3 py-1 rounded-md"
                >
                  Potential issue
                </div>

              </div>

            </div>


            {/* Evidence Marker */}
            <div
              className="absolute bottom-20
                         left-1/2 -translate-x-1/2
                         w-6 h-6 rounded-full
                         bg-red-600 border-4 border-white
                         shadow-lg"
            ></div>

          </div>


          {/* Image Controls */}
          <div className="flex flex-wrap gap-3 mt-5">

            <button
              className="flex items-center gap-2
                         px-4 py-2.5 rounded-xl
                         border border-slate-200
                         text-sm font-medium
                         text-slate-700
                         hover:bg-slate-50 transition"
            >
              <Eye size={17} />
              View Full Image
            </button>

            <button
              className="flex items-center gap-2
                         px-4 py-2.5 rounded-xl
                         border border-slate-200
                         text-sm font-medium
                         text-slate-700
                         hover:bg-slate-50 transition"
            >
              <RotateCcw size={17} />
              Rescan Image
            </button>

          </div>

        </section>


        {/* Finding Details */}
        <section
          className="xl:col-span-2 bg-white
                     border border-slate-200
                     rounded-2xl shadow-sm p-7"
        >

          <div className="flex items-center gap-3 mb-6">

            <div
              className="w-11 h-11 rounded-xl
                         bg-red-50 text-red-600
                         flex items-center justify-center"
            >
              <AlertTriangle size={22} />
            </div>

            <div>

              <h2 className="text-xl font-bold text-slate-900">
                Finding Details
              </h2>

              <p className="text-sm text-slate-500">
                AI-detected compliance issue
              </p>

            </div>

          </div>


          {/* Finding Status */}
          <div
            className="p-4 rounded-xl
                       bg-red-50 border border-red-200"
          >

            <p className="text-xs font-medium text-red-600 uppercase
                          tracking-wider">
              Assessment
            </p>

            <div className="flex items-center gap-2 mt-2">

              <XCircle size={20} className="text-red-600" />

              <span className="font-bold text-red-700">
                Potential Violation
              </span>

            </div>

          </div>


          {/* Finding */}
          <div className="mt-6">

            <p className="text-xs font-semibold text-slate-500
                          uppercase tracking-wider">
              Finding
            </p>

            <h3 className="text-lg font-bold text-slate-900 mt-2">
              MRP Declaration
            </h3>

            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              The detected MRP information may not satisfy the expected
              declaration format. The finding requires verification by
              the enforcement officer.
            </p>

          </div>


          {/* Confidence */}
          <div className="mt-6">

            <div className="flex justify-between mb-2">

              <span className="text-sm font-medium text-slate-700">
                AI Confidence
              </span>

              <span className="text-sm font-bold text-slate-900">
                84%
              </span>

            </div>

            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">

              <div
                className="h-full bg-red-500 rounded-full"
                style={{ width: "84%" }}
              ></div>

            </div>

          </div>


          {/* Rule Reference */}
          <div
            className="mt-6 p-4 rounded-xl
                       bg-blue-50 border border-blue-100"
          >

            <div className="flex items-start gap-3">

              <ShieldCheck
                size={19}
                className="text-blue-600 mt-0.5"
              />

              <div>

                <p className="text-xs font-semibold text-blue-800
                              uppercase tracking-wider">
                  Rule Reference
                </p>

                <p className="text-sm font-semibold text-blue-900 mt-1">
                  Applicable packaged commodity declaration requirement
                </p>

                <p className="text-xs text-blue-700 mt-2">
                  The applicable rule and amendment version should be
                  confirmed before making a final enforcement decision.
                </p>

              </div>

            </div>

          </div>


          {/* Detected Evidence */}
          <div className="mt-6">

            <p className="text-xs font-semibold text-slate-500
                          uppercase tracking-wider">
              Evidence
            </p>

            <div
              className="mt-3 p-4 rounded-xl
                         bg-slate-50 border border-slate-200"
            >

              <div className="flex items-center gap-3">

                <MapPin size={18} className="text-red-500" />

                <div>

                  <p className="text-sm font-medium text-slate-900">
                    Highlighted package region
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    Evidence linked to the detected finding.
                  </p>

                </div>

              </div>

            </div>

          </div>


          {/* Verification */}
          <div className="mt-7">

            <h3 className="font-bold text-slate-900">
              Inspector Verification
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              What is your assessment of this finding?
            </p>


            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">

              <button
                onClick={() => navigate("/report")}
                className="flex items-center justify-center gap-2
                           px-4 py-3 rounded-xl
                           bg-red-600 hover:bg-red-700
                           text-white font-semibold
                           transition"
              >

                <CheckCircle2 size={18} />

                Confirm Finding

              </button>


              <button
                className="flex items-center justify-center gap-2
                           px-4 py-3 rounded-xl
                           border border-slate-200
                           text-slate-700 font-semibold
                           hover:bg-slate-50
                           transition"
              >

                <XCircle size={18} />

                Reject Finding

              </button>

            </div>


            <button
              className="w-full mt-3
                         flex items-center justify-center gap-2
                         px-4 py-3 rounded-xl
                         border border-amber-200
                         text-amber-700 font-medium
                         hover:bg-amber-50
                         transition"
            >

              <RotateCcw size={18} />

              Request New Scan

            </button>

          </div>

        </section>

      </div>


      {/* Audit Trail */}
      <section
        className="mt-6 bg-white border border-slate-200
                   rounded-2xl shadow-sm p-7"
      >

        <div className="flex items-center gap-3 mb-5">

          <div
            className="w-10 h-10 rounded-xl
                       bg-slate-100 text-slate-600
                       flex items-center justify-center"
          >
            <FileText size={20} />
          </div>

          <div>

            <h2 className="text-lg font-bold text-slate-900">
              Verification & Audit Trail
            </h2>

            <p className="text-sm text-slate-500">
              Record of AI assessment and inspector actions
            </p>

          </div>

        </div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="p-4 rounded-xl bg-slate-50">

            <p className="text-xs text-slate-500">
              AI Assessment
            </p>

            <p className="text-sm font-semibold text-slate-900 mt-1">
              Potential Violation
            </p>

          </div>


          <div className="p-4 rounded-xl bg-slate-50">

            <p className="text-xs text-slate-500">
              Confidence
            </p>

            <p className="text-sm font-semibold text-slate-900 mt-1">
              84%
            </p>

          </div>


          <div className="p-4 rounded-xl bg-amber-50">

            <p className="text-xs text-amber-600">
              Inspector Decision
            </p>

            <p className="text-sm font-semibold text-amber-800 mt-1">
              Pending
            </p>

          </div>

        </div>


        <div
          className="mt-5 p-4 rounded-xl
                     bg-blue-50 border border-blue-100
                     flex items-start gap-3"
        >

          <Info
            size={18}
            className="text-blue-600 mt-0.5"
          />

          <p className="text-xs text-blue-700 leading-relaxed">
            Metra-X keeps the AI assessment separate from the inspector's
            final decision so that every inspection remains explainable
            and auditable.
          </p>

        </div>

      </section>

    </main>
  );
}

export default EvidenceReview;