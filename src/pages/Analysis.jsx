import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInspection } from "../context/InspectionContext";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";

const Analysis = () => {
  const navigate = useNavigate();
  const { inspection, updateInspection } = useInspection();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  // Prevent duplicate API calls during React development/StrictMode
  const hasAnalyzed = useRef(false);

  useEffect(() => {
    if (hasAnalyzed.current) {
      return;
    }

    hasAnalyzed.current = true;
    analyzeImage();
  }, []);

  const analyzeImage = async () => {
    try {
      setLoading(true);
      setError(null);
      setProgress(10);

      // Check whether an image was uploaded
      if (!inspection.images || inspection.images.length === 0) {
        throw new Error("No image uploaded. Please upload a label image first.");
      }

      // Get the first uploaded image
      const imageFile = inspection.images[0].file;

      if (!imageFile) {
        throw new Error("Unable to access the uploaded image.");
      }

      setProgress(25);

      // Create FormData for FastAPI
      const formData = new FormData();
      formData.append("file", imageFile);

      setProgress(40);

      // Send image to FastAPI backend
      const response = await fetch(
        "http://127.0.0.1:8000/analyze-label",
        {
          method: "POST",
          body: formData,
        }
      );

      setProgress(70);

      // Check HTTP response
      if (!response.ok) {
        throw new Error(
          `Backend analysis failed. Server returned ${response.status}.`
        );
      }

      const result = await response.json();

      console.log("Backend result:", result);

      // Backend itself returned an error
      if (result.status === "ERROR") {
        throw new Error(result.message || "Analysis failed.");
      }

      setProgress(90);

      // Save backend result in global InspectionContext
      updateInspection({
        analysis: result,
        complianceResult: result,
      });

      setProgress(100);
      setLoading(false);
    } catch (err) {
      console.error("Analysis error:", err);

      setError(
        err.message || "Something went wrong while analyzing the label."
      );

      setLoading(false);
    }
  };

  const handleViewResult = () => {
    navigate("/compliance-result");
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Label Analysis
          </h1>

          <p className="text-slate-500 mt-2">
            AI-powered analysis of your product label for Legal Metrology
            compliance.
          </p>
        </div>

        {/* Error */}
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
                  onClick={() => {
                    hasAnalyzed.current = false;
                    analyzeImage();
                  }}
                  className="mt-4 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
          {/* Uploaded Image */}
          {inspection.images && inspection.images.length > 0 && (
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

          {/* Analysis Status */}
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
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Pipeline */}
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
                {progress >= 40 ? "Completed" : "Processing"}
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
                {progress >= 90 ? "Completed" : "Processing"}
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
                {progress >= 100 ? "Completed" : "Waiting"}
              </span>
            </div>
          </div>

          {/* Result Button */}
          <div className="flex justify-end">
            <button
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
