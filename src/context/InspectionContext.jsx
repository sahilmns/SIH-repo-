import { createContext, useContext, useState } from "react";

const InspectionContext = createContext();

export function InspectionProvider({ children }) {
  const [inspection, setInspection] = useState({
    inspectionType: "physical",

    productName: "",
    brandName: "",
    category: "",
    mrp: "",
    netQuantity: "",
    productUrl: "",

    images: [],

    analysis: null,
    complianceResult: null,
  });

  // Update inspection details
  const updateInspection = (data) => {
    setInspection((prev) => ({
      ...prev,
      ...data,
    }));
  };

  // Add new images
  const addImages = (newImages) => {
    setInspection((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }));
  };

  // Remove an image
  const removeImage = (index) => {
    setInspection((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Replace an image
  const replaceImage = (index, newImage) => {
    setInspection((prev) => ({
      ...prev,
      images: prev.images.map((image, i) =>
        i === index ? newImage : image
      ),
    }));
  };

  // Reset inspection
  const resetInspection = () => {
    setInspection({
      inspectionType: "physical",

      productName: "",
      brandName: "",
      category: "",
      mrp: "",
      netQuantity: "",
      productUrl: "",

      images: [],

      analysis: null,
      complianceResult: null,
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