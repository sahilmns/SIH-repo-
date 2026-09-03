import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FileText, 
  Eye, 
  ShieldCheck, 
  Package, 
  ScanText, 
  Info, 
  ArrowRight, 
} from "lucide-react"; 

import { useNavigate } from "react-router-dom";
 
function ComplianceResult() { 

  const navigate = useNavigate();

  return ( 
    <main className="p-6 lg:p-8 bg-[#F6F8FC] min-h-[calc(100vh-80px)]"> 
 
      {/* Header */} 
      <div className="mb-8"> 
 
        <button 
          onClick={() => navigate("/analysis")}
          className="flex items-center gap-2 text-sm text-slate-500 
                     hover:text-blue-600 transition-colors mb-4" 
        > 
          <ArrowLeft size={17} /> 
          Back to Analysis 
        </button> 
 
        <div className="flex flex-col lg:flex-row lg:items-center 
                        lg:justify-between gap-4"> 
 
          <div> 
 
            <p className="text-sm font-medium text-blue-600 mb-1"> 
              Inspection #MTX-2026-00128 
            </p> 
 
            <h1 className="text-3xl font-bold text-slate-900"> 
              Compliance Result 
            </h1> 
 
            <p className="text-slate-500 mt-2"> 
              AI-assisted assessment of the packaged commodity. 
            </p> 
 
          </div> 
 
 
          {/* Status */} 
          <div 
            className="flex items-center gap-3 
                       px-5 py-3 rounded-xl 
                       bg-amber-50 border border-amber-200" 
          > 
 
            <AlertTriangle 
              size={22} 
              className="text-amber-600" 
            /> 
 
            <div> 
 
              <p className="text-sm font-semibold text-amber-800"> 
                Needs Review 
              </p> 
 
              <p className="text-xs text-amber-700"> 
                Inspector verification required 
              </p> 
 
            </div> 
 
          </div> 
 
        </div> 
 
      </div> 
 
 
      {/* Summary Cards */} 
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6"> 
 
 
        {/* Verified */} 
        <div 
          className="bg-white border border-slate-200 
                     rounded-2xl p-6 shadow-sm" 
        > 
 
          <div className="flex items-center justify-between"> 
 
            <div> 
 
              <p className="text-sm font-medium text-slate-500"> 
                Verified Declarations 
              </p> 
 
              <h2 className="text-3xl font-bold text-green-600 mt-2"> 
                7 
              </h2> 
 
            </div> 
 
            <div 
              className="w-11 h-11 rounded-xl 
                         bg-green-50 text-green-600 
                         flex items-center justify-center" 
            > 
              <CheckCircle2 size={22} /> 
            </div> 
 
          </div> 
 
        </div> 
 
 
        {/* Needs Review */} 
        <div 
          className="bg-white border border-slate-200 
                     rounded-2xl p-6 shadow-sm" 
        > 
 
          <div className="flex items-center justify-between"> 
 
            <div> 
 
              <p className="text-sm font-medium text-slate-500"> 
                Needs Review 
              </p> 
 
              <h2 className="text-3xl font-bold text-amber-500 mt-2"> 
                2 
              </h2> 
 
            </div> 
 
            <div 
              className="w-11 h-11 rounded-xl 
                         bg-amber-50 text-amber-600 
                         flex items-center justify-center" 
            > 
              <AlertTriangle size={22} /> 
            </div> 
 
          </div> 
 
        </div> 
 
 
        {/* Potential Violations */} 
        <div 
          className="bg-white border border-slate-200 
                     rounded-2xl p-6 shadow-sm" 
        > 
 
          <div className="flex items-center justify-between"> 
 
            <div> 
 
              <p className="text-sm font-medium text-slate-500"> 
                Potential Violations 
              </p> 
 
              <h2 className="text-3xl font-bold text-red-600 mt-2"> 
                1 
              </h2> 
 
            </div> 
 
            <div 
              className="w-11 h-11 rounded-xl 
                         bg-red-50 text-red-600 
                         flex items-center justify-center" 
            > 
              <XCircle size={22} /> 
            </div> 
 
          </div> 
 
        </div> 
 
      </section> 
 
 
      {/* Main Grid */} 
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6"> 
 
 
        {/* Extracted Information */} 
        <section 
          className="xl:col-span-2 bg-white 
                     border border-slate-200 
                     rounded-2xl shadow-sm p-7" 
        > 
 
          <div className="flex items-center gap-3 mb-6"> 
 
            <div 
              className="w-11 h-11 rounded-xl 
                         bg-blue-50 text-blue-600 
                         flex items-center justify-center" 
            > 
              <Package size={22} /> 
            </div> 
 
            <div> 
 
              <h2 className="text-xl font-bold text-slate-900"> 
                Extracted Product Information 
              </h2> 
 
              <p className="text-sm text-slate-500"> 
                Information detected from package images 
              </p> 
 
            </div> 
 
          </div> 
 
 
          {/* Product Info */} 
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> 
 
 
            <div className="p-4 rounded-xl bg-slate-50"> 
 
              <p className="text-xs text-slate-500"> 
                Product Name 
              </p> 
 
              <p className="font-semibold text-slate-900 mt-1"> 
                Premium Basmati Rice 
              </p> 
 
            </div> 
 
 
            <div className="p-4 rounded-xl bg-slate-50"> 
 
              <p className="text-xs text-slate-500"> 
                Brand 
              </p> 
 
              <p className="font-semibold text-slate-900 mt-1"> 
                Example Foods 
              </p> 
 
            </div> 
 
 
            <div className="p-4 rounded-xl bg-slate-50"> 
 
              <p className="text-xs text-slate-500"> 
                Net Quantity 
              </p> 
 
              <p className="font-semibold text-slate-900 mt-1"> 
                1 kg 
              </p> 
 
            </div> 
 
 
            <div className="p-4 rounded-xl bg-slate-50"> 
 
              <p className="text-xs text-slate-500"> 
                Maximum Retail Price 
              </p> 
 
              <p className="font-semibold text-slate-900 mt-1"> 
                ₹180 
              </p> 
 
            </div> 
 
 
            <div className="p-4 rounded-xl bg-slate-50"> 
 
              <p className="text-xs text-slate-500"> 
                Manufacturer 
              </p> 
 
              <p className="font-semibold text-slate-900 mt-1"> 
                Example Foods Pvt. Ltd. 
              </p> 
 
            </div> 
 
 
            <div className="p-4 rounded-xl bg-slate-50"> 
 
              <p className="text-xs text-slate-500"> 
                Consumer Care 
              </p> 
 
              <p className="font-semibold text-slate-900 mt-1"> 
                1800-000-0000 
              </p> 
 
            </div> 
 
          </div> 
 
 
          {/* Findings */} 
          <div className="mt-8"> 
 
            <div className="flex items-center justify-between mb-4"> 
 
              <div> 
 
                <h2 className="text-lg font-bold text-slate-900"> 
                  Compliance Findings 
                </h2> 
 
                <p className="text-sm text-slate-500 mt-1"> 
                  Detected issues and validation results 
                </p> 
 
              </div> 
 
              <span 
                className="text-xs font-medium 
                           px-3 py-1.5 rounded-full 
                           bg-blue-50 text-blue-700" 
              > 
                10 checks 
              </span> 
 
            </div> 
 
 
            {/* Finding 1 */} 
            <div 
              className="border border-green-200 
                         bg-green-50/40 
                         rounded-xl p-4 mb-3" 
            > 
 
              <div className="flex items-start gap-3"> 
 
                <CheckCircle2 
                  size={20} 
                  className="text-green-600 mt-0.5" 
                /> 
 
                <div className="flex-1"> 
 
                  <div className="flex flex-col sm:flex-row 
                                  sm:items-center sm:justify-between gap-2"> 
 
                    <h3 className="font-semibold text-slate-900"> 
                      Net Quantity Declaration 
                    </h3> 
 
                    <span className="text-xs font-medium text-green-600"> 
                      Verified 
                    </span> 
 
                  </div> 
 
                  <p className="text-sm text-slate-500 mt-1"> 
                    Net quantity was detected and appears to be clearly 
                    declared on the package. 
                  </p> 
 
                  <p className="text-xs text-slate-400 mt-2"> 
                    Confidence: 98% 
                  </p> 
 
                </div> 
 
              </div> 
 
            </div> 
 
 
            {/* Finding 2 */} 
            <div 
              className="border border-amber-200 
                         bg-amber-50/40 
                         rounded-xl p-4 mb-3" 
            > 
 
              <div className="flex items-start gap-3"> 
 
                <AlertTriangle 
                  size={20} 
                  className="text-amber-600 mt-0.5" 
                /> 
 
                <div className="flex-1"> 
 
                  <div className="flex flex-col sm:flex-row 
                                  sm:items-center sm:justify-between gap-2"> 
 
                    <h3 className="font-semibold text-slate-900"> 
                      Manufacturer Declaration 
                    </h3> 
 
                    <span className="text-xs font-medium text-amber-600"> 
                      Needs Review 
                    </span> 
 
                  </div> 
 
                  <p className="text-sm text-slate-500 mt-1"> 
                    Manufacturer information was detected, but image 
                    quality prevents reliable validation. 
                  </p> 
 
                  <p className="text-xs text-slate-400 mt-2"> 
                    Confidence: 71% 
                  </p> 
 
                </div> 
 
              </div> 
 
            </div> 
 
 
            {/* Finding 3 */} 
            <div 
              className="border border-red-200 
                         bg-red-50/40 
                         rounded-xl p-4" 
            > 
 
              <div className="flex items-start gap-3"> 
 
                <XCircle 
                  size={20} 
                  className="text-red-600 mt-0.5" 
                /> 
 
                <div className="flex-1"> 
 
                  <div className="flex flex-col sm:flex-row 
                                  sm:items-center sm:justify-between gap-2"> 
 
                    <h3 className="font-semibold text-slate-900"> 
                      MRP Declaration 
                    </h3> 
 
                    <span className="text-xs font-medium text-red-600"> 
                      Potential Violation 
                    </span> 
 
                  </div> 
 
                  <p className="text-sm text-slate-500 mt-1"> 
                    Detected MRP information may not satisfy the expected 
                    declaration format. Manual verification is required. 
                  </p> 
 
                  <p className="text-xs text-slate-400 mt-2"> 
                    Confidence: 84% 
                  </p> 
 
                </div> 
 
              </div> 
 
            </div> 
 
          </div> 
 
        </section> 
 
 
        {/* Inspection Summary */} 
        <section 
          className="bg-white border border-slate-200 
                     rounded-2xl shadow-sm p-7" 
        > 
 
          <div className="flex items-center gap-3 mb-6"> 
 
            <div 
              className="w-11 h-11 rounded-xl 
                         bg-cyan-50 text-cyan-600 
                         flex items-center justify-center" 
            > 
              <ShieldCheck size={22} /> 
            </div> 
 
            <div> 
 
              <h2 className="text-xl font-bold text-slate-900"> 
                Inspection Summary 
              </h2> 
 
              <p className="text-sm text-slate-500"> 
                Review before verification 
              </p> 
 
            </div> 
 
          </div> 
 
 
          {/* Overall Score */} 
          <div 
            className="p-5 rounded-2xl 
                       bg-amber-50 border border-amber-200 
                       text-center" 
          > 
 
            <p className="text-sm font-medium text-amber-700"> 
              Overall Assessment 
            </p> 
 
            <p className="text-4xl font-bold text-amber-600 mt-2"> 
              Review 
            </p> 
 
            <p className="text-xs text-amber-700 mt-2"> 
              Human verification required 
            </p> 
 
          </div> 
 
 
          {/* Inspection Info */} 
          <div className="mt-6 space-y-4"> 
 
            <div className="flex justify-between"> 
 
              <span className="text-sm text-slate-500"> 
                Inspection ID 
              </span> 
 
              <span className="text-sm font-medium text-slate-900"> 
                MTX-2026-00128 
              </span> 
 
            </div> 
 
 
            <div className="flex justify-between"> 
 
              <span className="text-sm text-slate-500"> 
                Images analyzed 
              </span> 
 
              <span className="text-sm font-medium text-slate-900"> 
                3 
              </span> 
 
            </div> 
 
 
            <div className="flex justify-between"> 
 
              <span className="text-sm text-slate-500"> 
                Checks performed 
              </span> 
 
              <span className="text-sm font-medium text-slate-900"> 
                10 
              </span> 
 
            </div> 
 
 
            <div className="flex justify-between"> 
 
              <span className="text-sm text-slate-500"> 
                AI confidence 
              </span> 
 
              <span className="text-sm font-medium text-slate-900"> 
                91% 
              </span> 
 
            </div> 
 
          </div> 
 
 
          {/* Evidence Button */} 
          <button 
            onClick={() => navigate("/evidence-review")}
            className="w-full mt-7 
                       flex items-center justify-center gap-2 
                       px-4 py-3 rounded-xl 
                       border border-blue-200 
                       text-blue-600 font-medium 
                       hover:bg-blue-50 transition" 
          > 
 
            <Eye size={18} /> 
 
            Review Evidence 
 
          </button> 
 
 
          {/* Verify Button */} 
          <button 
            onClick={() => navigate("/evidence-review")}
            className="w-full mt-3 
                       flex items-center justify-center gap-2 
                       px-4 py-3 rounded-xl 
                       bg-blue-600 hover:bg-blue-700 
                       text-white font-semibold 
                       transition" 
          > 
 
            Proceed to Verification 
 
            <ArrowRight size={18} /> 
 
          </button> 
 
 
          {/* Notice */} 
          <div 
            className="mt-5 p-4 rounded-xl 
                       bg-slate-50 border border-slate-200" 
          > 
 
            <div className="flex gap-2"> 
 
              <Info 
                size={17} 
                className="text-slate-500 mt-0.5" 
              /> 
 
              <p className="text-xs text-slate-500 leading-relaxed"> 
                Metra-X provides an AI-assisted assessment. Final 
                compliance decisions must be verified by an authorized 
                enforcement officer. 
              </p> 
 
            </div> 
 
          </div> 
 
        </section> 
 
      </div> 
 
 
      {/* Bottom */} 
      <div 
        className="mt-6 p-5 bg-white border border-slate-200 
                   rounded-2xl shadow-sm" 
      > 
 
        <div className="flex flex-col md:flex-row 
                        md:items-center md:justify-between gap-4"> 
 
          <div className="flex items-center gap-3"> 
 
            <ScanText 
              size={20} 
              className="text-blue-600" 
            /> 
 
            <div> 
 
              <p className="text-sm font-semibold text-slate-900"> 
                Evidence-based assessment 
              </p> 
 
              <p className="text-xs text-slate-500 mt-1"> 
                Every finding can be traced back to detected package information. 
              </p> 
 
            </div> 
 
          </div> 
 
          <button 
            className="flex items-center justify-center gap-2 
                       text-sm font-medium text-blue-600 
                       hover:text-blue-700" 
          > 
            <FileText size={17} /> 
            Generate Report 
          </button> 
 
        </div> 
 
      </div> 
 
    </main> 
  ); 
} 
 
export default ComplianceResult;