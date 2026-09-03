import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Loader2,
  FileSearch,
  ScanText,
  ShieldCheck,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

function Analysis() {
  const navigate = useNavigate();

  return (
    <main className="p-6 lg:p-8 bg-[#F6F8FC] min-h-[calc(100vh-80px)]">

      {/* Header */}
      <div className="mb-8">

        <button
          onClick={() => navigate("/image-review")}
          className="flex items-center gap-2 text-sm text-slate-500
                     hover:text-blue-600 transition-colors mb-4"
        >
          <ArrowLeft size={17} />
          Back to Image Review
        </button>

        <h1 className="text-3xl font-bold text-slate-900">
          Compliance Analysis
        </h1>

        <p className="text-slate-500 mt-2">
          AI-assisted analysis of packaged commodity declarations.
        </p>

      </div>


      {/* Progress */}
      <div className="bg-white border border-slate-200
                      rounded-2xl p-5 mb-6 shadow-sm">

        <div className="flex items-center gap-4">

          {/* Step 1 */}
          <div className="flex items-center gap-3">

            <div className="w-9 h-9 rounded-full
                            bg-green-500 text-white
                            flex items-center justify-center">
              ✓
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Product Details
              </p>

              <p className="text-xs text-green-600">
                Completed
              </p>
            </div>

          </div>


          <div className="h-px bg-green-200 flex-1"></div>


          {/* Step 2 */}
          <div className="flex items-center gap-3">

            <div className="w-9 h-9 rounded-full
                            bg-green-500 text-white
                            flex items-center justify-center">
              ✓
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Package Images
              </p>

              <p className="text-xs text-green-600">
                Completed
              </p>
            </div>

          </div>


          <div className="h-px bg-blue-200 flex-1"></div>


          {/* Step 3 */}
          <div className="flex items-center gap-3">

            <div className="w-9 h-9 rounded-full
                            bg-blue-600 text-white
                            flex items-center justify-center
                            font-semibold">
              3
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Analysis
              </p>

              <p className="text-xs text-blue-600">
                Processing
              </p>
            </div>

          </div>

        </div>

      </div>


      {/* Analysis Status */}
      <section className="bg-white border border-slate-200
                          rounded-2xl shadow-sm p-7 mb-6">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 rounded-xl
                            bg-blue-50 text-blue-600
                            flex items-center justify-center">

              <Loader2 size={25} className="animate-spin" />

            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Analyzing Package
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                AI models are checking package declarations and
                applicable compliance rules.
              </p>
            </div>

          </div>

          <span className="px-3 py-1.5 rounded-full
                           bg-blue-50 text-blue-700
                           text-xs font-semibold">
            In Progress
          </span>

        </div>


        {/* Progress Bar */}
        <div className="mt-7">

          <div className="flex items-center justify-between mb-2">

            <span className="text-sm font-medium text-slate-700">
              Overall Analysis Progress
            </span>

            <span className="text-sm font-bold text-blue-600">
              72%
            </span>

          </div>

          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">

            <div
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-400
                         rounded-full"
              style={{ width: "72%" }}
            ></div>

          </div>

        </div>

      </section>


      {/* Analysis Pipeline */}
      <section className="bg-white border border-slate-200
                          rounded-2xl shadow-sm p-7">

        <div className="flex items-center justify-between mb-6">

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Analysis Pipeline
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Processing stages for the current inspection.
            </p>
          </div>

          <span className="text-xs text-slate-400">
            Inspection #MTX-2026-00128
          </span>

        </div>


        <div className="space-y-4">

          {/* Image Processing */}
          <div className="flex items-center justify-between
                          p-4 rounded-xl
                          bg-green-50 border border-green-100">

            <div className="flex items-center gap-4">

              <div className="w-10 h-10 rounded-xl
                              bg-green-100 text-green-600
                              flex items-center justify-center">

                <ScanText size={20} />

              </div>

              <div>
                <p className="font-semibold text-slate-900">
                  Image Processing
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Package images prepared for analysis
                </p>
              </div>

            </div>

            <div className="flex items-center gap-2
                            text-green-600 text-sm font-medium">

              <CheckCircle2 size={18} />
              Completed

            </div>

          </div>


          {/* OCR */}
          <div className="flex items-center justify-between
                          p-4 rounded-xl
                          bg-green-50 border border-green-100">

            <div className="flex items-center gap-4">

              <div className="w-10 h-10 rounded-xl
                              bg-green-100 text-green-600
                              flex items-center justify-center">

                <FileSearch size={20} />

              </div>

              <div>
                <p className="font-semibold text-slate-900">
                  OCR Extraction
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Text and declarations extracted from package
                </p>
              </div>

            </div>

            <div className="flex items-center gap-2
                            text-green-600 text-sm font-medium">

              <CheckCircle2 size={18} />
              Completed

            </div>

          </div>


          {/* Information Extraction */}
          <div className="flex items-center justify-between
                          p-4 rounded-xl
                          bg-blue-50 border border-blue-100">

            <div className="flex items-center gap-4">

              <div className="w-10 h-10 rounded-xl
                              bg-blue-100 text-blue-600
                              flex items-center justify-center">

                <FileSearch size={20} />

              </div>

              <div>
                <p className="font-semibold text-slate-900">
                  Information Extraction
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Identifying mandatory package declarations
                </p>
              </div>

            </div>

            <div className="flex items-center gap-2
                            text-blue-600 text-sm font-medium">

              <Loader2 size={18} className="animate-spin" />
              Processing

            </div>

          </div>


          {/* Rule Validation */}
          <div className="flex items-center justify-between
                          p-4 rounded-xl
                          bg-slate-50 border border-slate-200">

            <div className="flex items-center gap-4">

              <div className="w-10 h-10 rounded-xl
                              bg-slate-100 text-slate-500
                              flex items-center justify-center">

                <ShieldCheck size={20} />

              </div>

              <div>
                <p className="font-semibold text-slate-700">
                  Rule Validation
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Checking declarations against applicable rules
                </p>
              </div>

            </div>

            <div className="flex items-center gap-2
                            text-slate-400 text-sm font-medium">

              <Clock3 size={18} />
              Waiting

            </div>

          </div>


          {/* Compliance Assessment */}
          <div className="flex items-center justify-between
                          p-4 rounded-xl
                          bg-slate-50 border border-slate-200">

            <div className="flex items-center gap-4">

              <div className="w-10 h-10 rounded-xl
                              bg-slate-100 text-slate-500
                              flex items-center justify-center">

                <ShieldCheck size={20} />

              </div>

              <div>
                <p className="font-semibold text-slate-700">
                  Compliance Assessment
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Generating final compliance assessment
                </p>
              </div>

            </div>

            <div className="flex items-center gap-2
                            text-slate-400 text-sm font-medium">

              <Clock3 size={18} />
              Waiting

            </div>

          </div>

        </div>

      </section>


      {/* AI Disclaimer */}
      <div className="mt-6 p-5 rounded-2xl
                      bg-blue-50 border border-blue-100">

        <div className="flex gap-3">

          <ShieldCheck
            size={21}
            className="text-blue-600 mt-0.5"
          />

          <div>

            <p className="text-sm font-semibold text-blue-900">
              AI-Assisted Analysis
            </p>

            <p className="text-xs text-blue-700 mt-1 leading-relaxed">
              Metra-X provides AI-assisted findings for inspection support.
              Final compliance decisions should be verified by an
              authorized enforcement officer.
            </p>

          </div>

        </div>

      </div>


      {/* Bottom Action */}
      <div className="flex justify-end mt-6">

        <button
          onClick={() => navigate("/compliance-result")}
          className="flex items-center gap-2
                     bg-blue-600 hover:bg-blue-700
                     text-white font-semibold
                     px-6 py-3.5 rounded-xl
                     shadow-sm hover:shadow-md
                     transition-all"
        >

          View Compliance Result

          <ArrowRight size={19} />

        </button>

      </div>

    </main>
  );
}

export default Analysis;