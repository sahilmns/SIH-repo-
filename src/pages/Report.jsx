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

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import { useInspection } from "../context/InspectionContext";


// ============================================================
// API
// ============================================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";


// ============================================================
// STATUS HELPERS
// ============================================================

function normalizeStatus(status) {
  const value = String(status || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  if (
    [
      "PASS",
      "PASSED",
      "COMPLIANT",
      "VERIFIED_COMPLIANT",
      "COMPLIANT_WITH_ALL_CHECKS",
    ].includes(value)
  ) {
    return "COMPLIANT";
  }

  if (
    [
      "VIOLATION",
      "VIOLATIONS",
      "FAIL",
      "FAILED",
      "NON_COMPLIANT",
    ].includes(value)
  ) {
    return "VIOLATION";
  }

  return "REVIEW";
}


function getStatusLabel(status) {
  const normalized = normalizeStatus(status);

  if (normalized === "COMPLIANT") {
    return "VERIFIED";
  }

  if (normalized === "VIOLATION") {
    return "VIOLATION";
  }

  return "NEEDS REVIEW";
}


function getStatusClasses(status) {
  const normalized = normalizeStatus(status);

  if (normalized === "COMPLIANT") {
    return {
      container: "border-green-200 bg-green-50",
      icon: "text-green-600",
      badge: "text-green-700 bg-green-100",
    };
  }

  if (normalized === "REVIEW") {
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


function getFinalStatus(report) {
  return normalizeStatus(report?.status);
}


function FinalStatusIcon({ status }) {
  const normalized = normalizeStatus(status);

  if (normalized === "COMPLIANT") {
    return (
      <div className="w-14 h-14 shrink-0 rounded-full bg-green-100 flex items-center justify-center">
        <CheckCircle2
          size={28}
          className="text-green-600"
        />
      </div>
    );
  }

  if (normalized === "VIOLATION") {
    return (
      <div className="w-14 h-14 shrink-0 rounded-full bg-red-100 flex items-center justify-center">
        <AlertTriangle
          size={28}
          className="text-red-600"
        />
      </div>
    );
  }

  return (
    <div className="w-14 h-14 shrink-0 rounded-full bg-amber-100 flex items-center justify-center">
      <AlertTriangle
        size={28}
        className="text-amber-600"
      />
    </div>
  );
}


// ============================================================
// GENERIC HELPERS
// ============================================================

function getRuleName(rule) {
  return (
    rule?.rule_name ||
    rule?.name ||
    rule?.rule ||
    rule?.rule_code ||
    "Compliance Check"
  );
}


function getRuleValue(rule) {
  if (
    rule?.value !== undefined &&
    rule?.value !== null &&
    String(rule.value).trim() !== ""
  ) {
    return rule.value;
  }

  if (
    rule?.result_data?.value !== undefined &&
    rule?.result_data?.value !== null
  ) {
    return rule.result_data.value;
  }

  if (
    rule?.result_data?.product_name !== undefined &&
    rule?.result_data?.product_name !== null
  ) {
    return rule.result_data.product_name;
  }

  if (
    rule?.result_data?.net_quantity !== undefined &&
    rule?.result_data?.net_quantity !== null
  ) {
    return rule.result_data.net_quantity;
  }

  if (
    rule?.result_data?.mrp !== undefined &&
    rule?.result_data?.mrp !== null
  ) {
    return rule.result_data.mrp;
  }

  return null;
}


function findRule(checks, keywords) {
  return checks.find((check) => {
    const text = `
      ${check?.name || ""}
      ${check?.rule_name || ""}
      ${check?.rule || ""}
      ${check?.rule_code || ""}
    `.toLowerCase();

    return keywords.some((keyword) =>
      text.includes(keyword.toLowerCase())
    );
  });
}


function formatConfidence(confidence) {
  const value = Number(confidence);

  if (!Number.isFinite(value)) {
    return null;
  }

  const percentage =
    value <= 1
      ? value * 100
      : value;

  return `${Math.max(
    0,
    Math.min(100, Math.round(percentage))
  )}%`;
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


function formatInspectionType(type) {
  if (!type) {
    return "Not recorded";
  }

  return String(type)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}


// ============================================================
// REPORT COMPONENT
// ============================================================

function Report() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const {
    inspection: currentInspection,
  } = useInspection();


  // ==========================================================
  // SELECTED DATABASE ID
  // ==========================================================

  const selectedInspectionId =
    searchParams.get("id");


  // ==========================================================
  // STATE
  // ==========================================================

  const [
    inspection,
    setInspection,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    loadError,
    setLoadError,
  ] = useState("");


  // ==========================================================
  // LOAD INSPECTION
  // ==========================================================

  useEffect(() => {
    let cancelled = false;


    async function loadInspection() {

      // ------------------------------------------------------
      // If opened from Reports, ALWAYS use the database ID.
      // ------------------------------------------------------

      if (selectedInspectionId) {

        try {
          setLoading(true);
          setLoadError("");
          setInspection(null);


          const response = await fetch(
            `${API_URL}/inspections/${encodeURIComponent(
              selectedInspectionId
            )}`
          );


          if (!response.ok) {
            throw new Error(
              `Inspection could not be loaded (${response.status})`
            );
          }


          const data = await response.json();


          if (cancelled) {
            return;
          }


          const backendInspection =
            data?.inspection ||
            data?.data?.inspection ||
            data;


          if (!backendInspection) {
            throw new Error(
              "Inspection data was not returned by the server."
            );
          }


          const backendImages =
            data?.images ||
            backendInspection?.images ||
            [];


          const backendRuleResults =
            data?.rule_results ||
            backendInspection?.rule_results ||
            data?.ruleResults ||
            [];


          // --------------------------------------------------
          // Normalize rule results
          // --------------------------------------------------

          const complianceChecks =
            Array.isArray(backendRuleResults)
              ? backendRuleResults.map((rule) => ({
                  ...rule,

                  name:
                    rule?.rule_name ||
                    rule?.name ||
                    rule?.rule ||
                    rule?.rule_code ||
                    "Compliance Check",

                  rule_name:
                    rule?.rule_name ||
                    rule?.name ||
                    rule?.rule ||
                    rule?.rule_code,

                  status:
                    rule?.status ||
                    "PARTIAL",

                  value:
                    getRuleValue(rule),

                  confidence:
                    rule?.confidence,

                  source_text:
                    rule?.source_text ||
                    rule?.result_data?.source_text ||
                    null,

                  bounding_box:
                    rule?.bounding_box ||
                    rule?.result_data?.bounding_box ||
                    null,
                }))
              : [];


          // --------------------------------------------------
          // Summary
          // --------------------------------------------------

          const totalChecks =
            backendInspection?.total_checks ??
            complianceChecks.length;


          const passedChecks =
            backendInspection?.passed_checks ??
            complianceChecks.filter(
              (rule) =>
                normalizeStatus(rule?.status) ===
                "COMPLIANT"
            ).length;


          const failedChecks =
            backendInspection?.failed_checks ??
            complianceChecks.filter(
              (rule) =>
                normalizeStatus(rule?.status) ===
                "VIOLATION"
            ).length;


          const partialChecks =
            backendInspection?.partial_checks ??
            complianceChecks.filter(
              (rule) =>
                normalizeStatus(rule?.status) ===
                "REVIEW"
            ).length;


          // --------------------------------------------------
          // Compliance report
          // --------------------------------------------------

          const complianceReport = {

            status:
              backendInspection?.overall_status ||
              backendInspection?.status ||
              "REVIEW",

            compliance_percentage:
              backendInspection?.compliance_percentage,

            summary: {
              total_checks: totalChecks,
              passed: passedChecks,
              failed: failedChecks,
              partial: partialChecks,
            },

            checks:
              complianceChecks,
          };


          // --------------------------------------------------
          // Images
          // --------------------------------------------------

          const normalizedImages =
            Array.isArray(backendImages)
              ? backendImages.map((image) => {

                  const imageUrl =
                    image?.url ||
                    image?.image_url ||
                    image?.imageUrl ||
                    (
                      image?.id
                        ? `${API_URL}/inspection-images/${image.id}`
                        : null
                    );


                  return {
                    ...image,

                    id:
                      image?.id,

                    preview:
                      imageUrl,

                    url:
                      imageUrl,

                    original_filename:
                      image?.original_filename ||
                      image?.filename ||
                      "Inspection Image",
                  };
                })
              : [];


          // --------------------------------------------------
          // Product values
          // --------------------------------------------------

          const productRule =
            findRule(
              complianceChecks,
              [
                "product name",
                "product / common",
                "common / generic",
                "generic name",
              ]
            );


          const netQuantityRule =
            findRule(
              complianceChecks,
              [
                "net quantity",
                "net weight",
                "net content",
              ]
            );


          const mrpRule =
            findRule(
              complianceChecks,
              [
                "mrp",
                "maximum retail price",
              ]
            );


          const productName =
            backendInspection?.product_name ||
            productRule?.value ||
            productRule?.result_data?.product_name ||
            null;


          const netQuantity =
            backendInspection?.net_quantity ||
            netQuantityRule?.value ||
            netQuantityRule?.result_data?.net_quantity ||
            null;


          const mrp =
            backendInspection?.mrp ||
            mrpRule?.value ||
            mrpRule?.result_data?.mrp ||
            null;


          // --------------------------------------------------
          // Final inspection object
          // --------------------------------------------------

          const normalizedInspection = {

            ...backendInspection,

            id:
              backendInspection?.id,

            inspectionCode:
              backendInspection?.inspection_code ||
              null,

            inspectionStatus:
              backendInspection?.status ||
              null,

            productName,

            brandName:
              backendInspection?.brand_name ||
              null,

            category:
              backendInspection?.category ||
              null,

            mrp,

            netQuantity,

            inspectionType:
              backendInspection?.inspection_type ||
              null,

            averageOcrConfidence:
              backendInspection?.average_ocr_confidence,

            createdAt:
              backendInspection?.created_at,

            completedAt:
              backendInspection?.completed_at,

            images:
              normalizedImages,

            complianceResult: {
              compliance_report:
                complianceReport,

              inspection: {
                average_ocr_confidence:
                  backendInspection?.average_ocr_confidence,
              },
            },
          };


          setInspection(
            normalizedInspection
          );

        } catch (error) {

          console.error(
            "NiyamDrishti report loading error:",
            error
          );


          if (!cancelled) {

            setLoadError(
              error?.message ||
              "Unable to load this inspection."
            );

            setInspection(null);
          }

        } finally {

          if (!cancelled) {
            setLoading(false);
          }

        }

        return;
      }


      // ------------------------------------------------------
      // No database ID.
      //
      // This means the report was opened directly from the
      // current inspection workflow.
      // ------------------------------------------------------

      if (!cancelled) {

        if (currentInspection) {
          setInspection(currentInspection);
        } else {
          setInspection(null);
          setLoadError(
            "No inspection is available for this report."
          );
        }

      }

    }


    loadInspection();


    return () => {
      cancelled = true;
    };

  }, [
    selectedInspectionId,
    currentInspection,
  ]);


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-80px)] bg-[#F6F8FC] flex items-center justify-center">

        <div className="text-center">

          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto" />

          <p className="text-slate-600 font-medium mt-4">
            Loading inspection report...
          </p>

          <p className="text-sm text-slate-400 mt-1">
            Retrieving inspection data
          </p>

        </div>

      </main>
    );
  }


  // ==========================================================
  // ERROR
  // ==========================================================

  if (loadError || !inspection) {
    return (
      <main className="min-h-[calc(100vh-80px)] bg-[#F6F8FC] flex items-center justify-center p-6">

        <div className="bg-white border border-red-200 rounded-2xl p-8 max-w-lg w-full text-center shadow-sm">

          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto">

            <AlertTriangle
              size={28}
              className="text-red-600"
            />

          </div>


          <h2 className="text-xl font-bold text-slate-900 mt-4">
            Inspection Report Not Found
          </h2>


          <p className="text-sm text-slate-500 mt-2">
            {loadError ||
              "The selected inspection could not be loaded."}
          </p>


          <button
            onClick={() =>
              navigate("/reports")
            }
            className="mt-6 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
          >
            Back to Reports
          </button>

        </div>

      </main>
    );
  }


  // ==========================================================
  // REPORT DATA
  // ==========================================================

  const result =
    inspection?.complianceResult;

  const report =
    result?.compliance_report || {};

  const summary =
    report?.summary || {};

  const checks =
    Array.isArray(report?.checks)
      ? report.checks
      : [];


  const finalStatus =
    getFinalStatus(report);


  // ==========================================================
  // PRODUCT INFORMATION
  // ==========================================================

  const productName =
    inspection?.productName ||
    "Not recorded";


  const brandName =
    inspection?.brandName ||
    "Not recorded";


  const category =
    inspection?.category ||
    "Not recorded";


  const netQuantity =
    inspection?.netQuantity ||
    "Not recorded";


  const mrp =
    inspection?.mrp ||
    "Not recorded";


  // ==========================================================
  // IDS
  // ==========================================================

  const inspectionId =
    inspection?.inspectionCode ||
    inspection?.id ||
    "Not assigned";


  const reportId =
    inspection?.reportId ||
    (
      inspection?.inspectionCode
        ? `ND-RPT-${inspection.inspectionCode}`
        : "Not assigned"
    );


  // ==========================================================
  // IMAGE
  // ==========================================================

  const image =
    inspection?.images?.[0];


  const imagePreview =
    image?.preview ||
    image?.url ||
    image?.image_url ||
    (
      typeof image === "string"
        ? image
        : null
    );


  // ==========================================================
  // DATE
  // ==========================================================

  const inspectionDate =
    inspection?.createdAt ||
    inspection?.created_at;


  // ==========================================================
  // SUMMARY COUNTS
  // ==========================================================

  const passedChecks =
    Number(summary.passed) || 0;


  const failedChecks =
    Number(summary.failed) || 0;


  const partialChecks =
    Number(summary.partial) || 0;


  const totalChecks =
    Number(summary.total_checks) ||
    checks.length;


  // ==========================================================
  // COMPLIANCE PERCENTAGE
  // ==========================================================

  const rawCompliancePercentage =
    report?.compliance_percentage;


  const compliancePercentage =
    rawCompliancePercentage !== undefined &&
    rawCompliancePercentage !== null &&
    Number.isFinite(
      Number(rawCompliancePercentage)
    )
      ? Number(rawCompliancePercentage)
      : null;


  // ==========================================================
  // OCR CONFIDENCE
  // ==========================================================

  const averageConfidence =
    result?.inspection
      ?.average_ocr_confidence ??
    inspection?.averageOcrConfidence ??
    inspection?.average_ocr_confidence ??
    null;


  // ==========================================================
  // ACTIONS
  // ==========================================================

  const handlePrint = () => {
    window.print();
  };


  const handleDownload = () => {
    window.print();
  };


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <main className="p-4 sm:p-6 lg:p-8 bg-[#F6F8FC] min-h-[calc(100vh-80px)]">


      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">

        <div>

          <button
            onClick={() =>
              selectedInspectionId
                ? navigate("/reports")
                : navigate("/evidence-review")
            }
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mb-3"
          >

            <ArrowLeft size={17} />

            {selectedInspectionId
              ? "Back to Reports"
              : "Back to Evidence Review"}

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


        <div className="text-left lg:text-right">

          <p className="text-xs text-slate-400 uppercase tracking-wide">
            Report ID
          </p>

          <p className="font-semibold text-slate-800 break-all">
            {reportId}
          </p>

        </div>

      </div>


      {/* ======================================================
          FINAL STATUS
      ====================================================== */}

      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 mb-6 shadow-sm">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

          <div className="flex items-start sm:items-center gap-4">

            <FinalStatusIcon
              status={finalStatus}
            />

            <div>

              <p className="text-sm text-slate-500">
                Final Inspection Assessment
              </p>

              <h2
                className={`text-lg sm:text-xl font-bold mt-1 ${
                  finalStatus === "COMPLIANT"
                    ? "text-green-600"
                    : finalStatus === "VIOLATION"
                    ? "text-red-600"
                    : "text-amber-600"
                }`}
              >
                {finalStatus === "COMPLIANT"
                  ? "COMPLIANT"
                  : finalStatus === "VIOLATION"
                  ? "NON-COMPLIANT"
                  : "NEEDS REVIEW"}
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Based on the stored compliance analysis
              </p>

            </div>

          </div>


          <div className="flex flex-col sm:flex-row gap-3">

            <button
              onClick={handlePrint}
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


      {/* ======================================================
          COMPLIANCE SUMMARY
      ====================================================== */}

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


        {compliancePercentage !== null && (

          <div className="mt-5">

            <div className="flex items-center justify-between mb-2">

              <p className="text-sm font-medium text-slate-700">
                Compliance Percentage
              </p>

              <p className="text-sm font-bold text-slate-900">
                {Math.round(
                  Math.max(
                    0,
                    Math.min(
                      100,
                      compliancePercentage
                    )
                  )
                )}
                %
              </p>

            </div>


            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">

              <div
                className="h-full bg-blue-600 rounded-full"
                style={{
                  width: `${Math.max(
                    0,
                    Math.min(
                      100,
                      compliancePercentage
                    )
                  )}%`,
                }}
              />

            </div>

          </div>

        )}

      </div>


      {/* ======================================================
          PRODUCT INFORMATION
      ====================================================== */}

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
              {mrp === "Not recorded"
                ? mrp
                : String(mrp).startsWith("₹")
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


      {/* ======================================================
          INSPECTION DETAILS
      ====================================================== */}

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
                {formatDate(
                  inspectionDate
                )}
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
                {inspection?.inspectorName ||
                  "Not recorded"}
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
                {inspection?.locationName ||
                  "Not recorded"}
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* ======================================================
          COMPLIANCE FINDINGS
      ====================================================== */}

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
                normalizeStatus(
                  check?.status
                );


              const classes =
                getStatusClasses(
                  status
                );


              const statusLabel =
                getStatusLabel(
                  status
                );


              const confidence =
                formatConfidence(
                  check?.confidence
                );


              const checkValue =
                getRuleValue(check);


              return (

                <div
                  key={
                    check?.id ||
                    check?.rule_code ||
                    check?.name ||
                    index
                  }
                  className={`border rounded-xl p-4 ${classes.container}`}
                >

                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">

                    <div className="flex gap-3">

                      {status === "COMPLIANT" ? (

                        <CheckCircle2
                          size={21}
                          className={`${classes.icon} mt-0.5 shrink-0`}
                        />

                      ) : status === "REVIEW" ? (

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
                          {getRuleName(check)}
                        </h3>


                        <p className="text-sm text-slate-600 mt-1">

                          {checkValue !== null &&
                          checkValue !== undefined &&
                          String(checkValue).trim() !== ""

                            ? `Detected value: ${checkValue}`

                            : "No value was detected for this declaration."}

                        </p>


                        {check?.source_text && (

                          <p className="text-xs text-slate-500 mt-2">

                            OCR evidence:{" "}

                            {check.source_text}

                          </p>

                        )}


                        {confidence && (

                          <p className="text-xs text-slate-500 mt-2">

                            OCR confidence:{" "}

                            {confidence}

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


      {/* ======================================================
          INSPECTION EVIDENCE
      ====================================================== */}

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
                onError={(event) => {
                  event.currentTarget.style.display =
                    "none";
                }}
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

                {finalStatus === "COMPLIANT"
                  ? "COMPLIANT"
                  : finalStatus === "VIOLATION"
                  ? "NON-COMPLIANT"
                  : "NEEDS REVIEW"}

              </p>

              <p className="text-sm text-slate-600 mt-1">
                The result shown here is based on the compliance analysis stored for this inspection.
              </p>

            </div>


            {averageConfidence !== null &&
              averageConfidence !== undefined && (

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">

                  <p className="text-xs font-semibold text-slate-500 uppercase">
                    Average OCR Confidence
                  </p>

                  <p className="text-lg font-bold text-slate-900 mt-2">
                    {formatConfidence(
                      averageConfidence
                    )}
                  </p>

                </div>

              )}

          </div>

        </div>

      </div>


      {/* ======================================================
          INSPECTION RECORD
      ====================================================== */}

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
              Stored inspection information
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
                {inspection?.inspectionStatus ||
                  inspection?.status ||
                  "Not recorded"}
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
                {formatInspectionType(
                  inspection?.inspectionType ||
                  inspection?.inspection_type
                )}
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* ======================================================
          BOTTOM ACTIONS
      ====================================================== */}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-8">

        <button
          onClick={() =>
            navigate("/new-inspection")
          }
          className="w-full sm:w-auto px-5 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Start New Inspection
        </button>


        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">

          <button
            onClick={handlePrint}
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


      {/* ======================================================
          DISCLAIMER
      ====================================================== */}

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
