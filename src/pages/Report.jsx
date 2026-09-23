import {
  ArrowLeft,
  Download,
  FileText,
  Printer,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  UserCheck,
  CalendarDays,
  MapPin,
  Package,
  Search,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useInspection } from "../context/InspectionContext";

function getStatusLabel(status) {
  const normalized = String(status || "").toUpperCase();

  if (normalized === "PASS") {
    return "VERIFIED";
  }

  if (
    normalized === "PARTIAL" ||
    normalized === "UNCERTAIN" ||
    normalized === "NEEDS REVIEW" ||
    normalized === "REQUIRES_ADDITIONAL_IMAGE"
  ) {
    return "NEEDS REVIEW";
  }

  return "VIOLATION";
}

function getStatusClasses(status) {
  const normalized = String(status || "").toUpperCase();

  if (normalized === "PASS") {
    return {
      container: "border-green-200 bg-green-50",
      icon: "text-green-600",
      badge: "text-green-700 bg-green-100",
    };
  }

  if (
    normalized === "PARTIAL" ||
    normalized === "UNCERTAIN" ||
    normalized === "NEEDS REVIEW" ||
    normalized === "REQUIRES_ADDITIONAL_IMAGE"
  ) {
    return {
      container: "border-amber-200 bg-amber-50",
      icon: "text-amber-600",
      badge: "text-amber-700 bg-amber-100",
    };
  }

  return {
    container: "border-red-200 bg-red-50",
    icon: "text-red-600",
    badge: "text-red-700 bg-red-100",
  };
}

function formatConfidence(confidence) {
  const value = Number(confidence);

  if (!Number.isFinite(value)) {
    return null;
  }

  const percentage = value <= 1 ? value * 100 : value;

  return `${Math.max(0, Math.min(100, Math.round(percentage)))}%`;
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "Not recorded";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return String(dateValue);
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getFinalStatus(report) {
  const status = String(report?.status || "").toUpperCase();

  if (status === "PASS" || status === "COMPLIANT") {
    return "COMPLIANT";
  }

  if (
    status === "PARTIAL" ||
    status === "UNCERTAIN" ||
    status === "NEEDS REVIEW" ||
    status === "REQUIRES_ADDITIONAL_IMAGE"
  ) {
    return "NEEDS REVIEW";
  }

  if (
    status === "VIOLATION" ||
    status === "FAIL" ||
    status === "FAILED" ||
    status === "NON-COMPLIANT"
  ) {
    return "NON-COMPLIANT";
  }

  return "NEEDS REVIEW";
}

function FinalStatusIcon({ status }) {
  if (status === "COMPLIANT") {
    return (
      <div className="w-14 h-14 shrink-0 rounded-full bg-green-100 flex items-center justify-center">
        <CheckCircle2 size={28} className="text-green-600" />
      </div>
    );
  }

  if (status === "NON-COMPLIANT") {
    return (
      <div className="w-14 h-14 shrink-0 rounded-full bg-red-100 flex items-center justify-center">
        <AlertTriangle size={28} className="text-red-600" />
      </div>
    );
  }

  return (
    <div className="w-14 h-14 shrink-0 rounded-full bg-amber-100 flex items-center justify-center">
      <AlertTriangle size={28} className="text-amber-600" />
    </div>
  );
}

function Report() {
  const navigate = useNavigate();
  const { inspection } = useInspection();

  const result = inspection?.complianceResult;
  const report = result?.compliance_report;

  const summary = report?.summary || {};

  const checks = Array.isArray(report?.checks)
    ? report.checks
    : [];

  const finalStatus = getFinalStatus(report);

  const productName =
    inspection?.productName ||
    result?.product_name ||
    result?.productName ||
    "Not detected";

  const brandName =
    inspection?.brandName ||
    result?.brand_name ||
    result?.brandName ||
    "Not available";

  const category =
    inspection?.category ||
    result?.category ||
    "Not available";

  const netQuantity =
    inspection?.netQuantity ||
    result?.net_quantity ||
    result?.netQuantity ||
    checks.find(
      (check) =>
        String(check?.name || "")
          .toLowerCase()
          .includes("net quantity")
    )?.value ||
    "Not detected";

  const mrp =
    inspection?.mrp ||
    result?.mrp ||
    checks.find(
      (check) =>
        String(check?.name || "")
          .toLowerCase()
          .includes("mrp")
    )?.value ||
    "Not detected";

  const inspectionId =
    inspection?.inspectionCode ||
    inspection?.backendInspectionId ||
    inspection?.id ||
    "Not assigned";

  const reportId = inspection?.reportId || `ND-RPT-${inspectionId}`;

  const image = inspection?.images?.[0];

  const imagePreview =
    image?.preview ||
    (typeof image === "string" ? image : null);

  const inspectionDate =
    inspection?.createdAt ||
    inspection?.created_at ||
    result?.created_at;

  const passedChecks = Number.isFinite(Number(summary.passed))
    ? Number(summary.passed)
    : checks.filter(
        (check) =>
          String(check?.status || "").toUpperCase() === "PASS"
      ).length;

  const failedChecks = Number.isFinite(Number(summary.failed))
    ? Number(summary.failed)
    : checks.filter((check) =>
        ["VIOLATION", "FAIL", "FAILED", "NON-COMPLIANT"].includes(
          String(check?.status || "").toUpperCase()
        )
      ).length;

  const partialChecks = Number.isFinite(Number(summary.partial))
    ? Number(summary.partial)
    : checks.filter((check) =>
        [
          "PARTIAL",
          "UNCERTAIN",
          "NEEDS REVIEW",
          "REQUIRES_ADDITIONAL_IMAGE",
        ].includes(String(check?.status || "").toUpperCase())
      ).length;

  const totalChecks = Number.isFinite(Number(summary.total_checks))
    ? Number(summary.total_checks)
    : checks.length;

  const compliancePercentage =
    report?.compliance_percentage !== undefined &&
    report?.compliance_percentage !== null
      ? Number(report.compliance_percentage)
      : null;

  const averageConfidence =
    result?.inspection?.average_ocr_confidence ??
    inspection?.averageOcrConfidence ??
    null;

  const handleDownload = () => {
    window.print();
  };

  return (
    <main className="p-4 sm:p-6 lg:p-8 bg-[#F6F8FC] min-h-[calc(100vh-80px)]">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">

        <div>

          <button
            onClick={() => navigate("/evidence-review")}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mb-3"
          >
            <ArrowLeft size={17} />
            Back to Evidence Review
          </button>

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 shrink-0 rounded-xl bg-blue-100 flex items-center justify-center">
              <FileText
                className="text-blue-600"
                size={23}
              />
            </div>

            <div>

              <h1 className="text-2xl font-bold text-slate-900">
                Inspection Report
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                Inspection record generated by NiyamDrishti
              </p>

            </div>

          </div>

        </div>


        {/* Report ID */}
        <div className="text-left lg:text-right">

          <p className="text-xs text-slate-400 uppercase tracking-wide">
            Report ID
          </p>

          <p className="font-semibold text-slate-800 break-all">
            {reportId}
          </p>

        </div>

      </div>


      {/* Final Status */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 mb-6 shadow-sm">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

          <div className="flex items-start sm:items-center gap-4">

            <FinalStatusIcon status={finalStatus} />

            <div>

              <p className="text-sm text-slate-500">
                Final Inspection Assessment
              </p>

              <h2
                className={`text-lg sm:text-xl font-bold mt-1 ${
                  finalStatus === "COMPLIANT"
                    ? "text-green-600"
                    : finalStatus === "NON-COMPLIANT"
                    ? "text-red-600"
                    : "text-amber-600"
                }`}
              >
                {finalStatus}
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Based on the current compliance analysis
              </p>

            </div>

          </div>


          <div className="flex flex-col sm:flex-row gap-3">

            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Printer size={17} />
              Print
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700"
            >
              <Download size={17} />
              Download / Print PDF
            </button>

          </div>

        </div>

      </div>


      {/* Compliance Summary */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 mb-6 shadow-sm">

        <div className="flex items-center gap-2 mb-5">

          <ShieldCheck
            size={20}
            className="text-blue-600"
          />

          <h2 className="font-bold text-lg text-slate-900">
            Compliance Summary
          </h2>

        </div>


        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase">
              Total Checks
            </p>

            <p className="text-2xl font-bold text-slate-900 mt-1">
              {totalChecks}
            </p>
          </div>


          <div className="bg-green-50 rounded-xl p-4">
            <p className="text-xs text-green-600 uppercase">
              Passed
            </p>

            <p className="text-2xl font-bold text-green-700 mt-1">
              {passedChecks}
            </p>
          </div>


          <div className="bg-amber-50 rounded-xl p-4">
            <p className="text-xs text-amber-600 uppercase">
              Needs Review
            </p>

            <p className="text-2xl font-bold text-amber-700 mt-1">
              {partialChecks}
            </p>
          </div>


          <div className="bg-red-50 rounded-xl p-4">
            <p className="text-xs text-red-600 uppercase">
              Violations
            </p>

            <p className="text-2xl font-bold text-red-700 mt-1">
              {failedChecks}
            </p>
          </div>

        </div>


        {compliancePercentage !== null &&
          Number.isFinite(compliancePercentage) && (
            <div className="mt-5">

              <div className="flex items-center justify-between mb-2">

                <p className="text-sm font-medium text-slate-700">
                  Compliance Percentage
                </p>

                <p className="text-sm font-bold text-slate-900">
                  {Math.round(compliancePercentage)}%
                </p>

              </div>

              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">

                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{
                    width: `${Math.max(
                      0,
                      Math.min(100, compliancePercentage)
                    )}%`,
                  }}
                />

              </div>

            </div>
          )}

      </div>


      {/* Product Information */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 mb-6 shadow-sm">

        <div className="flex items-center gap-2 mb-5">

          <Package
            size={20}
            className="text-blue-600"
          />

          <h2 className="font-bold text-lg text-slate-900">
            Product Information
          </h2>

        </div>


        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">

          <div>
            <p className="text-xs text-slate-400 uppercase">
              Product Name
            </p>

            <p className="font-semibold text-slate-800 mt-1 break-words">
              {productName}
            </p>
          </div>


          <div>
            <p className="text-xs text-slate-400 uppercase">
              Brand
            </p>

            <p className="font-semibold text-slate-800 mt-1 break-words">
              {brandName}
            </p>
          </div>


          <div>
            <p className="text-xs text-slate-400 uppercase">
              Category
            </p>

            <p className="font-semibold text-slate-800 mt-1 break-words">
              {category}
            </p>
          </div>


          <div>
            <p className="text-xs text-slate-400 uppercase">
              Net Quantity
            </p>

            <p className="font-semibold text-slate-800 mt-1">
              {netQuantity}
            </p>
          </div>


          <div>
            <p className="text-xs text-slate-400 uppercase">
              Declared MRP
            </p>

            <p className="font-semibold text-slate-800 mt-1">
              {String(mrp).startsWith("₹")
                ? String(mrp)
                : `₹${mrp}`}
            </p>
          </div>


          <div>
            <p className="text-xs text-slate-400 uppercase">
              Inspection ID
            </p>

            <p className="font-semibold text-slate-800 mt-1 break-all">
              {inspectionId}
            </p>
          </div>

        </div>

      </div>


      {/* Inspection Details */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 mb-6 shadow-sm">

        <h2 className="font-bold text-lg text-slate-900 mb-5">
          Inspection Details
        </h2>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 shrink-0 rounded-lg bg-blue-50 flex items-center justify-center">
              <CalendarDays
                size={19}
                className="text-blue-600"
              />
            </div>

            <div>

              <p className="text-xs text-slate-400">
                Inspection Date
              </p>

              <p className="text-sm font-semibold text-slate-800">
                {formatDate(inspectionDate)}
              </p>

            </div>

          </div>


          <div className="flex items-center gap-3">

            <div className="w-10 h-10 shrink-0 rounded-lg bg-blue-50 flex items-center justify-center">
              <UserCheck
                size={19}
                className="text-blue-600"
              />
            </div>

            <div>

              <p className="text-xs text-slate-400">
                Inspector
              </p>

              <p className="text-sm font-semibold text-slate-800">
                {inspection?.inspectorName || "Enforcement Officer"}
              </p>

            </div>

          </div>


          <div className="flex items-center gap-3">

            <div className="w-10 h-10 shrink-0 rounded-lg bg-blue-50 flex items-center justify-center">
              <MapPin
                size={19}
                className="text-blue-600"
              />
            </div>

            <div>

              <p className="text-xs text-slate-400">
                Inspection Location
              </p>

              <p className="text-sm font-semibold text-slate-800">
                {inspection?.locationName || "Retail Inspection"}
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* Findings */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 mb-6 shadow-sm">

        <div className="flex items-center gap-2 mb-5">

          <Search
            size={20}
            className="text-blue-600"
          />

          <h2 className="font-bold text-lg text-slate-900">
            Compliance Findings
          </h2>

        </div>


        <div className="space-y-4">

          {checks.length === 0 ? (

            <div className="text-center py-10 text-slate-500">
              No compliance findings available.
            </div>

          ) : (

            checks.map((check, index) => {

              const status =
                String(check?.status || "").toUpperCase();

              const classes = getStatusClasses(status);

              const statusLabel = getStatusLabel(status);

              const confidence =
                formatConfidence(check?.confidence);

              return (
                <div
                  key={
                    check?.rule_code ||
                    check?.name ||
                    index
                  }
                  className={`border rounded-xl p-4 ${classes.container}`}
                >

                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">

                    <div className="flex gap-3">

                      {status === "PASS" ? (
                        <CheckCircle2
                          size={21}
                          className={`${classes.icon} mt-0.5 shrink-0`}
                        />
                      ) : status === "PARTIAL" ||
                        status === "UNCERTAIN" ||
                        status === "NEEDS REVIEW" ||
                        status === "REQUIRES_ADDITIONAL_IMAGE" ? (
                        <ShieldCheck
                          size={21}
                          className={`${classes.icon} mt-0.5 shrink-0`}
                        />
                      ) : (
                        <AlertTriangle
                          size={21}
                          className={`${classes.icon} mt-0.5 shrink-0`}
                        />
                      )}

                      <div>

                        <h3 className="font-semibold text-slate-900">
                          {check?.name ||
                            check?.rule_name ||
                            `Compliance Check ${index + 1}`}
                        </h3>

                        <p className="text-sm text-slate-600 mt-1">
                          {check?.value !== undefined &&
                          check?.value !== null &&
                          String(check.value).trim() !== ""
                            ? `Detected value: ${check.value}`
                            : "No value was detected for this declaration."}
                        </p>

                        {check?.source_text && (
                          <p className="text-xs text-slate-500 mt-2">
                            OCR evidence: {check.source_text}
                          </p>
                        )}

                        {confidence && (
                          <p className="text-xs text-slate-500 mt-2">
                            OCR confidence: {confidence}
                          </p>
                        )}

                      </div>

                    </div>


                    <span
                      className={`self-start text-xs font-semibold px-3 py-1 rounded-full ${classes.badge}`}
                    >
                      {statusLabel}
                    </span>

                  </div>

                </div>
              );
            })

          )}

        </div>

      </div>


      {/* Evidence */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 mb-6 shadow-sm">

        <h2 className="font-bold text-lg text-slate-900 mb-5">
          Inspection Evidence
        </h2>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="min-h-64 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden">

            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Inspection evidence"
                className="w-full h-64 object-contain"
              />
            ) : (
              <div className="text-center p-6">

                <Package
                  size={42}
                  className="mx-auto text-slate-400 mb-3"
                />

                <p className="font-medium text-slate-600">
                  Package Image
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Evidence image preview unavailable
                </p>

              </div>
            )}

          </div>


          <div className="space-y-4">

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">

              <p className="text-xs font-semibold text-blue-600 uppercase">
                Inspection Result
              </p>

              <p className="font-semibold text-slate-900 mt-2">
                {finalStatus}
              </p>

              <p className="text-sm text-slate-600 mt-1">
                The result shown here is based on the compliance
                analysis returned by NiyamDrishti.
              </p>

            </div>


            {averageConfidence !== null &&
              averageConfidence !== undefined && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">

                  <p className="text-xs font-semibold text-slate-500 uppercase">
                    Average OCR Confidence
                  </p>

                  <p className="text-lg font-bold text-slate-900 mt-2">
                    {formatConfidence(averageConfidence)}
                  </p>

                </div>
              )}

          </div>

        </div>

      </div>


      {/* Inspector Verification */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 mb-6 shadow-sm">

        <div className="flex items-center gap-3 mb-5">

          <div className="w-10 h-10 shrink-0 rounded-lg bg-green-100 flex items-center justify-center">
            <UserCheck
              size={20}
              className="text-green-600"
            />
          </div>

          <div>

            <h2 className="font-bold text-lg text-slate-900">
              Inspection Record
            </h2>

            <p className="text-sm text-slate-500">
              Current inspection information
            </p>

          </div>

        </div>


        <div className="bg-slate-50 rounded-xl p-4">

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            <div>

              <p className="text-xs text-slate-400 uppercase">
                Status
              </p>

              <p className="font-semibold text-slate-800 mt-1">
                {inspection?.inspectionStatus || finalStatus}
              </p>

            </div>


            <div>

              <p className="text-xs text-slate-400 uppercase">
                Inspection ID
              </p>

              <p className="font-semibold text-slate-800 mt-1 break-all">
                {inspectionId}
              </p>

            </div>


            <div>

              <p className="text-xs text-slate-400 uppercase">
                Inspection Type
              </p>

              <p className="font-semibold text-slate-800 mt-1">
                {inspection?.inspectionType || "Physical"}
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* Bottom Actions */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-8">

        <button
          onClick={() => navigate("/new-inspection")}
          className="w-full sm:w-auto px-5 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Start New Inspection
        </button>


        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">

          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 px-5 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <FileText size={17} />
            Export / Print
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700"
          >
            <Download size={17} />
            Download Report
          </button>

        </div>

      </div>


      {/* Disclaimer */}
      <div className="border-t border-slate-200 pt-5 pb-4">

        <p className="text-xs text-slate-400 text-center leading-relaxed">
          NiyamDrishti provides AI-assisted compliance analysis.
          Final legal decisions and enforcement actions remain
          the responsibility of the authorized enforcement
          authority.
        </p>

      </div>

    </main>
  );
}

export default Report;
