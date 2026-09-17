import { useEffect, useRef, useState } from "react";
import {
  Camera,
  ImagePlus,
  X,
  CheckCircle,
} from "lucide-react";

function ConsumerScan() {
  const [selectedImages, setSelectedImages] = useState([]);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Start camera
  const startCamera = async () => {
    setCameraError("");

    if (selectedImages.length >= 4) {
      alert("You can select a maximum of 4 images.");
      return;
    }

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError(
          "Camera is not supported by this browser."
        );
        return;
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
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
      }, 0);
    } catch (error) {
      console.error("Camera error:", error);

      setCameraError(
        "Unable to access camera. Please allow camera permission and try again."
      );
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOpen(false);
  };

  // Capture photo
  const capturePhoto = () => {
    if (!videoRef.current) {
      return;
    }

    if (selectedImages.length >= 4) {
      alert("You can select a maximum of 4 images.");
      return;
    }

    const video = videoRef.current;

    if (
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      alert("Camera is not ready yet. Please wait a moment.");
      return;
    }

    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      alert("Unable to capture image. Please try again.");
      return;
    }

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          alert("Unable to capture image. Please try again.");
          return;
        }

        const file = new File(
          [blob],
          `product-camera-${Date.now()}.jpg`,
          {
            type: "image/jpeg",
          }
        );

        const newImage = {
          file,
          preview: URL.createObjectURL(file),
        };

        setSelectedImages((prev) => [
          ...prev,
          newImage,
        ]);
      },
      "image/jpeg",
      0.9
    );
  };

  // Handle gallery image selection
  // One image at a time
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

    setSelectedImages((prev) => [
      ...prev,
      newImage,
    ]);

    event.target.value = "";
  };

  // Remove image
  const handleRemoveImage = (index) => {
    setSelectedImages((prev) => {
      const updatedImages = [...prev];

      if (updatedImages[index]) {
        URL.revokeObjectURL(
          updatedImages[index].preview
        );
      }

      updatedImages.splice(index, 1);

      return updatedImages;
    });
  };

  // Check compliance
  const handleCheckCompliance = () => {
    if (selectedImages.length < 1) {
      alert("Please select at least 1 product image.");
      return;
    }

    alert(
      `${selectedImages.length} image${
        selectedImages.length > 1 ? "s" : ""
      } selected successfully! Compliance checking will be connected next.`
    );
  };

  // Cleanup camera
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  return (
    <div className="p-6">

      {/* Header */}
      <div className="mb-6">

        <div className="flex items-center gap-3">

          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
            <Camera
              size={24}
              className="text-[#0070FF]"
            />
          </div>

          <div>

            <h1 className="text-3xl font-bold text-[#081D41]">
              Scan Product
            </h1>

            <p className="mt-1 text-gray-600">
              Capture or upload product label images to check compliance.
            </p>

          </div>

        </div>

      </div>

      {/* Main Card */}
      <div className="max-w-4xl">

        <div className="bg-white rounded-xl p-8 shadow-sm border">

          {/* Title */}
          <div className="text-center">

            <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">

              <Camera
                size={32}
                className="text-[#0070FF]"
              />

            </div>

            <h2 className="mt-5 text-xl font-semibold text-[#081D41]">
              Scan Product Label
            </h2>

            <p className="mt-2 text-gray-600">
              Take photos using your camera or upload
              product label images.
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Minimum 1 image • Maximum 4 images
            </p>

          </div>

          {/* Camera */}
          {cameraOpen && (

            <div className="mt-8">

              <div className="border border-gray-200 rounded-xl overflow-hidden bg-black">

                <div className="relative">

                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full max-h-[500px] object-contain"
                  />

                  <div className="absolute top-4 left-4">

                    <span className="px-3 py-1.5 rounded-full bg-black/60 text-white text-sm">
                      Live Camera
                    </span>

                  </div>

                </div>

                <div className="p-5 flex items-center justify-center gap-4">

                  <button
                    type="button"
                    onClick={capturePhoto}
                    disabled={selectedImages.length >= 4}
                    className={`w-16 h-16 rounded-full border-4 border-white flex items-center justify-center transition ${
                      selectedImages.length >= 4
                        ? "bg-gray-500 cursor-not-allowed"
                        : "bg-white hover:scale-105"
                    }`}
                    aria-label="Capture photo"
                  >

                    <div className="w-11 h-11 rounded-full bg-[#0070FF]" />

                  </button>

                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-5 py-3 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition"
                  >
                    Close Camera
                  </button>

                </div>

              </div>

              <p className="mt-3 text-center text-sm text-gray-500">
                Position the product label clearly inside the camera view.
              </p>

            </div>

          )}

          {/* Camera Error */}
          {cameraError && (

            <div className="mt-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {cameraError}
            </div>

          )}

          {/* Upload / Camera Options */}
          {!cameraOpen && (

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Take Photo */}
              <button
                type="button"
                onClick={startCamera}
                disabled={selectedImages.length >= 4}
                className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-xl p-7 transition ${
                  selectedImages.length >= 4
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer hover:border-blue-400 hover:bg-blue-50/30"
                }`}
              >

                <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">

                  <Camera
                    size={28}
                    className="text-[#0070FF]"
                  />

                </div>

                <div className="text-center">

                  <p className="font-semibold text-[#081D41]">
                    Take Photo
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Open camera and capture
                  </p>

                </div>

              </button>

              {/* Upload Image */}
              <label
                htmlFor="gallery-input"
                className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-xl p-7 transition ${
                  selectedImages.length >= 4
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer hover:border-blue-400 hover:bg-blue-50/30"
                }`}
              >

                <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">

                  <ImagePlus
                    size={28}
                    className="text-[#0070FF]"
                  />

                </div>

                <div className="text-center">

                  <p className="font-semibold text-[#081D41]">
                    Upload Image
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Select one image at a time
                  </p>

                </div>

                <input
                  id="gallery-input"
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleImageChange}
                  disabled={selectedImages.length >= 4}
                  className="hidden"
                />

              </label>

            </div>

          )}

          {/* Selected Images */}
          {selectedImages.length > 0 && (

            <div className="mt-8">

              <div className="flex items-center justify-between mb-4">

                <div>

                  <h3 className="text-lg font-semibold text-[#081D41]">
                    Selected Images
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    {selectedImages.length} of 4 images selected
                  </p>

                </div>

                <div className="flex items-center gap-2 text-sm font-medium text-green-600">

                  <CheckCircle size={17} />

                  Ready

                </div>

              </div>

              {/* Image Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                {selectedImages.map((image, index) => (

                  <div
                    key={`${image.file.name}-${index}`}
                    className="relative border border-gray-200 rounded-xl p-3 bg-gray-50"
                  >

                    <div className="relative">

                      <img
                        src={image.preview}
                        alt={`Product image ${index + 1}`}
                        className="w-full h-52 object-contain rounded-lg bg-white"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveImage(index)
                        }
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

                <div className="mt-6 flex flex-col items-center">

                  <label
                    htmlFor="add-another-image"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0070FF] text-white rounded-lg cursor-pointer hover:bg-blue-700 transition font-medium"
                  >

                    <ImagePlus size={18} />

                    Add Another Image

                  </label>

                  <input
                    id="add-another-image"
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

          {/* Empty State */}
          {selectedImages.length === 0 &&
            !cameraOpen && (

              <div className="mt-8 text-center py-5">

                <p className="text-sm text-gray-500">
                  Please capture or upload at least 1 image to continue.
                </p>

              </div>

            )}

          {/* Check Compliance */}
          <div className="mt-8 flex justify-center">

            <button
              type="button"
              onClick={handleCheckCompliance}
              disabled={selectedImages.length === 0}
              className={`inline-flex items-center gap-2 px-7 py-3 rounded-lg text-white font-medium transition ${
                selectedImages.length > 0
                  ? "bg-[#0070FF] hover:bg-blue-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >

              <CheckCircle size={18} />

              Check Compliance

            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ConsumerScan;

