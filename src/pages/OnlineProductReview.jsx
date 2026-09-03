import {
  ArrowLeft,
  ArrowRight,
  Globe,
  Link,
  CheckCircle2,
  AlertCircle,
  Info,
  ExternalLink,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useInspection } from "../context/InspectionContext";

function OnlineProductReview() {
  const navigate = useNavigate();

  const { inspection } = useInspection();

  return (
    <main className="p-6 lg:p-8 bg-[#F6F8FC] min-h-[calc(100vh-80px)]">

      {/* Page Header */}
      <div className="mb-8">

        <button
          onClick={() => navigate("/new-inspection")}
          className="flex items-center gap-2 text-sm text-slate-500
                     hover:text-blue-600 transition-colors mb-4"
        >
          <ArrowLeft size={17} />
          Back to New Inspection
        </button>

        <h1 className="text-3xl font-bold text-slate-900">
          Online Product Review
        </h1>

        <p className="text-slate-500 mt-2">
          Review the product listing before starting compliance analysis.
        </p>

      </div>


      {/* Progress */}
      <div className="bg-white border border-slate-200 rounded-2xl
                      p-5 mb-6 shadow-sm">

        <div className="flex items-center gap-4">

          {/* Step 1 */}
          <div className="flex items-center gap-3">

            <div className="w-9 h-9 rounded-full
                            bg-blue-600 text-white
                            flex items-center justify-center
                            font-semibold">
              ✓
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Product Details
              </p>

              <p className="text-xs text-slate-500">
                Information entered
              </p>
            </div>

          </div>


          <div className="h-px bg-blue-200 flex-1"></div>


          {/* Step 2 */}
          <div className="flex items-center gap-3">

            <div className="w-9 h-9 rounded-full
                            bg-blue-600 text-white
                            flex items-center justify-center
                            font-semibold">
              2
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Online Listing
              </p>

              <p className="text-xs text-slate-500">
                Review product information
              </p>
            </div>

          </div>


          <div className="h-px bg-slate-200 flex-1"></div>


          {/* Step 3 */}
          <div className="flex items-center gap-3 opacity-50">

            <div className="w-9 h-9 rounded-full
                            bg-slate-100 text-slate-500
                            flex items-center justify-center
                            font-semibold">
              3
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-700">
                Analysis
              </p>

              <p className="text-xs text-slate-400">
                Check compliance
              </p>
            </div>

          </div>

        </div>

      </div>


      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">


        {/* Product Listing */}
        <section className="xl:col-span-2 bg-white
                            border border-slate-200
                            rounded-2xl shadow-sm p-7">

          <div className="flex items-center gap-3 mb-6">

            <div className="w-11 h-11 rounded-xl
                            bg-blue-50 text-blue-600
                            flex items-center justify-center">

              <Globe size={22} />

            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Product Listing
              </h2>

              <p className="text-sm text-slate-500">
                Information collected from the online product page.
              </p>
            </div>

          </div>


          {/* URL */}
          <div className="mb-6">

            <label className="block text-sm font-medium
                              text-slate-700 mb-2">
              Product URL
            </label>

            <div className="flex gap-3">

              <div className="relative flex-1">

                <Link
                  size={18}
                  className="absolute left-4 top-1/2
                             -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={inspection.productUrl || "No URL provided"}
                  readOnly
                  className="w-full pl-11 pr-4 py-3 rounded-xl
                             border border-slate-200
                             bg-slate-50 text-slate-600
                             outline-none"
                />

              </div>

              {inspection.productUrl && (
                <button
                  type="button"
                  onClick={() =>
                    window.open(
                      inspection.productUrl,
                      "_blank",
                      "noopener,noreferrer"
                    )
                  }
                  className="px-4 py-3 rounded-xl
                             border border-slate-200
                             text-slate-600
                             hover:bg-slate-50 transition"
                >
                  <ExternalLink size={19} />
                </button>
              )}

            </div>

          </div>


          {/* Preview */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">

            {/* Fake Browser Header */}
            <div className="bg-slate-50 border-b border-slate-200
                            px-5 py-3 flex items-center gap-2">

              <div className="w-3 h-3 rounded-full bg-slate-300"></div>
              <div className="w-3 h-3 rounded-full bg-slate-300"></div>
              <div className="w-3 h-3 rounded-full bg-slate-300"></div>

              <div className="ml-3 flex-1 bg-white border
                              border-slate-200 rounded-lg px-3 py-1.5
                              text-xs text-slate-500 truncate">
                {inspection.productUrl || "Product URL not provided"}
              </div>

            </div>


            {/* Product Preview */}
            <div className="p-7">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-7">

                {/* Product Image Placeholder */}
                <div className="h-64 rounded-2xl bg-slate-50
                                border border-slate-200
                                flex items-center justify-center">

                  <div className="text-center">

                    <div className="w-16 h-16 rounded-2xl
                                    bg-blue-50 text-blue-600
                                    flex items-center justify-center
                                    mx-auto">

                      <Globe size={30} />

                    </div>

                    <p className="text-sm font-medium
                                  text-slate-700 mt-4">
                      Online Product
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      Product listing preview
                    </p>

                  </div>

                </div>


                {/* Product Information */}
                <div>

                  <p className="text-xs uppercase tracking-wider
                                font-semibold text-slate-400">
                    Product
                  </p>

                  <h3 className="text-xl font-bold text-slate-900 mt-2">
                    {inspection.productName || "Product Name Not Provided"}
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    {inspection.brandName || "Brand Not Provided"}
                  </p>


                  <div className="grid grid-cols-2 gap-4 mt-6">

                    <div className="p-4 rounded-xl bg-slate-50">

                      <p className="text-xs text-slate-400">
                        MRP
                      </p>

                      <p className="font-semibold text-slate-900 mt-1">
                        {inspection.mrp || "Not provided"}
                      </p>

                    </div>


                    <div className="p-4 rounded-xl bg-slate-50">

                      <p className="text-xs text-slate-400">
                        Net Quantity
                      </p>

                      <p className="font-semibold text-slate-900 mt-1">
                        {inspection.netQuantity || "Not provided"}
                      </p>

                    </div>

                  </div>


                  {/* Category */}
                  <div className="mt-4 p-4 rounded-xl bg-slate-50">

                    <p className="text-xs text-slate-400">
                      Category
                    </p>

                    <p className="font-semibold text-slate-900 mt-1">
                      {inspection.category || "Not provided"}
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* Declaration Check */}
        <section className="bg-white border border-slate-200
                            rounded-2xl shadow-sm p-7">

          <div className="flex items-center gap-3 mb-6">

            <div className="w-11 h-11 rounded-xl
                            bg-cyan-50 text-cyan-600
                            flex items-center justify-center">

              <CheckCircle2 size={22} />

            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Declaration Check
              </h2>

              <p className="text-sm text-slate-500">
                Initial listing review
              </p>
            </div>

          </div>


          {/* Checks */}
          <div className="space-y-3">

            <div className="flex items-center justify-between
                            p-4 rounded-xl bg-green-50
                            border border-green-100">

              <div className="flex items-center gap-3">

                <CheckCircle2 size={18} className="text-green-600" />

                <span className="text-sm font-medium text-slate-700">
                  Product Name
                </span>

              </div>

              <span className="text-xs font-semibold text-green-700">
                {inspection.productName ? "FOUND" : "MISSING"}
              </span>

            </div>


            <div className="flex items-center justify-between
                            p-4 rounded-xl bg-green-50
                            border border-green-100">

              <div className="flex items-center gap-3">

                <CheckCircle2 size={18} className="text-green-600" />

                <span className="text-sm font-medium text-slate-700">
                  MRP
                </span>

              </div>

              <span className="text-xs font-semibold text-green-700">
                {inspection.mrp ? "FOUND" : "MISSING"}
              </span>

            </div>


            <div className="flex items-center justify-between
                            p-4 rounded-xl bg-green-50
                            border border-green-100">

              <div className="flex items-center gap-3">

                <CheckCircle2 size={18} className="text-green-600" />

                <span className="text-sm font-medium text-slate-700">
                  Net Quantity
                </span>

              </div>

              <span className="text-xs font-semibold text-green-700">
                {inspection.netQuantity ? "FOUND" : "MISSING"}
              </span>

            </div>


            <div className="flex items-center justify-between
                            p-4 rounded-xl bg-amber-50
                            border border-amber-100">

              <div className="flex items-center gap-3">

                <AlertCircle size={18} className="text-amber-600" />

                <span className="text-sm font-medium text-slate-700">
                  Manufacturer Details
                </span>

              </div>

              <span className="text-xs font-semibold text-amber-700">
                REVIEW
              </span>

            </div>

          </div>


          {/* Info */}
          <div className="mt-6 p-4 rounded-xl
                          bg-blue-50 border border-blue-100
                          flex gap-3">

            <Info
              size={18}
              className="text-blue-600 mt-0.5 flex-shrink-0"
            />

            <p className="text-xs text-blue-700 leading-relaxed">
              This is only an initial review. Metra-X will perform detailed
              compliance analysis in the next step.
            </p>

          </div>

        </section>

      </div>


      {/* Bottom Action */}
      <div className="flex justify-end mt-6">

        <button
          onClick={() => navigate("/analysis")}
          className="flex items-center gap-2
                     bg-blue-600 hover:bg-blue-700
                     text-white font-semibold
                     px-6 py-3.5 rounded-xl
                     shadow-sm hover:shadow-md
                     transition-all"
        >

          Continue to Analysis

          <ArrowRight size={19} />

        </button>

      </div>

    </main>
  );
}

export default OnlineProductReview;