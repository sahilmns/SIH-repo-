import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInspection } from "../context/InspectionContext";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const Analysis = () => {
  const navigate = useNavigate();

  const { inspection, updateInspection } = useInspection();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  // Prevent duplicate API calls during React StrictMode
  const hasAnalyzed = useRef(false);

  /* ========================================================= */
  /* ANALYZE IMAGE                                              */
  /* ========================================================= */

  const analyzeImage = async () => {
    try {
      setLoading(true);
      setError(null);
      setProgress(10);

      /* ------------------------------------------------------- */
      /* CHECK API URL                                           */
      /* ------------------------------------------------------- */

      if (!API_URL) {
        throw new Error(
          "Backend API URL is not configured. Please check VITE_API_URL."
        );
      }

      /* ------------------------------------------------------- */
      /* CHECK IMAGE                                             */
      /* ------------------------------------------------------- */

      const currentImage = inspection?.images?.[0];

      if (!currentImage) {
        throw new Error(
          "No package image found. Please upload one image first."
        );
      }

      const imageFile = currentImage.file;

      if (!imageFile) {
        throw new Error(
          "Unable to access the uploaded image. Please upload the image again."
        );
      }

      if (!imageFile.type?.startsWith("image/")) {
        throw new Error(
          "The selected file is not a valid image."
        );
      }

      setProgress(25);

      /* ------------------------------------------------------- */
      /* CREATE FORMDATA                                         */
      /* ------------------------------------------------------- */

      const formData = new FormData();

      // Backend expects exactly: file
      formData.append("file", imageFile);

      setProgress(40);

      /* ------------------------------------------------------- */
      /* CALL FASTAPI BACKEND                                    */
      /* ------------------------------------------------------- */

      const response = await fetch(
        `${API_URL}/analyze-label`,
        {
          method: "POST",
          body: formData,
        }
      );

      setProgress(70);

      /* ------------------------------------------------------- */
      /* HTTP ERROR                                              */
      /* ------------------------------------------------------- */

      if (!response.ok) {
        let errorMessage = `Backend analysis failed. Server returned ${response.status}.`;

        try {
          const errorData = await response.json();

          if (errorData?.detail) {
            errorMessage =
              typeof errorData.detail === "string"
                ? errorData.detail
                : JSON.stringify(errorData.detail);
          } else if (errorData?.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // Keep default HTTP error message
        }

        throw new Error(errorMessage);
      }

      /* ------------------------------------------------------- */
      /* READ BACKEND RESPONSE                                   */
      /* ------------------------------------------------------- */

      const result = await response.json();

      console.log("NiyamDrishti backend result:", result);

      /* ------------------------------------------------------- */
      /* BACKEND-LEVEL ERROR                                     */
      /* ------------------------------------------------------- */

      if (result?.status === "ERROR") {
        throw new Error(
          result.message || "Label analysis failed."
        );
      }

      setProgress(90);

      /* ------------------------------------------------------- */
      /* SAVE RESULT TO CONTEXT                                  */
      /* ------------------------------------------------------- */

      updateInspection({
        analysis: result,
        complianceResult: result,

        // Backend creates and returns the inspection record.
        // Store these fields if they are available.
        ...(result.inspection && {
          backendInspectionId: result.inspection.id,
          inspectionCode: result.inspection.inspection_code,
          inspectionStatus: result.inspection.status,
        }),
      });

      setProgress(100);
      setLoading(false);
    } catch (err) {
      console.error("NiyamDrishti analysis error:", err);

      setError(
        err?.message ||
          "Something went wrong while analyzing the label."
      );

      setLoading(false);
    }
  };

  /* ========================================================= */
  /* INITIAL ANALYSIS                                          */
  /* ========================================================= */

  useEffect(() => {
    if (hasAnalyzed.current) {
      return;
    }

    hasAnalyzed.current = true;

    analyzeImage();
  }, []);

  /* ========================================================= */
  /* VIEW RESULT                                               */
  /* ========================================================= */

  const handleViewResult = () => {
    if (loading || error) {
      return;
    }

    navigate("/compliance-result");
  };

  /* ========================================================= */
  /* RETRY                                                     */
  /* ========================================================= */

  const handleRetry = () => {
    hasAnalyzed.current = true;

    analyzeImage();
  };

  /* ========================================================= */
  /* RENDER                                                     */
  /* ========================================================= */

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="max-w-5xl mx-auto">

        {/* =================================================== */}
        {/* HEADER                                               */}
        {/* =================================================== */}

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-slate-900">
            Label Analysis
          </h1>

          <p className="text-slate-500 mt-2">
            AI-powered analysis of your product label for Legal
            Metrology compliance.
          </p>

        </div>

        {/* =================================================== */}
        {/* ERROR                                                */}
        {/* =================================================== */}

        {error && (

          <div className="mb-6 p-5 rounded-xl bg-red-50 border border-red-200">

            <div className="flex items-start gap-3">

              <AlertCircle
                size={22}
                className="text-red-600 mt-0.5 shrink-0"
              />

              <div>

                <p className="font-semibold text-red-700">
                  Analysis Failed
                </p>

                <p className="text-sm text-red-600 mt-1">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={handleRetry}
                  className="mt-4 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition"
                >
                  Try Again
                </button>

              </div>

            </div>

          </div>

        )}

        {/* =================================================== */}
        {/* ANALYSIS CARD                                        */}
        {/* =================================================== */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">

          {/* ================================================= */}
          {/* UPLOADED IMAGE                                     */}
          {/* ================================================= */}

          {inspection?.images?.length > 0 && (

            <div className="mb-8">

              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Uploaded Label
              </h2>

              <div className="flex justify-center bg-slate-50 rounded-xl border border-slate-200 p-4">

                <img
                  src={inspection.images[0].preview}
                  alt="Uploaded product label"
                  className="max-h-72 max-w-full object-contain rounded-lg"
                />

              </div>

              <p className="text-sm text-slate-500 mt-3 text-center">
                {inspection.images[0].name}
              </p>

            </div>

          )}

          {/* ================================================= */}
          {/* ANALYSIS STATUS                                    */}
          {/* ================================================= */}

          <div className="mb-8">

            <div className="flex items-center justify-between mb-3">

              <div className="flex items-center gap-3">

                {loading ? (

                  <Loader2
                    size={22}
                    className="text-blue-600 animate-spin"
                  />

                ) : error ? (

                  <AlertCircle
                    size={22}
                    className="text-red-600"
                  />

                ) : (

                  <CheckCircle2
                    size={22}
                    className="text-green-600"
                  />

                )}

                <div>

                  <h2 className="font-semibold text-slate-900">

                    {loading
                      ? "Analyzing Label..."
                      : error
                      ? "Analysis Failed"
                      : "Analysis Complete"}

                  </h2>

                  <p className="text-sm text-slate-500 mt-1">

                    {loading
                      ? "OCR and compliance rules are being processed."
                      : error
                      ? "Please check the error above and try again."
                      : "Your label has been analyzed successfully."}

                  </p>

                </div>

              </div>

              <span className="text-sm font-semibold text-slate-700">
                {progress}%
              </span>

            </div>

            {/* Progress Bar */}

            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">

              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                }}
              />

            </div>

          </div>

          {/* ================================================= */}
          {/* PIPELINE                                           */}
          {/* ================================================= */}

          <div className="space-y-4 mb-8">

            {/* OCR */}

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">

              <div className="flex items-center gap-3">

                {progress >= 40 ? (

                  <CheckCircle2
                    size={20}
                    className="text-green-600"
                  />

                ) : (

                  <Loader2
                    size={20}
                    className="text-blue-600 animate-spin"
                  />

                )}

                <div>

                  <p className="font-medium text-slate-900">
                    OCR Text Extraction
                  </p>

                  <p className="text-xs text-slate-500">
                    Extracting text from the product label
                  </p>

                </div>

              </div>

              <span className="text-xs font-medium text-slate-500">

                {progress >= 40
                  ? "Completed"
                  : "Processing"}

              </span>

            </div>

            {/* Rule Engine */}

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">

              <div className="flex items-center gap-3">

                {progress >= 90 ? (

                  <CheckCircle2
                    size={20}
                    className="text-green-600"
                  />

                ) : (

                  <Loader2
                    size={20}
                    className="text-blue-600 animate-spin"
                  />

                )}

                <div>

                  <p className="font-medium text-slate-900">
                    Legal Metrology Rule Engine
                  </p>

                  <p className="text-xs text-slate-500">
                    Checking mandatory declarations
                  </p>

                </div>

              </div>

              <span className="text-xs font-medium text-slate-500">

                {progress >= 90
                  ? "Completed"
                  : "Processing"}

              </span>

            </div>

            {/* Compliance Report */}

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">

              <div className="flex items-center gap-3">

                {progress >= 100 ? (

                  <CheckCircle2
                    size={20}
                    className="text-green-600"
                  />

                ) : (

                  <Loader2
                    size={20}
                    className="text-blue-600 animate-spin"
                  />

                )}

                <div>

                  <p className="font-medium text-slate-900">
                    Compliance Report
                  </p>

                  <p className="text-xs text-slate-500">
                    Generating the final compliance result
                  </p>

                </div>

              </div>

              <span className="text-xs font-medium text-slate-500">

                {progress >= 100
                  ? "Completed"
                  : "Waiting"}

              </span>

            </div>

          </div>

          {/* ================================================= */}
          {/* RESULT BUTTON                                      */}
          {/* ================================================= */}

          <div className="flex justify-end">

            <button
              type="button"
              onClick={handleViewResult}
              disabled={loading || Boolean(error)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-medium transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >

              {loading
                ? "Analyzing..."
                : "View Compliance Result"}

              <ArrowRight size={19} />

            </button>

          </div>

        </div>

      </div>
    </main>
  );
};

export default Analysis;
