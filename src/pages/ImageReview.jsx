import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Image as ImageIcon,
  Eye,
  Sun,
  ScanText,
  Trash2,
  Upload,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useInspection } from "../context/InspectionContext";
import { useRef, useState } from "react";

function ImageReview() {
  const navigate = useNavigate();

  const {
    inspection,
    addImages,
    removeImage,
    replaceImage,
  } = useInspection();

  const fileInputRef = useRef(null);
  const replaceInputRef = useRef(null);

  const [selectedImage, setSelectedImage] = useState(0);

  const images = inspection.images || [];

  // Upload multiple images
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);

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

    // Select first newly uploaded image
    setSelectedImage(images.length);

    // Allow selecting same file again
    event.target.value = "";
  };

  // Replace selected image
  const handleReplaceImage = (event) => {
    const file = event.target.files[0];

    if (!file || !file.type.startsWith("image/")) {
      return;
    }

    const newImage = {
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    };

    if (images[selectedImage]) {
      replaceImage(selectedImage, newImage);
    }

    event.target.value = "";
  };

  // Remove selected image
  const handleDeleteImage = () => {
    if (!images.length) return;

    removeImage(selectedImage);

    if (selectedImage > 0) {
      setSelectedImage(selectedImage - 1);
    } else {
      setSelectedImage(0);
    }
  };

  // Open image in new tab
  const handleViewFullSize = () => {
    if (!currentImage) return;

    window.open(
      currentImage.preview,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const currentImage = images[selectedImage];

  return (
    <main className="p-6 lg:p-8 bg-[#F6F8FC] min-h-[calc(100vh-80px)]">

      {/* Header */}
      <div className="mb-8">

        <button
          onClick={() => navigate("/new-inspection")}
          className="flex items-center gap-2 text-sm text-slate-500
                     hover:text-blue-600 transition-colors mb-4"
        >
          <ArrowLeft size={17} />
          Back to New Inspection
        </button>

        <h1 className="text-3xl font-bold text-slate-900">
          Image Review
        </h1>

        <p className="text-slate-500 mt-2">
          Review package images before starting compliance analysis.
        </p>

      </div>


      {/* Progress */}
      <div className="bg-white border border-slate-200
                      rounded-2xl p-5 mb-6 shadow-sm">

        <div className="flex items-center gap-4">

          {/* Step 1 */}
          <div className="flex items-center gap-3">

            <div className="w-9 h-9 rounded-full
                            bg-green-500 text-white
                            flex items-center justify-center">
              ✓
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Product Details
              </p>

              <p className="text-xs text-green-600">
                Completed
              </p>
            </div>

          </div>


          <div className="h-px bg-blue-200 flex-1"></div>


          {/* Step 2 */}
          <div className="flex items-center gap-3">

            <div className="w-9 h-9 rounded-full
                            bg-blue-600 text-white
                            flex items-center justify-center
                            font-semibold">
              2
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Package Images
              </p>

              <p className="text-xs text-blue-600">
                Review images
              </p>
            </div>

          </div>


          <div className="h-px bg-slate-200 flex-1"></div>


          {/* Step 3 */}
          <div className="flex items-center gap-3 opacity-50">

            <div className="w-9 h-9 rounded-full
                            bg-slate-100 text-slate-500
                            flex items-center justify-center
                            font-semibold">
              3
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-700">
                Analysis
              </p>

              <p className="text-xs text-slate-400">
                Check compliance
              </p>
            </div>

          </div>

        </div>

      </div>


      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">


        {/* Image Preview */}
        <section className="xl:col-span-2 bg-white
                            border border-slate-200
                            rounded-2xl shadow-sm p-7">

          <div className="flex items-center justify-between mb-6">

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-xl
                              bg-blue-50 text-blue-600
                              flex items-center justify-center">

                <ImageIcon size={22} />

              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Package Image
                </h2>

                <p className="text-sm text-slate-500">
                  {currentImage
                    ? currentImage.name
                    : "Upload package images"}
                </p>
              </div>

            </div>

            <span className="text-xs font-medium
                             px-3 py-1.5 rounded-full
                             bg-blue-50 text-blue-700">

              {images.length
                ? `Image ${selectedImage + 1} of ${images.length}`
                : "No images"}

            </span>

          </div>


          {/* Image Area */}
          <div className="bg-slate-100 rounded-2xl
                          min-h-[420px]
                          flex items-center justify-center
                          border border-slate-200
                          overflow-hidden">

            {currentImage ? (

              <img
                src={currentImage.preview}
                alt="Package preview"
                className="max-h-[420px] max-w-full object-contain"
              />

            ) : (

              <div className="text-center">

                <div className="w-20 h-20 rounded-2xl
                                bg-white shadow-sm
                                flex items-center justify-center
                                mx-auto">

                  <ImageIcon
                    size={38}
                    className="text-slate-300"
                  />

                </div>

                <p className="text-slate-500 mt-4 font-medium">
                  No product image uploaded
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Upload clear package images for analysis
                </p>

              </div>

            )}

          </div>


          {/* Image Thumbnails */}
          {images.length > 0 && (

            <div className="flex gap-3 mt-5 overflow-x-auto pb-1">

              {images.map((image, index) => (

                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-xl overflow-hidden
                              border-2 flex-shrink-0 transition
                              ${
                                selectedImage === index
                                  ? "border-blue-600"
                                  : "border-slate-200 hover:border-blue-300"
                              }`}
                >

                  <img
                    src={image.preview}
                    alt={`Package ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                </button>

              ))}

            </div>

          )}


          {/* Hidden Upload Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />


          {/* Hidden Replace Input */}
          <input
            ref={replaceInputRef}
            type="file"
            accept="image/*"
            onChange={handleReplaceImage}
            className="hidden"
          />


          {/* Image Controls */}
          <div className="flex flex-wrap gap-3 mt-5">

            {/* Upload */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2
                         px-4 py-2.5 rounded-xl
                         bg-blue-600 text-white
                         text-sm font-medium
                         hover:bg-blue-700 transition"
            >

              <Upload size={17} />

              Upload Images

            </button>


            {/* Replace */}
            <button
              onClick={() => {
                if (!currentImage) {
                  fileInputRef.current?.click();
                  return;
                }

                replaceInputRef.current?.click();
              }}
              className="flex items-center gap-2
                         px-4 py-2.5 rounded-xl
                         border border-slate-200
                         text-sm font-medium
                         text-slate-700
                         hover:bg-slate-50 transition"
            >

              <RefreshCw size={17} />

              Replace Image

            </button>


            {/* View Full Size */}
            {currentImage && (

              <button
                onClick={handleViewFullSize}
                className="flex items-center gap-2
                           px-4 py-2.5 rounded-xl
                           border border-blue-200
                           text-sm font-medium
                           text-blue-600
                           hover:bg-blue-50 transition"
              >

                <Eye size={17} />

                View Full Size

              </button>

            )}


            {/* Remove */}
            {currentImage && (

              <button
                onClick={handleDeleteImage}
                className="flex items-center gap-2
                           px-4 py-2.5 rounded-xl
                           border border-red-200
                           text-sm font-medium
                           text-red-600
                           hover:bg-red-50 transition"
              >

                <Trash2 size={17} />

                Remove

              </button>

            )}

          </div>

        </section>


        {/* Quality Panel */}
        <section className="bg-white
                            border border-slate-200
                            rounded-2xl shadow-sm p-7">

          <h2 className="text-xl font-bold text-slate-900">
            Image Quality
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Automatic image quality assessment
          </p>


          {/* Overall */}
          <div className="mt-6 p-4 rounded-xl
                          bg-green-50 border border-green-100">

            <div className="flex items-center gap-3">

              <CheckCircle2
                size={22}
                className="text-green-600"
              />

              <div>
                <p className="font-semibold text-green-800">
                  Image quality is good
                </p>

                <p className="text-xs text-green-700 mt-1">
                  Suitable for analysis
                </p>
              </div>

            </div>

          </div>


          {/* Quality Checks */}
          <div className="mt-6 space-y-4">


            {/* Resolution */}
            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <ScanText
                  size={18}
                  className="text-slate-500"
                />

                <span className="text-sm text-slate-700">
                  Resolution
                </span>

              </div>

              <span className="flex items-center gap-1
                               text-xs font-medium
                               text-green-600">

                <CheckCircle2 size={15} />

                Good

              </span>

            </div>


            {/* Blur */}
            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <Eye
                  size={18}
                  className="text-slate-500"
                />

                <span className="text-sm text-slate-700">
                  Blur detection
                </span>

              </div>

              <span className="flex items-center gap-1
                               text-xs font-medium
                               text-green-600">

                <CheckCircle2 size={15} />

                Clear

              </span>

            </div>


            {/* Glare */}
            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <Sun
                  size={18}
                  className="text-slate-500"
                />

                <span className="text-sm text-slate-700">
                  Glare detection
                </span>

              </div>

              <span className="flex items-center gap-1
                               text-xs font-medium
                               text-amber-600">

                <AlertTriangle size={15} />

                Minor glare

              </span>

            </div>


            {/* Text readability */}
            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <ScanText
                  size={18}
                  className="text-slate-500"
                />

                <span className="text-sm text-slate-700">
                  Text readability
                </span>

              </div>

              <span className="flex items-center gap-1
                               text-xs font-medium
                               text-green-600">

                <CheckCircle2 size={15} />

                Readable

              </span>

            </div>

          </div>


          {/* Tip */}
          <div className="mt-6 p-4 rounded-xl
                          bg-blue-50 border border-blue-100">

            <p className="text-xs font-semibold text-blue-800">
              💡 Tip
            </p>

            <p className="text-xs text-blue-700 mt-1 leading-relaxed">
              Make sure mandatory declarations are clearly visible
              before continuing with analysis.
            </p>

          </div>


          {/* Retake */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full mt-5
                       flex items-center justify-center gap-2
                       px-4 py-3 rounded-xl
                       border border-slate-200
                       text-slate-700 font-medium
                       hover:bg-slate-50 transition"
          >

            <RefreshCw size={18} />

            Retake Image

          </button>

        </section>

      </div>


      {/* Bottom Action */}
      <div className="flex justify-end mt-6">

        <button
          onClick={() => {

            if (!images.length) {
              alert("Please upload at least one package image.");
              return;
            }

            navigate("/analysis");

          }}
          className="flex items-center gap-2
                     bg-blue-600 hover:bg-blue-700
                     text-white font-semibold
                     px-6 py-3.5 rounded-xl
                     shadow-sm hover:shadow-md
                     transition-all"
        >

          Continue to Analysis

          <ArrowRight size={19} />

        </button>

      </div>

    </main>
  );
}

export default ImageReview;