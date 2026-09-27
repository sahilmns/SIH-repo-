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
// HELPERS
// ============================================================

function getStatusLabel(status) {
  const normalized = String(status || "").toUpperCase();

  if (
    normalized === "PASS" ||
    normalized === "PASSED" ||
    normalized === "COMPLIANT"
  ) {
    return "VERIFIED";
  }

  if (
    normalized === "PARTIAL" ||
    normalized === "UNCERTAIN" ||
    normalized === "NEEDS REVIEW" ||
    normalized === "REQUIRES_ADDITIONAL_IMAGE" ||
    normalized === "REVIEW"
  ) {
    return "NEEDS REVIEW";
  }

  return "VIOLATION";
}


function getStatusClasses(status) {
  const normalized = String(status || "").toUpperCase();

  if (
    normalized === "PASS" ||
    normalized === "PASSED" ||
    normalized === "COMPLIANT"
  ) {
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
    normalized === "REQUIRES_ADDITIONAL_IMAGE" ||
    normalized === "REVIEW"
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


function getFinalStatus(report) {
  const status = String(
    report?.status || ""
  ).toUpperCase();

  if (
    status === "PASS" ||
    status === "PASSED" ||
    status === "COMPLIANT"
  ) {
    return "COMPLIANT";
  }

  if (
    status === "PARTIAL" ||
    status === "UNCERTAIN" ||
    status === "NEEDS REVIEW" ||
    status === "REQUIRES_ADDITIONAL_IMAGE" ||
    status === "REVIEW"
  ) {
    return "NEEDS REVIEW";
  }

  if (
    status === "VIOLATION" ||
    status === "FAIL" ||
    status === "FAILED" ||
    status === "NON-COMPLIANT" ||
    status === "NON_COMPLIANT"
  ) {
    return "NON-COMPLIANT";
  }

  return "NEEDS REVIEW";
}


function FinalStatusIcon({ status }) {
  if (status === "COMPLIANT") {
    return (
      <div className="w-14 h-14 shrink-0 rounded-full bg-green-100 flex items-center justify-center">
        <CheckCircle2
          size={28}
          className="text-green-600"
        />
      </div>
    );
  }

  if (status === "NON-COMPLIANT") {
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
// GENERIC VALUE HELPERS
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
  // SELECTED DATABASE INSPECTION ID
  // ==========================================================

  const selectedInspectionId =
    searchParams.get("id");


  // ==========================================================
  // STATE
  // ==========================================================

  const [
    inspection,
    setInspection,
  ] = useState(currentInspection || null);

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

      /*
       * If this report was opened from Reports,
       * selectedInspectionId exists and we MUST fetch
       * the selected database record.
       */

      if (!selectedInspectionId) {
        setInspection(
          currentInspection || null
        );

        return;
      }


      try {
        setLoading(true);
        setLoadError("");


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


        /*
         * The backend may return:
         *
         * {
         *   inspection: {...},
         *   images: [...],
         *   ocr_detections: [...],
         *   rule_results: [...]
         * }
         *
         * or the inspection object directly.
         */

        const backendInspection =
          data?.inspection ||
          data?.data?.inspection ||
          data;


        const backendImages =
          data?.images ||
          backendInspection?.images ||
          [];


        const backendRuleResults =
          data?.rule_results ||
          backendInspection?.rule_results ||
          data?.ruleResults ||
          [];


        // ======================================================
        // NORMALIZE RULE RESULTS
        // ======================================================

        const complianceChecks =
          Array.isArray(backendRuleResults)
            ? backendRuleResults.map((rule) => ({
                ...rule,

                name:
                  rule?.rule_name ||
                  rule?.name ||
                  rule?.rule ||
                  rule?.rule_code,

                rule_name:
                  rule?.rule_name ||
                  rule?.name ||
                  rule?.rule,

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


        // ======================================================
        // CREATE COMPLIANCE REPORT OBJECT
        // ======================================================

        const complianceReport = {

          status:
            backendInspection?.overall_status ||
            backendInspection?.status ||
            "REVIEW",

          compliance_percentage:
            backendInspection?.compliance_percentage,

          summary: {

            total_checks:
              backendInspection?.total_checks ??
              complianceChecks.length,

            passed:
              backendInspection?.passed_checks ??
              complianceChecks.filter(
                (check) =>
                  ["PASS", "PASSED"].includes(
                    String(
                      check?.status || ""
                    ).toUpperCase()
                  )
              ).length,

            failed:
              backendInspection?.failed_checks ??
              complianceChecks.filter(
                (check) =>
                  [
                    "VIOLATION",
                    "FAIL",
                    "FAILED",
                    "NON-COMPLIANT",
                    "NON_COMPLIANT",
                  ].includes(
                    String(
                      check?.status || ""
                    ).toUpperCase()
                  )
              ).length,

            partial:
              backendInspection?.partial_checks ??
              complianceChecks.filter(
                (check) =>
                  [
                    "PARTIAL",
                    "UNCERTAIN",
                    "NEEDS REVIEW",
                    "REQUIRES_ADDITIONAL_IMAGE",
                    "REVIEW",
                  ].includes(
                    String(
                      check?.status || ""
                    ).toUpperCase()
                  )
              ).length,
          },

          checks:
            complianceChecks,
        };


        // ======================================================
        // BUILD IMAGE OBJECTS
        // ======================================================

        const normalizedImages =
          Array.isArray(backendImages)
            ? backendImages.map((image) => {

                /*
                 * Prefer a backend URL if the API already
                 * supplies one.
                 */

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


        // ======================================================
        // PRODUCT NAME FALLBACK
        // ======================================================

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
            ["mrp", "maximum retail price"]
          );


        const detectedProductName =
          backendInspection?.product_name ||
          backendInspection?.productName ||
          productRule?.value ||
          productRule?.result_data?.product_name ||
          productRule?.product_name ||
          null;


        const detectedNetQuantity =
          backendInspection?.net_quantity ||
          backendInspection?.netQuantity ||
          netQuantityRule?.value ||
          netQuantityRule?.result_data?.net_quantity ||
          null;


        const detectedMrp =
          backendInspection?.mrp ||
          mrpRule?.value ||
          mrpRule?.result_data?.mrp ||
          null;


        // ======================================================
        // FINAL NORMALIZED INSPECTION
        // ======================================================

        const normalizedInspection = {

          ...backendInspection,

          id:
            backendInspection?.id,

          inspectionCode:
            backendInspection?.inspection_code ||
            backendInspection?.inspectionCode,

          backendInspectionId:
            backendInspection?.id,

          inspectionStatus:
            backendInspection?.status,

          productName:
            detectedProductName,

          brandName:
            backendInspection?.brand_name ||
            backendInspection?.brandName ||
            "",

          category:
            backendInspection?.category ||
            "",

          mrp:
            detectedMrp,

          netQuantity:
            detectedNetQuantity,

          inspectionType:
            backendInspection?.inspection_type ||
            "physical",

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

          /*
           * Very important:
           * do NOT fall back to currentInspection here.
           *
           * Otherwise clicking another report could again
           * show the previous scanned product.
           */

          setInspection(null);
        }

      } finally {

        if (!cancelled) {
          setLoading(false);
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
  // LOADING SCREEN
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
  // ERROR SCREEN
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
            onClick={() => navigate("/reports")}
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
    result?.product_name ||
    result?.productName ||
    findRule(
      checks,
      [
        "product name",
        "product / common",
        "common / generic",
        "generic name",
      ]
    )?.value ||
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
    findRule(
      checks,
      [
        "net quantity",
        "net weight",
        "net content",
      ]
    )?.value ||
    "Not detected";


  const mrp =
    inspection?.mrp ||
    result?.mrp ||
    findRule(
      checks,
      [
        "mrp",
        "maximum retail price",
      ]
    )?.value ||
    "Not detected";


  // ==========================================================
  // IDS
  // ==========================================================

  const inspectionId =
    inspection?.inspectionCode ||
    inspection?.inspection_code ||
    inspection?.backendInspectionId ||
    inspection?.id ||
    "Not assigned";


  const reportId =
    inspection?.reportId ||
    `ND-RPT-${inspectionId}`;


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
    inspection?.created_at ||
    result?.created_at;


  // ==========================================================
  // SUMMARY COUNTS
  // ==========================================================

  const passedChecks =
    Number.isFinite(
      Number(summary.passed)
    )
      ? Number(summary.passed)
      : checks.filter(
          (check) =>
            [
              "PASS",
              "PASSED",
            ].includes(
              String(
                check?.status || ""
              ).toUpperCase()
            )
        ).length;


  const failedChecks =
    Number.isFinite(
      Number(summary.failed)
    )
      ? Number(summary.failed)
      : checks.filter(
          (check) =>
            [
              "VIOLATION",
              "FAIL",
              "FAILED",
              "NON-COMPLIANT",
              "NON_COMPLIANT",
            ].includes(
              String(
                check?.status || ""
              ).toUpperCase()
            )
        ).length;


  const partialChecks =
    Number.isFinite(
      Number(summary.partial)
    )
      ? Number(summary.partial)
      : checks.filter(
          (check) =>
            [
              "PARTIAL",
              "UNCERTAIN",
              "NEEDS REVIEW",
              "REQUIRES_ADDITIONAL_IMAGE",
              "REVIEW",
            ].includes(
              String(
                check?.status || ""
              ).toUpperCase()
            )
        ).length;


  const totalChecks =
    Number.isFinite(
      Number(summary.total_checks)
    )
      ? Number(summary.total_checks)
      : checks.length;


  // ==========================================================
  // COMPLIANCE PERCENTAGE
  // ==========================================================

  const compliancePercentage =
    report?.compliance_percentage !== undefined &&
    report?.compliance_percentage !== null
      ? Number(
          report.compliance_percentage
        )
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
                    : finalStatus ===
                      "NON-COMPLIANT"
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
              onClick={() =>
                window.print()
              }
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


          {/* Total */}

          <div className="bg-slate-50 rounded-xl p-4">

            <p className="text-xs text-slate-400 uppercase">
              Total Checks
            </p>

            <p className="text-2xl font-bold text-slate-900 mt-1">
              {totalChecks}
            </p>

          </div>


          {/* Passed */}

          <div className="bg-green-50 rounded-xl p-4">

            <p className="text-xs text-green-600 uppercase">
              Passed
            </p>

            <p className="text-2xl font-bold text-green-700 mt-1">
              {passedChecks}
            </p>

          </div>


          {/* Review */}

          <div className="bg-amber-50 rounded-xl p-4">

            <p className="text-xs text-amber-600 uppercase">
              Needs Review
            </p>

            <p className="text-2xl font-bold text-amber-700 mt-1">
              {partialChecks}
            </p>

          </div>


          {/* Violations */}

          <div className="bg-red-50 rounded-xl p-4">

            <p className="text-xs text-red-600 uppercase">
              Violations
            </p>

            <p className="text-2xl font-bold text-red-700 mt-1">
              {failedChecks}
            </p>

          </div>

        </div>


        {/* Compliance bar */}

        {compliancePercentage !== null &&
          Number.isFinite(
            compliancePercentage
          ) && (

            <div className="mt-5">

              <div className="flex items-center justify-between mb-2">

                <p className="text-sm font-medium text-slate-700">
                  Compliance Percentage
                </p>

                <p className="text-sm font-bold text-slate-900">
                  {Math.round(
                    compliancePercentage
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


          {/* Product */}

          <div>

            <p className="text-xs text-slate-400 uppercase">
              Product Name
            </p>

            <p className="font-semibold text-slate-800 mt-1 break-words">
              {productName}
            </p>

          </div>


          {/* Brand */}

          <div>

            <p className="text-xs text-slate-400 uppercase">
              Brand
            </p>

            <p className="font-semibold text-slate-800 mt-1 break-words">
              {brandName}
            </p>

          </div>


          {/* Category */}

          <div>

            <p className="text-xs text-slate-400 uppercase">
              Category
            </p>

            <p className="font-semibold text-slate-800 mt-1 break-words">
              {category}
            </p>

          </div>


          {/* Net quantity */}

          <div>

            <p className="text-xs text-slate-400 uppercase">
              Net Quantity
            </p>

            <p className="font-semibold text-slate-800 mt-1">
              {netQuantity}
            </p>

          </div>


          {/* MRP */}

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


          {/* Inspection ID */}

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


          {/* Date */}

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


          {/* Inspector */}

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
                  "Enforcement Officer"}
              </p>

            </div>

          </div>


          {/* Location */}

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
                  "Retail Inspection"}
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

            checks.map(
              (check, index) => {

                const status =
                  String(
                    check?.status || ""
                  ).toUpperCase();


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


                        {/* Icon */}

                        {[
                          "PASS",
                          "PASSED",
                          "COMPLIANT",
                        ].includes(status) ? (

                          <CheckCircle2
                            size={21}
                            className={`${classes.icon} mt-0.5 shrink-0`}
                          />

                        ) : [

                          "PARTIAL",
                          "UNCERTAIN",
                          "NEEDS REVIEW",
                          "REQUIRES_ADDITIONAL_IMAGE",
                          "REVIEW",

                        ].includes(status) ? (

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

                            {getRuleName(
                              check
                            )}

                          </h3>


                          <p className="text-sm text-slate-600 mt-1">

                            {checkValue !== null &&
                            checkValue !== undefined &&
                            String(
                              checkValue
                            ).trim() !== ""

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


                      {/* Status */}

                      <span
                        className={`self-start text-xs font-semibold px-3 py-1 rounded-full ${classes.badge}`}
                      >

                        {statusLabel}

                      </span>

                    </div>

                  </div>

                );
              }
            )

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


          {/* Image */}

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


          {/* Result */}

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
              Current inspection information
            </p>

          </div>

        </div>


        <div className="bg-slate-50 rounded-xl p-4">

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">


            {/* Status */}

            <div>

              <p className="text-xs text-slate-400 uppercase">
                Status
              </p>

              <p className="font-semibold text-slate-800 mt-1">
                {inspection?.inspectionStatus ||
                  inspection?.status ||
                  finalStatus}
              </p>

            </div>


            {/* ID */}

            <div>

              <p className="text-xs text-slate-400 uppercase">
                Inspection ID
              </p>

              <p className="font-semibold text-slate-800 mt-1 break-all">
                {inspectionId}
              </p>

            </div>


            {/* Type */}

            <div>

              <p className="text-xs text-slate-400 uppercase">
                Inspection Type
              </p>

              <p className="font-semibold text-slate-800 mt-1">
                {inspection?.inspectionType ||
                  "Physical"}
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
            onClick={() =>
              window.print()
            }
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