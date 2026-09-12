from paddleocr import PaddleOCR
import json
import re
from datetime import datetime

# Initialize PaddleOCR
# # lang options: 'en', 'ch', 'french', 'german', 'korean', 'japan', etc.
# ocr = PaddleOCR( lang='en',defenable_mkldnn=False)

# # # Path to your sample image
# img_path = 'label.jpg'

# # Run OCR
# result = ocr.predict(img_path)

# # Print extracted text
# for line in result:
#     # print(type(line))
#    data = line.json
#    print(data)
#    print(type(data))

class LegalMetrologyOCREngine:
    def __init__(self, lang='en'):
        """
        Initialize the OCR engine once (loading models is expensive,
        so we don't want to do this on every image).
        """
        self.ocr = PaddleOCR(
            lang=lang,
            enable_mkldnn = False  # suppress PaddleOCR's internal logging
        )

    def extract_to_json(self, image_path):
        """
        Main method: extracts text and returns structured JSON.
        """
        raw_result = self.ocr.predict(image_path) # this is a ocr object (python list)
        # print(raw_result)
        # print(type(raw_result))
        entries = []
        for result in raw_result:
            # print(type(result))
            # print(result.json)
            data = result.json["res"]
            texts = data["rec_texts"]
            scores = data["rec_scores"]
            boxes = data["rec_boxes"]
            # print(texts[0])

            for idx, (text, confidence, box) in enumerate(
                zip(texts, scores, boxes)
            ):

                x1, y1, x2, y2 = box

                entries.append({
                    "id": idx,
                    "text": text,
                    "confidence": round(float(confidence), 4),
                    "bounding_box": {
                        "x1": x1,
                        "y1": y1,
                        "x2": x2,
                        "y2": y2
                    },
                    "height_pixels": y2 - y1,
                    "width_pixels": x2 - x1
                })

        return {
    "image": image_path,
    "total_detections": len(entries),
    "detections": entries
}

image_path = "biscuit.jpeg"
# test_case = LegalMetrologyOCREngine()
# result = test_case.extract_to_json(image_path)

# for detection in result["detections"]:
#     print(repr(detection["text"]))

# ocr_json = json.dumps(result, indent=4)
# print(ocr_json )


class LegalMetrologyRuleEngine:

    def __init__(self, ocr_result):
        self.ocr_result = ocr_result
        self.detections = ocr_result["detections"]

    def check_mrp(self):

        declaration_pattern = re.compile(
            r"\b(?:M\.?\s*R\.?\s*P\.?|Maximum\s+Retail\s+Price)\b",
            re.IGNORECASE
        )

        price_pattern = re.compile(
            r"(?:₹|Rs\.?|INR)?\s*(\d+(?:\.\d+)?)",
            re.IGNORECASE
        )

        for detection in self.detections:

            text = detection["text"]

            declaration_match = declaration_pattern.search(text)

            if not declaration_match:
                continue

            # -----------------------------------------
            # CASE 1:
            # "MRP: ₹120"
            # -----------------------------------------

            price_match = price_pattern.search(
                text[declaration_match.end():]
            )

            if price_match:

                mrp = float(price_match.group(1))

                return {
                    "rule": "MRP Declaration",
                    "found": True,
                    "mrp": mrp,
                    "source_text": text,
                    "confidence": detection["confidence"],
                    "bounding_box": detection["bounding_box"],
                    "status": "PASS"
                }

            # -----------------------------------------
            # CASE 2:
            # MRP and price are separate detections
            # Find nearest price
            # -----------------------------------------

            current_box = detection["bounding_box"]

            current_x = (
                current_box["x1"] + current_box["x2"]
            ) / 2

            current_y = (
                current_box["y1"] + current_box["y2"]
            ) / 2

            nearest_price = None
            nearest_distance = float("inf")

            for candidate in self.detections:

                if candidate is detection:
                    continue

                candidate_match = price_pattern.fullmatch(
                    candidate["text"].strip()
                )

                if not candidate_match:
                    continue

                candidate_box = candidate["bounding_box"]

                candidate_x = (
                    candidate_box["x1"] + candidate_box["x2"]
                ) / 2

                candidate_y = (
                    candidate_box["y1"] + candidate_box["y2"]
                ) / 2

                distance = (
                    (candidate_x - current_x) ** 2 +
                    (candidate_y - current_y) ** 2
                ) ** 0.5

                if distance < nearest_distance:

                    nearest_distance = distance
                    nearest_price = candidate

            if nearest_price is not None:

                price_match = price_pattern.search(
                    nearest_price["text"]
                )

                mrp = float(price_match.group(1))

                return {
                    "rule": "MRP Declaration",
                    "found": True,
                    "mrp": mrp,
                    "source_text": (
                        text + " " +
                        nearest_price["text"]
                    ),
                    "confidence": min(
                        detection["confidence"],
                        nearest_price["confidence"]
                    ),
                    "bounding_box": {
                        "x1": min(
                            current_box["x1"],
                            nearest_price["bounding_box"]["x1"]
                        ),
                        "y1": min(
                            current_box["y1"],
                            nearest_price["bounding_box"]["y1"]
                        ),
                        "x2": max(
                            current_box["x2"],
                            nearest_price["bounding_box"]["x2"]
                        ),
                        "y2": max(
                            current_box["y2"],
                            nearest_price["bounding_box"]["y2"]
                        )
                    },
                    "status": "PASS"
                }

        return {
            "rule": "MRP Declaration",
            "found": False,
            "mrp": None,
            "source_text": None,
            "confidence": None,
            "bounding_box": None,
            "status": "VIOLATION"
        }

    def check_net_quantity(self):

        declaration_pattern = re.compile(
            r"\b(?:"
            r"NET\s*(?:WEIGHT|WT|QUANTITY|QTY|VOLUME|CONTENT)"
            r")\b",
            re.IGNORECASE
        )

        quantity_pattern = re.compile(
            r"(\d+(?:\.\d+)?)\s*(kg|g|mg|l|ml)\b",
            re.IGNORECASE
        )

        for detection in self.detections:

            text = detection["text"]

            declaration_match = declaration_pattern.search(text)

            if not declaration_match:
                continue

            # -----------------------------------------
            # CASE 1:
            # "NET QUANTITY: 150 g"
            # "NET CONTENT: 180 mL"
            # -----------------------------------------

            quantity_match = quantity_pattern.search(
                text[declaration_match.end():]
            )

            if quantity_match:

                quantity = float(quantity_match.group(1))
                unit = quantity_match.group(2).lower()

                return {
                    "rule": "Net Quantity",
                    "found": True,
                    "quantity": quantity,
                    "unit": unit,
                    "source_text": text,
                    "confidence": detection["confidence"],
                    "bounding_box": detection["bounding_box"],
                    "status": "PASS"
                }

            # -----------------------------------------
            # CASE 2:
            # "NET QUANTITY:"
            # "150 g"
            #
            # Find nearest quantity using bounding box
            # -----------------------------------------

            current_box = detection["bounding_box"]

            current_x = (
                current_box["x1"] + current_box["x2"]
            ) / 2

            current_y = (
                current_box["y1"] + current_box["y2"]
            ) / 2

            nearest_quantity = None
            nearest_distance = float("inf")

            for candidate in self.detections:

                if candidate is detection:
                    continue

                candidate_match = quantity_pattern.fullmatch(
                    candidate["text"].strip()
                )

                if not candidate_match:
                    continue

                candidate_box = candidate["bounding_box"]

                candidate_x = (
                    candidate_box["x1"] + candidate_box["x2"]
                ) / 2

                candidate_y = (
                    candidate_box["y1"] + candidate_box["y2"]
                ) / 2

                distance = (
                    (candidate_x - current_x) ** 2 +
                    (candidate_y - current_y) ** 2
                ) ** 0.5

                if distance < nearest_distance:

                    nearest_distance = distance
                    nearest_quantity = candidate

            # -----------------------------------------
            # Quantity found
            # -----------------------------------------

            if nearest_quantity is not None:

                quantity_match = quantity_pattern.search(
                    nearest_quantity["text"]
                )

                quantity = float(quantity_match.group(1))
                unit = quantity_match.group(2).lower()

                return {
                    "rule": "Net Quantity",
                    "found": True,
                    "quantity": quantity,
                    "unit": unit,
                    "source_text": (
                        text + " " +
                        nearest_quantity["text"]
                    ),
                    "confidence": min(
                        detection["confidence"],
                        nearest_quantity["confidence"]
                    ),
                    "bounding_box": {
                        "x1": min(
                            current_box["x1"],
                            nearest_quantity["bounding_box"]["x1"]
                        ),
                        "y1": min(
                            current_box["y1"],
                            nearest_quantity["bounding_box"]["y1"]
                        ),
                        "x2": max(
                            current_box["x2"],
                            nearest_quantity["bounding_box"]["x2"]
                        ),
                        "y2": max(
                            current_box["y2"],
                            nearest_quantity["bounding_box"]["y2"]
                        )
                    },
                    "status": "PASS"
                }

        # -----------------------------------------
        # NET QUANTITY NOT FOUND
        # -----------------------------------------

        return {
            "rule": "Net Quantity",
            "found": False,
            "quantity": None,
            "unit": None,
            "source_text": None,
            "confidence": None,
            "bounding_box": None,
            "status": "VIOLATION"
        }

    def check_manufacturer_packer_importer(self):

        manufacturer_pattern = re.compile(
            r"\b(?:"
            r"manufactured\s+by|"
            r"manufactured\s*&\s*marketed\s+by|"
            r"manufactured\s*&\s*packed\s+by"
            r")\b",
            re.IGNORECASE
        )

        packer_pattern = re.compile(
            r"\b(?:"
            r"packed\s+by|"
            r"packed\s*&\s*marketed\s+by|"
            r"packer"
            r")\b",
            re.IGNORECASE
        )

        importer_pattern = re.compile(
            r"\b(?:"
            r"imported\s+by|"
            r"importer"
            r")\b",
            re.IGNORECASE
        )

        marketed_pattern = re.compile(
            r"\bmarketed\s+by\b",
            re.IGNORECASE
        )

        for detection in self.detections:

            text = detection["text"]

            # Manufacturer
            if manufacturer_pattern.search(text):

                return {
                    "rule": "Manufacturer Details",
                    "found": True,
                    "type": "manufacturer",
                    "source_text": text,
                    "confidence": detection["confidence"],
                    "bounding_box": detection["bounding_box"],
                    "status": "PASS"
                }

            # Packer
            if packer_pattern.search(text):

                return {
                    "rule": "Packer Details",
                    "found": True,
                    "type": "packer",
                    "source_text": text,
                    "confidence": detection["confidence"],
                    "bounding_box": detection["bounding_box"],
                    "status": "PASS"
                }

            # Importer
            if importer_pattern.search(text):

                return {
                    "rule": "Importer Details",
                    "found": True,
                    "type": "importer",
                    "source_text": text,
                    "confidence": detection["confidence"],
                    "bounding_box": detection["bounding_box"],
                    "status": "PASS"
                }

            # Marketer
            if marketed_pattern.search(text):

                return {
                    "rule": "Marketed By Declaration",
                    "found": True,
                    "type": "marketer",
                    "source_text": text,
                    "confidence": detection["confidence"],
                    "bounding_box": detection["bounding_box"],
                    "status": "DETECTED"
                }

        return {
            "rule": "Manufacturer/Packer/Importer Details",
            "found": False,
            "type": None,
            "source_text": None,
            "confidence": None,
            "bounding_box": None,
            "status": "VIOLATION"
        } 

    
    def check_manufacturing_date(self):

        declaration_pattern = re.compile(
            r"\b(?:"
            r"MFG\s*(?:DATE)?|"
            r"MANUFACTURING\s*DATE|"
            r"PKD|"
            r"PACKED\s*ON|"
            r"DATE\s*OF\s*PACKING"
            r")\b",
            re.IGNORECASE
        )

        date_pattern = re.compile(
            r"\b\d{1,2}\s*[\/\-]\s*\d{1,2}\s*[\/\-]\s*\d{2,4}\b"
            r"|\b\d{1,2}\s*[\/\-]\s*\d{2,4}\b"
        )

        for detection in self.detections:

            text = detection["text"]

            declaration_match = declaration_pattern.search(text)

            if not declaration_match:
                continue

            # ------------------------------------------------
            # CASE 1:
            # "PKD.: 15/05/2024"
            # ------------------------------------------------

            date_match = date_pattern.search(
                text[declaration_match.end():]
            )

            if date_match:

                return {
                    "rule": "Manufacturing/Packing Date",
                    "found": True,
                    "date": date_match.group(0),
                    "source_text": text,
                    "confidence": detection["confidence"],
                    "bounding_box": detection["bounding_box"],
                    "status": "PASS"
                }

            # ------------------------------------------------
            # CASE 2:
            # Date is in another OCR detection
            # Find the nearest date using bounding boxes
            # ------------------------------------------------

            current_box = detection["bounding_box"]

            current_x = (
                current_box["x1"] + current_box["x2"]
            ) / 2

            current_y = (
                current_box["y1"] + current_box["y2"]
            ) / 2

            nearest_date = None
            nearest_distance = float("inf")

            for candidate in self.detections:

                candidate_text = candidate["text"]

                candidate_match = date_pattern.search(
                    candidate_text
                )

                if not candidate_match:
                    continue

                # Don't compare the declaration with itself
                if candidate is detection:
                    continue

                candidate_box = candidate["bounding_box"]

                candidate_x = (
                    candidate_box["x1"] + candidate_box["x2"]
                ) / 2

                candidate_y = (
                    candidate_box["y1"] + candidate_box["y2"]
                ) / 2

                distance = (
                    (candidate_x - current_x) ** 2 +
                    (candidate_y - current_y) ** 2
                ) ** 0.5

                if distance < nearest_distance:

                    nearest_distance = distance
                    nearest_date = candidate

            # ------------------------------------------------
            # If a nearby date was found
            # ------------------------------------------------

            if nearest_date is not None:

                date_match = date_pattern.search(
                    nearest_date["text"]
                )

                return {
                    "rule": "Manufacturing/Packing Date",
                    "found": True,
                    "date": date_match.group(0),
                    "source_text": (
                        text + " " +
                        nearest_date["text"]
                    ),
                    "confidence": min(
                        detection["confidence"],
                        nearest_date["confidence"]
                    ),
                    "bounding_box": {
                        "x1": min(
                            current_box["x1"],
                            nearest_date["bounding_box"]["x1"]
                        ),
                        "y1": min(
                            current_box["y1"],
                            nearest_date["bounding_box"]["y1"]
                        ),
                        "x2": max(
                            current_box["x2"],
                            nearest_date["bounding_box"]["x2"]
                        ),
                        "y2": max(
                            current_box["y2"],
                            nearest_date["bounding_box"]["y2"]
                        )
                    },
                    "status": "PASS"
                }

        # ------------------------------------------------
        # DATE NOT FOUND
        # ------------------------------------------------

        return {
            "rule": "Manufacturing/Packing Date",
            "found": False,
            "date": None,
            "source_text": None,
            "confidence": None,
            "bounding_box": None,
            "status": "VIOLATION"
        }

    def check_date_validity(self):

        date_pattern = re.compile(
            r"\b\d{1,2}\s*[\/\-]\s*\d{1,2}\s*[\/\-]\s*\d{2,4}\b"
            r"|\b\d{1,2}\s*[\/\-]\s*\d{2,4}\b"
        )

        # First find MFG / PKD / Packing declaration
        declaration_pattern = re.compile(
            r"(?:"
            r"\bMFG\s*(?:DATE)?\b|"
            r"\bMANUFACTURING\s*DATE\b|"
            r"\bPKD\b|"
            r"\bPACKED\s*ON\b|"
            r"\bDATE\s*OF\s*PACKING\b"
            r")",
            re.IGNORECASE
        )

        for detection in self.detections:

            text = detection["text"].strip()

            if not declaration_pattern.search(text):
                continue

            # ------------------------------------------------
            # CASE 1:
            # Declaration and date are in same detection
            # ------------------------------------------------

            match = date_pattern.search(text)

            if match:

                date_text = match.group(0)

                if self._is_valid_date(date_text):

                    return {
                        "rule": "Manufacturing / Packing Date Validity",
                        "found": True,
                        "date": date_text,
                        "source_text": text,
                        "confidence": detection["confidence"],
                        "bounding_box": detection["bounding_box"],
                        "status": "PASS"
                    }

                else:

                    return {
                        "rule": "Manufacturing / Packing Date Validity",
                        "found": True,
                        "date": date_text,
                        "source_text": text,
                        "confidence": detection["confidence"],
                        "bounding_box": detection["bounding_box"],
                        "status": "VIOLATION"
                    }

            # ------------------------------------------------
            # CASE 2:
            # Declaration and date are separate detections
            # ------------------------------------------------

            current_box = detection["bounding_box"]

            cx = (current_box["x1"] + current_box["x2"]) / 2
            cy = (current_box["y1"] + current_box["y2"]) / 2

            candidates = []

            for candidate in self.detections:

                if candidate is detection:
                    continue

                candidate_text = candidate["text"].strip()

                match = date_pattern.search(candidate_text)

                if not match:
                    continue

                date_text = match.group(0)

                box = candidate["bounding_box"]

                candidate_cx = (box["x1"] + box["x2"]) / 2
                candidate_cy = (box["y1"] + box["y2"]) / 2

                distance = (
                    (candidate_cx - cx) ** 2 +
                    (candidate_cy - cy) ** 2
                ) ** 0.5

                candidates.append(
                    (distance, candidate, date_text)
                )

            if candidates:

                candidates.sort(key=lambda x: x[0])

                _, nearest, date_text = candidates[0]

                is_valid = self._is_valid_date(date_text)

                return {
                    "rule": "Manufacturing / Packing Date Validity",
                    "found": True,
                    "date": date_text,
                    "source_text": nearest["text"],
                    "confidence": nearest["confidence"],
                    "bounding_box": nearest["bounding_box"],
                    "status": "PASS" if is_valid else "VIOLATION"
                }

            return {
                "rule": "Manufacturing / Packing Date Validity",
                "found": False,
                "date": None,
                "source_text": None,
                "confidence": None,
                "bounding_box": None,
                "status": "VIOLATION"
            }

        return {
            "rule": "Manufacturing / Packing Date Validity",
            "found": False,
            "date": None,
            "source_text": None,
            "confidence": None,
            "bounding_box": None,
            "status": "VIOLATION"
        }


    def _is_valid_date(self, date_text):

        # Remove spaces
        date_text = re.sub(r"\s+", "", date_text)

        parts = re.split(r"[\/\-.]", date_text)

        try:

            if len(parts) == 3:

                day = int(parts[0])
                month = int(parts[1])
                year = int(parts[2])

                if year < 100:
                    year += 2000

                datetime(year, month, day)

                return True

            elif len(parts) == 2:

                # MM/YYYY or MM/YY style date
                month = int(parts[0])
                year = int(parts[1])

                if year < 100:
                    year += 2000

                if month < 1 or month > 12:
                    return False

                return True

        except ValueError:
            return False

        return False
    def check_consumer_care(self):

        consumer_pattern = re.compile(
            r"\b(?:"
            r"consumer\s*care|"
            r"customer\s*care|"
            r"consumer\s*complaints?|"
            r"complaints?|"
            r"contact"
            r")\b",
            re.IGNORECASE
        )

        phone_pattern = re.compile(
            r"\b(?:\+91[\s\-]?)?[6-9]\d{9}\b"
            r"|\b\d{4,5}[\s\-]?\d{5,6}\b"
        )

        email_pattern = re.compile(
            r"\b[A-Za-z0-9._%+-]+@"
            r"[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"
        )

        for i, detection in enumerate(self.detections):

            text = detection["text"]

            if not consumer_pattern.search(text):
                continue

            phone = None
            email = None

            # Search nearby OCR detections
            for candidate in self.detections:

                candidate_text = candidate["text"]

                if phone is None:
                    phone_match = phone_pattern.search(candidate_text)

                    if phone_match:
                        phone = phone_match.group(0)

                if email is None:
                    email_match = email_pattern.search(candidate_text)

                    if email_match:
                        email = email_match.group(0)

            return {
                "rule": "Consumer Care / Complaint Details",
                "found": True,
                "phone": phone,
                "email": email,
                "source_text": text,
                "confidence": detection["confidence"],
                "bounding_box": detection["bounding_box"],
                "status": "PASS" if phone or email else "PARTIAL"
            }

        return {
            "rule": "Consumer Care / Complaint Details",
            "found": False,
            "phone": None,
            "email": None,
            "source_text": None,
            "confidence": None,
            "bounding_box": None,
            "status": "VIOLATION"
        }

    def check_product_name(self):

        # Explicit product-name declarations
        declaration_pattern = re.compile(
            r"\b(?:"
            r"PRODUCT\s*NAME|"
            r"COMMON\s*NAME|"
            r"GENERIC\s*NAME|"
            r"PRODUCT"
            r")\b",
            re.IGNORECASE
        )

        # Things that should NOT be considered product names
        exclude_pattern = re.compile(
            r"(?:"
            r"MRP|"
            r"NET|"
            r"QUANTITY|"
            r"WEIGHT|"
            r"VOLUME|"
            r"MFG|"
            r"MANUFACTUR|"
            r"PACK|"
            r"PKD|"
            r"USE\s*BY|"
            r"BEST\s*BEFORE|"
            r"EXPIR|"
            r"BATCH|"
            r"LOT|"
            r"FSSAI|"
            r"LIC|"
            r"CONTACT|"
            r"COMPLAINT|"
            r"CONSUMER|"
            r"INGREDIENTS|"
            r"STORE|"
            r"KEEP|"
            r"EMAIL|"
            r"WWW|"
            r"HTTP"
            r")",
            re.IGNORECASE
        )

        # 1. First look for an explicit product-name declaration
        for i, detection in enumerate(self.detections):

            text = detection["text"].strip()

            if declaration_pattern.search(text):

                # If the name is present in the same OCR detection
                cleaned = declaration_pattern.sub("", text).strip(" :-")

                if cleaned:
                    return {
                        "rule": "Product / Common / Generic Name",
                        "found": True,
                        "product_name": cleaned,
                        "source_text": text,
                        "confidence": detection["confidence"],
                        "bounding_box": detection["bounding_box"],
                        "status": "PASS"
                    }

                # Otherwise look for a nearby text detection
                current_box = detection["bounding_box"]

                cx = (current_box["x1"] + current_box["x2"]) / 2
                cy = (current_box["y1"] + current_box["y2"]) / 2

                candidates = []

                for candidate in self.detections:

                    candidate_text = candidate["text"].strip()

                    if candidate is detection:
                        continue

                    if exclude_pattern.search(candidate_text):
                        continue

                    # Avoid very long paragraphs
                    if len(candidate_text) > 80:
                        continue

                    box = candidate["bounding_box"]

                    candidate_cx = (box["x1"] + box["x2"]) / 2
                    candidate_cy = (box["y1"] + box["y2"]) / 2

                    distance = (
                        (candidate_cx - cx) ** 2 +
                        (candidate_cy - cy) ** 2
                    ) ** 0.5

                    candidates.append((distance, candidate))

                if candidates:

                    candidates.sort(key=lambda x: x[0])

                    nearest = candidates[0][1]

                    return {
                        "rule": "Product / Common / Generic Name",
                        "found": True,
                        "product_name": nearest["text"],
                        "source_text": nearest["text"],
                        "confidence": nearest["confidence"],
                        "bounding_box": nearest["bounding_box"],
                        "status": "PASS"
                    }

        # 2. Fallback:
        # Look for a short, reasonably confident text that could be
        # the product name.
        for detection in self.detections:

            text = detection["text"].strip()

            if not text:
                continue

            if len(text) < 3 or len(text) > 50:
                continue

            if exclude_pattern.search(text):
                continue

            # Ignore strings containing mostly numbers
            digit_count = sum(char.isdigit() for char in text)

            if digit_count > len(text) * 0.5:
                continue

            # Ignore obvious sentences
            if len(text.split()) > 8:
                continue

            # Require reasonable OCR confidence
            if detection["confidence"] < 0.70:
                continue

            return {
                "rule": "Product / Common / Generic Name",
                "found": True,
                "product_name": text,
                "source_text": text,
                "confidence": detection["confidence"],
                "bounding_box": detection["bounding_box"],
                "status": "PASS"
            }

        # Nothing found
        return {
            "rule": "Product / Common / Generic Name",
            "found": False,
            "product_name": None,
            "source_text": None,
            "confidence": None,
            "bounding_box": None,
            "status": "VIOLATION"
        }

    def check_unit_of_measurement(self):

        # Units commonly used with packaged commodities
        valid_units = {
            "mg", "g", "kg",
            "ml", "l",
            "cm", "m",
            "mm"
        }

        quantity_pattern = re.compile(
            r"(\d+(?:\.\d+)?)\s*([a-zA-Z]+)\b",
            re.IGNORECASE
        )

        # First find the Net Quantity declaration
        net_quantity_pattern = re.compile(
            r"\b(?:"
            r"NET\s*(?:WEIGHT|WT|QUANTITY|QTY|VOLUME|CONTENT)"
            r")\b",
            re.IGNORECASE
        )

        for detection in self.detections:

            text = detection["text"].strip()

            if not net_quantity_pattern.search(text):
                continue

            # Case 1: quantity and unit are in the same detection
            match = quantity_pattern.search(text)

            if match:
                quantity = match.group(1)
                unit = match.group(2).lower()

                if unit in valid_units:
                    status = "PASS"
                else:
                    status = "VIOLATION"

                return {
                    "rule": "Unit of Measurement",
                    "found": True,
                    "quantity": quantity,
                    "unit": unit,
                    "source_text": text,
                    "confidence": detection["confidence"],
                    "bounding_box": detection["bounding_box"],
                    "status": status
                }

            # Case 2: Net Quantity and quantity are separate detections
            current_box = detection["bounding_box"]

            cx = (current_box["x1"] + current_box["x2"]) / 2
            cy = (current_box["y1"] + current_box["y2"]) / 2

            candidates = []

            for candidate in self.detections:

                candidate_text = candidate["text"].strip()

                if candidate is detection:
                    continue

                match = quantity_pattern.search(candidate_text)

                if not match:
                    continue

                unit = match.group(2).lower()

                if unit not in valid_units:
                    continue

                box = candidate["bounding_box"]

                candidate_cx = (box["x1"] + box["x2"]) / 2
                candidate_cy = (box["y1"] + box["y2"]) / 2

                distance = (
                    (candidate_cx - cx) ** 2 +
                    (candidate_cy - cy) ** 2
                ) ** 0.5

                candidates.append((distance, candidate, match))

            if candidates:

                candidates.sort(key=lambda x: x[0])

                _, nearest, match = candidates[0]

                return {
                    "rule": "Unit of Measurement",
                    "found": True,
                    "quantity": match.group(1),
                    "unit": match.group(2).lower(),
                    "source_text": nearest["text"],
                    "confidence": nearest["confidence"],
                    "bounding_box": nearest["bounding_box"],
                    "status": "PASS"
                }

        return {
            "rule": "Unit of Measurement",
            "found": False,
            "quantity": None,
            "unit": None,
            "source_text": None,
            "confidence": None,
            "bounding_box": None,
            "status": "VIOLATION"
        }

    def check_declaration_completeness(self):

        results = {
            "MRP": self.check_mrp(),
            "Net Quantity": self.check_net_quantity(),
            "Manufacturer / Packer / Importer":
                self.check_manufacturer_packer_importer(),
            "Manufacturing / Packing Date":
                self.check_manufacturing_date(),
            "Consumer Care":
                self.check_consumer_care(),
            "Product Name":
                self.check_product_name(),
            "Unit of Measurement":
                self.check_unit_of_measurement()
        }

        # These are the declarations we want for our MVP
        required_checks = [
            "MRP",
            "Net Quantity",
            "Manufacturer / Packer / Importer",
            "Manufacturing / Packing Date",
            "Consumer Care",
            "Product Name",
            "Unit of Measurement"
        ]

        passed = []
        failed = []

        for check_name in required_checks:

            result = results[check_name]

            if result["status"] == "PASS":
                passed.append(check_name)
            else:
                failed.append(check_name)

        if failed:
            overall_status = "NON-COMPLIANT"
        else:
            overall_status = "COMPLIANT"

        return {
            "rule": "Declaration Completeness",
            "overall_status": overall_status,
            "total_checks": len(required_checks),
            "passed": len(passed),
            "failed": len(failed),
            "passed_checks": passed,
            "failed_checks": failed,
            "details": results
        }

    def generate_structured_report(self):

        results = {
            "MRP": self.check_mrp(),
            "Net Quantity": self.check_net_quantity(),
            "Manufacturer / Packer / Importer":
                self.check_manufacturer_packer_importer(),
            "Manufacturing / Packing Date":
                self.check_manufacturing_date(),
            "Consumer Care":
                self.check_consumer_care(),
            "Product Name":
                self.check_product_name(),
            "Unit of Measurement":
                self.check_unit_of_measurement()
        }

        checks = []

        for name, result in results.items():

            if name == "MRP":
                value = (
                    f"₹{result['mrp']:.2f}"
                    if result.get("mrp") is not None
                    else None
                )

            elif name == "Net Quantity":
                if result.get("quantity") is not None:
                    value = f"{result['quantity']} {result['unit']}"
                else:
                    value = None

            elif name == "Manufacturing / Packing Date":
                value = result.get("date")

            elif name == "Consumer Care":
                value = result.get("email") or result.get("phone")

            elif name == "Product Name":
                value = result.get("product_name")

            elif name == "Unit of Measurement":
                if result.get("quantity") is not None:
                    value = f"{result['quantity']} {result['unit']}"
                else:
                    value = None

            else:
                value = result.get("source_text")

            checks.append({
                "name": name,
                "status": result["status"],
                "value": value,
                "confidence": result.get("confidence"),
                "bounding_box": result.get("bounding_box")
            })

        passed = sum(
            1 for check in checks
            if check["status"] == "PASS"
        )

        failed = len(checks) - passed

        overall_status = (
            "COMPLIANT"
            if failed == 0
            else "NON-COMPLIANT"
        )

        return {
            "image": self.ocr_result.get("image"),

            "summary": {
                "overall_status": overall_status,
                "total_checks": len(checks),
                "passed": passed,
                "failed": failed
            },

            "checks": checks
        }

    def generate_final_report(self):

        report = self.generate_structured_report()

        summary = report["summary"]
        checks = report["checks"]

        # Calculate compliance percentage
        compliance_percentage = round(
            (summary["passed"] / summary["total_checks"]) * 100,
            2
        )

        # Final status
        if summary["failed"] == 0:
            final_status = "COMPLIANT"
        else:
            final_status = "NON-COMPLIANT"

        return {
            "compliance_report": {

                "status": final_status,

                "compliance_percentage":
                    compliance_percentage,

                "summary": {
                    "total_checks": summary["total_checks"],
                    "passed": summary["passed"],
                    "failed": summary["failed"]
                },

                "checks": checks
            }
        }
# test_engine = LegalMetrologyRuleEngine(result)

# # print(ocr_json)
# print(test_engine.check_mrp())
# print(test_engine.check_net_quantity())
# print(test_engine.check_manufacturer_packer_importer())
# print(test_engine.check_manufacturing_date())
# print(test_engine.check_consumer_care())
# print(test_engine.check_product_name())
# print(test_engine.check_unit_of_measurement())
# print(test_engine.check_date_validity())
# print(test_engine.check_declaration_completeness())

# structured_output = test_engine.generate_final_report()
# print(json.dumps(structured_output,indent = 4))

