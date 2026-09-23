import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Image as ImageIcon,
  Eye,
  Sun,
  ScanText,
  Trash2,
  Upload,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useInspection } from "../context/InspectionContext";
import { useRef } from "react";

function ImageReview() {
  const navigate = useNavigate();

  const {
    inspection,
    removeImage,
    replaceImage,
    addImages,
  } = useInspection();

  const fileInputRef = useRef(null);
  const replaceInputRef = useRef(null);

  const images = inspection.images || [];
  const currentImage = images[0] || null;

  /* ========================================================= */
  /* REPLACE IMAGE                                              */
  /* ========================================================= */

  const handleReplaceImage = (file) => {
    if (!file || !file.type.startsWith("image/")) {
      return;
    }

    const newImage = {
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    };

    if (currentImage) {
      replaceImage(0, newImage);
    } else {
      addImages([newImage]);
    }
  };

  /* ========================================================= */
  /* FILE UPLOAD                                                */
  /* ========================================================= */

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    handleReplaceImage(file);

    // Allows the same file to be selected again
    event.target.value = "";
  };

  /* ========================================================= */
  /* REMOVE IMAGE                                               */
  /* ========================================================= */

  const handleDeleteImage = () => {
    if (!currentImage) {
      return;
    }

    removeImage(0);
  };

  /* ========================================================= */
  /* VIEW FULL SIZE                                             */
  /* ========================================================= */

  const handleViewFullSize = () => {
    if (!currentImage) {
      return;
    }

    window.open(
      currentImage.preview,
      "_blank",
      "noopener,noreferrer"
    );
  };

  /* ========================================================= */
  /* CONTINUE                                                   */
  /* ========================================================= */

  const handleContinue = () => {
    if (!currentImage) {
      alert("Please upload one package image.");
      return;
    }

    navigate("/analysis");
  };

  return (
    <main className="p-4 sm:p-6 lg:p-8 bg-[#F6F8FC] min-h-[calc(100vh-80px)]">

      {/* ===================================================== */}
      {/* HEADER                                                  */}
      {/* ===================================================== */}

      <div className="mb-6 lg:mb-8">

        <button
          onClick={() => navigate("/new-inspection")}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors mb-4"
        >
          <ArrowLeft size={17} />
          Back to New Inspection
        </button>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Image Review
        </h1>

        <p className="text-sm sm:text-base text-slate-500 mt-2">
          Review the package image before starting compliance analysis.
        </p>

      </div>

      {/* ===================================================== */}
      {/* PROGRESS                                                */}
      {/* ===================================================== */}

      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 mb-6 shadow-sm">

        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">

          {/* Step 1 */}

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">

            <div className="w-9 h-9 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 size={18} />
            </div>

            <div>

              <p className="text-sm font-semibold text-slate-900">
                Product Details
              </p>

              <p className="text-xs text-green-600 hidden sm:block">
                Completed
              </p>

            </div>

          </div>

          <div className="h-px bg-blue-200 flex-1 min-w-6" />

          {/* Step 2 */}

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">

            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold shrink-0">
              2
            </div>

            <div>

              <p className="text-sm font-semibold text-slate-900">
                Image Review
              </p>

              <p className="text-xs text-blue-600 hidden sm:block">
                Review image
              </p>

            </div>

          </div>

          <div className="h-px bg-slate-200 flex-1 min-w-6" />

          {/* Step 3 */}

          <div className="flex items-center gap-2 sm:gap-3 opacity-50 shrink-0">

            <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-semibold shrink-0">
              3
            </div>

            <div>

              <p className="text-sm font-semibold text-slate-700">
                Analysis
              </p>

              <p className="text-xs text-slate-400 hidden sm:block">
                Check compliance
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* ===================================================== */}
      {/* MAIN CONTENT                                            */}
      {/* ===================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* =================================================== */}
        {/* IMAGE PREVIEW                                         */}
        {/* =================================================== */}

        <section className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6 lg:p-7">

          {/* Image heading */}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

            <div className="flex items-center gap-3 min-w-0">

              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <ImageIcon size={22} />
              </div>

              <div className="min-w-0">

                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  Package Image
                </h2>

                <p className="text-sm text-slate-500 truncate">
                  {currentImage
                    ? currentImage.name
                    : "No package image selected"}
                </p>

              </div>

            </div>

            <span className="self-start sm:self-auto text-xs font-medium px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 whitespace-nowrap">
              {currentImage ? "Image 1 of 1" : "0 of 1 images"}
            </span>

          </div>

          {/* ================================================= */}
          {/* IMAGE AREA                                          */}
          {/* ================================================= */}

          <div className="bg-slate-100 rounded-2xl min-h-[280px] sm:min-h-[360px] lg:min-h-[420px] flex items-center justify-center border border-slate-200 overflow-hidden">

            {currentImage ? (

              <img
                src={currentImage.preview}
                alt="Package preview"
                className="max-h-[280px] sm:max-h-[360px] lg:max-h-[420px] max-w-full object-contain"
              />

            ) : (

              <div className="text-center p-6">

                <div className="w-20 h-20 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto">

                  <ImageIcon
                    size={38}
                    className="text-slate-300"
                  />

                </div>

                <p className="text-slate-500 mt-4 font-medium">
                  No product image uploaded
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Upload one clear package image for analysis
                </p>

              </div>

            )}

          </div>

          {/* ================================================= */}
          {/* HIDDEN UPLOAD INPUT                                 */}
          {/* ================================================= */}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* ================================================= */}
          {/* HIDDEN REPLACE INPUT                               */}
          {/* ================================================= */}

          <input
            ref={replaceInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* ================================================= */}
          {/* IMAGE CONTROLS                                      */}
          {/* ================================================= */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-3 mt-5">

            {/* Upload / Replace */}

            <button
              type="button"
              onClick={() => {
                if (currentImage) {
                  replaceInputRef.current?.click();
                } else {
                  fileInputRef.current?.click();
                }
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
            >

              {currentImage ? (
                <RefreshCw size={17} />
              ) : (
                <Upload size={17} />
              )}

              {currentImage
                ? "Replace Image"
                : "Upload Image"}

            </button>

            {/* View Full Size */}

            {currentImage && (

              <button
                type="button"
                onClick={handleViewFullSize}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-blue-200 text-sm font-medium text-blue-600 hover:bg-blue-50 transition"
              >

                <Eye size={17} />

                View Full Size

              </button>

            )}

            {/* Remove */}

            {currentImage && (

              <button
                type="button"
                onClick={handleDeleteImage}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50 transition"
              >

                <Trash2 size={17} />

                Remove

              </button>

            )}

          </div>

        </section>

        {/* =================================================== */}
        {/* QUALITY PANEL                                         */}
        {/* =================================================== */}

        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6 lg:p-7">

          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Image Quality
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Automatic image quality assessment
          </p>

          {/* Overall */}

          <div className="mt-6 p-4 rounded-xl bg-green-50 border border-green-100">

            <div className="flex items-start gap-3">

              <CheckCircle2
                size={22}
                className="text-green-600 shrink-0"
              />

              <div>

                <p className="font-semibold text-green-800">
                  Image quality is good
                </p>

                <p className="text-xs text-green-700 mt-1">
                  Suitable for analysis
                </p>

              </div>

            </div>

          </div>

          {/* Quality Checks */}

          <div className="mt-6 space-y-4">

            {/* Resolution */}

            <div className="flex items-center justify-between gap-3">

              <div className="flex items-center gap-3 min-w-0">

                <ScanText
                  size={18}
                  className="text-slate-500 shrink-0"
                />

                <span className="text-sm text-slate-700">
                  Resolution
                </span>

              </div>

              <span className="flex items-center gap-1 text-xs font-medium text-green-600 shrink-0">

                <CheckCircle2 size={15} />

                Good

              </span>

            </div>

            {/* Blur */}

            <div className="flex items-center justify-between gap-3">

              <div className="flex items-center gap-3 min-w-0">

                <Eye
                  size={18}
                  className="text-slate-500 shrink-0"
                />

                <span className="text-sm text-slate-700">
                  Blur detection
                </span>

              </div>

              <span className="flex items-center gap-1 text-xs font-medium text-green-600 shrink-0">

                <CheckCircle2 size={15} />

                Clear

              </span>

            </div>

            {/* Glare */}

            <div className="flex items-center justify-between gap-3">

              <div className="flex items-center gap-3 min-w-0">

                <Sun
                  size={18}
                  className="text-slate-500 shrink-0"
                />

                <span className="text-sm text-slate-700">
                  Glare detection
                </span>

              </div>

              <span className="flex items-center gap-1 text-xs font-medium text-amber-600 shrink-0">

                <AlertTriangle size={15} />

                Minor glare

              </span>

            </div>

            {/* Text readability */}

            <div className="flex items-center justify-between gap-3">

              <div className="flex items-center gap-3 min-w-0">

                <ScanText
                  size={18}
                  className="text-slate-500 shrink-0"
                />

                <span className="text-sm text-slate-700">
                  Text readability
                </span>

              </div>

              <span className="flex items-center gap-1 text-xs font-medium text-green-600 shrink-0">

                <CheckCircle2 size={15} />

                Readable

              </span>

            </div>

          </div>

          {/* Tip */}

          <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100">

            <p className="text-xs font-semibold text-blue-800">
              💡 Tip
            </p>

            <p className="text-xs text-blue-700 mt-1 leading-relaxed">
              Make sure mandatory declarations are clearly visible
              before continuing with analysis.
            </p>

          </div>

          {/* Retake */}

          <button
            type="button"
            onClick={() => {
              if (currentImage) {
                replaceInputRef.current?.click();
              } else {
                fileInputRef.current?.click();
              }
            }}
            className="w-full mt-5 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition"
          >

            <RefreshCw size={18} />

            {currentImage ? "Retake Image" : "Upload Image"}

          </button>

        </section>

      </div>

      {/* ===================================================== */}
      {/* BOTTOM ACTION                                          */}
      {/* ===================================================== */}

      <div className="flex justify-stretch sm:justify-end mt-6">

        <button
          type="button"
          onClick={handleContinue}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3.5 rounded-xl shadow-sm hover:shadow-md transition-all"
        >

          Continue to Analysis

          <ArrowRight size={19} />

        </button>

      </div>

    </main>
  );
}

export default ImageReview;
