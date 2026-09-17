import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Upload,
  Package,
  ImagePlus,
  Info,
  Globe,
  Link,
  X,
  CheckCircle2,
  Trash2,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInspection } from "../context/InspectionContext";

function NewInspection() {
  const navigate = useNavigate();

  const {
    inspection,
    updateInspection,
    addImages,
    removeImage,
  } = useInspection();

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [inspectionType, setInspectionType] = useState(
    inspection.inspectionType || "physical"
  );

  const [productName, setProductName] = useState(
    inspection.productName || ""
  );

  const [brandName, setBrandName] = useState(
    inspection.brandName || ""
  );

  const [category, setCategory] = useState(
    inspection.category || ""
  );

  const [mrp, setMrp] = useState(
    inspection.mrp || ""
  );

  const [netQuantity, setNetQuantity] = useState(
    inspection.netQuantity || ""
  );

  const [productUrl, setProductUrl] = useState(
    inspection.productUrl || ""
  );

  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const images = inspection.images || [];

  /* ---------------- CAMERA ---------------- */

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const openCamera = async () => {
    setCameraError("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        "Camera access is not supported by this browser."
      );
      setCameraOpen(true);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: {
            ideal: "environment",
          },
        },
        audio: false,
      });

      streamRef.current = stream;
      setCameraOpen(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (error) {
      console.error(error);

      if (error.name === "NotAllowedError") {
        setCameraError(
          "Camera permission was denied. Please allow camera access and try again."
        );
      } else if (error.name === "NotFoundError") {
        setCameraError(
          "No camera was found on this device."
        );
      } else if (error.name === "NotReadableError") {
        setCameraError(
          "Camera is currently being used by another application."
        );
      } else {
        setCameraError(
          "Unable to access the camera."
        );
      }

      setCameraOpen(true);
    }
  };

  const closeCamera = () => {
    stopCamera();
    setCameraOpen(false);
    setCameraError("");
  };

  const capturePhoto = () => {
    const video = videoRef.current;

    if (!video || !video.videoWidth || !video.videoHeight) {
      return;
    }

    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) return;

        const file = new File(
          [blob],
          `package-${Date.now()}.jpg`,
          {
            type: "image/jpeg",
          }
        );

        const imageData = {
          file,
          preview: URL.createObjectURL(file),
          name: file.name,
        };

        addImages([imageData]);

        closeCamera();
      },
      "image/jpeg",
      0.9
    );
  };

  /* ---------------- IMAGE UPLOAD ---------------- */

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    const imageFiles = files.filter((file) =>
      file.type.startsWith("image/")
    );

    const imageData = imageFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));

    addImages(imageData);

    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();

    const files = Array.from(event.dataTransfer.files || []);

    if (!files.length) return;

    const imageFiles = files.filter((file) =>
      file.type.startsWith("image/")
    );

    const imageData = imageFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));

    addImages(imageData);
  };

  /* ---------------- CONTINUE ---------------- */

  const handleContinue = () => {
    if (inspectionType === "physical" && images.length === 0) {
      alert(
        "Please upload at least one package image before continuing."
      );
      return;
    }

    if (inspectionType === "online" && !productUrl.trim()) {
      alert("Please enter the product URL.");
      return;
    }

    updateInspection({
      inspectionType,
      productName,
      brandName,
      category,
      mrp,
      netQuantity,
      productUrl,
    });

    if (inspectionType === "online") {
      navigate("/online-product-review");
    } else {
      navigate("/image-review");
    }
  };

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#F4F7FA]">
      <div className="max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8">

        {/* ================= TOP ================= */}

        <div className="mb-7">

          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#06345B] transition mb-5"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </button>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">

            <div>
              <div className="flex items-center gap-3 mb-2">

                <div className="w-11 h-11 rounded-xl bg-[#06345B] flex items-center justify-center text-white shadow-sm">
                  <Package size={22} />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.15em] font-semibold text-[#1769AA]">
                    Inspection Module
                  </p>

                  <h1 className="text-2xl sm:text-3xl font-bold text-[#102A43]">
                    New Inspection
                  </h1>
                </div>

              </div>

              <p className="text-sm sm:text-base text-slate-500 max-w-2xl">
                Enter product details and provide package evidence
                for compliance assessment.
              </p>
            </div>

            <div className="text-xs text-slate-500">
              Step <span className="font-bold text-[#06345B]">1</span> of 3
            </div>

          </div>
        </div>

        {/* ================= STEPPER ================= */}

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-7">

          <div className="px-4 sm:px-6 py-4">

            <div className="flex items-center max-w-3xl">

              {/* Step 1 */}

              <div className="flex items-center gap-2 shrink-0">

                <div className="w-8 h-8 rounded-full bg-[#06345B] text-white flex items-center justify-center text-sm font-bold">
                  1
                </div>

                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-[#102A43]">
                    Product Details
                  </p>
                  <p className="text-[11px] text-[#1769AA]">
                    Current step
                  </p>
                </div>

              </div>

              <div className="h-px bg-slate-200 flex-1 mx-3 sm:mx-5" />

              {/* Step 2 */}

              <div className="flex items-center gap-2 shrink-0">

                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 border border-slate-200 flex items-center justify-center text-sm font-semibold">
                  2
                </div>

                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-slate-500">
                    Image Review
                  </p>
                </div>

              </div>

              <div className="h-px bg-slate-200 flex-1 mx-3 sm:mx-5" />

              {/* Step 3 */}

              <div className="flex items-center gap-2 shrink-0">

                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 border border-slate-200 flex items-center justify-center text-sm font-semibold">
                  3
                </div>

                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-slate-500">
                    Analysis
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* ================= INSPECTION SOURCE ================= */}

        <section className="bg-white border border-slate-200 rounded-xl shadow-sm mb-7 overflow-hidden">

          <div className="px-5 sm:px-7 py-5 border-b border-slate-100">

            <div className="flex items-center gap-3">

              <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#1769AA] flex items-center justify-center">
                <Globe size={19} />
              </div>

              <div>
                <h2 className="font-bold text-[#102A43]">
                  Inspection Source
                </h2>

                <p className="text-xs text-slate-500 mt-0.5">
                  Select how the product will be inspected.
                </p>
              </div>

            </div>

          </div>

          <div className="p-5 sm:p-7">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Physical */}

              <button
                type="button"
                onClick={() => setInspectionType("physical")}
                className={`text-left rounded-xl border p-4 transition-all ${
                  inspectionType === "physical"
                    ? "border-[#1769AA] bg-blue-50/60 ring-1 ring-[#1769AA]"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >

                <div className="flex items-start gap-3">

                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      inspectionType === "physical"
                        ? "bg-[#06345B] text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <Package size={19} />
                  </div>

                  <div className="flex-1">

                    <div className="flex items-center justify-between gap-2">

                      <h3 className="font-semibold text-[#102A43]">
                        Physical Product
                      </h3>

                      {inspectionType === "physical" && (
                        <CheckCircle2
                          size={18}
                          className="text-[#1769AA]"
                        />
                      )}

                    </div>

                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Inspect a product available physically by
                      uploading or capturing package images.
                    </p>

                  </div>

                </div>

              </button>

              {/* Online */}

              <button
                type="button"
                onClick={() => setInspectionType("online")}
                className={`text-left rounded-xl border p-4 transition-all ${
                  inspectionType === "online"
                    ? "border-[#1769AA] bg-blue-50/60 ring-1 ring-[#1769AA]"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >

                <div className="flex items-start gap-3">

                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      inspectionType === "online"
                        ? "bg-[#06345B] text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <Link size={19} />
                  </div>

                  <div className="flex-1">

                    <div className="flex items-center justify-between gap-2">

                      <h3 className="font-semibold text-[#102A43]">
                        Online Product
                      </h3>

                      {inspectionType === "online" && (
                        <CheckCircle2
                          size={18}
                          className="text-[#1769AA]"
                        />
                      )}

                    </div>

                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Inspect a product listing using its online
                      product URL.
                    </p>

                  </div>

                </div>

              </button>

            </div>

            {/* Online URL */}

            {inspectionType === "online" && (
              <div className="mt-5 pt-5 border-t border-slate-100">

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Product URL
                </label>

                <div className="relative">

                  <Link
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="url"
                    value={productUrl}
                    onChange={(e) =>
                      setProductUrl(e.target.value)
                    }
                    placeholder="https://example.com/product"
                    className="w-full h-11 pl-10 pr-4 rounded-lg border border-slate-300 bg-white text-sm outline-none transition focus:border-[#1769AA] focus:ring-2 focus:ring-blue-100"
                  />

                </div>

                <p className="text-xs text-slate-400 mt-2">
                  Enter the publicly accessible product listing URL.
                </p>

              </div>
            )}

          </div>

        </section>

        {/* ===================================================== */}
        {/* PRODUCT INFORMATION + IMAGE UPLOAD                  */}
        {/* ===================================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

          {/* ================= PRODUCT INFORMATION ================= */}

          <section className="lg:col-span-3 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

            <div className="px-5 sm:px-7 py-5 border-b border-slate-100">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#1769AA] flex items-center justify-center">
                  <Package size={19} />
                </div>

                <div>

                  <h2 className="font-bold text-[#102A43]">
                    Product Information
                  </h2>

                  <p className="text-xs text-slate-500 mt-0.5">
                    Enter the information available on the package.
                  </p>

                </div>

              </div>

            </div>

            <div className="p-5 sm:p-7">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">

                {/* Product Name */}

                <div className="sm:col-span-2">

                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Product Name
                    <span className="text-red-500 ml-1">*</span>
                  </label>

                  <input
                    type="text"
                    value={productName}
                    onChange={(e) =>
                      setProductName(e.target.value)
                    }
                    placeholder="Enter product name"
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-300 bg-white text-sm outline-none focus:border-[#1769AA] focus:ring-2 focus:ring-blue-100 transition"
                  />

                </div>

                {/* Brand */}

                <div>

                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Brand Name
                  </label>

                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) =>
                      setBrandName(e.target.value)
                    }
                    placeholder="Enter brand"
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-300 bg-white text-sm outline-none focus:border-[#1769AA] focus:ring-2 focus:ring-blue-100 transition"
                  />

                </div>

                {/* Category */}

                <div>

                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Category
                  </label>

                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value)
                    }
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-700 outline-none focus:border-[#1769AA] focus:ring-2 focus:ring-blue-100 transition"
                  >

                    <option value="">
                      Select category
                    </option>

                    <option value="Food & Beverages">
                      Food & Beverages
                    </option>

                    <option value="Personal Care">
                      Personal Care
                    </option>

                    <option value="Household">
                      Household
                    </option>

                    <option value="Consumer Goods">
                      Consumer Goods
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>

                </div>

                {/* MRP */}

                <div>

                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    MRP
                  </label>

                  <div className="relative">

                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                      ₹
                    </span>

                    <input
                      type="text"
                      value={mrp}
                      onChange={(e) =>
                        setMrp(e.target.value)
                      }
                      placeholder="e.g. 120"
                      className="w-full h-11 pl-8 pr-3.5 rounded-lg border border-slate-300 bg-white text-sm outline-none focus:border-[#1769AA] focus:ring-2 focus:ring-blue-100 transition"
                    />

                  </div>

                </div>

                {/* Quantity */}

                <div>

                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Net Quantity
                  </label>

                  <input
                    type="text"
                    value={netQuantity}
                    onChange={(e) =>
                      setNetQuantity(e.target.value)
                    }
                    placeholder="e.g. 500 g"
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-300 bg-white text-sm outline-none focus:border-[#1769AA] focus:ring-2 focus:ring-blue-100 transition"
                  />

                </div>

              </div>

              {/* Information note */}

              <div className="mt-7 p-4 rounded-lg bg-[#F5F8FB] border border-slate-200">

                <div className="flex items-start gap-3">

                  <Info
                    size={18}
                    className="text-[#1769AA] shrink-0 mt-0.5"
                  />

                  <div>

                    <p className="text-sm font-semibold text-[#102A43]">
                      Inspection information
                    </p>

                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      These details help organize the inspection.
                      The uploaded package images will be processed
                      separately for automated text extraction and
                      compliance assessment.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </section>

          {/* ================= IMAGE UPLOAD ================= */}

          <section className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden lg:sticky lg:top-6">

            <div className="px-5 sm:px-6 py-5 border-b border-slate-100">

              <div className="flex items-center justify-between gap-3">

                <div className="flex items-center gap-3">

                  <div className="w-9 h-9 rounded-lg bg-orange-50 text-[#D97706] flex items-center justify-center">
                    <ImagePlus size={19} />
                  </div>

                  <div>

                    <h2 className="font-bold text-[#102A43]">
                      Package Evidence
                    </h2>

                    <p className="text-xs text-slate-500 mt-0.5">
                      Upload clear package images.
                    </p>

                  </div>

                </div>

                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                  {images.length}{" "}
                  {images.length === 1 ? "image" : "images"}
                </span>

              </div>

            </div>

            <div className="p-5 sm:p-6">

              {/* Upload area */}

              <div
                onDragOver={(event) =>
                  event.preventDefault()
                }
                onDrop={handleDrop}
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="group border-2 border-dashed border-slate-300 hover:border-[#1769AA] bg-slate-50 hover:bg-blue-50/40 rounded-xl min-h-[230px] flex flex-col items-center justify-center text-center cursor-pointer transition-all"
              >

                <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-[#1769AA] group-hover:scale-105 transition-transform">

                  <Upload size={25} />

                </div>

                <h3 className="mt-4 text-sm font-bold text-[#102A43]">
                  Upload package images
                </h3>

                <p className="text-xs text-slate-500 mt-1 max-w-[240px] leading-relaxed">
                  Drag and drop images here or click to browse
                  from your device.
                </p>

                <span className="mt-3 text-[11px] text-slate-400">
                  JPG, JPEG, PNG or WEBP
                </span>

              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />

              {/* Action buttons */}

              <div className="grid grid-cols-2 gap-3 mt-4">

                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="h-10 rounded-lg bg-[#06345B] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#082f4f] transition"
                >
                  <Upload size={16} />
                  Browse
                </button>

                <button
                  type="button"
                  onClick={openCamera}
                  className="h-10 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-slate-50 transition"
                >
                  <Camera size={17} />
                  Camera
                </button>

              </div>

              {/* Image previews */}

              {images.length > 0 && (
                <div className="mt-5">

                  <div className="flex items-center justify-between mb-3">

                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Uploaded Evidence
                    </p>

                    <p className="text-xs text-slate-400">
                      {images.length} added
                    </p>

                  </div>

                  <div className="grid grid-cols-3 gap-2">

                    {images.map((image, index) => (

                      <div
                        key={`${image.name}-${index}`}
                        className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100 group"
                      >

                        <img
                          src={image.preview}
                          alt={`Package evidence ${index + 1}`}
                          className="w-full h-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            removeImage(index);
                          }}
                          className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-white/95 text-red-600 shadow-sm flex items-center justify-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition"
                          aria-label={`Remove image ${index + 1}`}
                        >
                          <Trash2 size={14} />
                        </button>

                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-2 py-1 truncate">
                          {index + 1}. {image.name}
                        </div>

                      </div>

                    ))}

                  </div>

                </div>
              )}

              {/* Guidelines */}

              <div className="mt-5 pt-5 border-t border-slate-100">

                <p className="text-xs font-bold text-[#102A43] mb-3">
                  For better analysis
                </p>

                <div className="space-y-2">

                  <div className="flex items-center gap-2 text-xs text-slate-500">

                    <CheckCircle2
                      size={14}
                      className="text-[#138808]"
                    />

                    Keep mandatory declarations visible

                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500">

                    <CheckCircle2
                      size={14}
                      className="text-[#138808]"
                    />

                    Avoid blur and excessive glare

                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500">

                    <CheckCircle2
                      size={14}
                      className="text-[#138808]"
                    />

                    Capture the complete package label

                  </div>

                </div>

              </div>

            </div>

          </section>

        </div>

        {/* ================= BOTTOM ACTION ================= */}

        <div className="mt-6 bg-white border border-slate-200 rounded-xl shadow-sm">

          <div className="px-5 sm:px-7 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div>

              <p className="text-sm font-semibold text-[#102A43]">
                Ready to continue?
              </p>

              <p className="text-xs text-slate-500 mt-1">
                {inspectionType === "physical"
                  ? images.length > 0
                    ? `${images.length} package image${
                        images.length > 1 ? "s" : ""
                      } ready for review.`
                    : "Upload at least one package image to continue."
                  : productUrl
                    ? "Product URL is ready for review."
                    : "Enter a product URL to continue."}
              </p>

            </div>

            <button
              type="button"
              onClick={handleContinue}
              className="w-full sm:w-auto min-w-[210px] h-11 px-6 rounded-lg bg-[#06345B] hover:bg-[#082f4f] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all"
            >
              {inspectionType === "physical"
                ? "Continue to Image Review"
                : "Continue to Product Review"}

              <ArrowRight size={18} />

            </button>

          </div>

          {/* Tricolour accent */}

          <div className="flex h-1">

            <div className="w-1/3 bg-[#FF9933]" />
            <div className="w-1/3 bg-white border-y border-slate-100" />
            <div className="w-1/3 bg-[#138808]" />

          </div>

        </div>

      </div>

      {/* ===================================================== */}
      {/* CAMERA MODAL                                          */}
      {/* ===================================================== */}

      {cameraOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl">

            {/* Modal header */}

            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-lg bg-[#06345B] text-white flex items-center justify-center">
                  <Camera size={18} />
                </div>

                <div>

                  <h2 className="font-bold text-[#102A43]">
                    Capture Package Image
                  </h2>

                  <p className="text-xs text-slate-500">
                    Position the package clearly inside the frame.
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={closeCamera}
                className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X size={20} />
              </button>

            </div>

            {/* Camera */}

            <div className="bg-black aspect-video flex items-center justify-center">

              {cameraError ? (

                <div className="text-center text-white px-6">

                  <Camera
                    size={42}
                    className="mx-auto mb-4 opacity-50"
                  />

                  <p className="font-semibold">
                    Camera unavailable
                  </p>

                  <p className="text-sm text-white/60 mt-2 max-w-md">
                    {cameraError}
                  </p>

                </div>

              ) : (

                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-contain"
                />

              )}

            </div>

            {/* Modal actions */}

            <div className="px-5 py-4 flex flex-col sm:flex-row gap-3 sm:justify-end">

              <button
                type="button"
                onClick={closeCamera}
                className="h-11 px-5 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>

              {!cameraError && (
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="h-11 px-6 rounded-lg bg-[#06345B] text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#082f4f] transition"
                >
                  <Camera size={18} />
                  Capture Image
                </button>
              )}

            </div>

          </div>

        </div>
      )}

    </main>
  );
}

export default NewInspection;