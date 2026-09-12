import React from "react";
import { useNavigate } from "react-router-dom";
import { useInspection } from "../context/InspectionContext";

function StatusBadge({ status }) {
  const normalized = status?.toUpperCase();

  if (normalized === "PASS") {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
        PASS
      </span>
    );
  }

  if (normalized === "PARTIAL" || normalized === "NEEDS REVIEW") {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
        NEEDS REVIEW
      </span>
    );
  }

  return (
    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
      VIOLATION
    </span>
  );
}

function ConfidenceBar({ confidence }) {
  const value = Math.round(Number(confidence || 0) * 100);

  return (
    <div className="flex items-center gap-3 min-w-[150px]">
      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full"
          style={{ width: `${value}%` }}
        />
      </div>

      <span className="text-sm font-medium text-gray-700">
        {value}%
      </span>
    </div>
  );
}

export default function EvidenceReview() {
  const navigate = useNavigate();
  const { inspection } = useInspection();

  const report = inspection?.complianceResult?.compliance_report;
  const checks = report?.checks || [];

  const image = inspection?.images?.[0];

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">

        <button
          onClick={() => navigate("/compliance-result")}
          className="text-sm text-blue-600 hover:underline mb-4"
        >
          ← Back to Compliance Result
        </button>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Evidence Review
          </h1>

          <p className="text-gray-500 mt-2">
            Review the text and compliance evidence detected from the product label.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT — PRODUCT IMAGE */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">

          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Product Label
              </h2>

              <p className="text-sm text-gray-500">
                Uploaded inspection image
              </p>
            </div>
          </div>

          <div className="bg-gray-100 rounded-xl min-h-[500px] flex items-center justify-center overflow-hidden">

            {image?.preview ? (
              <img
                src={image.preview}
                alt="Product label"
                className="max-h-[600px] max-w-full object-contain"
              />
            ) : (
              <div className="text-gray-400 text-sm">
                Product image unavailable
              </div>
            )}

          </div>
        </div>


        {/* RIGHT — INSPECTION EVIDENCE */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">

          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Compliance Evidence
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Evidence extracted by OCR and evaluated by the rule engine.
            </p>
          </div>


          {/* Checks */}
          <div className="space-y-4">

            {checks.length === 0 ? (

              <div className="text-center py-12 text-gray-500">
                No compliance evidence available.
              </div>

            ) : (

              checks.map((check, index) => (

                <div
                  key={index}
                  className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition"
                >

                  {/* Rule header */}
                  <div className="flex items-center justify-between gap-3 mb-3">

                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {check.name}
                      </h3>

                      <p className="text-xs text-gray-500 mt-1">
                        Rule check #{index + 1}
                      </p>
                    </div>

                    <StatusBadge status={check.status} />

                  </div>


                  {/* Detected value */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">

                    <p className="text-xs text-gray-500 mb-1">
                      Detected Value
                    </p>

                    <p className="text-sm font-medium text-gray-900 break-words">
                      {check.value || "Not detected"}
                    </p>

                  </div>


                  {/* Confidence */}
                  {check.confidence !== null &&
                    check.confidence !== undefined && (
                      <div className="flex items-center justify-between">

                        <span className="text-xs text-gray-500">
                          OCR Confidence
                        </span>

                        <ConfidenceBar
                          confidence={check.confidence}
                        />

                      </div>
                    )}


                  {/* Bounding box information */}
                  {check.bounding_box && (
                    <div className="mt-3 pt-3 border-t border-gray-200">

                      <p className="text-xs text-gray-500 mb-1">
                        Evidence Location
                      </p>

                      <p className="text-xs text-gray-600">
                        X: {check.bounding_box.x1} –{" "}
                        {check.bounding_box.x2}
                        {" | "}
                        Y: {check.bounding_box.y1} –{" "}
                        {check.bounding_box.y2}
                      </p>

                    </div>
                  )}

                </div>

              ))

            )}

          </div>

        </div>

      </div>


      {/* Bottom action */}
      <div className="max-w-7xl mx-auto mt-6 flex justify-end">

        <button
          onClick={() => navigate("/report")}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
        >
          Continue to Report →
        </button>

      </div>

    </div>
  );
}
