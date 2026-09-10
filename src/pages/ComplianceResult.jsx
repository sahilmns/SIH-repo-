import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  ShieldCheck,
  Package,
  ArrowRight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useInspection } from "../context/InspectionContext";

function ComplianceResult() {
  const navigate = useNavigate();
  const { inspection } = useInspection();

  const result = inspection?.complianceResult;
  const report = result?.compliance_report;

  // No result available
  if (!report) {
    return (
      <main className="p-6 md:p-8 bg-[#F6F8FC] min-h-screen">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate("/analysis")}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors mb-6"
          >
            <ArrowLeft size={17} />
            Back to Analysis
          </button>

          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
            <AlertTriangle
              size={45}
              className="text-amber-500 mx-auto mb-4"
            />

            <h1 className="text-2xl font-bold text-slate-900">
              No Analysis Result Available
            </h1>

            <p className="text-slate-500 mt-2">
              Please upload and analyze a label before viewing the compliance
              result.
            </p>

            <button
              onClick={() => navigate("/analysis")}
              className="mt-6 px-5 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
            >
              Go to Analysis
            </button>
          </div>
        </div>
      </main>
    );
  }

  const summary = report.summary || {};
  const checks = report.checks || [];

  const totalChecks = summary.total_checks || checks.length;
  const passedChecks = summary.passed || 0;

  // PARTIAL is considered a review item, not a passed check
  const reviewChecks = checks.filter(
    (check) => check.status === "PARTIAL"
  ).length;

  const failedChecks = checks.filter(
    (check) => check.status === "VIOLATION"
  ).length;

  const compliancePercentage = report.compliance_percentage ?? 0;

  const overallStatus = report.status || "NON-COMPLIANT";

  const productName =
    inspection?.productName ||
    getCheckValue(checks, "Product Name") ||
    "Not detected";

  const brandName =
    inspection?.brandName ||
    "Not detected";

  const netQuantity =
    inspection?.netQuantity ||
    getCheckValue(checks, "Net Quantity") ||
    "Not detected";

  const mrp =
    inspection?.mrp ||
    getCheckValue(checks, "MRP") ||
    "Not detected";

  const manufacturer =
    getCheckValue(
      checks,
      "Manufacturer / Packer / Importer"
    ) || "Not detected";

  const consumerCare =
    getCheckValue(
      checks,
      "Consumer Care"
    ) || "Not detected";

  const imageCount = inspection?.images?.length || 0;

  const averageConfidence = calculateAverageConfidence(checks);

  const isCompliant = overallStatus === "COMPLIANT";

  return (
    <main className="p-4 sm:p-6 lg:p-8 bg-[#F6F8FC] min-h-[calc(100vh-80px)]">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate("/analysis")}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors mb-4"
          >
            <ArrowLeft size={17} />
            Back to Analysis
          </button>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">
                LabelLens Inspection
              </p>

              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Compliance Result
              </h1>

              <p className="text-sm sm:text-base text-slate-500 mt-2">
                AI-assisted assessment of the packaged commodity.
              </p>
            </div>

            {/* Overall Status */}
            <div
              className={`flex items-center gap-3 px-4 sm:px-5 py-3 rounded-xl self-start lg:self-auto ${
                isCompliant
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              {isCompliant ? (
                <CheckCircle2
                  size={22}
                  className="text-green-600 shrink-0"
                />
              ) : (
                <AlertTriangle
                  size={22}
                  className="text-red-600 shrink-0"
                />
              )}

              <div>
                <p
                  className={`text-sm font-semibold ${
                    isCompliant
                      ? "text-green-800"
                      : "text-red-800"
                  }`}
                >
                  {overallStatus}
                </p>

                <p
                  className={`text-xs ${
                    isCompliant
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  Based on current automated checks
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 mb-6">

          {/* Passed */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Passed Checks
                </p>

                <h2 className="text-3xl font-bold text-green-600 mt-2">
                  {passedChecks}
                </h2>
              </div>

              <div className="w-11 h-11 shrink-0 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>

          {/* Review */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Needs Review
                </p>

                <h2 className="text-3xl font-bold text-amber-500 mt-2">
                  {reviewChecks}
                </h2>
              </div>

              <div className="w-11 h-11 shrink-0 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangle size={22} />
              </div>
            </div>
          </div>

          {/* Violations */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm sm:col-span-2 md:col-span-1">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Potential Violations
                </p>

                <h2 className="text-3xl font-bold text-red-600 mt-2">
                  {failedChecks}
                </h2>
              </div>

              <div className="w-11 h-11 shrink-0 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <XCircle size={22} />
              </div>
            </div>
          </div>

        </section>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Left - Product + Findings */}
          <section className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-7">

            {/* Extracted Information */}
            <div className="flex items-center gap-3 mb-6">

              <div className="w-11 h-11 shrink-0 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Package size={22} />
              </div>

              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  Extracted Product Information
                </h2>

                <p className="text-sm text-slate-500">
                  Information detected from the package image
                </p>
              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <InfoCard
                label="Product Name"
                value={productName}
              />

              <InfoCard
                label="Brand"
                value={brandName}
              />

              <InfoCard
                label="Net Quantity"
                value={netQuantity}
              />

              <InfoCard
                label="Maximum Retail Price"
                value={mrp}
              />

              <InfoCard
                label="Manufacturer / Packer / Importer"
                value={manufacturer}
              />

              <InfoCard
                label="Consumer Care"
                value={consumerCare}
              />

            </div>

            {/* Compliance Findings */}
            <div className="mt-8">

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Compliance Findings
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Results returned by the Legal Metrology Rule Engine
                  </p>
                </div>

                <span className="self-start text-xs font-medium px-3 py-1.5 rounded-full bg-blue-50 text-blue-700">
                  {totalChecks} checks
                </span>

              </div>

              <div className="space-y-3">

                {checks.map((check, index) => (
                  <ComplianceCheck
                    key={`${check.name}-${index}`}
                    check={check}
                  />
                ))}

              </div>

            </div>
          </section>

          {/* Right - Summary */}
          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-7">

            <div className="flex items-center gap-3 mb-6">

              <div className="w-11 h-11 shrink-0 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                <ShieldCheck size={22} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Inspection Summary
                </h2>

                <p className="text-sm text-slate-500">
                  Automated analysis overview
                </p>
              </div>

            </div>

            {/* Compliance Percentage */}
            <div
              className={`p-5 rounded-2xl text-center border ${
                isCompliant
                  ? "bg-green-50 border-green-200"
                  : "bg-amber-50 border-amber-200"
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  isCompliant
                    ? "text-green-700"
                    : "text-amber-700"
                }`}
              >
                MVP Declaration Compliance
              </p>

              <p
                className={`text-4xl font-bold mt-2 ${
                  isCompliant
                    ? "text-green-600"
                    : "text-amber-600"
                }`}
              >
                {compliancePercentage}%
              </p>

              <p
                className={`text-xs mt-2 ${
                  isCompliant
                    ? "text-green-700"
                    : "text-amber-700"
                }`}
              >
                {passedChecks} of {totalChecks} checks passed
              </p>
            </div>

            {/* Inspection Details */}
            <div className="mt-6 space-y-4">

              <SummaryRow
                label="Images analyzed"
                value={imageCount}
              />

              <SummaryRow
                label="Checks performed"
                value={totalChecks}
              />

              <SummaryRow
                label="Passed"
                value={passedChecks}
              />

              <SummaryRow
                label="Needs review"
                value={reviewChecks}
              />

              <SummaryRow
                label="Potential violations"
                value={failedChecks}
              />

              <SummaryRow
                label="Average OCR confidence"
                value={
                  averageConfidence !== null
                    ? `${averageConfidence}%`
                    : "N/A"
                }
              />

            </div>

            {/* Important Note */}
            <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200">

              <p className="text-xs font-semibold text-slate-700 mb-1">
                Important
              </p>

              <p className="text-xs text-slate-500 leading-relaxed">
                This is an automated preliminary assessment. Final legal
                verification should be performed by the authorized inspector.
              </p>

            </div>

            {/* Evidence */}
            <button
              onClick={() => navigate("/evidence-review")}
              className="w-full mt-7 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-blue-200 text-blue-600 font-medium hover:bg-blue-50 transition"
            >
              <Eye size={18} />
              Review Evidence
            </button>

            {/* Verification */}
            <button
              onClick={() => navigate("/evidence-review")}
              className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
            >
              Proceed to Verification
              <ArrowRight size={18} />
            </button>

          </section>

        </div>
      </div>
    </main>
  );
}


/* ------------------------------------------------ */
/* Helper: Product Information Card                 */
/* ------------------------------------------------ */

function InfoCard({ label, value }) {
  return (
    <div className="p-4 rounded-xl bg-slate-50">

      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="font-semibold text-slate-900 mt-1 break-words">
        {value || "Not detected"}
      </p>

    </div>
  );
}


/* ------------------------------------------------ */
/* Helper: Summary Row                              */
/* ------------------------------------------------ */

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="text-sm font-medium text-slate-900">
        {value}
      </span>
    </div>
  );
}


/* ------------------------------------------------ */
/* Helper: Compliance Check                         */
/* ------------------------------------------------ */

function ComplianceCheck({ check }) {
  const isPass = check.status === "PASS";
  const isPartial = check.status === "PARTIAL";

  const statusText = isPass
    ? "Verified"
    : isPartial
    ? "Needs Review"
    : "Potential Violation";

  const statusClass = isPass
    ? "text-green-600"
    : isPartial
    ? "text-amber-600"
    : "text-red-600";

  const containerClass = isPass
    ? "border-green-200 bg-green-50/40"
    : isPartial
    ? "border-amber-200 bg-amber-50/40"
    : "border-red-200 bg-red-50/40";

  return (
    <div
      className={`border rounded-xl p-4 ${containerClass}`}
    >
      <div className="flex items-start gap-3">

        {/* Icon */}
        {isPass ? (
          <CheckCircle2
            size={20}
            className="text-green-600 mt-0.5 shrink-0"
          />
        ) : isPartial ? (
          <AlertTriangle
            size={20}
            className="text-amber-600 mt-0.5 shrink-0"
          />
        ) : (
          <XCircle
            size={20}
            className="text-red-600 mt-0.5 shrink-0"
          />
        )}

        <div className="flex-1 min-w-0">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

            <h3 className="font-semibold text-slate-900">
              {check.name}
            </h3>

            <span className={`text-xs font-medium ${statusClass}`}>
              {statusText}
            </span>

          </div>

          <p className="text-sm text-slate-500 mt-1 break-words">
            {check.value || "No value detected"}
          </p>

          {check.confidence !== null &&
            check.confidence !== undefined && (
              <p className="text-xs text-slate-400 mt-2">
                OCR Confidence:{" "}
                {(Number(check.confidence) * 100).toFixed(1)}%
              </p>
            )}

        </div>
      </div>
    </div>
  );
}


/* ------------------------------------------------ */
/* Helper: Get Check Value                          */
/* ------------------------------------------------ */

function getCheckValue(checks, checkName) {
  const check = checks.find(
    (item) => item.name === checkName
  );

  if (!check) {
    return null;
  }

  return check.value || null;
}


/* ------------------------------------------------ */
/* Helper: Average Confidence                       */
/* ------------------------------------------------ */

function calculateAverageConfidence(checks) {
  const confidenceValues = checks
    .map((check) => check.confidence)
    .filter(
      (confidence) =>
        confidence !== null &&
        confidence !== undefined &&
        !Number.isNaN(Number(confidence))
    )
    .map((confidence) => Number(confidence));

  if (confidenceValues.length === 0) {
    return null;
  }

  const average =
    confidenceValues.reduce(
      (sum, value) => sum + value,
      0
    ) / confidenceValues.length;

  return (average * 100).toFixed(1);
}


export default ComplianceResult;
