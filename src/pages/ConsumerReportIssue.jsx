import { useState } from "react";
import {
    AlertTriangle,
    Upload,
    X,
    Send,
    ImagePlus,
} from "lucide-react";

function ConsumerReportIssue() {
    const [productName, setProductName] = useState("");
    const [brandName, setBrandName] = useState("");
    const [issueType, setIssueType] = useState("");
    const [description, setDescription] = useState("");

    const [selectedImages, setSelectedImages] = useState([]);

    // Handle image selection - one image at a time
    const handleImageChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            alert("Please select an image file.");
            event.target.value = "";
            return;
        }

        if (selectedImages.length >= 4) {
            alert("You can select a maximum of 4 images.");
            event.target.value = "";
            return;
        }

        const newImage = {
            file,
            preview: URL.createObjectURL(file),
        };

        setSelectedImages((prev) => [...prev, newImage]);

        // Reset input so the same image can be selected again
        event.target.value = "";
    };

    // Remove image
    const handleRemoveImage = (index) => {
        setSelectedImages((prev) => {
            const updatedImages = [...prev];

            if (updatedImages[index]) {
                URL.revokeObjectURL(updatedImages[index].preview);
            }

            updatedImages.splice(index, 1);

            return updatedImages;
        });
    };

    // Submit report
    const handleSubmit = (event) => {
        event.preventDefault();

        if (!productName || !issueType || !description) {
            alert("Please fill all required fields.");
            return;
        }

        alert(
            `Issue reported successfully with ${selectedImages.length} image${selectedImages.length > 1 ? "s" : ""
            }!`
        );

        // Reset form
        setProductName("");
        setBrandName("");
        setIssueType("");
        setDescription("");

        selectedImages.forEach((image) => {
            URL.revokeObjectURL(image.preview);
        });

        setSelectedImages([]);
    };

    return (
        <div className="p-6">

            {/* Header */}
            <div className="mb-6">

                <div className="flex items-center gap-3">

                    <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
                        <AlertTriangle
                            size={24}
                            className="text-red-500"
                        />
                    </div>

                    <div>

                        <h1 className="text-3xl font-bold text-[#081D41]">
                            Report an Issue
                        </h1>

                        <p className="mt-1 text-gray-600">
                            Report a problem found on a packaged product.
                        </p>

                    </div>

                </div>

            </div>


            {/* Main Form */}
            <div className="max-w-3xl">

                <div className="bg-white rounded-xl border shadow-sm p-8">

                    <form onSubmit={handleSubmit}>

                        {/* Product Details */}
                        <div>

                            <h2 className="text-xl font-semibold text-[#081D41]">
                                Product Information
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Provide the basic information about the product.
                            </p>

                        </div>


                        {/* Product Name */}
                        <div className="mt-6">

                            <label
                                htmlFor="productName"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Product Name <span className="text-red-500">*</span>
                            </label>

                            <input
                                id="productName"
                                type="text"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                                placeholder="Enter product name"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                        </div>


                        {/* Brand Name */}
                        <div className="mt-5">

                            <label
                                htmlFor="brandName"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Brand Name
                            </label>

                            <input
                                id="brandName"
                                type="text"
                                value={brandName}
                                onChange={(e) => setBrandName(e.target.value)}
                                placeholder="Enter brand name"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                        </div>


                        {/* Issue Type */}
                        <div className="mt-5">

                            <label
                                htmlFor="issueType"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Issue Type <span className="text-red-500">*</span>
                            </label>

                            <select
                                id="issueType"
                                value={issueType}
                                onChange={(e) => setIssueType(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                            >

                                <option value="">
                                    Select an issue
                                </option>

                                <option value="missing-declaration">
                                    Missing Mandatory Declaration
                                </option>

                                <option value="incorrect-mrp">
                                    Incorrect / Unclear MRP
                                </option>

                                <option value="incorrect-quantity">
                                    Incorrect Quantity Information
                                </option>

                                <option value="manufacturer-details">
                                    Missing Manufacturer Details
                                </option>

                                <option value="date-information">
                                    Missing / Incorrect Date Information
                                </option>

                                <option value="font-size">
                                    Declaration / Font Size Issue
                                </option>

                                <option value="other">
                                    Other
                                </option>

                            </select>

                        </div>


                        {/* Description */}
                        <div className="mt-5">

                            <label
                                htmlFor="description"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Describe the Issue{" "}
                                <span className="text-red-500">*</span>
                            </label>

                            <textarea
                                id="description"
                                rows="5"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the problem you found..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                        </div>


                        {/* Image Upload */}
                        <div className="mt-6">

                            <div className="flex items-center justify-between mb-2">

                                <label className="block text-sm font-medium text-gray-700">
                                    Supporting Images
                                </label>

                                <span className="text-xs text-gray-500">
                                    {selectedImages.length} / 4 selected
                                </span>

                            </div>


                            {/* No Images */}
                            {selectedImages.length === 0 && (

                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">

                                    <Upload
                                        size={30}
                                        className="mx-auto text-gray-400"
                                    />

                                    <p className="mt-3 text-sm font-medium text-gray-700">
                                        Upload product or label images
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                        JPG, JPEG or PNG • Maximum 4 images
                                    </p>

                                    <label
                                        htmlFor="issue-image"
                                        className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-[#0070FF] text-white rounded-lg cursor-pointer hover:bg-blue-700 transition"
                                    >
                                        <Upload size={17} />
                                        Choose Image
                                    </label>

                                    <input
                                        id="issue-image"
                                        type="file"
                                        accept="image/png, image/jpeg, image/jpg"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />

                                </div>

                            )}


                            {/* Selected Images */}
                            {selectedImages.length > 0 && (

                                <div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                        {selectedImages.map((image, index) => (

                                            <div
                                                key={`${image.file.name}-${index}`}
                                                className="border border-gray-200 rounded-xl p-4 bg-gray-50"
                                            >

                                                <div className="relative">

                                                    <img
                                                        src={image.preview}
                                                        alt={`Supporting image ${index + 1}`}
                                                        className="w-full h-48 object-contain rounded-lg bg-white"
                                                    />

                                                    {/* Remove */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveImage(index)}
                                                        className="absolute top-2 right-2 w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition shadow"
                                                        aria-label={`Remove image ${index + 1}`}
                                                    >

                                                        <X size={18} />

                                                    </button>

                                                </div>


                                                <div className="mt-3">

                                                    <p className="text-sm font-medium text-[#081D41]">
                                                        Image {index + 1}
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-500 break-all">
                                                        {image.file.name}
                                                    </p>

                                                </div>

                                            </div>

                                        ))}

                                    </div>


                                    {/* Add Another Image */}
                                    {selectedImages.length < 4 && (

                                        <div className="mt-5 flex flex-col items-center">

                                            <label
                                                htmlFor="add-another-issue-image"
                                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0070FF] text-white rounded-lg cursor-pointer hover:bg-blue-700 transition font-medium"
                                            >

                                                <ImagePlus size={18} />

                                                Add Another Image

                                            </label>

                                            <input
                                                id="add-another-issue-image"
                                                type="file"
                                                accept="image/png, image/jpeg, image/jpg"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />

                                            <p className="mt-2 text-sm text-gray-500">
                                                {4 - selectedImages.length}{" "}
                                                {4 - selectedImages.length === 1
                                                    ? "image"
                                                    : "images"}{" "}
                                                remaining
                                            </p>

                                        </div>

                                    )}

                                </div>

                            )}

                        </div>


                        {/* Submit */}
                        <div className="mt-8 flex justify-end">

                            <button
                                type="submit"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-[#0070FF] text-white rounded-lg font-medium hover:bg-blue-700 transition"
                            >

                                <Send size={18} />

                                Submit Report

                            </button>

                        </div>

                    </form>

                </div>

            </div>

        </div>
    );
}

export default ConsumerReportIssue;

