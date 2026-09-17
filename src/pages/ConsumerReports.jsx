import {
    FileText,
    Download,
    Eye,
    CheckCircle,
    AlertTriangle,
    XCircle,
    FileBarChart,
} from "lucide-react";

function ConsumerReports() {

    // Temporary dummy data
    const reports = [
        {
            id: 1,
            product: "Tata Salt",
            brand: "Tata",
            date: "17 Sep 2026",
            status: "Compliant",
        },
        {
            id: 2,
            product: "Aashirvaad Atta",
            brand: "Aashirvaad",
            date: "15 Sep 2026",
            status: "Needs Review",
        },
        {
            id: 3,
            product: "Parle-G Biscuits",
            brand: "Parle",
            date: "12 Sep 2026",
            status: "Non-Compliant",
        },
    ];

    // Status UI
    const getStatusDetails = (status) => {

        if (status === "Compliant") {
            return {
                icon: CheckCircle,
                className: "bg-green-50 text-green-700 border-green-200",
            };
        }

        if (status === "Needs Review") {
            return {
                icon: AlertTriangle,
                className: "bg-yellow-50 text-yellow-700 border-yellow-200",
            };
        }

        return {
            icon: XCircle,
            className: "bg-red-50 text-red-700 border-red-200",
        };
    };


    // Temporary button handlers
    const handleViewReport = (report) => {
        alert(`Opening report for ${report.product}`);
    };

    const handleDownloadReport = (report) => {
        alert(`Downloading report for ${report.product}`);
    };


    return (
        <div className="p-6">

            {/* Header */}
            <div className="mb-6">

                <div className="flex items-center gap-3">

                    <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                        <FileBarChart
                            size={24}
                            className="text-[#0070FF]"
                        />
                    </div>

                    <div>

                        <h1 className="text-3xl font-bold text-[#081D41]">
                            Reports
                        </h1>

                        <p className="mt-1 text-gray-600">
                            View and download your product compliance reports.
                        </p>

                    </div>

                </div>

            </div>


            {/* Main Card */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">

                {/* Card Header */}
                <div className="p-5 border-b">

                    <div className="flex items-center gap-3">

                        <FileText
                            size={20}
                            className="text-[#0070FF]"
                        />

                        <div>

                            <h2 className="text-lg font-semibold text-[#081D41]">
                                Compliance Reports
                            </h2>

                            <p className="text-sm text-gray-500 mt-1">
                                Reports generated from your previous product scans.
                            </p>

                        </div>

                    </div>

                </div>


                {/* Reports List */}
                <div className="overflow-x-auto">

                    {reports.length > 0 ? (

                        <table className="w-full">

                            <thead>

                                <tr className="bg-gray-50 border-b">

                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                                        Product
                                    </th>

                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                                        Brand
                                    </th>

                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                                        Scan Date
                                    </th>

                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                                        Status
                                    </th>

                                    <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {reports.map((report) => {

                                    const statusDetails =
                                        getStatusDetails(report.status);

                                    const StatusIcon =
                                        statusDetails.icon;

                                    return (

                                        <tr
                                            key={report.id}
                                            className="border-b last:border-b-0 hover:bg-gray-50 transition"
                                        >

                                            {/* Product */}
                                            <td className="px-6 py-5">

                                                <div className="flex items-center gap-3">

                                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">

                                                        <FileText
                                                            size={19}
                                                            className="text-[#0070FF]"
                                                        />

                                                    </div>

                                                    <div>

                                                        <p className="font-medium text-[#081D41]">
                                                            {report.product}
                                                        </p>

                                                        <p className="text-xs text-gray-500 mt-0.5">
                                                            Compliance Report
                                                        </p>

                                                    </div>

                                                </div>

                                            </td>


                                            {/* Brand */}
                                            <td className="px-6 py-5 text-gray-600">
                                                {report.brand}
                                            </td>


                                            {/* Date */}
                                            <td className="px-6 py-5 text-gray-600">
                                                {report.date}
                                            </td>


                                            {/* Status */}
                                            <td className="px-6 py-5">

                                                <span
                                                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${statusDetails.className}`}
                                                >

                                                    <StatusIcon size={16} />

                                                    {report.status}

                                                </span>

                                            </td>


                                            {/* Actions */}
                                            <td className="px-6 py-5">

                                                <div className="flex items-center justify-end gap-2">

                                                    <button
                                                        type="button"
                                                        onClick={() => handleViewReport(report)}
                                                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition text-sm font-medium"
                                                    >

                                                        <Eye size={16} />

                                                        View

                                                    </button>


                                                    <button
                                                        type="button"
                                                        onClick={() => handleDownloadReport(report)}
                                                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition text-sm font-medium"
                                                    >

                                                        <Download size={16} />

                                                        Download

                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    );

                                })}

                            </tbody>

                        </table>

                    ) : (

                        /* Empty State */
                        <div className="py-16 text-center">

                            <div className="mx-auto w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">

                                <FileText
                                    size={25}
                                    className="text-gray-400"
                                />

                            </div>

                            <h2 className="mt-4 text-lg font-semibold text-[#081D41]">
                                No reports available
                            </h2>

                            <p className="mt-1 text-gray-500">
                                Your compliance reports will appear here after you scan a product.
                            </p>

                        </div>

                    )}

                </div>

            </div>

        </div>
    );
}

export default ConsumerReports;
