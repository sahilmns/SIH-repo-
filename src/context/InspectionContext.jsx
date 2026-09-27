import { createContext, useContext, useState } from "react";

const InspectionContext = createContext();

const initialInspection = {
  inspectionType: "physical",

  productName: "",
  brandName: "",
  category: "",
  mrp: "",
  netQuantity: "",
  productUrl: "",

  // Single image only
  images: [],

  analysis: null,
  complianceResult: null,

  // Backend inspection information
  backendInspectionId: null,
  inspectionCode: null,
  inspectionStatus: null,
};

export function InspectionProvider({ children }) {
  const [inspection, setInspection] = useState(initialInspection);

  // Update inspection details
  const updateInspection = (data) => {
    setInspection((prev) => ({
      ...prev,
      ...data,
    }));
  };

  // --------------------------------------------------
  // SINGLE IMAGE ONLY
  // --------------------------------------------------
  // Any image added replaces the existing image.
  const addImages = (newImages) => {
    if (!newImages || newImages.length === 0) {
      return;
    }

    const image = newImages[0];

    setInspection((prev) => ({
      ...prev,
      images: [image],
    }));
  };

  // Remove the only image
  const removeImage = (index) => {
    setInspection((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Replace the only image
  const replaceImage = (index, newImage) => {
    if (!newImage) {
      return;
    }

    setInspection((prev) => {
      const images = [...prev.images];

      if (images.length === 0) {
        return {
          ...prev,
          images: [newImage],
        };
      }

      images[0] = newImage;

      return {
        ...prev,
        images: images.slice(0, 1),
      };
    });
  };

  // --------------------------------------------------
  // RESET
  // --------------------------------------------------
  const resetInspection = () => {
    setInspection({
      ...initialInspection,
      images: [],
    });
  };

  return (
    <InspectionContext.Provider
      value={{
        inspection,
        updateInspection,
        addImages,
        removeImage,
        replaceImage,
        resetInspection,
      }}
    >
      {children}
    </InspectionContext.Provider>
  );
}

export function useInspection() {
  return useContext(InspectionContext);
}