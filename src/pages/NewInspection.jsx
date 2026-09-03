import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Upload,
  Package,
  ImagePlus,
  Info,
  Globe,
  Link,
} from "lucide-react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInspection } from "../context/InspectionContext";

function NewInspection() {
  const navigate = useNavigate();

  const { updateInspection } = useInspection();

  const [inspectionType, setInspectionType] = useState("physical");

  const [productName, setProductName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [category, setCategory] = useState("");
  const [mrp, setMrp] = useState("");
  const [netQuantity, setNetQuantity] = useState("");
  const [productUrl, setProductUrl] = useState("");

  return (
    <main className="p-6 lg:p-8 bg-[#F6F8FC] min-h-[calc(100vh-80px)]">

      {/* Page Header */}
      <div className="mb-8">

        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-slate-500
                     hover:text-blue-600 transition-colors mb-4"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold text-slate-900">
          New Inspection
        </h1>

        <p className="text-slate-500 mt-2">
          Start a new packaged commodity compliance inspection.
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
              1
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Product Details
              </p>

              <p className="text-xs text-slate-500">
                Enter basic information
              </p>
            </div>

          </div>


          <div className="h-px bg-slate-200 flex-1"></div>


          {/* Step 2 */}
          <div className="flex items-center gap-3 opacity-50">

            <div className="w-9 h-9 rounded-full
                            bg-slate-100 text-slate-500
                            flex items-center justify-center
                            font-semibold">
              2
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-700">
                Package Images
              </p>

              <p className="text-xs text-slate-400">
                Upload product images
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


      {/* Inspection Source */}
      <section className="bg-white border border-slate-200
                          rounded-2xl shadow-sm p-7 mb-6">

        <div className="flex items-center gap-3 mb-5">

          <div className="w-11 h-11 rounded-xl
                          bg-blue-50 text-blue-600
                          flex items-center justify-center">

            <Globe size={22} />

          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Inspection Source
            </h2>

            <p className="text-sm text-slate-500">
              Choose how you want to provide the product information.
            </p>
          </div>

        </div>


        {/* Source Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Physical Product */}
          <button
            type="button"
            onClick={() => setInspectionType("physical")}
            className={`text-left p-5 rounded-2xl border-2 transition-all ${
              inspectionType === "physical"
                ? "border-blue-500 bg-blue-50/50"
                : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
            }`}
          >

            <div className="flex items-start gap-4">

              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  inspectionType === "physical"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <Package size={22} />
              </div>

              <div className="flex-1">

                <div className="flex items-center justify-between">

                  <h3 className="font-bold text-slate-900">
                    Physical Product
                  </h3>

                  {inspectionType === "physical" && (
                    <span className="text-xs font-semibold text-blue-600">
                      SELECTED
                    </span>
                  )}

                </div>

                <p className="text-sm text-slate-500 mt-1">
                  Upload or capture images of the actual product package.
                </p>

              </div>

            </div>

          </button>


          {/* Online Product */}
          <button
            type="button"
            onClick={() => setInspectionType("online")}
            className={`text-left p-5 rounded-2xl border-2 transition-all ${
              inspectionType === "online"
                ? "border-blue-500 bg-blue-50/50"
                : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
            }`}
          >

            <div className="flex items-start gap-4">

              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  inspectionType === "online"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <Globe size={22} />
              </div>

              <div className="flex-1">

                <div className="flex items-center justify-between">

                  <h3 className="font-bold text-slate-900">
                    Online Product URL
                  </h3>

                  {inspectionType === "online" && (
                    <span className="text-xs font-semibold text-blue-600">
                      SELECTED
                    </span>
                  )}

                </div>

                <p className="text-sm text-slate-500 mt-1">
                  Enter an e-commerce product URL for online listing analysis.
                </p>

              </div>

            </div>

          </button>

        </div>


        {/* Online URL Input */}
        {inspectionType === "online" && (
          <div className="mt-5">

            <label className="block text-sm font-medium text-slate-700 mb-2">
              Online Product URL
            </label>

            <div className="relative">

              <Link
                size={19}
                className="absolute left-4 top-1/2
                           -translate-y-1/2 text-slate-400"
              />

              <input
                type="url"
                placeholder="https://www.example.com/product/..."
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl
                           border border-slate-200
                           outline-none
                           focus:border-blue-500
                           focus:ring-4 focus:ring-blue-500/10
                           transition"
              />

            </div>

            <p className="text-xs text-slate-500 mt-2">
              Enter the publicly accessible product page URL that you want
              Metra-X to analyze.
            </p>

          </div>
        )}

      </section>


      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">


        {/* Product Details */}
        <section className="xl:col-span-2 bg-white
                            border border-slate-200
                            rounded-2xl shadow-sm p-7">

          <div className="flex items-center gap-3 mb-6">

            <div className="w-11 h-11 rounded-xl
                            bg-blue-50 text-blue-600
                            flex items-center justify-center">

              <Package size={22} />

            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Product Details
              </h2>

              <p className="text-sm text-slate-500">
                Enter the basic information of the packaged commodity.
              </p>
            </div>

          </div>


          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">


            {/* Product Name */}
            <div className="md:col-span-2">

              <label className="block text-sm font-medium
                                text-slate-700 mb-2">
                Product Name
              </label>

              <input
                type="text"
                placeholder="e.g. Basmati Rice"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl
                           border border-slate-200
                           outline-none
                           focus:border-blue-500
                           focus:ring-4 focus:ring-blue-500/10
                           transition"
              />

            </div>


            {/* Brand */}
            <div>

              <label className="block text-sm font-medium
                                text-slate-700 mb-2">
                Brand Name
              </label>

              <input
                type="text"
                placeholder="e.g. Example Foods"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl
                           border border-slate-200
                           outline-none
                           focus:border-blue-500
                           focus:ring-4 focus:ring-blue-500/10
                           transition"
              />

            </div>


            {/* Category */}
            <div>

              <label className="block text-sm font-medium
                                text-slate-700 mb-2">
                Product Category
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl
                           border border-slate-200
                           text-slate-600
                           outline-none
                           focus:border-blue-500
                           focus:ring-4 focus:ring-blue-500/10"
              >

                <option value="">Select category</option>
                <option>Food & Beverages</option>
                <option>Personal Care</option>
                <option>Household Products</option>
                <option>Electronics</option>
                <option>Other</option>

              </select>

            </div>


            {/* MRP */}
            <div>

              <label className="block text-sm font-medium
                                text-slate-700 mb-2">
                MRP
              </label>

              <input
                type="text"
                placeholder="₹ 0.00"
                value={mrp}
                onChange={(e) => setMrp(e.target.value)}
                className="w-full px-4 py-3 rounded-xl
                           border border-slate-200
                           outline-none
                           focus:border-blue-500
                           focus:ring-4 focus:ring-blue-500/10"
              />

            </div>


            {/* Net Quantity */}
            <div>

              <label className="block text-sm font-medium
                                text-slate-700 mb-2">
                Net Quantity
              </label>

              <input
                type="text"
                placeholder="e.g. 1 kg"
                value={netQuantity}
                onChange={(e) => setNetQuantity(e.target.value)}
                className="w-full px-4 py-3 rounded-xl
                           border border-slate-200
                           outline-none
                           focus:border-blue-500
                           focus:ring-4 focus:ring-blue-500/10"
              />

            </div>

          </div>


          {/* Info */}
          <div className="mt-6 p-4 rounded-xl
                          bg-blue-50 border border-blue-100
                          flex gap-3">

            <Info
              size={19}
              className="text-blue-600 mt-0.5 flex-shrink-0"
            />

            <p className="text-sm text-blue-800">

              {inspectionType === "online"
                ? "Online product information will be used to analyze declarations displayed on the product listing."
                : "Product information helps Metra-X organize the inspection and generate an accurate compliance report."}

            </p>

          </div>

        </section>


        {/* Physical Product Image Upload */}
        {inspectionType === "physical" && (
          <section className="bg-white border border-slate-200
                              rounded-2xl shadow-sm p-7">

            <div className="flex items-center gap-3 mb-6">

              <div className="w-11 h-11 rounded-xl
                              bg-cyan-50 text-cyan-600
                              flex items-center justify-center">

                <ImagePlus size={22} />

              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Package Images
                </h2>

                <p className="text-sm text-slate-500">
                  Add product images
                </p>
              </div>

            </div>


            {/* Upload Area */}
            <div className="border-2 border-dashed
                            border-slate-200
                            rounded-2xl p-8
                            text-center
                            hover:border-blue-400
                            hover:bg-blue-50/30
                            transition cursor-pointer">

              <div className="w-14 h-14 rounded-full
                              bg-blue-50 text-blue-600
                              flex items-center justify-center
                              mx-auto">

                <Upload size={25} />

              </div>

              <h3 className="font-semibold text-slate-900 mt-4">
                Upload package images
              </h3>

              <p className="text-sm text-slate-500 mt-2">
                JPG, PNG or WEBP
              </p>

              <button
                className="mt-5 px-5 py-2.5 rounded-xl
                           border border-slate-200
                           text-sm font-medium
                           text-slate-700
                           hover:bg-slate-50 transition"
              >
                Choose Files
              </button>

            </div>


            {/* Camera Button */}
            <button
              className="w-full mt-4
                         flex items-center justify-center gap-2
                         px-4 py-3 rounded-xl
                         border border-blue-200
                         text-blue-600
                         font-medium
                         hover:bg-blue-50
                         transition"
            >

              <Camera size={19} />

              Capture Using Camera

            </button>


            {/* Image Requirements */}
            <div className="mt-6">

              <p className="text-xs font-semibold text-slate-500
                            uppercase tracking-wider mb-3">
                Recommended
              </p>

              <ul className="space-y-2 text-sm text-slate-500">

                <li>✓ Front side of package</li>
                <li>✓ Back side of package</li>
                <li>✓ Side panels if required</li>
                <li>✓ Clear and readable labels</li>

              </ul>

            </div>

          </section>
        )}


        {/* Online Product Preview */}
        {inspectionType === "online" && (
          <section className="bg-white border border-slate-200
                              rounded-2xl shadow-sm p-7">

            <div className="flex items-center gap-3 mb-6">

              <div className="w-11 h-11 rounded-xl
                              bg-cyan-50 text-cyan-600
                              flex items-center justify-center">

                <Globe size={22} />

              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Online Listing
                </h2>

                <p className="text-sm text-slate-500">
                  Product page analysis
                </p>
              </div>

            </div>


            <div className="border-2 border-dashed
                            border-slate-200
                            rounded-2xl p-8
                            text-center">

              <div className="w-14 h-14 rounded-full
                              bg-blue-50 text-blue-600
                              flex items-center justify-center
                              mx-auto">

                <Globe size={25} />

              </div>

              <h3 className="font-semibold text-slate-900 mt-4">
                Online product inspection
              </h3>

              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Metra-X will analyze the information available on the
                product listing and identify declarations that require
                compliance review.
              </p>

            </div>


            {/* URL reminder */}
            <div className="mt-5 p-4 rounded-xl
                            bg-blue-50 border border-blue-100
                            flex gap-3">

              <Info
                size={18}
                className="text-blue-600 mt-0.5 flex-shrink-0"
              />

              <p className="text-xs text-blue-700 leading-relaxed">
                Make sure the product URL is publicly accessible and points
                directly to the product listing.
              </p>

            </div>

          </section>
        )}

      </div>


      {/* Bottom Action */}
      <div className="flex justify-end mt-6">

        <button
          onClick={() => {

            updateInspection({
              inspectionType,
              productName,
              brandName,
              category,
              mrp,
              netQuantity,
              productUrl,
            });

            navigate(
              inspectionType === "online"
                ? "/online-product-review"
                : "/image-review"
            );

          }}
          className="flex items-center gap-2
                     bg-blue-600 hover:bg-blue-700
                     text-white font-semibold
                     px-6 py-3.5 rounded-xl
                     shadow-sm hover:shadow-md
                     transition-all"
        >

          {inspectionType === "online"
            ? "Continue to Online Analysis"
            : "Continue to Image Review"}

          <ArrowRight size={19} />

        </button>

      </div>

    </main>
  );
}

export default NewInspection;