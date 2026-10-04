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
  useRef,
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
// STATUS NORMALIZATION
// ============================================================

function normalizeStatus(value) {
  const normalized = String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[-\s]+/g, "_");

  if (
    [
      "COMPLIANT",
      "PASS",
      "PASSED",
      "VERIFIED_COMPLIANT",
      "COMPLIANT_WITH_ALL_CHECKS",
    ].includes(normalized)
  ) {
    return "compliant";
  }

  if (
    [
      "VIOLATION",
      "VIOLATIONS",
      "NON_COMPLIANT",
      "FAILED",
      "FAIL",
    ].includes(normalized)
  ) {
    return "potential_violation";
  }

  return "needs_review";
}


// ============================================================
// STATUS LABEL
// ============================================================

function getStatusLabel(status) {
  const normalized =
    normalizeStatus(status);

  if (normalized === "compliant") {
    return "Verified Compliant";
  }

  if (
    normalized ===
    "potential_violation"
  ) {
    return "Potential Violation";
  }

  return "Needs Review";
}


// ============================================================
// STATUS CLASSES
// ============================================================

function getStatusClasses(status) {
  const normalized =
    normalizeStatus(status);

  if (normalized === "compliant") {
    return {
      container:
        "bg-green-50 border-green-200",
      text:
        "text-green-700",
      icon:
        "text-green-600",
    };
  }

  if (
    normalized ===
    "potential_violation"
  ) {
    return {
      container:
        "bg-red-50 border-red-200",
      text:
        "text-red-700",
      icon:
        "text-red-600",
    };
  }

  return {
    container:
      "bg-amber-50 border-amber-200",
    text:
      "text-amber-700",
    icon:
      "text-amber-600",
  };
}


// ============================================================
// FINAL STATUS ICON
// ============================================================

function FinalStatusIcon({ status, size = 24 }) {
  const normalized =
    normalizeStatus(status);

  if (normalized === "compliant") {
    return (
      <CheckCircle2
        size={size}
        className="text-green-600"
      />
    );
  }

  if (
    normalized ===
    "potential_violation"
  ) {
    return (
      <AlertTriangle
        size={size}
        className="text-red-600"
      />
    );
  }

  return (
    <AlertTriangle
      size={size}
      className="text-amber-600"
    />
  );
}


// ============================================================
// HELPERS
// ============================================================

function getFinalStatus(inspection) {
  if (!inspection) {
    return "needs_review";
  }

  if (inspection.overall_status) {
    return normalizeStatus(
      inspection.overall_status
    );
  }

  if (
    Array.isArray(
      inspection.rule_results
    ) &&
    inspection.rule_results.length > 0
  ) {
    const statuses =
      inspection.rule_results.map(
        (rule) =>
          normalizeStatus(
            rule?.status
          )
      );

    if (
      statuses.includes(
        "potential_violation"
      )
    ) {
      return "potential_violation";
    }

    if (
      statuses.includes(
        "needs_review"
      )
    ) {
      return "needs_review";
    }

    return "compliant";
  }

  return "needs_review";
}


function getRuleName(rule) {
  return (
    rule?.rule_name ||
    rule?.name ||
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
    return String(rule.value);
  }

  if (
    rule?.source_text !== undefined &&
    rule?.source_text !== null &&
    String(rule.source_text).trim() !== ""
  ) {
    return String(rule.source_text);
  }

  if (
    rule?.found !== undefined &&
    rule?.found !== null
  ) {
    return rule.found
      ? "Detected"
      : "Not detected";
  }

  return "—";
}


function findRule(
  rules,
  ...names
) {
  if (!Array.isArray(rules)) {
    return null;
  }

  const normalizedNames =
    names.map((name) =>
      String(name)
        .toLowerCase()
        .replace(/[_-]+/g, " ")
        .trim()
    );

  return (
    rules.find((rule) => {
      const ruleName =
        String(
          rule?.rule_name ||
            rule?.name ||
            rule?.rule_code ||
            ""
        )
          .toLowerCase()
          .replace(/[_-]+/g, " ")
          .trim();

      return normalizedNames.some(
        (name) =>
          ruleName === name ||
          ruleName.includes(name) ||
          name.includes(ruleName)
      );
    }) || null
  );
}


function formatConfidence(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return `${(
    number <= 1
      ? number * 100
      : number
  ).toFixed(1)}%`;
}


function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value);
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}


function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value);
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}


function formatInspectionType(value) {
  const normalized =
    String(value || "")
      .trim()
      .toLowerCase();

  if (
    normalized ===
    "physical"
  ) {
    return "Physical Inspection";
  }

  if (
    normalized ===
    "online"
  ) {
    return "Online Inspection";
  }

  if (!normalized) {
    return "Physical Inspection";
  }

  return normalized
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}


// ============================================================
// REPORT PAGE
// ============================================================

function Report() {
  const navigate =
    useNavigate();

  const [
    searchParams,
  ] = useSearchParams();

  const {
    inspection:
      currentInspection,
  } = useInspection();


  // ==========================================================
  // URL PARAMETERS
  // ==========================================================

  const selectedInspectionId =
    searchParams.get("id");

  const shouldAutoPrint =
    searchParams.get("print") ===
    "true";


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
  ] = useState(
    Boolean(selectedInspectionId)
  );

  const [
    loadError,
    setLoadError,
  ] = useState("");


  // ==========================================================
  // AUTO PRINT PROTECTION
  //
  // Prevents React StrictMode from opening the
  // browser print dialog more than once.
  // ==========================================================

  const autoPrintTriggered =
    useRef(false);


  // ==========================================================
  // LOAD REPORT FROM DATABASE
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    const loadInspection =
      async () => {

        // ----------------------------------------------------
        // If no database ID was supplied, use context data.
        // ----------------------------------------------------

        if (
          !selectedInspectionId
        ) {
          setInspection(
            currentInspection ||
              null
          );

          setLoading(false);

          return;
        }


        // ----------------------------------------------------
        // Load the exact inspection from backend.
        // ----------------------------------------------------

        try {
          setLoading(true);
          setLoadError("");

          const response =
            await fetch(
              `${API_URL}/inspections/${encodeURIComponent(
                selectedInspectionId
              )}`
            );

          if (!response.ok) {
            throw new Error(
              `Failed to load inspection (${response.status})`
            );
          }

          const data =
            await response.json();

          if (cancelled) {
            return;
          }


          // --------------------------------------------------
          // Backend may return the inspection directly or
          // inside an "inspection" property.
          // --------------------------------------------------

          const rawInspection =
            data?.inspection ||
            data;


          // --------------------------------------------------
          // Normalize images
          // --------------------------------------------------

          const rawImages =
            Array.isArray(
              data?.images
            )
              ? data.images
              : Array.isArray(
                  rawInspection?.images
                )
                ? rawInspection.images
                : [];


          const normalizedImages =
            rawImages.map(
              (image) => {

                const imageId =
                  image?.id;

                const imageUrl =
                  image?.file_url ||
                  image?.url ||
                  (
                    imageId !==
                      undefined &&
                    imageId !== null
                      ? `${API_URL}/inspection-images/${imageId}`
                      : null
                  );

                return {
                  ...image,
                  id: imageId,
                  url: imageUrl,
                  file_url:
                    imageUrl,
                };
              }
            );


          // --------------------------------------------------
          // Normalize rule results
          // --------------------------------------------------

          const rawRuleResults =
            Array.isArray(
              data?.rule_results
            )
              ? data.rule_results
              : Array.isArray(
                  rawInspection?.rule_results
                )
                ? rawInspection.rule_results
                : [];


          // --------------------------------------------------
          // Build normalized inspection object
          // --------------------------------------------------

          const normalizedInspection = {
            ...rawInspection,

            id:
              rawInspection?.id ??
              selectedInspectionId,

            inspection_code:
              rawInspection?.inspection_code ||
              rawInspection?.inspectionCode ||
              `INS-${selectedInspectionId}`,

            inspection_type:
              rawInspection?.inspection_type ||
              "physical",

            images:
              normalizedImages,

            rule_results:
              rawRuleResults,

            ocr_detections:
              Array.isArray(
                data?.ocr_detections
              )
                ? data.ocr_detections
                : Array.isArray(
                    rawInspection?.ocr_detections
                  )
                  ? rawInspection.ocr_detections
                  : [],
          };


          setInspection(
            normalizedInspection
          );

        } catch (error) {

          if (
            cancelled
          ) {
            return;
          }

          console.error(
            "NiyamDrishti report loading error:",
            error
          );

          setLoadError(
            error?.message ||
              "Unable to load this inspection report."
          );

          setInspection(null);

        } finally {

          if (!cancelled) {
            setLoading(false);
          }

        }
      };


    loadInspection();


    return () => {
      cancelled = true;
    };

  }, [
    selectedInspectionId,
    currentInspection,
  ]);


  // ==========================================================
  // AUTO PRINT
  //
  // When Reports.jsx sends:
  //
  // /report?id=123&print=true
  //
  // the report first loads from the database and then
  // automatically opens the browser print dialog.
  // ==========================================================

  useEffect(() => {

    if (
      !shouldAutoPrint ||
      loading ||
      !inspection ||
      loadError ||
      autoPrintTriggered.current
    ) {
      return;
    }


    autoPrintTriggered.current =
      true;


    const printTimer =
      setTimeout(() => {

        // ----------------------------------------------------
        // Wait for report images to finish loading before
        // opening the print dialog.
        // ----------------------------------------------------

        const reportImages =
          Array.from(
            document.querySelectorAll(
              ".print-report img"
            )
          );


        const imagePromises =
          reportImages.map(
            (image) => {

              if (
                image.complete
              ) {
                return Promise.resolve();
              }


              return new Promise(
                (resolve) => {

                  image.onload =
                    resolve;

                  image.onerror =
                    resolve;

                }
              );
            }
          );


        Promise.all(
          imagePromises
        ).then(() => {

          // Give the browser one extra rendering cycle.
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              window.print();
            });
          });

        });

      }, 500);


    return () => {
      clearTimeout(
        printTimer
      );
    };

  }, [
    shouldAutoPrint,
    loading,
    inspection,
    loadError,
  ]);


  // ==========================================================
  // REMOVE print=true AFTER PRINTING
  //
  // This prevents a page refresh from reopening the
  // print dialog.
  // ==========================================================

  useEffect(() => {

    if (!shouldAutoPrint) {
      return;
    }


    const handleAfterPrint =
      () => {

        const params =
          new URLSearchParams(
            searchParams
          );


        params.delete(
          "print"
        );


        const query =
          params.toString();


        navigate(
          `/report${
            query
              ? `?${query}`
              : ""
          }`,
          {
            replace: true,
          }
        );

      };


    window.addEventListener(
      "afterprint",
      handleAfterPrint
    );


    return () => {

      window.removeEventListener(
        "afterprint",
        handleAfterPrint
      );

    };

  }, [
    shouldAutoPrint,
    searchParams,
    navigate,
  ]);


  // ==========================================================
  // SELECT DATA SOURCE
  // ==========================================================

  const reportInspection =
    inspection ||
    currentInspection ||
    null;


  // ==========================================================
  // DERIVED DATA
  // ==========================================================

  const rules =
    Array.isArray(
      reportInspection?.rule_results
    )
      ? reportInspection.rule_results
      : [];


  const finalStatus =
    getFinalStatus(
      reportInspection
    );


  const statusLabel =
    getStatusLabel(
      finalStatus
    );


  const statusClasses =
    getStatusClasses(
      finalStatus
    );


  // ==========================================================
  // SUMMARY
  // ==========================================================

  const totalChecks =
    Number(
      reportInspection?.total_checks
    ) ||
    rules.length ||
    0;


  const passedChecks =
    Number(
      reportInspection?.passed_checks
    ) ||
    rules.filter(
      (rule) =>
        normalizeStatus(
          rule?.status
        ) === "compliant"
    ).length;


  const failedChecks =
    Number(
      reportInspection?.failed_checks
    ) ||
    rules.filter(
      (rule) =>
        normalizeStatus(
          rule?.status
        ) ===
        "potential_violation"
    ).length;


  const partialChecks =
    Number(
      reportInspection?.partial_checks
    ) ||
    rules.filter(
      (rule) =>
        normalizeStatus(
          rule?.status
        ) === "needs_review"
    ).length;


  const compliancePercentage =
    Number.isFinite(
      Number(
        reportInspection?.compliance_percentage
      )
    )
      ? Number(
          reportInspection?.compliance_percentage
        )
      : totalChecks > 0
        ? (
            (passedChecks /
              totalChecks) *
            100
          )
        : 0;


  // ==========================================================
  // PRODUCT RULES
  // ==========================================================

  const mrpRule =
    findRule(
      rules,
      "MRP",
      "Maximum Retail Price"
    );


  const quantityRule =
    findRule(
      rules,
      "Net Quantity",
      "Net Quantity Declaration"
    );


  const manufacturerRule =
    findRule(
      rules,
      "Manufacturer / Packer / Importer",
      "Manufacturer",
      "Packer",
      "Importer"
    );


  const dateRule =
    findRule(
      rules,
      "Manufacturing / Packing Date",
      "Manufacturing Date",
      "Packing Date",
      "Date of Manufacture"
    );


  const consumerCareRule =
    findRule(
      rules,
      "Consumer Care",
      "Consumer Care Details"
    );


  const productNameRule =
    findRule(
      rules,
      "Product Name"
    );


  const unitRule =
    findRule(
      rules,
      "Unit of Measurement",
      "Unit"
    );


  // ==========================================================
  // PRINT
  // ==========================================================

  const handlePrint =
    () => {
      window.print();
    };


  const handleDownload =
    () => {
      window.print();
    };


  // ==========================================================
  // LOADING STATE
  // ==========================================================

  if (loading) {
    return (
      <main
        className="min-h-[calc(100vh-80px)]
                   bg-[#F6F8FC]
                   flex
                   items-center
                   justify-center
                   p-8"
      >

        <div
          className="bg-white
                     rounded-2xl
                     border
                     border-slate-200
                     shadow-sm
                     px-8
                     py-10
                     text-center"
        >

          <div
            className="w-12 h-12
                       rounded-full
                       border-4
                       border-blue-100
                       border-t-blue-600
                       animate-spin
                       mx-auto"
          />

          <p
            className="text-slate-700
                       font-semibold
                       mt-5"
          >
            Loading inspection report...
          </p>

          <p
            className="text-sm
                       text-slate-500
                       mt-2"
          >
            Fetching the latest inspection data.
          </p>

        </div>

      </main>
    );
  }


  // ==========================================================
  // ERROR STATE
  // ==========================================================

  if (
    loadError ||
    !reportInspection
  ) {
    return (
      <main
        className="min-h-[calc(100vh-80px)]
                   bg-[#F6F8FC]
                   flex
                   items-center
                   justify-center
                   p-8"
      >

        <div
          className="bg-white
                     rounded-2xl
                     border
                     border-red-200
                     shadow-sm
                     max-w-lg
                     w-full
                     p-8
                     text-center"
        >

          <div
            className="w-14 h-14
                       rounded-full
                       bg-red-50
                       flex
                       items-center
                       justify-center
                       mx-auto"
          >

            <AlertTriangle
              size={28}
              className="text-red-600"
            />

          </div>


          <h2
            className="text-xl
                       font-bold
                       text-slate-900
                       mt-5"
          >
            Unable to load report
          </h2>


          <p
            className="text-sm
                       text-slate-500
                       mt-2"
          >
            {loadError ||
              "No inspection report is currently available."}
          </p>


          <button
            onClick={() =>
              navigate("/reports")
            }
            className="mt-6
                       inline-flex
                       items-center
                       gap-2
                       px-5
                       py-2.5
                       rounded-xl
                       bg-[#081D41]
                       text-white
                       hover:bg-[#102A5A]
                       transition-all"
          >

            <ArrowLeft
              size={17}
            />

            Back to Reports

          </button>

        </div>

      </main>
    );
  }


  // ==========================================================
  // RENDER REPORT
  // ==========================================================

  return (
    <>
      {/* ======================================================
          PRINT STYLES
      ====================================================== */}

      <style>
        {`
          @media print {

            @page {
              size: A4;
              margin: 12mm;
            }

            html,
            body {
              background: #ffffff !important;
              margin: 0 !important;
              padding: 0 !important;
            }

            /*
             * Hide everything outside the actual report.
             * This prevents the application's navbar,
             * sidebar, page controls, etc. from appearing
             * in the generated PDF.
             */

            body * {
              visibility: hidden !important;
            }

            .print-report,
            .print-report * {
              visibility: visible !important;
            }

            .print-report {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              min-height: auto !important;
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
            }

            /*
             * Anything marked no-print remains hidden even
             * inside the report.
             */

            .no-print,
            .no-print * {
              display: none !important;
              visibility: hidden !important;
            }

            /*
             * Remove web-only visual effects.
             */

            .print-card {
              box-shadow: none !important;
              border-color: #d1d5db !important;
            }

            /*
             * Prevent small sections from being split between
             * two pages where possible.
             */

            .print-section {
              break-inside: avoid;
              page-break-inside: avoid;
            }

            /*
             * Tables should remain readable when printed.
             */

            table {
              break-inside: auto;
              page-break-inside: auto;
            }

            tr {
              break-inside: avoid;
              page-break-inside: avoid;
            }

            /*
             * Make report images fit the printable area.
             */

            .print-report img {
              max-width: 100% !important;
            }

            /*
             * Remove hover/interactive appearance.
             */

            button {
              box-shadow: none !important;
            }

          }
        `}
      </style>


      {/* ======================================================
          PRINT REPORT WRAPPER
      ====================================================== */}

      <main
        className="print-report
                   p-8
                   bg-[#F6F8FC]
                   min-h-[calc(100vh-80px)]"
      >

        {/* ====================================================
            TOP NAVIGATION / ACTIONS
        ==================================================== */}

        <section
          className="no-print
                     mb-6"
        >

          <div
            className="flex
                       flex-col
                       sm:flex-row
                       sm:items-center
                       sm:justify-between
                       gap-4"
          >

            <button
              onClick={() =>
                navigate("/reports")
              }
              className="inline-flex
                         items-center
                         gap-2
                         text-slate-600
                         hover:text-slate-900
                         font-medium
                         transition-colors"
            >

              <ArrowLeft
                size={18}
              />

              Back to Reports

            </button>


            <div
              className="flex
                         items-center
                         gap-3"
            >

              <button
                onClick={
                  handlePrint
                }
                className="inline-flex
                           items-center
                           gap-2
                           px-4
                           py-2.5
                           rounded-xl
                           border
                           border-slate-200
                           bg-white
                           text-slate-700
                           hover:bg-slate-50
                           transition-all"
              >

                <Printer
                  size={17}
                />

                Print

              </button>


              <button
                onClick={
                  handleDownload
                }
                className="inline-flex
                           items-center
                           gap-2
                           px-4
                           py-2.5
                           rounded-xl
                           bg-[#081D41]
                           text-white
                           hover:bg-[#102A5A]
                           transition-all"
              >

                <Download
                  size={17}
                />

                Download / Print PDF

              </button>

            </div>

          </div>

        </section>


        {/* ====================================================
            REPORT HEADER
        ==================================================== */}

        <section
          className="print-section
                     print-card
                     bg-white
                     rounded-2xl
                     border
                     border-slate-200
                     shadow-sm
                     overflow-hidden
                     mb-6"
        >

          <div
            className="p-6
                       border-b
                       border-slate-200"
          >

            <div
              className="flex
                         flex-col
                         lg:flex-row
                         lg:items-start
                         lg:justify-between
                         gap-6"
            >

              <div>

                <div
                  className="flex
                             items-center
                             gap-3"
                >

                  <div
                    className="w-11 h-11
                               rounded-xl
                               bg-blue-50
                               flex
                               items-center
                               justify-center"
                  >

                    <FileText
                      size={23}
                      className="text-blue-600"
                    />

                  </div>


                  <div>

                    <p
                      className="text-sm
                                 font-medium
                                 text-blue-600"
                    >
                      NiyamDrishti
                    </p>


                    <h1
                      className="text-2xl
                                 font-bold
                                 text-slate-900"
                    >
                      Inspection Report
                    </h1>

                  </div>

                </div>


                <div
                  className="flex
                             flex-wrap
                             items-center
                             gap-x-6
                             gap-y-2
                             mt-5
                             text-sm
                             text-slate-500"
                >

                  <div
                    className="flex
                               items-center
                               gap-2"
                  >

                    <FileText
                      size={16}
                    />

                    <span>
                      Report ID:
                    </span>

                    <span
                      className="font-semibold
                                 text-slate-800"
                    >
                      {reportInspection.inspection_code ||
                        reportInspection.id ||
                        "—"}
                    </span>

                  </div>


                  <div
                    className="flex
                               items-center
                               gap-2"
                  >

                    <CalendarDays
                      size={16}
                    />

                    <span>
                      Date:
                    </span>

                    <span
                      className="font-semibold
                                 text-slate-800"
                    >
                      {formatDate(
                        reportInspection.created_at ||
                          reportInspection.completed_at
                      )}
                    </span>

                  </div>

                </div>

              </div>


              {/* ==================================================
                  FINAL STATUS
              ================================================== */}

              <div
                className={`flex
                            items-center
                            gap-3
                            px-5
                            py-4
                            rounded-xl
                            border
                            ${statusClasses.container}`}
              >

                <FinalStatusIcon
                  status={finalStatus}
                  size={28}
                />


                <div>

                  <p
                    className="text-xs
                               font-medium
                               text-slate-500"
                  >
                    Final Assessment
                  </p>


                  <p
                    className={`text-lg
                                font-bold
                                ${statusClasses.text}`}
                  >
                    {statusLabel}
                  </p>

                </div>

              </div>

            </div>

          </div>


          {/* ====================================================
              COMPLIANCE SUMMARY
          ==================================================== */}

          <div
            className="grid
                       grid-cols-2
                       lg:grid-cols-4
                       divide-x
                       divide-slate-200"
          >

            <div
              className="p-5"
            >

              <p
                className="text-xs
                           font-medium
                           text-slate-500"
              >
                Compliance Score
              </p>


              <p
                className="text-2xl
                           font-bold
                           text-slate-900
                           mt-1"
              >
                {compliancePercentage.toFixed(
                  1
                )}
                %
              </p>

            </div>


            <div
              className="p-5"
            >

              <p
                className="text-xs
                           font-medium
                           text-slate-500"
              >
                Total Checks
              </p>


              <p
                className="text-2xl
                           font-bold
                           text-slate-900
                           mt-1"
              >
                {totalChecks}
              </p>

            </div>


            <div
              className="p-5"
            >

              <p
                className="text-xs
                           font-medium
                           text-slate-500"
              >
                Passed
              </p>


              <p
                className="text-2xl
                           font-bold
                           text-green-600
                           mt-1"
              >
                {passedChecks}
              </p>

            </div>


            <div
              className="p-5"
            >

              <p
                className="text-xs
                           font-medium
                           text-slate-500"
              >
                Attention Required
              </p>


              <p
                className="text-2xl
                           font-bold
                           text-red-600
                           mt-1"
              >
                {failedChecks +
                  partialChecks}
              </p>

            </div>

          </div>

        </section>


        {/* ====================================================
            PRODUCT INFORMATION
        ==================================================== */}

        <section
          className="print-section
                     print-card
                     bg-white
                     rounded-2xl
                     border
                     border-slate-200
                     shadow-sm
                     p-6
                     mb-6"
        >

          <div
            className="flex
                       items-center
                       gap-3
                       mb-5"
          >

            <div
              className="w-10 h-10
                         rounded-xl
                         bg-blue-50
                         flex
                         items-center
                         justify-center"
            >

              <Package
                size={20}
                className="text-blue-600"
              />

            </div>


            <div>

              <h2
                className="text-lg
                           font-bold
                           text-slate-900"
              >
                Product Information
              </h2>

              <p
                className="text-sm
                           text-slate-500"
              >
                Details captured during the inspection.
              </p>

            </div>

          </div>


          <div
            className="grid
                       grid-cols-1
                       md:grid-cols-2
                       lg:grid-cols-3
                       gap-5"
          >

            <div>

              <p
                className="text-xs
                           font-medium
                           uppercase
                           tracking-wide
                           text-slate-400"
              >
                Product Name
              </p>


              <p
                className="text-sm
                           font-semibold
                           text-slate-800
                           mt-1"
              >
                {reportInspection.product_name ||
                  getRuleValue(
                    productNameRule
                  ) ||
                  "—"}
              </p>

            </div>


            <div>

              <p
                className="text-xs
                           font-medium
                           uppercase
                           tracking-wide
                           text-slate-400"
              >
                Brand
              </p>


              <p
                className="text-sm
                           font-semibold
                           text-slate-800
                           mt-1"
              >
                {reportInspection.brand_name ||
                  "—"}
              </p>

            </div>


            <div>

              <p
                className="text-xs
                           font-medium
                           uppercase
                           tracking-wide
                           text-slate-400"
              >
                Category
              </p>


              <p
                className="text-sm
                           font-semibold
                           text-slate-800
                           mt-1"
              >
                {reportInspection.category ||
                  "—"}
              </p>

            </div>


            <div>

              <p
                className="text-xs
                           font-medium
                           uppercase
                           tracking-wide
                           text-slate-400"
              >
                MRP
              </p>


              <p
                className="text-sm
                           font-semibold
                           text-slate-800
                           mt-1"
              >
                {reportInspection.mrp ||
                  getRuleValue(
                    mrpRule
                  ) ||
                  "—"}
              </p>

            </div>


            <div>

              <p
                className="text-xs
                           font-medium
                           uppercase
                           tracking-wide
                           text-slate-400"
              >
                Net Quantity
              </p>


              <p
                className="text-sm
                           font-semibold
                           text-slate-800
                           mt-1"
              >
                {reportInspection.net_quantity ||
                  getRuleValue(
                    quantityRule
                  ) ||
                  "—"}
              </p>

            </div>


            <div>

              <p
                className="text-xs
                           font-medium
                           uppercase
                           tracking-wide
                           text-slate-400"
              >
                Inspection Type
              </p>


              <p
                className="text-sm
                           font-semibold
                           text-slate-800
                           mt-1"
              >
                {formatInspectionType(
                  reportInspection.inspection_type
                )}
              </p>

            </div>

          </div>

        </section>


        {/* ====================================================
            INSPECTION DETAILS
        ==================================================== */}

        <section
          className="print-section
                     print-card
                     bg-white
                     rounded-2xl
                     border
                     border-slate-200
                     shadow-sm
                     p-6
                     mb-6"
        >

          <div
            className="flex
                       items-center
                       gap-3
                       mb-5"
          >

            <div
              className="w-10 h-10
                         rounded-xl
                         bg-slate-100
                         flex
                         items-center
                         justify-center"
            >

              <UserCheck
                size={20}
                className="text-slate-600"
              />

            </div>


            <div>

              <h2
                className="text-lg
                           font-bold
                           text-slate-900"
              >
                Inspection Details
              </h2>

              <p
                className="text-sm
                           text-slate-500"
              >
                Inspection record information.
              </p>

            </div>

          </div>


          <div
            className="grid
                       grid-cols-1
                       md:grid-cols-2
                       lg:grid-cols-3
                       gap-5"
          >

            <div>

              <p
                className="text-xs
                           font-medium
                           uppercase
                           tracking-wide
                           text-slate-400"
              >
                Inspection ID
              </p>


              <p
                className="text-sm
                           font-semibold
                           text-slate-800
                           mt-1
                           break-all"
              >
                {reportInspection.inspection_code ||
                  reportInspection.id ||
                  "—"}
              </p>

            </div>


            <div>

              <p
                className="text-xs
                           font-medium
                           uppercase
                           tracking-wide
                           text-slate-400"
              >
                Inspection Type
              </p>


              <p
                className="text-sm
                           font-semibold
                           text-slate-800
                           mt-1"
              >
                {formatInspectionType(
                  reportInspection.inspection_type
                )}
              </p>

            </div>


            <div>

              <p
                className="text-xs
                           font-medium
                           uppercase
                           tracking-wide
                           text-slate-400"
              >
                Created
              </p>


              <p
                className="text-sm
                           font-semibold
                           text-slate-800
                           mt-1"
              >
                {formatDateTime(
                  reportInspection.created_at
                )}
              </p>

            </div>


            <div>

              <p
                className="text-xs
                           font-medium
                           uppercase
                           tracking-wide
                           text-slate-400"
              >
                Completed
              </p>


              <p
                className="text-sm
                           font-semibold
                           text-slate-800
                           mt-1"
              >
                {formatDateTime(
                  reportInspection.completed_at
                )}
              </p>

            </div>


            <div>

              <p
                className="text-xs
                           font-medium
                           uppercase
                           tracking-wide
                           text-slate-400"
              >
                Status
              </p>


              <p
                className={`text-sm
                            font-semibold
                            mt-1
                            ${statusClasses.text}`}
              >
                {statusLabel}
              </p>

            </div>


            <div>

              <p
                className="text-xs
                           font-medium
                           uppercase
                           tracking-wide
                           text-slate-400"
              >
                Average OCR Confidence
              </p>


              <p
                className="text-sm
                           font-semibold
                           text-slate-800
                           mt-1"
              >
                {formatConfidence(
                  reportInspection.average_ocr_confidence
                )}
              </p>

            </div>

          </div>

        </section>


        {/* ====================================================
            COMPLIANCE FINDINGS
        ==================================================== */}

        <section
          className="print-card
                     bg-white
                     rounded-2xl
                     border
                     border-slate-200
                     shadow-sm
                     overflow-hidden
                     mb-6"
        >

          <div
            className="p-6
                       border-b
                       border-slate-200"
          >

            <div
              className="flex
                         items-center
                         gap-3"
            >

              <div
                className="w-10 h-10
                           rounded-xl
                           bg-blue-50
                           flex
                           items-center
                           justify-center"
              >

                <ShieldCheck
                  size={20}
                  className="text-blue-600"
                />

              </div>


              <div>

                <h2
                  className="text-lg
                             font-bold
                             text-slate-900"
                >
                  Compliance Findings
                </h2>


                <p
                  className="text-sm
                             text-slate-500"
                >
                  Rule-by-rule assessment from the inspection.
                </p>

              </div>

            </div>

          </div>


          {rules.length > 0 ? (

            <div
              className="divide-y
                         divide-slate-100"
            >

              {rules.map(
                (rule, index) => {

                  const ruleStatus =
                    normalizeStatus(
                      rule?.status
                    );

                  const ruleStatusClasses =
                    getStatusClasses(
                      ruleStatus
                    );


                  return (
                    <div
                      key={
                        rule?.id ??
                        rule?.rule_code ??
                        index
                      }
                      className="p-5
                                 print-section"
                    >

                      <div
                        className="flex
                                   flex-col
                                   lg:flex-row
                                   lg:items-start
                                   lg:justify-between
                                   gap-4"
                      >

                        <div
                          className="flex
                                     gap-4"
                        >

                          <div
                            className={`w-9 h-9
                                        rounded-lg
                                        flex
                                        items-center
                                        justify-center
                                        ${
                                          ruleStatus ===
                                          "compliant"
                                            ? "bg-green-50"
                                            : ruleStatus ===
                                                "potential_violation"
                                              ? "bg-red-50"
                                              : "bg-amber-50"
                                        }`}
                          >

                            {ruleStatus ===
                            "compliant" ? (
                              <CheckCircle2
                                size={18}
                                className="text-green-600"
                              />
                            ) : ruleStatus ===
                              "potential_violation" ? (
                              <AlertTriangle
                                size={18}
                                className="text-red-600"
                              />
                            ) : (
                              <AlertTriangle
                                size={18}
                                className="text-amber-600"
                              />
                            )}

                          </div>


                          <div>

                            <h3
                              className="text-sm
                                         font-semibold
                                         text-slate-900"
                            >
                              {getRuleName(
                                rule
                              )}
                            </h3>


                            <p
                              className="text-sm
                                         text-slate-600
                                         mt-1"
                            >
                              {getRuleValue(
                                rule
                              )}
                            </p>


                            {rule?.source_text &&
                              String(
                                rule.source_text
                              ) !==
                                String(
                                  getRuleValue(
                                    rule
                                  )
                                ) && (
                                <p
                                  className="text-xs
                                             text-slate-400
                                             mt-2"
                                >
                                  OCR:{" "}
                                  {
                                    rule.source_text
                                  }
                                </p>
                              )}

                          </div>

                        </div>


                        <div
                          className="flex
                                     flex-wrap
                                     items-center
                                     gap-3
                                     lg:justify-end"
                        >

                          <span
                            className={`inline-flex
                                        items-center
                                        px-3
                                        py-1.5
                                        rounded-full
                                        border
                                        text-xs
                                        font-semibold
                                        ${ruleStatusClasses.container}
                                        ${ruleStatusClasses.text}`}
                          >
                            {getStatusLabel(
                              ruleStatus
                            )}
                          </span>


                          {rule?.confidence !==
                            undefined &&
                            rule?.confidence !==
                              null && (
                              <span
                                className="text-xs
                                           text-slate-400"
                              >
                                OCR confidence:{" "}
                                {formatConfidence(
                                  rule.confidence
                                )}
                              </span>
                            )}

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          ) : (

            <div
              className="p-10
                         text-center"
            >

              <Search
                size={34}
                className="mx-auto
                           text-slate-300"
              />


              <p
                className="text-sm
                           text-slate-500
                           mt-3"
              >
                No detailed rule results are available for this inspection.
              </p>

            </div>

          )}

        </section>


        {/* ====================================================
            INSPECTION EVIDENCE
        ==================================================== */}

        <section
          className="print-section
                     print-card
                     bg-white
                     rounded-2xl
                     border
                     border-slate-200
                     shadow-sm
                     p-6
                     mb-6"
        >

          <div
            className="flex
                       items-center
                       gap-3
                       mb-5"
          >

            <div
              className="w-10 h-10
                         rounded-xl
                         bg-slate-100
                         flex
                         items-center
                         justify-center"
            >

              <FileText
                size={20}
                className="text-slate-600"
              />

            </div>


            <div>

              <h2
                className="text-lg
                           font-bold
                           text-slate-900"
              >
                Inspection Evidence
              </h2>


              <p
                className="text-sm
                           text-slate-500"
              >
                Images associated with this inspection.
              </p>

            </div>

          </div>


          {Array.isArray(
            reportInspection.images
          ) &&
          reportInspection.images.length >
            0 ? (

            <div
              className="grid
                         grid-cols-1
                         md:grid-cols-2
                         gap-5"
            >

              {reportInspection.images.map(
                (image, index) => {

                  const imageUrl =
                    image?.file_url ||
                    image?.url ||
                    (
                      image?.id !==
                        undefined &&
                      image?.id !==
                        null
                        ? `${API_URL}/inspection-images/${image.id}`
                        : null
                    );


                  return (
                    <div
                      key={
                        image?.id ??
                        index
                      }
                      className="border
                                 border-slate-200
                                 rounded-xl
                                 overflow-hidden
                                 bg-slate-50"
                    >

                      {imageUrl ? (

                        <img
                          src={imageUrl}
                          alt={`Inspection evidence ${
                            index + 1
                          }`}
                          className="w-full
                                     max-h-[420px]
                                     object-contain
                                     bg-slate-100"
                        />

                      ) : (

                        <div
                          className="h-48
                                     flex
                                     items-center
                                     justify-center
                                     text-sm
                                     text-slate-400"
                        >
                          Image unavailable
                        </div>

                      )}


                      <div
                        className="px-4
                                   py-3
                                   border-t
                                   border-slate-200
                                   bg-white"
                      >

                        <p
                          className="text-sm
                                     font-medium
                                     text-slate-700"
                        >
                          {image?.original_filename ||
                            image?.filename ||
                            `Inspection Image ${
                              index + 1
                            }`}
                        </p>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          ) : (

            <div
              className="rounded-xl
                         border
                         border-dashed
                         border-slate-300
                         p-10
                         text-center"
            >

              <FileText
                size={34}
                className="mx-auto
                           text-slate-300"
              />


              <p
                className="text-sm
                           text-slate-500
                           mt-3"
              >
                No inspection images are available.
              </p>

            </div>

          )}

        </section>


        {/* ====================================================
            INSPECTION RECORD
        ==================================================== */}

        <section
          className="print-section
                     print-card
                     bg-white
                     rounded-2xl
                     border
                     border-slate-200
                     shadow-sm
                     p-6
                     mb-6"
        >

          <div
            className="flex
                       items-center
                       gap-3
                       mb-5"
          >

            <div
              className="w-10 h-10
                         rounded-xl
                         bg-slate-100
                         flex
                         items-center
                         justify-center"
            >

              <CalendarDays
                size={20}
                className="text-slate-600"
              />

            </div>


            <div>

              <h2
                className="text-lg
                           font-bold
                           text-slate-900"
              >
                Inspection Record
              </h2>


              <p
                className="text-sm
                           text-slate-500"
              >
                Database record associated with this report.
              </p>

            </div>

          </div>


          <div
            className="grid
                       grid-cols-1
                       md:grid-cols-2
                       gap-5"
          >

            <div
              className="rounded-xl
                         bg-slate-50
                         border
                         border-slate-100
                         p-4"
            >

              <div
                className="flex
                           items-center
                           gap-2
                           text-slate-500
                           text-xs
                           font-medium"
              >

                <CalendarDays
                  size={15}
                />

                Created

              </div>


              <p
                className="text-sm
                           font-semibold
                           text-slate-800
                           mt-2"
              >
                {formatDateTime(
                  reportInspection.created_at
                )}
              </p>

            </div>


            <div
              className="rounded-xl
                         bg-slate-50
                         border
                         border-slate-100
                         p-4"
            >

              <div
                className="flex
                           items-center
                           gap-2
                           text-slate-500
                           text-xs
                           font-medium"
              >

                <CalendarDays
                  size={15}
                />

                Completed

              </div>


              <p
                className="text-sm
                           font-semibold
                           text-slate-800
                           mt-2"
              >
                {formatDateTime(
                  reportInspection.completed_at
                )}
              </p>

            </div>


            <div
              className="rounded-xl
                         bg-slate-50
                         border
                         border-slate-100
                         p-4"
            >

              <div
                className="flex
                           items-center
                           gap-2
                           text-slate-500
                           text-xs
                           font-medium"
              >

                <MapPin
                  size={15}
                />

                Location

              </div>


              <p
                className="text-sm
                           font-semibold
                           text-slate-800
                           mt-2"
              >
                {reportInspection.location ||
                  reportInspection.inspection_location ||
                  "Not available"}
              </p>

            </div>


            <div
              className="rounded-xl
                         bg-slate-50
                         border
                         border-slate-100
                         p-4"
            >

              <div
                className="flex
                           items-center
                           gap-2
                           text-slate-500
                           text-xs
                           font-medium"
              >

                <UserCheck
                  size={15}
                />

                Inspection Type

              </div>


              <p
                className="text-sm
                           font-semibold
                           text-slate-800
                           mt-2"
              >
                {formatInspectionType(
                  reportInspection.inspection_type
                )}
              </p>

            </div>

          </div>

        </section>


        {/* ====================================================
            DISCLAIMER
        ==================================================== */}

        <section
          className="print-section
                     print-card
                     bg-slate-50
                     rounded-2xl
                     border
                     border-slate-200
                     p-5
                     mb-6"
        >

          <p
            className="text-xs
                       leading-5
                       text-slate-500"
          >
            <span
              className="font-semibold
                         text-slate-700"
            >
              Note:
            </span>{" "}
            This report is generated from the OCR detections
            and Legal Metrology rule-engine analysis stored for
            this inspection. The report is intended to assist
            inspection and review and should be considered
            alongside applicable Legal Metrology requirements
            and official inspection procedures.
          </p>

        </section>


        {/* ====================================================
            BOTTOM ACTIONS
        ==================================================== */}

        <section
          className="no-print
                     flex
                     flex-col
                     sm:flex-row
                     items-center
                     justify-between
                     gap-4
                     bg-white
                     rounded-2xl
                     border
                     border-slate-200
                     shadow-sm
                     p-5"
        >

          <div>

            <p
              className="text-sm
                         font-semibold
                         text-slate-800"
            >
              Report ready
            </p>


            <p
              className="text-xs
                         text-slate-500
                         mt-1"
            >
              Use your browser's print dialog to save this report as a PDF.
            </p>

          </div>


          <div
            className="flex
                       items-center
                       gap-3"
          >

            <button
              onClick={
                handlePrint
              }
              className="inline-flex
                         items-center
                         gap-2
                         px-4
                         py-2.5
                         rounded-xl
                         border
                         border-slate-200
                         bg-white
                         text-slate-700
                         hover:bg-slate-50
                         transition-all"
            >

              <Printer
                size={17}
              />

              Export / Print

            </button>


            <button
              onClick={
                handleDownload
              }
              className="inline-flex
                         items-center
                         gap-2
                         px-4
                         py-2.5
                         rounded-xl
                         bg-[#081D41]
                         text-white
                         hover:bg-[#102A5A]
                         transition-all"
            >

              <Download
                size={17}
              />

              Download Report

            </button>

          </div>

        </section>

      </main>
    </>
  );
}


export default Report;
