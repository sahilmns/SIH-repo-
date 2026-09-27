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
            lang='en',
            enable_mkldnn=False,
            text_detection_model_name="PP-OCRv5_mobile_det",
            text_recognition_model_name="PP-OCRv5_mobile_rec",
            use_doc_orientation_classify=False,
            use_doc_unwarping=False,
            use_textline_orientation=False
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

if __name__ == "__main__":
    image_path = r"D:\Programming\Python\glucond.jpeg"

    test_case = LegalMetrologyOCREngine()

    result = test_case.extract_to_json(image_path)
    # print(result)

# for detection in result["detections"]:
#     print(repr(detection["text"]))

# ocr_json = json.dumps(result, indent=4)
# print(ocr_json )


class LegalMetrologyRuleEngine:

    def __init__(self, ocr_result):
        self.ocr_result = ocr_result
        self.detections = ocr_result["detections"]


    def check_mrp(self):
        """
        Detect MRP from OCR detections.

        Handles:
            MRP ₹350
            MRP: Rs. 350/-
            M.R.P. Rs. 350
            MRP (INCL OF ALL TAXES): Rs. 350/-
            MRPCINCL OF ALL TAXES):Rs.350/-

        Also handles:
            MRP: SEE BOTTOM
            MRP: SEE TOP
            MRP: SEE SIDE
            MRP: SEE BACK

        For multi-image OCR:
            - Search all detections for an actual MRP first.
            - Only return REQUIRES_ADDITIONAL_IMAGE if no actual
            MRP value exists anywhere.
        """

        import re
        from math import sqrt

        detections = self.detections

        # =========================================================
        # 1. MRP DECLARATION
        # =========================================================
        #
        # IMPORTANT:
        # Do NOT put \b after MRP.
        #
        # OCR can produce:
        #
        #   MRPCINCL
        #   MRPTAX
        #   MRP₹
        #
        # So we deliberately allow MRP to be followed immediately
        # by another character.
        # =========================================================

        mrp_pattern = re.compile(
            r"""
            (?:
                M\s*\.?\s*R\s*\.?\s*P\s*\.?
                |
                MAX\s*\.?\s*R\s*\.?\s*P\s*\.?
                |
                MAXIMUM\s+RETAIL\s+PRICE
            )
            """,
            re.IGNORECASE | re.VERBOSE
        )

        # =========================================================
        # 2. SEE ANOTHER SURFACE
        # =========================================================

        additional_image_pattern = re.compile(
            r"""
            (?:
                SEE\s+(?:THE\s+)?BOTTOM
                |
                SEE\s+(?:THE\s+)?TOP
                |
                SEE\s+(?:THE\s+)?SIDE
                |
                SEE\s+(?:THE\s+)?BACK
                |
                SEE\s+(?:THE\s+)?REAR

                |

                REFER\s+TO\s+(?:THE\s+)?BOTTOM
                |
                REFER\s+TO\s+(?:THE\s+)?TOP
                |
                REFER\s+TO\s+(?:THE\s+)?SIDE
                |
                REFER\s+TO\s+(?:THE\s+)?BACK
                |
                REFER\s+TO\s+(?:THE\s+)?REAR

                |

                ON\s+(?:THE\s+)?BOTTOM
                |
                ON\s+(?:THE\s+)?TOP
                |
                ON\s+(?:THE\s+)?SIDE
                |
                ON\s+(?:THE\s+)?BACK
                |
                ON\s+(?:THE\s+)?REAR
            )
            """,
            re.IGNORECASE | re.VERBOSE
        )

        # =========================================================
        # 3. CURRENCY
        # =========================================================

        currency_pattern = re.compile(
            r"""
            (?:
                ₹
                |
                \bRS\.?
                |
                \bINR\b
            )
            """,
            re.IGNORECASE | re.VERBOSE
        )

        # =========================================================
        # 4. PRICE
        # =========================================================
        #
        # Examples:
        #
        # Rs. 350
        # Rs 350/-
        # ₹350
        # ₹ 350.00
        # INR 350
        # 350.00
        #
        # Currency is optional because OCR may miss ₹ / Rs.
        # =========================================================

        price_pattern = re.compile(
            r"""
            (?:
                ₹\s*
                |
                RS\.?\s*
                |
                INR\s*
            )?
            (\d+(?:\.\d{1,2})?)
            \s*
            (?:/-)?
            """,
            re.IGNORECASE | re.VERBOSE
        )

        # =========================================================
        # 5. CONTEXT WHICH MEANS "NOT MRP"
        # =========================================================
        #
        # These are evaluated around an INDIVIDUAL price.
        #
        # Example:
        #
        # MRP: Rs.350 USP: Rs.0.87 per g
        #
        # 350 -> valid
        # 0.87 -> rejected
        # =========================================================

        invalid_price_context = re.compile(
            r"""
            (?:
                UNIT\s*SALE\s*PRICE
                |
                UNIT\s*SELLING\s*PRICE
                |
                SALE\s*PRICE
                |
                UNIT\s*PRICE
                |
                USP
                |
                PER\s*
                (?:G|GM|GRAM|KG|KGS|MG|ML|L|LTR|LITRE)
            )
            """,
            re.IGNORECASE | re.VERBOSE
        )

        # =========================================================
        # 6. OTHER NON-MRP CONTEXT
        # =========================================================

        non_mrp_pattern = re.compile(
            r"""
            (?:
                NET\s*(?:WT|WEIGHT|QUANTITY|CONTENT)
                |
                BATCH
                |
                LOT
                |
                MFG
                |
                MFD
                |
                MANUFACTURED
                |
                PACKED
                |
                PKD
                |
                PROD
                |
                POD
                |
                EXP
                |
                EXPIRY
                |
                USE\s*BY
                |
                BEST\s*BEFORE
                |
                ENERGY
                |
                FAT
                |
                SODIUM
                |
                CARBOHYDRATE
                |
                PROTEIN
                |
                SUGARS
                |
                CHOLESTEROL
                |
                SERVING
                |
                NUTRITION
                |
                PER\s*100
            )
            """,
            re.IGNORECASE | re.VERBOSE
        )

        # =========================================================
        # 7. DATE PATTERN
        # =========================================================

        date_pattern = re.compile(
            r"""
            \d{1,3}
            \s*[/.\-]
            \s*\d{1,2}
            \s*[/.\-]
            \s*\d{2,4}
            """,
            re.IGNORECASE | re.VERBOSE
        )

        # =========================================================
        # HELPERS
        # =========================================================

        def clean_text(text):
            return str(text or "").strip()

        def get_box(detection):
            return detection.get("bounding_box")

        def get_center(detection):

            box = get_box(detection)

            if not box:
                return None

            return (
                (box["x1"] + box["x2"]) / 2,
                (box["y1"] + box["y2"]) / 2
            )

        def get_height(detection):

            box = get_box(detection)

            if not box:
                return 0

            return max(
                1,
                box["y2"] - box["y1"]
            )

        def horizontal_overlap(a, b):

            box_a = get_box(a)
            box_b = get_box(b)

            if not box_a or not box_b:
                return 0

            left = max(
                box_a["x1"],
                box_b["x1"]
            )

            right = min(
                box_a["x2"],
                box_b["x2"]
            )

            return max(
                0,
                right - left
            )

        def spatial_relation(
            mrp_detection,
            candidate
        ):

            mrp_center = get_center(
                mrp_detection
            )

            candidate_center = get_center(
                candidate
            )

            if not mrp_center or not candidate_center:
                return None

            mx, my = mrp_center
            cx, cy = candidate_center

            dx = cx - mx
            dy = cy - my

            tolerance = max(
                20,
                min(
                    get_height(mrp_detection),
                    get_height(candidate)
                ) * 1.5
            )

            if abs(dy) <= tolerance:

                if dx > 0:
                    return "RIGHT"

                if dx < 0:
                    return "LEFT"

                return "SAME"

            if dy > 0:
                return "BELOW"

            return "ABOVE"

        def contains_date(text):

            return bool(
                date_pattern.search(
                    clean_text(text)
                )
            )

        def contains_non_mrp_context(text):

            return bool(
                non_mrp_pattern.search(
                    clean_text(text)
                )
            )

        # =========================================================
        # 8. FIND ALL MRP DECLARATIONS
        # =========================================================

        mrp_detections = []

        for detection in detections:

            text = clean_text(
                detection.get("text", "")
            )

            if not text:
                continue

            if mrp_pattern.search(text):

                mrp_detections.append(
                    detection
                )

        # =========================================================
        # 9. NO MRP DECLARATION
        # =========================================================

        if not mrp_detections:

            return {
                "rule": "MRP",
                "found": False,
                "mrp": None,
                "value": None,
                "source_text": None,
                "confidence": 0.0,
                "bounding_box": None,
                "status": "NOT_FOUND"
            }

        # =========================================================
        # 10. REMEMBER SEE BOTTOM / TOP / SIDE / BACK
        # =========================================================

        additional_image_detections = []

        for detection in detections:

            text = clean_text(
                detection.get("text", "")
            )

            if not text:
                continue

            if additional_image_pattern.search(text):

                additional_image_detections.append(
                    detection
                )

        # =========================================================
        # 11. SEARCH FOR ACTUAL MRP
        # =========================================================

        candidates = []

        for mrp_detection in mrp_detections:

            mrp_text = clean_text(
                mrp_detection.get("text", "")
            )

            mrp_match = mrp_pattern.search(
                mrp_text
            )

            if not mrp_match:
                continue

            # -----------------------------------------------------
            # TEXT AFTER MRP
            # -----------------------------------------------------

            after_mrp = mrp_text[
                mrp_match.end():
            ].strip()

            # =====================================================
            # CASE A: PRICE IN SAME OCR BOX
            # =====================================================

            if after_mrp:

                matches = list(
                    price_pattern.finditer(
                        after_mrp
                    )
                )

                for match in matches:

                    try:

                        value = float(
                            match.group(1)
                        )

                    except (
                        ValueError,
                        TypeError
                    ):

                        continue

                    if value <= 0:
                        continue

                    matched_text = match.group(0)

                    # -------------------------------------------------
                    # Currency directly attached to this price
                    # -------------------------------------------------

                    has_currency = bool(
                        currency_pattern.search(
                            matched_text
                        )
                    )

                    # -------------------------------------------------
                    # IMPORTANT:
                    # Only inspect the text IMMEDIATELY BEFORE
                    # this particular price.
                    #
                    # Do NOT inspect the whole OCR box.
                    #
                    # This fixes:
                    #
                    # MRP Rs.350 USP Rs.0.87 per g
                    #
                    # 350 -> valid
                    # 0.87 -> rejected
                    # -------------------------------------------------

                    context_before = after_mrp[
                        max(
                            0,
                            match.start() - 40
                        ):
                        match.start()
                    ]

                    # Reject if this particular price is associated
                    # with USP / unit sale price / per gram etc.
                    if invalid_price_context.search(
                        context_before
                    ):
                        continue

                    # -------------------------------------------------
                    # Text immediately after price
                    # -------------------------------------------------

                    context_after = after_mrp[
                        match.end():
                        match.end() + 25
                    ]

                    # Reject quantities such as:
                    #
                    # 350 g
                    # 350 ml
                    # 350 kcal
                    # -------------------------------------------------

                    if re.search(
                        r"""
                        \b(?:
                            KCAL
                            |MG
                            |G
                            |KG
                            |ML
                            |L
                            |%
                        )\b
                        """,
                        context_after,
                        re.IGNORECASE |
                        re.VERBOSE
                    ):

                        continue

                    # -------------------------------------------------
                    # Reject dates
                    # -------------------------------------------------

                    date_context = (
                        context_before +
                        matched_text +
                        context_after
                    )

                    if contains_date(
                        date_context
                    ):

                        continue

                    # -------------------------------------------------
                    # Reject non-MRP declaration context
                    #
                    # BUT only when it occurs immediately before
                    # this price.
                    # -------------------------------------------------

                    if contains_non_mrp_context(
                        context_before
                    ):

                        continue

                    # -------------------------------------------------
                    # SCORE
                    # -------------------------------------------------

                    score = 200

                    # Currency is strong evidence.
                    if has_currency:
                        score += 300

                    # Price immediately after MRP is strong evidence.
                    score += max(
                        0,
                        100 - match.start()
                    )

                    candidates.append({
                        "score": score,
                        "value": value,
                        "source_text": mrp_text,
                        "confidence": float(
                            mrp_detection.get(
                                "confidence",
                                0
                            )
                        ),
                        "bounding_box":
                            mrp_detection.get(
                                "bounding_box"
                            ),
                        "mrp_detection":
                            mrp_detection,
                        "candidate_detection":
                            None
                    })

            # =====================================================
            # CASE B: PRICE IN ANOTHER OCR BOX
            # =====================================================

            mrp_center = get_center(
                mrp_detection
            )

            if not mrp_center:
                continue

            mx, my = mrp_center

            for candidate in detections:

                if candidate is mrp_detection:
                    continue

                candidate_text = clean_text(
                    candidate.get("text", "")
                )

                if not candidate_text:
                    continue

                # -------------------------------------------------
                # Reject obvious unrelated declaration boxes.
                # -------------------------------------------------

                if contains_date(
                    candidate_text
                ):
                    continue

                if contains_non_mrp_context(
                    candidate_text
                ):
                    continue

                candidate_center = get_center(
                    candidate
                )

                if not candidate_center:
                    continue

                cx, cy = candidate_center

                dx = cx - mx
                dy = cy - my

                # -------------------------------------------------
                # Spatial limits
                # -------------------------------------------------

                if abs(dx) > 350:
                    continue

                if abs(dy) > 250:
                    continue

                # -------------------------------------------------
                # Price candidates
                # -------------------------------------------------

                matches = list(
                    price_pattern.finditer(
                        candidate_text
                    )
                )

                if not matches:
                    continue

                for match in matches:

                    try:

                        value = float(
                            match.group(1)
                        )

                    except (
                        ValueError,
                        TypeError
                    ):

                        continue

                    if value <= 0:
                        continue

                    matched_text = match.group(0)

                    has_currency = bool(
                        currency_pattern.search(
                            matched_text
                        )
                    )

                    # -------------------------------------------------
                    # Context immediately around THIS price.
                    # -------------------------------------------------

                    context_before = candidate_text[
                        max(
                            0,
                            match.start() - 40
                        ):
                        match.start()
                    ]

                    context_after = candidate_text[
                        match.end():
                        match.end() + 25
                    ]

                    # USP / unit sale price
                    if invalid_price_context.search(
                        context_before
                    ):
                        continue

                    # Quantity / nutrition units
                    if re.search(
                        r"""
                        \b(?:
                            KCAL
                            |MG
                            |G
                            |KG
                            |ML
                            |L
                            |%
                        )\b
                        """,
                        context_after,
                        re.IGNORECASE |
                        re.VERBOSE
                    ):

                        continue

                    relation = spatial_relation(
                        mrp_detection,
                        candidate
                    )

                    if not relation:
                        continue

                    # -------------------------------------------------
                    # SCORE
                    # -------------------------------------------------

                    score = 0

                    # Currency is very strong evidence.
                    if has_currency:
                        score += 300

                    # Spatial relation.
                    if relation == "RIGHT":
                        score += 150

                    elif relation == "BELOW":
                        score += 140

                    elif relation == "SAME":
                        score += 120

                    elif relation == "LEFT":
                        score += 50

                    elif relation == "ABOVE":
                        score += 30

                    # Distance.
                    distance = sqrt(
                        dx ** 2 +
                        dy ** 2
                    )

                    score += max(
                        0,
                        100 - distance / 5
                    )

                    # Strong horizontal relationship.
                    if (
                        dx > 0
                        and abs(dy) <= 80
                        and dx <= 300
                    ):

                        score += 100

                    # Strong vertical relationship.
                    if (
                        dy > 0
                        and abs(dx) <= 200
                        and dy <= 200
                    ):

                        score += 100

                    # Overlapping boxes.
                    if horizontal_overlap(
                        mrp_detection,
                        candidate
                    ) > 0:

                        score += 50

                    # Small value without currency is more likely
                    # to be a unit sale price.
                    if (
                        value < 1
                        and not has_currency
                    ):

                        score -= 100

                    candidates.append({
                        "score": score,
                        "value": value,
                        "source_text": (
                            mrp_text
                            + " "
                            + candidate_text
                        ).strip(),
                        "confidence": min(
                            float(
                                mrp_detection.get(
                                    "confidence",
                                    0
                                )
                            ),
                            float(
                                candidate.get(
                                    "confidence",
                                    0
                                )
                            )
                        ),
                        "bounding_box": None,
                        "mrp_detection":
                            mrp_detection,
                        "candidate_detection":
                            candidate
                    })

        # =========================================================
        # 12. NO ACTUAL MRP FOUND
        # =========================================================

        if not candidates:

            if additional_image_detections:

                detection = (
                    additional_image_detections[0]
                )

                return {
                    "rule": "MRP",
                    "found": False,
                    "mrp": None,
                    "value": None,
                    "source_text": detection.get(
                        "text"
                    ),
                    "confidence": round(
                        float(
                            detection.get(
                                "confidence",
                                0
                            )
                        ),
                        4
                    ),
                    "bounding_box":
                        detection.get(
                            "bounding_box"
                        ),
                    "status":
                        "REQUIRES_ADDITIONAL_IMAGE"
                }

            return {
                "rule": "MRP",
                "found": False,
                "mrp": None,
                "value": None,
                "source_text": None,
                "confidence": 0.0,
                "bounding_box": None,
                "status": "NOT_FOUND"
            }

        # =========================================================
        # 13. SORT CANDIDATES
        # =========================================================

        candidates.sort(
            key=lambda x: x["score"],
            reverse=True
        )

        best = candidates[0]

        # =========================================================
        # 14. UNCERTAINTY CHECK
        # =========================================================

        if len(candidates) > 1:

            second = candidates[1]

            if (
                best["value"] != second["value"]
                and
                best["score"] - second["score"] < 25
            ):

                return {
                    "rule": "MRP",
                    "found": False,
                    "mrp": None,
                    "value": None,
                    "source_text": (
                        best["source_text"]
                        + " | "
                        + second["source_text"]
                    ),
                    "confidence": round(
                        min(
                            best["confidence"],
                            second["confidence"]
                        ),
                        4
                    ),
                    "bounding_box": None,
                    "status": "UNCERTAIN"
                }

        # =========================================================
        # 15. COMBINE BOUNDING BOXES
        # =========================================================

        mrp_detection = best.get(
            "mrp_detection"
        )

        candidate_detection = best.get(
            "candidate_detection"
        )

        if (
            mrp_detection
            and candidate_detection
        ):

            box1 = mrp_detection.get(
                "bounding_box"
            )

            box2 = candidate_detection.get(
                "bounding_box"
            )

            if box1 and box2:

                combined_box = {
                    "x1": min(
                        box1["x1"],
                        box2["x1"]
                    ),
                    "y1": min(
                        box1["y1"],
                        box2["y1"]
                    ),
                    "x2": max(
                        box1["x2"],
                        box2["x2"]
                    ),
                    "y2": max(
                        box1["y2"],
                        box2["y2"]
                    )
                }

            else:

                combined_box = (
                    box1 or box2
                )

        else:

            combined_box = best.get(
                "bounding_box"
            )

        # =========================================================
        # 16. FINAL PASS
        # =========================================================

        return {
            "rule": "MRP",
            "found": True,
            "mrp": best["value"],
            "value": best["value"],
            "source_text": best["source_text"],
            "confidence": round(
                best["confidence"],
                4
            ),
            "bounding_box": combined_box,
            "status": "PASS"
        }

    def check_unit_sale_price(self):

        # ---------------------------------------------------------
        # 1. UNIT SALE PRICE DECLARATION
        # ---------------------------------------------------------

        usp_pattern = re.compile(
            r"\b(?:"
            r"UNIT\s*SALE\s*PRICE"
            r"|UNIT\s*SELLING\s*PRICE"
            r"|SALE\s*PRICE\s*PER\s*UNIT"
            r"|SELLING\s*PRICE\s*PER\s*UNIT"
            r"|USP"
            r")\b",
            re.IGNORECASE
        )

        # ---------------------------------------------------------
        # 2. PRICE + UNIT PATTERN
        #
        # Examples:
        # ₹ 0.20 per g
        # Rs. 0.87 per 100 g
        # ₹ 38 per kg
        # 0.38/g
        # ---------------------------------------------------------

        price_unit_pattern = re.compile(
            r"(?:"
            r"(?:₹|RS\.?|INR)\s*"
            r")?"
            r"(\d+(?:\.\d+)?)"
            r"\s*"
            r"(?:"
            r"PER\s+"
            r"(?:\d+(?:\.\d+)?\s*)?"
            r"(KG|G|MG|L|ML|UNIT|UNITS|PCS|PC|NUMBER|NO\.?)"
            r"|"
            r"/\s*"
            r"(?:\d+(?:\.\d+)?\s*)?"
            r"(KG|G|MG|L|ML|UNIT|UNITS|PCS|PC|NUMBER|NO\.?)"
            r")\b",
            re.IGNORECASE
        )

        # ---------------------------------------------------------
        # 3. FIND USP DECLARATIONS
        # ---------------------------------------------------------

        usp_detections = []

        for detection in self.detections:

            text = detection.get("text", "").strip()

            if not text:
                continue

            if usp_pattern.search(text):
                usp_detections.append(detection)

        # ---------------------------------------------------------
        # 4. SAME OCR BOX
        #
        # Example:
        # UNIT SALE PRICE ₹: 0.20 per g
        # ---------------------------------------------------------

        for detection in usp_detections:

            text = detection.get("text", "").strip()

            declaration_match = usp_pattern.search(text)

            if not declaration_match:
                continue

            price_match = price_unit_pattern.search(
                text,
                declaration_match.end()
            )

            if not price_match:
                # Sometimes OCR puts the value before the
                # USP declaration, so check the complete text.
                price_match = price_unit_pattern.search(text)

            if not price_match:
                continue

            price = float(price_match.group(1))

            unit = (
                price_match.group(2)
                or price_match.group(3)
            )

            unit = unit.upper().replace(".", "")

            return {
                "rule": "Unit Sale Price",
                "found": True,
                "price": price,
                "unit": unit,
                "source_text": text,
                "confidence": detection.get("confidence"),
                "bounding_box": detection.get("bounding_box"),
                "status": "PASS"
            }

        # ---------------------------------------------------------
        # 5. USP AND VALUE IN SEPARATE OCR BOXES
        #
        # Example:
        #
        # UNIT SALE PRICE:
        # ₹ 0.20 per g
        # ---------------------------------------------------------

        for declaration in usp_detections:

            declaration_box = declaration.get(
                "bounding_box"
            )

            if not declaration_box:
                continue

            declaration_x = (
                declaration_box["x1"] +
                declaration_box["x2"]
            ) / 2

            declaration_y = (
                declaration_box["y1"] +
                declaration_box["y2"]
            ) / 2

            nearby_candidates = []

            for candidate in self.detections:

                if candidate is declaration:
                    continue

                candidate_text = candidate.get(
                    "text",
                    ""
                ).strip()

                if not candidate_text:
                    continue

                price_match = price_unit_pattern.search(
                    candidate_text
                )

                if not price_match:
                    continue

                candidate_box = candidate.get(
                    "bounding_box"
                )

                if not candidate_box:
                    continue

                candidate_x = (
                    candidate_box["x1"] +
                    candidate_box["x2"]
                ) / 2

                candidate_y = (
                    candidate_box["y1"] +
                    candidate_box["y2"]
                ) / 2

                distance = (
                    (candidate_x - declaration_x) ** 2 +
                    (candidate_y - declaration_y) ** 2
                ) ** 0.5

                nearby_candidates.append(
                    (
                        distance,
                        candidate,
                        price_match
                    )
                )

            nearby_candidates.sort(
                key=lambda item: item[0]
            )

            for distance, candidate, price_match in (
                nearby_candidates[:10]
            ):

                declaration_height = (
                    declaration_box["y2"] -
                    declaration_box["y1"]
                )

                max_distance = max(
                    300,
                    declaration_height * 8
                )

                if distance > max_distance:
                    continue

                price = float(price_match.group(1))

                unit = (
                    price_match.group(2)
                    or price_match.group(3)
                )

                unit = unit.upper().replace(".", "")

                confidence_values = [
                    declaration.get("confidence"),
                    candidate.get("confidence")
                ]

                confidence_values = [
                    value
                    for value in confidence_values
                    if isinstance(value, (int, float))
                ]

                confidence = (
                    min(confidence_values)
                    if confidence_values
                    else None
                )

                candidate_box = candidate.get(
                    "bounding_box"
                )

                combined_box = {
                    "x1": min(
                        declaration_box["x1"],
                        candidate_box["x1"]
                    ),
                    "y1": min(
                        declaration_box["y1"],
                        candidate_box["y1"]
                    ),
                    "x2": max(
                        declaration_box["x2"],
                        candidate_box["x2"]
                    ),
                    "y2": max(
                        declaration_box["y2"],
                        candidate_box["y2"]
                    )
                }

                return {
                    "rule": "Unit Sale Price",
                    "found": True,
                    "price": price,
                    "unit": unit,
                    "source_text": (
                        declaration.get("text", "")
                        + " "
                        + candidate.get("text", "")
                    ),
                    "confidence": confidence,
                    "bounding_box": combined_box,
                    "status": "PASS"
                }

        # ---------------------------------------------------------
        # 6. USP DECLARATION FOUND BUT VALUE NOT DETECTED
        # ---------------------------------------------------------

        if usp_detections:

            best_detection = max(
                usp_detections,
                key=lambda detection: detection.get(
                    "confidence",
                    0
                )
            )

            return {
                "rule": "Unit Sale Price",
                "found": False,
                "price": None,
                "unit": None,
                "source_text": best_detection.get(
                    "text"
                ),
                "confidence": best_detection.get(
                    "confidence"
                ),
                "bounding_box": best_detection.get(
                    "bounding_box"
                ),
                "status": "PARTIAL"
            }

        # ---------------------------------------------------------
        # 7. NO USP DECLARATION DETECTED
        # ---------------------------------------------------------

        return {
            "rule": "Unit Sale Price",
            "found": False,
            "price": None,
            "unit": None,
            "source_text": None,
            "confidence": None,
            "bounding_box": None,
            "status": "NOT_APPLICABLE"
        }

    def check_net_quantity(self):

        import re
        import math

        # ---------------------------------------------------------
        # 1. NET QUANTITY DECLARATION
        # ---------------------------------------------------------

        declaration_pattern = re.compile(
            r"\b(?:"
            r"NET\s*(?:WEIGHT|WT)"
            r"|NET\s*(?:QUANTITY|QTY)"
            r"|NET\s*(?:CONTENT|CONTENTS)"
            r"|NET\s*(?:VOLUME)"
            r")\b",
            re.IGNORECASE
        )

        # ---------------------------------------------------------
        # 2. QUANTITY VALUE PATTERN
        #
        # Supports:
        # 250 g
        # 180 mL
        # 1.5 kg
        # 500 mg
        # 2 L
        # 10 pcs
        # 10 pieces
        # ---------------------------------------------------------

        quantity_pattern = re.compile(
            r"(?<![\w.])"
            r"(\d+(?:\.\d+)?)"
            r"\s*"
            r"(kg|kgs|kilogram|kilograms|"
            r"g|gm|gms|gram|grams|"
            r"mg|milligram|milligrams|"
            r"l|lt|ltr|litre|litres|liter|liters|"
            r"ml|millilitre|millilitres|milliliter|milliliters|"
            r"µl|μl|ul|microlitre|microlitres|"
            r"pcs|pc|pieces|piece|"
            r"nos|no|number|"
            r"units|unit)"
            r"\b",
            re.IGNORECASE
        )

        # ---------------------------------------------------------
        # 3. WORDS THAT USUALLY INDICATE AN UNRELATED NUMBER
        # ---------------------------------------------------------

        exclusion_pattern = re.compile(
            r"\b(?:"
            r"serving|servings|"
            r"per\s*(?:g|kg|mg|ml|l|unit|piece|number)"
            r"|unit\s*sale\s*price"
            r"|sale\s*price"
            r"|mrp"
            r"|price"
            r"|batch"
            r"|batch\s*no"
            r"|lot"
            r"|lot\s*no"
            r"|code"
            r"|barcode"
            r"|calories?"
            r"|energy"
            r"|protein"
            r"|carbohydrates?"
            r"|carbs?"
            r"|fat"
            r"|saturated\s*fat"
            r"|trans\s*fat"
            r"|sodium"
            r"|sugar"
            r"|fibre"
            r"|fiber"
            r"|calcium"
            r"|iron"
            r"|vitamin"
            r"|vitamins"
            r"|ingredients?"
            r")\b",
            re.IGNORECASE
        )

        # ---------------------------------------------------------
        # 4. NORMALIZE UNIT
        # ---------------------------------------------------------

        unit_map = {
            "kg": "kg",
            "kgs": "kg",
            "kilogram": "kg",
            "kilograms": "kg",

            "g": "g",
            "gm": "g",
            "gms": "g",
            "gram": "g",
            "grams": "g",

            "mg": "mg",
            "milligram": "mg",
            "milligrams": "mg",

            "l": "l",
            "lt": "l",
            "ltr": "l",
            "litre": "l",
            "litres": "l",
            "liter": "l",
            "liters": "l",

            "ml": "ml",
            "millilitre": "ml",
            "millilitres": "ml",
            "milliliter": "ml",
            "milliliters": "ml",

            "µl": "µl",
            "μl": "µl",
            "ul": "µl",
            "microlitre": "µl",
            "microlitres": "µl",

            "pcs": "pcs",
            "pc": "pcs",
            "piece": "pcs",
            "pieces": "pcs",

            "nos": "number",
            "no": "number",
            "number": "number",

            "units": "unit",
            "unit": "unit"
        }

        # ---------------------------------------------------------
        # 5. HELPER: CHECK WHETHER A TEXT IS A BAD CANDIDATE
        # ---------------------------------------------------------

        def is_excluded(text):
            return bool(exclusion_pattern.search(text))

        # ---------------------------------------------------------
        # 6. HELPER: GET CENTER OF BOUNDING BOX
        # ---------------------------------------------------------

        def get_center(box):

            if not box:
                return None

            return (
                (box["x1"] + box["x2"]) / 2,
                (box["y1"] + box["y2"]) / 2
            )

        # ---------------------------------------------------------
        # 7. HELPER: MERGE TWO BOUNDING BOXES
        # ---------------------------------------------------------

        def merge_boxes(box1, box2):

            if not box1:
                return box2

            if not box2:
                return box1

            return {
                "x1": min(box1["x1"], box2["x1"]),
                "y1": min(box1["y1"], box2["y1"]),
                "x2": max(box1["x2"], box2["x2"]),
                "y2": max(box1["y2"], box2["y2"])
            }

        # ---------------------------------------------------------
        # 8. HELPER: CREATE FINAL RESULT
        # ---------------------------------------------------------

        def build_result(
            quantity,
            unit,
            source_text,
            confidence,
            bounding_box
        ):

            return {
                "rule": "Net Quantity",
                "found": True,
                "quantity": quantity,
                "unit": unit,
                "source_text": source_text,
                "confidence": round(confidence, 4),
                "bounding_box": bounding_box,
                "status": "PASS"
            }

        # ---------------------------------------------------------
        # 9. COLLECT NET-QUANTITY DECLARATIONS
        # ---------------------------------------------------------

        declarations = []

        for index, detection in enumerate(self.detections):

            text = str(detection.get("text", "")).strip()

            if not text:
                continue

            match = declaration_pattern.search(text)

            if not match:
                continue

            declarations.append({
                "index": index,
                "detection": detection,
                "match": match
            })

        # ---------------------------------------------------------
        # 10. IF THERE IS NO NET QUANTITY DECLARATION
        # ---------------------------------------------------------

        if not declarations:

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

        # ---------------------------------------------------------
        # 11. PROCESS EACH DECLARATION
        # ---------------------------------------------------------

        for declaration in declarations:

            detection = declaration["detection"]
            declaration_match = declaration["match"]

            declaration_text = str(
                detection.get("text", "")
            ).strip()

            declaration_box = detection.get("bounding_box")

            # -----------------------------------------------------
            # 11A. SAME OCR BOX
            #
            # Example:
            # "NET CONTENT : 180 mL"
            # -----------------------------------------------------

            text_after_declaration = declaration_text[
                declaration_match.end():
            ]

            if not is_excluded(text_after_declaration):

                same_box_match = quantity_pattern.search(
                    text_after_declaration
                )

                if same_box_match:

                    quantity = float(
                        same_box_match.group(1)
                    )

                    raw_unit = same_box_match.group(2).lower()

                    unit = unit_map.get(
                        raw_unit,
                        raw_unit
                    )

                    return build_result(
                        quantity=quantity,
                        unit=unit,
                        source_text=declaration_text,
                        confidence=detection.get(
                            "confidence",
                            0
                        ),
                        bounding_box=declaration_box
                    )

            # -----------------------------------------------------
            # 11B. FIND QUANTITY IN ANOTHER OCR BOX
            # -----------------------------------------------------

            declaration_center = get_center(
                declaration_box
            )

            if declaration_center is None:
                continue

            declaration_x, declaration_y = declaration_center

            declaration_height = max(
                1,
                declaration_box["y2"] -
                declaration_box["y1"]
            )

            declaration_width = max(
                1,
                declaration_box["x2"] -
                declaration_box["x1"]
            )

            candidates = []

            for candidate_index, candidate in enumerate(
                self.detections
            ):

                if candidate_index == declaration["index"]:
                    continue

                candidate_text = str(
                    candidate.get("text", "")
                ).strip()

                if not candidate_text:
                    continue

                # Reject obvious unrelated contexts.
                if is_excluded(candidate_text):
                    continue

                candidate_match = quantity_pattern.search(
                    candidate_text
                )

                if not candidate_match:
                    continue

                candidate_box = candidate.get(
                    "bounding_box"
                )

                candidate_center = get_center(
                    candidate_box
                )

                if candidate_center is None:
                    continue

                candidate_x, candidate_y = candidate_center

                # -------------------------------------------------
                # Calculate relative position.
                # -------------------------------------------------

                dx = candidate_x - declaration_x
                dy = candidate_y - declaration_y

                horizontal_distance = abs(dx)
                vertical_distance = abs(dy)

                distance = math.sqrt(
                    dx ** 2 + dy ** 2
                )

                # -------------------------------------------------
                # Candidate should normally be reasonably close.
                #
                # We allow a larger vertical distance because OCR
                # may split:
                #
                # NET CONTENT :
                # 180 mL
                # -------------------------------------------------

                max_vertical_distance = max(
                    declaration_height * 5,
                    250
                )

                max_horizontal_distance = max(
                    declaration_width * 4,
                    350
                )

                if (
                    vertical_distance > max_vertical_distance
                    and horizontal_distance > max_horizontal_distance
                ):
                    continue

                # -------------------------------------------------
                # Determine spatial relationship.
                # -------------------------------------------------

                is_below = (
                    candidate_y >=
                    declaration_box["y1"]
                )

                is_same_line = (
                    vertical_distance <=
                    declaration_height * 1.5
                )

                # -------------------------------------------------
                # Score candidate.
                #
                # Higher score = stronger association.
                # -------------------------------------------------

                score = 0.0

                # Confidence
                score += (
                    candidate.get("confidence", 0)
                    * 30
                )

                # Strong preference for value below declaration.
                if is_below:
                    score += 30

                # Strong preference for same-line value.
                if is_same_line:
                    score += 25

                # Prefer closer candidates.
                score += max(
                    0,
                    25 - (
                        distance /
                        max(
                            declaration_width,
                            declaration_height,
                            1
                        )
                    )
                )

                # -------------------------------------------------
                # Extra preference when candidate is almost
                # vertically aligned with declaration.
                # -------------------------------------------------

                if horizontal_distance <= (
                    declaration_width * 2
                ):
                    score += 15

                candidates.append({
                    "candidate": candidate,
                    "candidate_index": candidate_index,
                    "match": candidate_match,
                    "score": score,
                    "distance": distance
                })

            # -----------------------------------------------------
            # 11C. SORT CANDIDATES
            # -----------------------------------------------------

            candidates.sort(
                key=lambda item: (
                    item["score"],
                    -item["distance"]
                ),
                reverse=True
            )

            # -----------------------------------------------------
            # 11D. ACCEPT BEST RELIABLE CANDIDATE
            # -----------------------------------------------------

            if candidates:

                best = candidates[0]

                candidate = best["candidate"]
                quantity_match = best["match"]

                quantity = float(
                    quantity_match.group(1)
                )

                raw_unit = quantity_match.group(2).lower()

                unit = unit_map.get(
                    raw_unit,
                    raw_unit
                )

                candidate_confidence = candidate.get(
                    "confidence",
                    0
                )

                declaration_confidence = detection.get(
                    "confidence",
                    0
                )

                final_confidence = min(
                    declaration_confidence,
                    candidate_confidence
                )

                merged_box = merge_boxes(
                    declaration_box,
                    candidate.get("bounding_box")
                )

                return build_result(
                    quantity=quantity,
                    unit=unit,
                    source_text=(
                        declaration_text +
                        " " +
                        candidate.get("text", "").strip()
                    ),
                    confidence=final_confidence,
                    bounding_box=merged_box
                )

        # ---------------------------------------------------------
        # 12. DECLARATION FOUND BUT NO RELIABLE VALUE
        # ---------------------------------------------------------

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

        import re
        import math

        # =========================================================
        # 1. DECLARATION PATTERNS
        # =========================================================

        manufacturer_pattern = re.compile(
            r"""
            \b(?:
                MANUFACTURED\s+BY
                |
                MANUFACTURED\s*&\s*MARKETED\s+BY
                |
                MANUFACTURED\s+AND\s+MARKETED\s+BY
                |
                MANUFACTURED\s*&\s*PACKED\s+BY
                |
                MANUFACTURED\s+AND\s+PACKED\s+BY
                |
                MANUFACTURER
                |
                MFG\.?\s*BY
                |
                MFD\.?\s*BY
            )\b
            """,
            re.IGNORECASE | re.VERBOSE
        )

        packer_pattern = re.compile(
            r"""
            \b(?:
                PACKED\s+BY
                |
                PACKED\s*&\s*MARKETED\s+BY
                |
                PACKED\s+AND\s+MARKETED\s+BY
                |
                PACKER
                |
                PACKED\s+FOR
            )\b
            """,
            re.IGNORECASE | re.VERBOSE
        )

        importer_pattern = re.compile(
            r"""
            \b(?:
                IMPORTED\s+BY
                |
                IMPORTER
                |
                IMPORTED\s*&\s*MARKETED\s+BY
                |
                IMPORTED\s+AND\s+MARKETED\s+BY
            )\b
            """,
            re.IGNORECASE | re.VERBOSE
        )

        marketed_pattern = re.compile(
            r"""
            \b(?:
                MARKETED\s+BY
                |
                MARKETED\s+AND\s+SOLD\s+BY
            )\b
            """,
            re.IGNORECASE | re.VERBOSE
        )

        # =========================================================
        # 2. HELPER FUNCTIONS
        # =========================================================

        def clean_text(text):
            return str(text or "").strip()

        def get_center(detection):

            box = detection.get("bounding_box")

            if not box:
                return None

            return (
                (box["x1"] + box["x2"]) / 2,
                (box["y1"] + box["y2"]) / 2
            )

        def merge_boxes(box1, box2):

            if not box1:
                return box2

            if not box2:
                return box1

            return {
                "x1": min(
                    box1["x1"],
                    box2["x1"]
                ),
                "y1": min(
                    box1["y1"],
                    box2["y1"]
                ),
                "x2": max(
                    box1["x2"],
                    box2["x2"]
                ),
                "y2": max(
                    box1["y2"],
                    box2["y2"]
                )
            }

        # =========================================================
        # 3. FIND DECLARATIONS
        # =========================================================

        manufacturer_candidates = []
        packer_candidates = []
        importer_candidates = []
        marketer_candidates = []

        for index, detection in enumerate(
            self.detections
        ):

            text = clean_text(
                detection.get("text", "")
            )

            if not text:
                continue

            # -----------------------------------------------------
            # Manufacturer
            # -----------------------------------------------------

            manufacturer_match = (
                manufacturer_pattern.search(text)
            )

            if manufacturer_match:

                manufacturer_candidates.append({
                    "index": index,
                    "detection": detection,
                    "match": manufacturer_match
                })

            # -----------------------------------------------------
            # Packer
            # -----------------------------------------------------

            packer_match = packer_pattern.search(text)

            if packer_match:

                packer_candidates.append({
                    "index": index,
                    "detection": detection,
                    "match": packer_match
                })

            # -----------------------------------------------------
            # Importer
            # -----------------------------------------------------

            importer_match = importer_pattern.search(text)

            if importer_match:

                importer_candidates.append({
                    "index": index,
                    "detection": detection,
                    "match": importer_match
                })

            # -----------------------------------------------------
            # Marketer
            # -----------------------------------------------------

            marketer_match = marketed_pattern.search(text)

            if marketer_match:

                marketer_candidates.append({
                    "index": index,
                    "detection": detection,
                    "match": marketer_match
                })

        # =========================================================
        # 4. EXTRACT THE COMPANY / ENTITY ASSOCIATED WITH
        #    A DECLARATION
        # =========================================================

        def find_associated_entity(
            declaration,
            declaration_pattern
        ):

            detection = declaration["detection"]
            declaration_index = declaration["index"]
            match = declaration["match"]

            declaration_text = clean_text(
                detection.get("text", "")
            )

            declaration_box = detection.get(
                "bounding_box"
            )

            # -----------------------------------------------------
            # CASE 1:
            # Declaration and entity in SAME OCR BOX
            #
            # "Manufactured by Royal Import & Export"
            # -----------------------------------------------------

            after_declaration = declaration_text[
                match.end():
            ].strip(
                " :,-"
            )

            if after_declaration:

                return {
                    "entity": after_declaration,
                    "source_detection": detection,
                    "bounding_box": declaration_box,
                    "confidence": detection.get(
                        "confidence",
                        0
                    )
                }

            # -----------------------------------------------------
            # CASE 2:
            # Entity is in another OCR detection
            #
            # Manufactured by:
            # ROYAL IMPORT & EXPORT
            # -----------------------------------------------------

            declaration_center = get_center(
                detection
            )

            if declaration_center is None:

                return {
                    "entity": None,
                    "source_detection": None,
                    "bounding_box": declaration_box,
                    "confidence": detection.get(
                        "confidence",
                        0
                    )
                }

            dx, dy = declaration_center

            candidates = []

            for candidate_index, candidate in enumerate(
                self.detections
            ):

                if candidate_index == declaration_index:
                    continue

                candidate_text = clean_text(
                    candidate.get("text", "")
                )

                if not candidate_text:
                    continue

                candidate_box = candidate.get(
                    "bounding_box"
                )

                candidate_center = get_center(
                    candidate
                )

                if candidate_center is None:
                    continue

                cx, cy = candidate_center

                horizontal_distance = abs(
                    cx - dx
                )

                vertical_distance = (
                    cy - dy
                )

                distance = math.sqrt(
                    (cx - dx) ** 2 +
                    (cy - dy) ** 2
                )

                # -------------------------------------------------
                # We mainly expect the entity BELOW the declaration.
                # -------------------------------------------------

                if vertical_distance < -20:
                    continue

                # Avoid jumping to completely unrelated text.
                if vertical_distance > 250:
                    continue

                if horizontal_distance > 400:
                    continue

                score = 0

                # Strong preference for below.
                if vertical_distance >= 0:
                    score += 50

                # Strong preference for close horizontal alignment.
                if horizontal_distance <= 200:
                    score += 30

                # Closer candidate = better.
                score += max(
                    0,
                    50 - distance / 5
                )

                # OCR confidence.
                score += (
                    candidate.get(
                        "confidence",
                        0
                    ) * 20
                )

                # -------------------------------------------------
                # Reject another declaration as the entity.
                # -------------------------------------------------

                if (
                    manufacturer_pattern.search(
                        candidate_text
                    )
                    or
                    packer_pattern.search(
                        candidate_text
                    )
                    or
                    importer_pattern.search(
                        candidate_text
                    )
                    or
                    marketed_pattern.search(
                        candidate_text
                    )
                ):
                    continue

                candidates.append({
                    "candidate": candidate,
                    "score": score,
                    "distance": distance
                })

            if not candidates:

                return {
                    "entity": None,
                    "source_detection": None,
                    "bounding_box": declaration_box,
                    "confidence": detection.get(
                        "confidence",
                        0
                    )
                }

            candidates.sort(
                key=lambda item: item["score"],
                reverse=True
            )

            best = candidates[0]

            candidate = best["candidate"]

            return {
                "entity": clean_text(
                    candidate.get("text", "")
                ),
                "source_detection": candidate,
                "bounding_box": merge_boxes(
                    declaration_box,
                    candidate.get(
                        "bounding_box"
                    )
                ),
                "confidence": min(
                    detection.get(
                        "confidence",
                        0
                    ),
                    candidate.get(
                        "confidence",
                        0
                    )
                )
            }

        # =========================================================
        # 5. CREATE RESULT
        # =========================================================

        def build_result(
            rule_name,
            declaration_type,
            declaration,
            entity_result,
            status="PASS"
        ):

            detection = declaration["detection"]

            declaration_text = clean_text(
                detection.get("text", "")
            )

            entity = entity_result.get(
                "entity"
            )

            if entity:

                source_text = (
                    declaration_text
                    + " "
                    + entity
                ).strip()

            else:

                source_text = declaration_text

            return {
                "rule": rule_name,
                "found": True,
                "type": declaration_type,
                "entity": entity,
                "source_text": source_text,
                "confidence": round(
                    entity_result.get(
                        "confidence",
                        detection.get(
                            "confidence",
                            0
                        )
                    ),
                    4
                ),
                "bounding_box":
                    entity_result.get(
                        "bounding_box"
                    ),
                "status": status
            }

        # =========================================================
        # 6. MANUFACTURER
        # =========================================================

        if manufacturer_candidates:

            declaration = manufacturer_candidates[0]

            entity_result = find_associated_entity(
                declaration,
                manufacturer_pattern
            )

            return build_result(
                rule_name="Manufacturer Details",
                declaration_type="manufacturer",
                declaration=declaration,
                entity_result=entity_result,
                status="PASS"
            )

        # =========================================================
        # 7. PACKER
        # =========================================================

        if packer_candidates:

            declaration = packer_candidates[0]

            entity_result = find_associated_entity(
                declaration,
                packer_pattern
            )

            return build_result(
                rule_name="Packer Details",
                declaration_type="packer",
                declaration=declaration,
                entity_result=entity_result,
                status="PASS"
            )

        # =========================================================
        # 8. IMPORTER
        # =========================================================

        if importer_candidates:

            declaration = importer_candidates[0]

            entity_result = find_associated_entity(
                declaration,
                importer_pattern
            )

            return build_result(
                rule_name="Importer Details",
                declaration_type="importer",
                declaration=declaration,
                entity_result=entity_result,
                status="PASS"
            )

        # =========================================================
        # 9. MARKETED BY
        #
        # Important:
        # "Marketed by" alone is NOT treated as manufacturer,
        # packer, or importer.
        # =========================================================

        if marketer_candidates:

            declaration = marketer_candidates[0]

            entity_result = find_associated_entity(
                declaration,
                marketed_pattern
            )

            return build_result(
                rule_name="Marketed By Declaration",
                declaration_type="marketer",
                declaration=declaration,
                entity_result=entity_result,
                status="DETECTED"
            )

        # =========================================================
        # 10. NOTHING FOUND
        # =========================================================

        return {
            "rule": "Manufacturer/Packer/Importer Details",
            "found": False,
            "type": None,
            "entity": None,
            "source_text": None,
            "confidence": None,
            "bounding_box": None,
            "status": "VIOLATION"
        }
        
    def check_manufacturing_date(self):

        import re
        import math

        # ============================================================
        # 1. MANUFACTURING / PACKING DECLARATIONS
        # ============================================================

        declaration_pattern = re.compile(
            r"""
            (?:
                \bMFD\b
                |
                \bMFD\.
                |
                \bMFG\b
                |
                \bMFG\.
                |
                \bMFG\s+DATE\b
                |
                \bDATE\s+OF\s+MFG\b
                |
                \bDATE\s+OF\s+MANUFACTURE\b
                |
                \bMANUFACTURING\s+DATE\b
                |
                \bMANUFACTURE\s+DATE\b
                |
                \bMANUFACTURED\s+ON\b
                |
                \bPKD\b
                |
                \bPKD\.
                |
                \bPKD\s+DATE\b
                |
                \bPACKING\s+DATE\b
                |
                \bDATE\s+OF\s+PACKING\b
                |
                \bPACKED\s+ON\b
                |
                \bPACKED\s+DATE\b
                |
                \bPROD\b
                |
                \bPROD\.
                |
                \bPRODUCTION\s+DATE\b
            )
            """,
            re.IGNORECASE | re.VERBOSE
        )

        # ============================================================
        # 2. DATE PATTERNS
        # ============================================================
        #
        # Supports:
        #
        # 15/05/2024
        # 18/8/26
        # 04-08-26
        # 28.03.2026
        #
        # Also supports:
        #
        # FEB2014
        # FEB 2014
        # FEB-2014
        # 02/2014
        #
        # This is important because one of your reference images
        # contains:
        #
        # Manufacturing Date : FEB2014
        # ============================================================

        numeric_full_date_pattern = re.compile(
            r"""
            \b
            \d{1,2}
            \s*[/.\-]\s*
            \d{1,2}
            \s*[/.\-]\s*
            \d{2,4}
            \b
            """,
            re.IGNORECASE | re.VERBOSE
        )

        month_year_pattern = re.compile(
            r"""
            (?:
                \b
                (?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|SEPT|OCT|NOV|DEC)
                \s*[-/.]?\s*
                \d{2,4}
                \b
                |
                \b
                \d{1,2}
                \s*[/.\-]\s*
                \d{2,4}
                \b
            )
            """,
            re.IGNORECASE | re.VERBOSE
        )

        # ============================================================
        # 3. EXCLUSION PATTERNS
        # ============================================================
        #
        # These declarations must never be interpreted as the
        # manufacturing date.
        # ============================================================

        expiry_pattern = re.compile(
            r"""
            (?:
                \bEXP\b
                |
                \bEXP\.
                |
                \bEXPIRY\b
                |
                \bEXPIRATION\b
                |
                \bEXPIRES?\b
                |
                \bUSE\s*BY\b
                |
                \bBEST\s*BEFORE\b
                |
                \bBBE\b
            )
            """,
            re.IGNORECASE | re.VERBOSE
        )

        batch_pattern = re.compile(
            r"""
            (?:
                \bBATCH\b
                |
                \bBATCH\s*NO\b
                |
                \bLOT\b
                |
                \bLOT\s*NO\b
            )
            """,
            re.IGNORECASE | re.VERBOSE
        )

        # ============================================================
        # 4. HELPERS
        # ============================================================

        def clean_text(text):
            return str(text or "").strip()

        def get_box(detection):

            return detection.get(
                "bounding_box"
            )

        def get_center(detection):

            box = get_box(detection)

            if not box:
                return None

            return (
                (box["x1"] + box["x2"]) / 2,
                (box["y1"] + box["y2"]) / 2
            )

        def merge_boxes(box1, box2):

            if not box1:
                return box2

            if not box2:
                return box1

            return {
                "x1": min(
                    box1["x1"],
                    box2["x1"]
                ),
                "y1": min(
                    box1["y1"],
                    box2["y1"]
                ),
                "x2": max(
                    box1["x2"],
                    box2["x2"]
                ),
                "y2": max(
                    box1["y2"],
                    box2["y2"]
                )
            }

        def find_dates(text):

            """
            Return all possible manufacturing-style dates
            from a piece of OCR text.
            """

            text = clean_text(text)

            matches = []

            for match in numeric_full_date_pattern.finditer(text):

                matches.append({
                    "text": match.group(0),
                    "start": match.start(),
                    "end": match.end(),
                    "type": "FULL_DATE"
                })

            for match in month_year_pattern.finditer(text):

                value = match.group(0)

                # Avoid duplicating a numeric full date
                if numeric_full_date_pattern.fullmatch(
                    value.strip()
                ):
                    continue

                matches.append({
                    "text": value,
                    "start": match.start(),
                    "end": match.end(),
                    "type": "MONTH_YEAR"
                })

            return matches

        def has_expiry_context(text):

            return bool(
                expiry_pattern.search(
                    clean_text(text)
                )
            )

        def has_batch_context(text):

            return bool(
                batch_pattern.search(
                    clean_text(text)
                )
            )

        # ============================================================
        # 5. FIND MANUFACTURING / PACKING DECLARATIONS
        # ============================================================

        declarations = []

        for index, detection in enumerate(
            self.detections
        ):

            text = clean_text(
                detection.get(
                    "text",
                    ""
                )
            )

            if not text:
                continue

            match = declaration_pattern.search(
                text
            )

            if match:

                declarations.append({
                    "index": index,
                    "detection": detection,
                    "match": match
                })

        # ============================================================
        # 6. NO DECLARATION FOUND
        # ============================================================

        if not declarations:

            return {
                "rule": "Manufacturing/Packing Date",
                "found": False,
                "date": None,
                "source_text": None,
                "confidence": None,
                "bounding_box": None,
                "status": "VIOLATION"
            }

        # ============================================================
        # 7. CREATE DATE CANDIDATES
        # ============================================================

        candidates = []

        # ============================================================
        # PROCESS EACH DECLARATION
        # ============================================================

        for declaration in declarations:

            declaration_index = declaration["index"]

            detection = declaration["detection"]

            match = declaration["match"]

            text = clean_text(
                detection.get(
                    "text",
                    ""
                )
            )

            # ========================================================
            # CASE 1
            #
            # Declaration and date are in SAME OCR BOX
            #
            # Example:
            #
            # PKD: 15/05/2024
            #
            # PROD: 28/03/2026
            #
            # MFG DATE: 31/08/2025
            # ========================================================

            text_after_declaration = text[
                match.end():
            ]

            same_box_dates = find_dates(
                text_after_declaration
            )

            for date_info in same_box_dates:

                date_text = date_info["text"]

                # Context immediately around the date
                context_before = text[
                    max(
                        0,
                        match.end() - 30
                    ):
                    match.end()
                ]

                context_after = text[
                    date_info["end"]:
                    date_info["end"] + 30
                ]

                context = (
                    context_before
                    + " "
                    + context_after
                )

                # ----------------------------------------------------
                # Never accept an expiry/use-by/best-before date
                # ----------------------------------------------------

                if has_expiry_context(context):
                    continue

                # ----------------------------------------------------
                # Never accept a batch/lot-associated date
                # ----------------------------------------------------

                if has_batch_context(context_before):
                    continue

                # ----------------------------------------------------
                # Strong candidate
                # ----------------------------------------------------

                score = 500

                # Date is directly associated with declaration
                score += 150

                # OCR confidence
                score += (
                    float(
                        detection.get(
                            "confidence",
                            0
                        )
                    ) * 100
                )

                # Full date is more informative than month/year
                if date_info["type"] == "FULL_DATE":
                    score += 50

                candidates.append({

                    "score": score,

                    "date": date_text,

                    "source_text": text,

                    "confidence": float(
                        detection.get(
                            "confidence",
                            0
                        )
                    ),

                    "bounding_box":
                        detection.get(
                            "bounding_box"
                        ),

                    "declaration_detection":
                        detection,

                    "date_detection":
                        None
                })

            # ========================================================
            # CASE 2
            #
            # Declaration and date are in DIFFERENT OCR BOXES
            #
            # Example:
            #
            # Manufacturing Date
            # FEB2014
            #
            # or:
            #
            # PKD:
            # 18/8/26
            # ========================================================

            declaration_center = get_center(
                detection
            )

            if declaration_center is None:
                continue

            dx, dy = declaration_center

            for candidate_index, candidate in enumerate(
                self.detections
            ):

                if candidate_index == declaration_index:
                    continue

                candidate_text = clean_text(
                    candidate.get(
                        "text",
                        ""
                    )
                )

                if not candidate_text:
                    continue

                # ----------------------------------------------------
                # Do not use boxes explicitly belonging to expiry
                # ----------------------------------------------------

                if has_expiry_context(
                    candidate_text
                ):
                    continue

                # ----------------------------------------------------
                # Do not use batch/lot boxes
                # ----------------------------------------------------

                if has_batch_context(
                    candidate_text
                ):
                    continue

                date_matches = find_dates(
                    candidate_text
                )

                if not date_matches:
                    continue

                candidate_center = get_center(
                    candidate
                )

                if candidate_center is None:
                    continue

                cx, cy = candidate_center

                dx_distance = cx - dx
                dy_distance = cy - dy

                distance = math.sqrt(
                    dx_distance ** 2
                    +
                    dy_distance ** 2
                )

                # ----------------------------------------------------
                # Restrict search area
                #
                # Manufacturing date should generally be close to
                # the manufacturing declaration.
                # ----------------------------------------------------

                if abs(dx_distance) > 450:
                    continue

                if abs(dy_distance) > 300:
                    continue

                # Do not use something clearly above the declaration.
                if dy_distance < -80:
                    continue

                # ----------------------------------------------------
                # Candidate context
                # ----------------------------------------------------

                for date_info in date_matches:

                    date_text = date_info["text"]

                    context_before = candidate_text[
                        max(
                            0,
                            date_info["start"] - 35
                        ):
                        date_info["start"]
                    ]

                    context_after = candidate_text[
                        date_info["end"]:
                        date_info["end"] + 35
                    ]

                    context = (
                        context_before
                        + " "
                        + context_after
                    )

                    if has_expiry_context(
                        context
                    ):
                        continue

                    if has_batch_context(
                        context
                    ):
                        continue

                    # ------------------------------------------------
                    # Score candidate
                    # ------------------------------------------------

                    score = 0

                    # Close distance
                    score += max(
                        0,
                        180 - distance / 2
                    )

                    # Date is below declaration
                    if dy_distance >= 0:
                        score += 100

                    # Date is horizontally aligned
                    if abs(dy_distance) <= 100:
                        score += 100

                    # Date is to the right
                    if (
                        dx_distance > 0
                        and
                        abs(dy_distance) <= 100
                    ):
                        score += 100

                    # Date is directly below
                    if (
                        dy_distance > 0
                        and
                        abs(dx_distance) <= 200
                    ):
                        score += 100

                    # OCR confidence
                    score += (
                        float(
                            candidate.get(
                                "confidence",
                                0
                            )
                        ) * 100
                    )

                    # Full date gets additional confidence
                    if date_info["type"] == "FULL_DATE":
                        score += 50

                    # Month/year is valid but slightly weaker
                    elif date_info["type"] == "MONTH_YEAR":
                        score += 20

                    candidates.append({

                        "score": score,

                        "date": date_text,

                        "source_text": (
                            text
                            + " "
                            + candidate_text
                        ).strip(),

                        "confidence": min(
                            float(
                                detection.get(
                                    "confidence",
                                    0
                                )
                            ),
                            float(
                                candidate.get(
                                    "confidence",
                                    0
                                )
                            )
                        ),

                        "bounding_box":
                            merge_boxes(
                                detection.get(
                                    "bounding_box"
                                ),
                                candidate.get(
                                    "bounding_box"
                                )
                            ),

                        "declaration_detection":
                            detection,

                        "date_detection":
                            candidate
                    })

        # ============================================================
        # 8. NO VALID DATE FOUND
        # ============================================================

        if not candidates:

            return {
                "rule": "Manufacturing/Packing Date",
                "found": False,
                "date": None,
                "source_text": None,
                "confidence": None,
                "bounding_box": None,
                "status": "VIOLATION"
            }

        # ============================================================
        # 9. SORT CANDIDATES
        # ============================================================

        candidates.sort(
            key=lambda x: x["score"],
            reverse=True
        )

        best = candidates[0]

        # ============================================================
        # 10. AMBIGUITY PROTECTION
        # ============================================================
        #
        # If two different dates are almost equally strong,
        # don't blindly choose one.
        # ============================================================

        if len(candidates) > 1:

            second = candidates[1]

            different_dates = (
                best["date"] != second["date"]
            )

            score_difference = (
                best["score"]
                -
                second["score"]
            )

            if (
                different_dates
                and
                score_difference < 30
            ):

                return {
                    "rule": "Manufacturing/Packing Date",
                    "found": False,
                    "date": None,
                    "source_text": (
                        best["source_text"]
                        + " | "
                        + second["source_text"]
                    ),
                    "confidence": round(
                        min(
                            best["confidence"],
                            second["confidence"]
                        ),
                        4
                    ),
                    "bounding_box": None,
                    "status": "UNCERTAIN"
                }

        # ============================================================
        # 11. FINAL RESULT
        # ============================================================

        return {
            "rule": "Manufacturing/Packing Date",
            "found": True,
            "date": best["date"],
            "source_text": best["source_text"],
            "confidence": round(
                best["confidence"],
                4
            ),
            "bounding_box": best["bounding_box"],
            "status": "PASS"
        }

    def check_best_before_use_by(self):

        # ---------------------------------------------------------
        # 1. BEST BEFORE / USE BY DECLARATION
        # ---------------------------------------------------------

        validity_pattern = re.compile(
            r"\b(?:"
            r"BEST\s*BEFORE"
            r"|USE\s*BY"
            r"|EXPIRY"
            r"|EXP"
            r"|EXPIRES?"
            r"|VALID\s*UP\s*TO"
            r"|VALID\s*UNTIL"
            r"|CONSUME\s*BEFORE"
            r")\b",
            re.IGNORECASE
        )

        # ---------------------------------------------------------
        # 2. DATE PATTERNS
        # ---------------------------------------------------------

        date_pattern = re.compile(
            r"\b(?:"
            # DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
            r"\d{1,2}[\-/\.]\d{1,2}[\-/\.]\d{2,4}"
            r"|"
            # MM/YYYY or MM-YYYY
            r"\d{1,2}[\-/\.]\d{4}"
            r"|"
            # MM/YY or MM-YY
            r"\d{1,2}[\-/\.]\d{2}"
            r"|"
            # Month YYYY
            r"(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|"
            r"OCT|NOV|DEC)[A-Z]*\s+\d{2,4}"
            r"|"
            # YYYY-MM-DD
            r"\d{4}[\-/\.]\d{1,2}[\-/\.]\d{1,2}"
            r")\b",
            re.IGNORECASE
        )

        # ---------------------------------------------------------
        # 3. DURATION PATTERN
        #
        # Examples:
        # BEST BEFORE 90 DAYS FROM PACKING DATE
        # BEST BEFORE THREE MONTHS FROM MANUFACTURING
        # ---------------------------------------------------------

        duration_pattern = re.compile(
            r"\b(?:"
            r"\d+\s*(?:DAY|DAYS|MONTH|MONTHS|YEAR|YEARS)"
            r"|"
            r"(?:ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE|TEN|"
            r"ELEVEN|TWELVE)\s+"
            r"(?:DAY|DAYS|MONTH|MONTHS|YEAR|YEARS)"
            r")\b",
            re.IGNORECASE
        )

        # ---------------------------------------------------------
        # 4. FIND VALIDITY DECLARATIONS
        # ---------------------------------------------------------

        validity_detections = []

        for detection in self.detections:

            text = detection.get("text", "").strip()

            if not text:
                continue

            if validity_pattern.search(text):
                validity_detections.append(detection)

        # ---------------------------------------------------------
        # 5. NOTHING FOUND
        #
        # We don't immediately call this a violation.
        # Applicability depends on the commodity.
        # ---------------------------------------------------------

        if not validity_detections:

            return {
                "rule": "Best Before / Use By",
                "found": False,
                "validity_date": None,
                "validity_type": None,
                "source_text": None,
                "confidence": None,
                "bounding_box": None,
                "status": "NOT_APPLICABLE"
            }

        # ---------------------------------------------------------
        # 6. CHECK SAME OCR BOX
        # ---------------------------------------------------------

        for detection in validity_detections:

            text = detection.get("text", "").strip()

            declaration_match = validity_pattern.search(text)

            if not declaration_match:
                continue

            date_match = date_pattern.search(
                text,
                declaration_match.end()
            )

            if date_match:

                validity_date = date_match.group(0)

                validity_type = (
                    "USE BY"
                    if re.search(
                        r"\bUSE\s*BY\b",
                        text,
                        re.IGNORECASE
                    )
                    else "BEST BEFORE"
                )

                return {
                    "rule": "Best Before / Use By",
                    "found": True,
                    "validity_date": validity_date,
                    "validity_type": validity_type,
                    "source_text": text,
                    "confidence": detection.get(
                        "confidence"
                    ),
                    "bounding_box": detection.get(
                        "bounding_box"
                    ),
                    "status": "PASS"
                }

            # -----------------------------------------------------
            # BEST BEFORE X DAYS/MONTHS FROM PACKING DATE
            # -----------------------------------------------------

            duration_match = duration_pattern.search(
                text,
                declaration_match.end()
            )

            if duration_match:

                return {
                    "rule": "Best Before / Use By",
                    "found": True,
                    "validity_date": duration_match.group(0),
                    "validity_type": "BEST BEFORE DURATION",
                    "source_text": text,
                    "confidence": detection.get(
                        "confidence"
                    ),
                    "bounding_box": detection.get(
                        "bounding_box"
                    ),
                    "status": "PASS"
                }

        # ---------------------------------------------------------
        # 7. DECLARATION FOUND BUT DATE IS IN ANOTHER OCR BOX
        #
        # Example:
        #
        # USE BY:
        # 14/11/2024
        # ---------------------------------------------------------

        for declaration in validity_detections:

            declaration_box = declaration.get(
                "bounding_box"
            )

            if not declaration_box:
                continue

            declaration_x = (
                declaration_box["x1"] +
                declaration_box["x2"]
            ) / 2

            declaration_y = (
                declaration_box["y1"] +
                declaration_box["y2"]
            ) / 2

            nearby_candidates = []

            for candidate in self.detections:

                if candidate is declaration:
                    continue

                candidate_text = candidate.get(
                    "text",
                    ""
                ).strip()

                if not candidate_text:
                    continue

                candidate_box = candidate.get(
                    "bounding_box"
                )

                if not candidate_box:
                    continue

                # Candidate must contain a date
                date_match = date_pattern.search(
                    candidate_text
                )

                if not date_match:
                    continue

                candidate_x = (
                    candidate_box["x1"] +
                    candidate_box["x2"]
                ) / 2

                candidate_y = (
                    candidate_box["y1"] +
                    candidate_box["y2"]
                ) / 2

                distance = (
                    (candidate_x - declaration_x) ** 2 +
                    (candidate_y - declaration_y) ** 2
                ) ** 0.5

                nearby_candidates.append(
                    (distance, candidate, date_match)
                )

            nearby_candidates.sort(
                key=lambda item: item[0]
            )

            for distance, candidate, date_match in (
                nearby_candidates[:10]
            ):

                declaration_height = (
                    declaration_box["y2"] -
                    declaration_box["y1"]
                )

                max_distance = max(
                    300,
                    declaration_height * 8
                )

                if distance > max_distance:
                    continue

                validity_type = (
                    "USE BY"
                    if re.search(
                        r"\bUSE\s*BY\b",
                        declaration.get("text", ""),
                        re.IGNORECASE
                    )
                    else "BEST BEFORE"
                )

                confidence_values = [
                    declaration.get("confidence"),
                    candidate.get("confidence")
                ]

                confidence_values = [
                    value
                    for value in confidence_values
                    if isinstance(value, (int, float))
                ]

                confidence = (
                    min(confidence_values)
                    if confidence_values
                    else None
                )

                combined_box = {
                    "x1": min(
                        declaration_box["x1"],
                        candidate_box["x1"]
                    ),
                    "y1": min(
                        declaration_box["y1"],
                        candidate_box["y1"]
                    ),
                    "x2": max(
                        declaration_box["x2"],
                        candidate_box["x2"]
                    ),
                    "y2": max(
                        declaration_box["y2"],
                        candidate_box["y2"]
                    )
                }

                return {
                    "rule": "Best Before / Use By",
                    "found": True,
                    "validity_date": date_match.group(0),
                    "validity_type": validity_type,
                    "source_text": (
                        declaration.get("text", "")
                        + " "
                        + candidate_text
                    ),
                    "confidence": confidence,
                    "bounding_box": combined_box,
                    "status": "PASS"
                }

        # ---------------------------------------------------------
        # 8. DURATION IN A SEPARATE OCR BOX
        #
        # Example:
        #
        # BEST BEFORE
        # 90 DAYS FROM PACKING DATE
        # ---------------------------------------------------------

        for declaration in validity_detections:

            declaration_box = declaration.get(
                "bounding_box"
            )

            if not declaration_box:
                continue

            declaration_x = (
                declaration_box["x1"] +
                declaration_box["x2"]
            ) / 2

            declaration_y = (
                declaration_box["y1"] +
                declaration_box["y2"]
            ) / 2

            nearby_candidates = []

            for candidate in self.detections:

                if candidate is declaration:
                    continue

                candidate_text = candidate.get(
                    "text",
                    ""
                ).strip()

                duration_match = duration_pattern.search(
                    candidate_text
                )

                if not duration_match:
                    continue

                candidate_box = candidate.get(
                    "bounding_box"
                )

                if not candidate_box:
                    continue

                candidate_x = (
                    candidate_box["x1"] +
                    candidate_box["x2"]
                ) / 2

                candidate_y = (
                    candidate_box["y1"] +
                    candidate_box["y2"]
                ) / 2

                distance = (
                    (candidate_x - declaration_x) ** 2 +
                    (candidate_y - declaration_y) ** 2
                ) ** 0.5

                nearby_candidates.append(
                    (distance, candidate, duration_match)
                )

            nearby_candidates.sort(
                key=lambda item: item[0]
            )

            for distance, candidate, duration_match in (
                nearby_candidates[:10]
            ):

                declaration_height = (
                    declaration_box["y2"] -
                    declaration_box["y1"]
                )

                max_distance = max(
                    300,
                    declaration_height * 8
                )

                if distance > max_distance:
                    continue

                confidence_values = [
                    declaration.get("confidence"),
                    candidate.get("confidence")
                ]

                confidence_values = [
                    value
                    for value in confidence_values
                    if isinstance(value, (int, float))
                ]

                confidence = (
                    min(confidence_values)
                    if confidence_values
                    else None
                )

                candidate_box = candidate.get(
                    "bounding_box"
                )

                combined_box = {
                    "x1": min(
                        declaration_box["x1"],
                        candidate_box["x1"]
                    ),
                    "y1": min(
                        declaration_box["y1"],
                        candidate_box["y1"]
                    ),
                    "x2": max(
                        declaration_box["x2"],
                        candidate_box["x2"]
                    ),
                    "y2": max(
                        declaration_box["y2"],
                        candidate_box["y2"]
                    )
                }

                return {
                    "rule": "Best Before / Use By",
                    "found": True,
                    "validity_date": duration_match.group(0),
                    "validity_type": "BEST BEFORE DURATION",
                    "source_text": (
                        declaration.get("text", "")
                        + " "
                        + candidate.get("text", "")
                    ),
                    "confidence": confidence,
                    "bounding_box": combined_box,
                    "status": "PASS"
                }

        # ---------------------------------------------------------
        # 9. DECLARATION EXISTS BUT VALUE WAS NOT READ
        # ---------------------------------------------------------

        best_detection = max(
            validity_detections,
            key=lambda detection: detection.get(
                "confidence",
                0
            )
        )

        return {
            "rule": "Best Before / Use By",
            "found": False,
            "validity_date": None,
            "validity_type": (
                "USE BY"
                if re.search(
                    r"\bUSE\s*BY\b",
                    best_detection.get("text", ""),
                    re.IGNORECASE
                )
                else "BEST BEFORE"
            ),
            "source_text": best_detection.get(
                "text"
            ),
            "confidence": best_detection.get(
                "confidence"
            ),
            "bounding_box": best_detection.get(
                "bounding_box"
            ),
            "status": "PARTIAL"
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

        # ---------------------------------------------------------
        # 1. Consumer-care / complaint declaration patterns
        # ---------------------------------------------------------
        consumer_care_pattern = re.compile(
            r"\b(?:"
            r"CONSUMER\s*CARE"
            r"|CUSTOMER\s*CARE"
            r"|CONSUMER\s*COMPLAINTS?"
            r"|CUSTOMER\s*COMPLAINTS?"
            r"|FOR\s+CONSUMER\s+COMPLAINTS?"
            r"|FOR\s+COMPLAINT"
            r"|COMPLAINT\s*/\s*QUERY\s*/\s*FEEDBACK"
            r"|COMPLAINTS?\s*/\s*FEEDBACK"
            r"|CUSTOMER\s*SERVICE"
            r"|CONSUMER\s*SERVICE"
            r"|HELPLINE"
            r"|TOLL\s*FREE"
            r"|CONTACT\s+US"
            r"|CONTACT\s+(?:CUSTOMER|CONSUMER)\s*CARE"
            r")\b",
            re.IGNORECASE
        )

        # ---------------------------------------------------------
        # 2. Phone number pattern
        # ---------------------------------------------------------
        phone_pattern = re.compile(
            r"(?<!\d)"
            r"(?:\+91[\s\-]?)?"
            r"(?:"
            r"[6-9]\d{9}"
            r"|"
            r"1800[\s\-]?\d{3}[\s\-]?\d{3,4}"
            r")"
            r"(?!\d)",
            re.IGNORECASE
        )

        # ---------------------------------------------------------
        # 3. Email pattern
        # ---------------------------------------------------------
        email_pattern = re.compile(
            r"\b[A-Z0-9._%+\-]+"
            r"@[A-Z0-9.\-]+\.[A-Z]{2,}\b",
            re.IGNORECASE
        )

        # ---------------------------------------------------------
        # 4. Useful keywords which can identify a consumer-care
        #    detection even when OCR splits the declaration
        # ---------------------------------------------------------
        consumer_keywords = re.compile(
            r"\b(?:"
            r"consumer|customer|complaint|complaints|"
            r"feedback|query|helpline|toll|contact|"
            r"care|service"
            r")\b",
            re.IGNORECASE
        )

        # ---------------------------------------------------------
        # 5. First pass:
        #    Find detections which explicitly contain a consumer-care
        #    declaration.
        # ---------------------------------------------------------
        declaration_detections = []

        for detection in self.detections:

            text = detection.get("text", "").strip()

            if not text:
                continue

            if consumer_care_pattern.search(text):
                declaration_detections.append(detection)

        # ---------------------------------------------------------
        # 6. If no exact declaration was found, look for OCR-split
        #    consumer-care wording.
        #
        #    Example:
        #
        #    "FOR CONSUMER"
        #    "COMPLAINTS / FEEDBACK"
        #    "CONTACT CUSTOMER CARE"
        # ---------------------------------------------------------
        if not declaration_detections:

            for detection in self.detections:

                text = detection.get("text", "").strip()

                if not text:
                    continue

                if not consumer_keywords.search(text):
                    continue

                normalized = re.sub(
                    r"[^a-z0-9]+",
                    " ",
                    text.lower()
                ).strip()

                # Strong consumer-care combinations
                if (
                    "consumer" in normalized
                    or "customer" in normalized
                    or "complaint" in normalized
                    or "feedback" in normalized
                    or "helpline" in normalized
                    or "toll free" in normalized
                ):
                    declaration_detections.append(detection)

        # ---------------------------------------------------------
        # 7. If still no consumer-care context exists,
        #    do NOT classify random phone numbers/emails as
        #    consumer care.
        # ---------------------------------------------------------
        if not declaration_detections:

            return {
                "rule": "Consumer Care",
                "found": False,
                "phone": None,
                "email": None,
                "source_text": None,
                "confidence": None,
                "bounding_box": None,
                "status": "VIOLATION"
            }

        # ---------------------------------------------------------
        # 8. Search around the consumer-care declaration for
        #    phone/email information.
        # ---------------------------------------------------------
        best_result = None

        for declaration in declaration_detections:

            declaration_text = declaration.get("text", "").strip()

            phone = None
            email = None

            # -----------------------------------------------------
            # Check phone/email directly inside declaration text
            # -----------------------------------------------------
            phone_match = phone_pattern.search(declaration_text)

            if phone_match:
                phone = phone_match.group(0).strip()

            email_match = email_pattern.search(declaration_text)

            if email_match:
                email = email_match.group(0).strip()

            # -----------------------------------------------------
            # Search nearby OCR detections
            # -----------------------------------------------------
            declaration_box = declaration.get("bounding_box")

            if declaration_box:

                current_x = (
                    declaration_box["x1"] +
                    declaration_box["x2"]
                ) / 2

                current_y = (
                    declaration_box["y1"] +
                    declaration_box["y2"]
                ) / 2

            else:
                current_x = None
                current_y = None

            nearby_detections = []

            for candidate in self.detections:

                if candidate is declaration:
                    continue

                candidate_text = candidate.get("text", "").strip()

                if not candidate_text:
                    continue

                candidate_box = candidate.get("bounding_box")

                if (
                    not declaration_box
                    or not candidate_box
                    or current_x is None
                    or current_y is None
                ):
                    continue

                candidate_x = (
                    candidate_box["x1"] +
                    candidate_box["x2"]
                ) / 2

                candidate_y = (
                    candidate_box["y1"] +
                    candidate_box["y2"]
                ) / 2

                distance = (
                    (candidate_x - current_x) ** 2 +
                    (candidate_y - current_y) ** 2
                ) ** 0.5

                nearby_detections.append(
                    (distance, candidate)
                )

            # Closest detections first
            nearby_detections.sort(
                key=lambda item: item[0]
            )

            # -----------------------------------------------------
            # Look through nearby detections.
            # We use a generous limit because OCR often separates
            # declaration, phone and email into different boxes.
            # -----------------------------------------------------
            for distance, candidate in nearby_detections[:12]:

                candidate_text = candidate.get(
                    "text",
                    ""
                ).strip()

                # Phone
                if phone is None:

                    phone_match = phone_pattern.search(
                        candidate_text
                    )

                    if phone_match:
                        phone = phone_match.group(0).strip()

                # Email
                if email is None:

                    email_match = email_pattern.search(
                        candidate_text
                    )

                    if email_match:
                        email = email_match.group(0).strip()

                # Stop once both are found
                if phone and email:
                    break

            # -----------------------------------------------------
            # 9. Determine status
            #
            # PASS    -> phone + email
            # PARTIAL -> only phone OR email
            # VIOLATION -> neither
            # -----------------------------------------------------
            if phone and email:
                status = "PASS"

            elif phone or email:
                status = "PARTIAL"

            else:
                status = "VIOLATION"

            # -----------------------------------------------------
            # 10. Calculate combined confidence
            # -----------------------------------------------------
            confidence_values = [
                declaration.get("confidence")
            ]

            for candidate in self.detections:

                candidate_text = candidate.get(
                    "text",
                    ""
                ).strip()

                if (
                    phone and
                    phone in candidate_text
                ):
                    confidence_values.append(
                        candidate.get("confidence")
                    )

                if (
                    email and
                    email in candidate_text
                ):
                    confidence_values.append(
                        candidate.get("confidence")
                    )

            confidence_values = [
                value
                for value in confidence_values
                if isinstance(value, (int, float))
            ]

            confidence = (
                min(confidence_values)
                if confidence_values
                else None
            )

            # -----------------------------------------------------
            # 11. Keep the strongest result
            # -----------------------------------------------------
            result = {
                "rule": "Consumer Care",
                "found": True,
                "phone": phone,
                "email": email,
                "source_text": declaration_text,
                "confidence": confidence,
                "bounding_box": declaration.get(
                    "bounding_box"
                ),
                "status": status
            }

            # Prefer PASS over PARTIAL over VIOLATION
            if best_result is None:
                best_result = result

            else:

                priority = {
                    "PASS": 3,
                    "PARTIAL": 2,
                    "VIOLATION": 1
                }

                if (
                    priority[result["status"]]
                    >
                    priority[best_result["status"]]
                ):
                    best_result = result

        # ---------------------------------------------------------
        # 12. Final result
        # ---------------------------------------------------------
        if best_result:
            return best_result

        return {
            "rule": "Consumer Care",
            "found": False,
            "phone": None,
            "email": None,
            "source_text": None,
            "confidence": None,
            "bounding_box": None,
            "status": "VIOLATION"
        }

    def check_country_of_origin(self):

        # ---------------------------------------------------------
        # 1. COUNTRY OF ORIGIN DECLARATION
        # ---------------------------------------------------------

        origin_pattern = re.compile(
            r"\b(?:"
            r"COUNTRY\s+OF\s+ORIGIN"
            r"|MADE\s+IN"
            r"|PRODUCT\s+OF"
            r"|ORIGIN"
            r")\b",
            re.IGNORECASE
        )

        # ---------------------------------------------------------
        # 2. IMPORTED PRODUCT INDICATORS
        # ---------------------------------------------------------

        import_pattern = re.compile(
            r"\b(?:"
            r"IMPORTED\s+BY"
            r"|IMPORTED\s*&?\s*MARKETED\s+BY"
            r"|IMPORTED\s+AND\s+MARKETED\s+BY"
            r"|IMPORTED\s+AND\s+PACKED\s+BY"
            r"|IMPORTED\s+AND\s+PACKAGED\s+BY"
            r"|IMPORTED\s+BY"
            r"|IMPORTER"
            r"|IMPORTED\s+FROM"
            r")\b",
            re.IGNORECASE
        )

        # ---------------------------------------------------------
        # 3. COUNTRY NAMES
        # ---------------------------------------------------------

        country_pattern = re.compile(
            r"\b(?:"
            r"INDIA"
            r"|CHINA"
            r"|JAPAN"
            r"|KOREA"
            r"|SOUTH\s+KOREA"
            r"|NORTH\s+KOREA"
            r"|USA"
            r"|U\.S\.A\."
            r"|UNITED\s+STATES"
            r"|UNITED\s+STATES\s+OF\s+AMERICA"
            r"|UK"
            r"|U\.K\."
            r"|UNITED\s+KINGDOM"
            r"|GERMANY"
            r"|FRANCE"
            r"|ITALY"
            r"|SPAIN"
            r"|PORTUGAL"
            r"|NETHERLANDS"
            r"|BELGIUM"
            r"|SWITZERLAND"
            r"|CANADA"
            r"|AUSTRALIA"
            r"|NEW\s+ZEALAND"
            r"|THAILAND"
            r"|VIETNAM"
            r"|VIET\s+NAM"
            r"|NEPAL"
            r"|BANGLADESH"
            r"|SINGAPORE"
            r"|MALAYSIA"
            r"|INDONESIA"
            r"|PAKISTAN"
            r"|SRI\s+LANKA"
            r"|UAE"
            r"|UNITED\s+ARAB\s+EMIRATES"
            r"|SAUDI\s+ARABIA"
            r"|TURKEY"
            r"|BRAZIL"
            r"|MEXICO"
            r"|SOUTH\s+AFRICA"
            r"|RUSSIA"
            r")\b",
            re.IGNORECASE
        )

        # ---------------------------------------------------------
        # 4. FIND ORIGIN DECLARATIONS
        # ---------------------------------------------------------

        origin_detections = []

        for detection in self.detections:

            text = detection.get("text", "").strip()

            if not text:
                continue

            if origin_pattern.search(text):
                origin_detections.append(detection)

        # ---------------------------------------------------------
        # 5. FIND IMPORTED-PRODUCT INDICATORS
        # ---------------------------------------------------------

        import_detections = []

        for detection in self.detections:

            text = detection.get("text", "").strip()

            if not text:
                continue

            if import_pattern.search(text):
                import_detections.append(detection)

        # ---------------------------------------------------------
        # 6. HELPER TO FIND COUNTRY IN TEXT
        # ---------------------------------------------------------

        def extract_country(text):

            if not text:
                return None

            match = country_pattern.search(text)

            if match:
                return match.group(0).strip().upper()

            return None

        # ---------------------------------------------------------
        # 7. FIRST: CHECK SAME OCR BOX
        # ---------------------------------------------------------

        for detection in origin_detections:

            text = detection.get("text", "").strip()

            country = extract_country(text)

            if country:

                return {
                    "rule": "Country of Origin",
                    "found": True,
                    "country": country,
                    "source_text": text,
                    "confidence": detection.get("confidence"),
                    "bounding_box": detection.get("bounding_box"),
                    "status": "PASS"
                }

        # ---------------------------------------------------------
        # 8. CHECK NEARBY OCR BOXES
        #
        # Example:
        #
        # COUNTRY OF ORIGIN:
        # CHINA
        # ---------------------------------------------------------

        for declaration in origin_detections:

            declaration_box = declaration.get("bounding_box")

            if not declaration_box:
                continue

            declaration_x = (
                declaration_box["x1"] +
                declaration_box["x2"]
            ) / 2

            declaration_y = (
                declaration_box["y1"] +
                declaration_box["y2"]
            ) / 2

            nearby_candidates = []

            for candidate in self.detections:

                if candidate is declaration:
                    continue

                candidate_text = candidate.get(
                    "text",
                    ""
                ).strip()

                if not candidate_text:
                    continue

                candidate_box = candidate.get(
                    "bounding_box"
                )

                if not candidate_box:
                    continue

                candidate_x = (
                    candidate_box["x1"] +
                    candidate_box["x2"]
                ) / 2

                candidate_y = (
                    candidate_box["y1"] +
                    candidate_box["y2"]
                ) / 2

                distance = (
                    (candidate_x - declaration_x) ** 2 +
                    (candidate_y - declaration_y) ** 2
                ) ** 0.5

                nearby_candidates.append(
                    (distance, candidate)
                )

            nearby_candidates.sort(
                key=lambda item: item[0]
            )

            # Check closest OCR detections
            for distance, candidate in nearby_candidates[:10]:

                candidate_text = candidate.get(
                    "text",
                    ""
                ).strip()

                country = extract_country(candidate_text)

                if not country:
                    continue

                # Avoid accepting an unrelated country that is
                # extremely far from the declaration.
                declaration_height = (
                    declaration_box["y2"] -
                    declaration_box["y1"]
                )

                max_distance = max(
                    300,
                    declaration_height * 8
                )

                if distance > max_distance:
                    continue

                combined_text = (
                    declaration.get("text", "").strip()
                    + " "
                    + candidate_text
                )

                confidence_values = [
                    declaration.get("confidence"),
                    candidate.get("confidence")
                ]

                confidence_values = [
                    value
                    for value in confidence_values
                    if isinstance(value, (int, float))
                ]

                confidence = (
                    min(confidence_values)
                    if confidence_values
                    else None
                )

                declaration_box = declaration.get(
                    "bounding_box"
                )

                candidate_box = candidate.get(
                    "bounding_box"
                )

                combined_box = {
                    "x1": min(
                        declaration_box["x1"],
                        candidate_box["x1"]
                    ),
                    "y1": min(
                        declaration_box["y1"],
                        candidate_box["y1"]
                    ),
                    "x2": max(
                        declaration_box["x2"],
                        candidate_box["x2"]
                    ),
                    "y2": max(
                        declaration_box["y2"],
                        candidate_box["y2"]
                    )
                }

                return {
                    "rule": "Country of Origin",
                    "found": True,
                    "country": country,
                    "source_text": combined_text,
                    "confidence": confidence,
                    "bounding_box": combined_box,
                    "status": "PASS"
                }

        # ---------------------------------------------------------
        # 9. ORIGIN DECLARATION EXISTS BUT COUNTRY IS UNCLEAR
        # ---------------------------------------------------------

        if origin_detections:

            best_detection = max(
                origin_detections,
                key=lambda detection: detection.get(
                    "confidence",
                    0
                )
            )

            return {
                "rule": "Country of Origin",
                "found": True,
                "country": None,
                "source_text": best_detection.get(
                    "text"
                ),
                "confidence": best_detection.get(
                    "confidence"
                ),
                "bounding_box": best_detection.get(
                    "bounding_box"
                ),
                "status": "PARTIAL"
            }

        # ---------------------------------------------------------
        # 10. IMPORTED PRODUCT BUT COUNTRY OF ORIGIN MISSING
        # ---------------------------------------------------------

        if import_detections:

            best_detection = max(
                import_detections,
                key=lambda detection: detection.get(
                    "confidence",
                    0
                )
            )

            return {
                "rule": "Country of Origin",
                "found": False,
                "country": None,
                "source_text": best_detection.get(
                    "text"
                ),
                "confidence": best_detection.get(
                    "confidence"
                ),
                "bounding_box": best_detection.get(
                    "bounding_box"
                ),
                "status": "VIOLATION"
            }

        # ---------------------------------------------------------
        # 11. NO IMPORTED CONTEXT
        #
        # Country of origin is not applicable based on
        # the information detected in this image.
        # ---------------------------------------------------------

        return {
            "rule": "Country of Origin",
            "found": False,
            "country": None,
            "source_text": None,
            "confidence": None,
            "bounding_box": None,
            "status": "NOT_APPLICABLE"
        }

    def check_product_name(self):

        # ============================================================
        # 1. EXPLICIT PRODUCT-NAME DECLARATIONS
        # ============================================================

        declaration_pattern = re.compile(
            r"\b(?:"
            r"PRODUCT\s+NAME"
            r"|COMMON\s+NAME"
            r"|GENERIC\s+NAME"
            r")\b",
            re.IGNORECASE
        )

        # ============================================================
        # 2. TEXT THAT MUST NOT BE A PRODUCT NAME
        # ============================================================

        exclude_pattern = re.compile(
            r"\b(?:"
            r"MRP"
            r"|NET"
            r"|QUANTITY"
            r"|WEIGHT"
            r"|VOLUME"
            r"|MFG"
            r"|MFD"
            r"|MANUFACTURED"
            r"|MANUFACTURER"
            r"|PACKED"
            r"|PACKER"
            r"|PACKAGING"
            r"|PKD"
            r"|USE\s*BY"
            r"|BEST\s*BEFORE"
            r"|EXPIRY"
            r"|EXP"
            r"|BATCH"
            r"|LOT"
            r"|FSSAI"
            r"|LIC"
            r"|LICENSE"
            r"|CONTACT"
            r"|COMPLAINT"
            r"|CONSUMER"
            r"|CUSTOMER"
            r"|HELPLINE"
            r"|TOLL\s*FREE"
            r"|INGREDIENTS"
            r"|NUTRITION"
            r"|NUTRITIONAL"
            r"|SERVING"
            r"|SERVINGS"
            r"|SERVE"
            r"|SERVE\s*SIZE"
            r"|CALORIES"
            r"|PROTEIN"
            r"|CARBOHYDRATE"
            r"|CARBOHYDRATES"
            r"|FAT"
            r"|SUGAR"
            r"|SODIUM"
            r"|FIBRE"
            r"|FIBER"
            r"|ALLERGEN"
            r"|ADVICE"
            r"|STORE"
            r"|KEEP"
            r"|REFRIGERATE"
            r"|DIRECTION"
            r"|DIRECTIONS"
            r"|CAUTION"
            r"|WARNING"
            r"|EMAIL"
            r"|WWW"
            r"|HTTP"
            r"|COUNTRY\s+OF\s+ORIGIN"
            r"|MADE\s+IN"
            r"|PRODUCT\s+OF"
            r"|UNIT\s+SALE\s+PRICE"
            r"|UNIT\s+SELLING\s+PRICE"
            r"|USP"
            r")\b",
            re.IGNORECASE
        )

        # ============================================================
        # 3. OTHER STRONG REJECTION PATTERNS
        # ============================================================

        quantity_pattern = re.compile(
            r"\b\d+(?:\.\d+)?\s*"
            r"(?:mg|mcg|g|kg|ml|cl|l|ltr|litre|litres|"
            r"cm|mm|m)\b",
            re.IGNORECASE
        )

        date_pattern = re.compile(
            r"\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b"
            r"|\b\d{1,2}[/-]\d{2,4}\b",
            re.IGNORECASE
        )

        price_pattern = re.compile(
            r"(?:₹|\bRS\.?\b|\bINR\b|\bMRP\b)",
            re.IGNORECASE
        )

        email_pattern = re.compile(
            r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b",
            re.IGNORECASE
        )

        url_pattern = re.compile(
            r"(?:https?://|www\.)",
            re.IGNORECASE
        )

        # ============================================================
        # 4. BASIC HELPERS
        # ============================================================

        def clean_text(text):

            text = str(text or "").strip()

            # Remove OCR garbage around the text
            text = re.sub(r"\s+", " ", text)

            return text.strip(" :-|")

        def get_box(detection):
            return detection.get("bounding_box")

        def get_center(detection):

            box = get_box(detection)

            if not box:
                return None

            return (
                (box["x1"] + box["x2"]) / 2,
                (box["y1"] + box["y2"]) / 2
            )

        def get_width(detection):

            box = get_box(detection)

            if not box:
                return 0

            return max(
                1,
                box["x2"] - box["x1"]
            )

        def get_height(detection):

            box = get_box(detection)

            if not box:
                return 0

            return max(
                1,
                box["y2"] - box["y1"]
            )

        def is_valid_candidate(text):

            text = clean_text(text)

            if not text:
                return False

            # Product names should have reasonable length
            if len(text) < 3 or len(text) > 60:
                return False

            # Reject known declaration information
            if exclude_pattern.search(text):
                return False

            # Reject quantities
            if quantity_pattern.search(text):
                return False

            # Reject dates
            if date_pattern.search(text):
                return False

            # Reject prices
            if price_pattern.search(text):
                return False

            # Reject email / URL
            if email_pattern.search(text):
                return False

            if url_pattern.search(text):
                return False

            # Reject text with too many digits
            digit_count = sum(
                char.isdigit()
                for char in text
            )

            if digit_count / max(len(text), 1) > 0.20:
                return False

            # Product names should contain meaningful alphabetic text
            alpha_count = sum(
                char.isalpha()
                for char in text
            )

            if alpha_count < 3:
                return False

            if alpha_count / max(len(text), 1) < 0.55:
                return False

            # Very long text is probably a paragraph/declaration
            words = text.split()

            if len(words) > 7:
                return False

            return True

        # ============================================================
        # 5. FIRST: EXPLICIT PRODUCT NAME
        # ============================================================

        for detection in self.detections:

            text = clean_text(
                detection.get("text")
            )

            if not declaration_pattern.search(text):
                continue

            cleaned = declaration_pattern.sub(
                "",
                text
            ).strip(" :-|")

            # --------------------------------------------------------
            # Case:
            # PRODUCT NAME: BUTTER COOKIES
            # --------------------------------------------------------

            if is_valid_candidate(cleaned):

                return {
                    "rule": "Product / Common / Generic Name",
                    "found": True,
                    "product_name": cleaned,
                    "source_text": text,
                    "confidence": detection.get("confidence"),
                    "bounding_box": detection.get("bounding_box"),
                    "status": "PASS"
                }

            # --------------------------------------------------------
            # Case:
            # PRODUCT NAME:
            #
            # BUTTER COOKIES
            # --------------------------------------------------------

            current_box = get_box(detection)

            if not current_box:
                continue

            cx = (
                current_box["x1"]
                + current_box["x2"]
            ) / 2

            cy = (
                current_box["y1"]
                + current_box["y2"]
            ) / 2

            nearby = []

            for candidate in self.detections:

                if candidate is detection:
                    continue

                candidate_text = clean_text(
                    candidate.get("text")
                )

                if not is_valid_candidate(candidate_text):
                    continue

                candidate_box = get_box(candidate)

                if not candidate_box:
                    continue

                candidate_center = get_center(candidate)

                if not candidate_center:
                    continue

                candidate_cx, candidate_cy = candidate_center

                distance = (
                    (candidate_cx - cx) ** 2
                    + (candidate_cy - cy) ** 2
                ) ** 0.5

                nearby.append(
                    (distance, candidate)
                )

            nearby.sort(
                key=lambda item: item[0]
            )

            if nearby:

                nearest = nearby[0][1]

                return {
                    "rule": "Product / Common / Generic Name",
                    "found": True,
                    "product_name": clean_text(
                        nearest.get("text")
                    ),
                    "source_text": clean_text(
                        nearest.get("text")
                    ),
                    "confidence": nearest.get(
                        "confidence"
                    ),
                    "bounding_box": nearest.get(
                        "bounding_box"
                    ),
                    "status": "PASS"
                }

        # ============================================================
        # 6. FALLBACK:
        # FIND PROMINENT PRODUCT-NAME CANDIDATES
        #
        # This is the important part for packages like:
        #
        # Sunfeast
        # Marie Light
        #
        # and:
        #
        # BUTTER COOKIES
        # ============================================================

        candidates = []

        # Find the maximum OCR box height.
        # Product names are frequently among the larger text elements.
        heights = [
            get_height(detection)
            for detection in self.detections
            if get_box(detection)
        ]

        max_height = max(
            heights,
            default=1
        )

        for detection in self.detections:

            text = clean_text(
                detection.get("text")
            )

            if not is_valid_candidate(text):
                continue

            confidence = detection.get(
                "confidence",
                0
            )

            if confidence < 0.70:
                continue

            box = get_box(detection)

            if not box:
                continue

            height = get_height(
                detection
            )

            width = get_width(
                detection
            )

            # --------------------------------------------------------
            # Start score with OCR confidence
            # --------------------------------------------------------

            score = confidence * 100

            # --------------------------------------------------------
            # PROMINENT TEXT
            #
            # Larger text is more likely to be the product name.
            # --------------------------------------------------------

            height_ratio = (
                height / max_height
            )

            if height_ratio >= 0.80:
                score += 35

            elif height_ratio >= 0.65:
                score += 25

            elif height_ratio >= 0.50:
                score += 15

            elif height_ratio < 0.25:
                score -= 15

            # --------------------------------------------------------
            # PRODUCT NAME LENGTH
            # --------------------------------------------------------

            words = text.split()

            if 1 <= len(words) <= 4:
                score += 15

            elif len(words) == 5:
                score += 5

            elif len(words) > 6:
                score -= 20

            # --------------------------------------------------------
            # ALPHABETIC CONTENT
            # --------------------------------------------------------

            alpha_count = sum(
                char.isalpha()
                for char in text
            )

            alpha_ratio = (
                alpha_count / max(len(text), 1)
            )

            if alpha_ratio >= 0.85:
                score += 15

            elif alpha_ratio >= 0.70:
                score += 8

            # --------------------------------------------------------
            # PRODUCT NAMES OFTEN USE TITLE CASE / UPPERCASE
            # --------------------------------------------------------

            if text.isupper():
                score += 8

            elif text.istitle():
                score += 8

            # --------------------------------------------------------
            # PENALIZE SENTENCE-LIKE TEXT
            # --------------------------------------------------------

            if len(words) >= 5:

                if re.search(
                    r"\b(?:"
                    r"the|and|or|with|for|of|"
                    r"this|that|please|refer|"
                    r"contains|may|shown|"
                    r"actual|purpose"
                    r")\b",
                    text,
                    re.IGNORECASE
                ):
                    score -= 25

            # --------------------------------------------------------
            # PENALIZE SYMBOL-HEAVY TEXT
            # --------------------------------------------------------

            if re.search(
                r"[|:;=₹+/]",
                text
            ):
                score -= 15

            # --------------------------------------------------------
            # PENALIZE PROMOTIONAL QUANTITY TEXT
            #
            # Example:
            # 200 g + 50 g FREE
            # --------------------------------------------------------

            if re.search(
                r"\d+(?:\.\d+)?\s*(?:g|kg|ml|l)"
                r".*(?:\+|FREE|EXTRA)"
                r".*\d+",
                text,
                re.IGNORECASE
            ):
                score -= 60

            candidates.append({
                "score": score,
                "detection": detection,
                "text": text
            })

        # ============================================================
        # 7. GROUP NEARBY PRODUCT-NAME TEXT
        #
        # Important for:
        #
        # Sunfeast
        # Marie Light
        #
        # where OCR may produce two separate detections.
        # ============================================================

        grouped_candidates = []

        for candidate in candidates:

            detection = candidate["detection"]
            text = candidate["text"]

            box = get_box(detection)

            if not box:
                continue

            center = get_center(
                detection
            )

            if not center:
                continue

            cx, cy = center

            for other in candidates:

                other_detection = other["detection"]

                if other_detection is detection:
                    continue

                other_box = get_box(
                    other_detection
                )

                if not other_box:
                    continue

                other_center = get_center(
                    other_detection
                )

                if not other_center:
                    continue

                ox, oy = other_center

                # Vertical and horizontal gaps
                horizontal_gap = min(
                    abs(
                        other_box["x1"]
                        - box["x2"]
                    ),
                    abs(
                        box["x1"]
                        - other_box["x2"]
                    )
                )

                vertical_gap = min(
                    abs(
                        other_box["y1"]
                        - box["y2"]
                    ),
                    abs(
                        box["y1"]
                        - other_box["y2"]
                    )
                )

                average_height = (
                    get_height(detection)
                    + get_height(other_detection)
                ) / 2

                # ----------------------------------------------------
                # Horizontally adjacent text
                # ----------------------------------------------------

                same_row = (
                    abs(oy - cy)
                    <= average_height * 2
                )

                close_horizontal = (
                    horizontal_gap
                    <= average_height * 4
                )

                # ----------------------------------------------------
                # Vertically stacked text
                # ----------------------------------------------------

                same_column = (
                    abs(ox - cx)
                    <= average_height * 2
                )

                close_vertical = (
                    vertical_gap
                    <= average_height * 4
                )

                if (
                    same_row
                    and close_horizontal
                ) or (
                    same_column
                    and close_vertical
                ):

                    combined_text = (
                        text
                        + " "
                        + other["text"]
                    )

                    combined_text = clean_text(
                        combined_text
                    )

                    if not is_valid_candidate(
                        combined_text
                    ):
                        continue

                    combined_score = (
                        candidate["score"]
                        + other["score"]
                        + 20
                    )

                    grouped_candidates.append({
                        "score": combined_score,
                        "text": combined_text,
                        "detection": detection,
                        "other_detection":
                            other_detection
                    })

        # ============================================================
        # 8. ADD INDIVIDUAL CANDIDATES
        # ============================================================

        for candidate in candidates:

            grouped_candidates.append({
                "score": candidate["score"],
                "text": candidate["text"],
                "detection": candidate["detection"],
                "other_detection": None
            })

        # ============================================================
        # 9. SORT BY SCORE
        # ============================================================

        grouped_candidates.sort(
            key=lambda item: item["score"],
            reverse=True
        )

        # ============================================================
        # 10. SELECT STRONGEST CANDIDATE
        # ============================================================

        if grouped_candidates:

            best = grouped_candidates[0]

            detection = best["detection"]
            other_detection = best[
                "other_detection"
            ]

            # --------------------------------------------------------
            # Combined bounding box
            # --------------------------------------------------------

            box1 = get_box(
                detection
            )

            box2 = get_box(
                other_detection
            ) if other_detection else None

            if box1 and box2:

                bounding_box = {
                    "x1": min(
                        box1["x1"],
                        box2["x1"]
                    ),
                    "y1": min(
                        box1["y1"],
                        box2["y1"]
                    ),
                    "x2": max(
                        box1["x2"],
                        box2["x2"]
                    ),
                    "y2": max(
                        box1["y2"],
                        box2["y2"]
                    )
                }

                confidence_values = [
                    detection.get("confidence"),
                    other_detection.get(
                        "confidence"
                    )
                ]

                confidence = min(
                    confidence_values
                )

            else:

                bounding_box = box1

                confidence = detection.get(
                    "confidence"
                )

            return {
                "rule": "Product / Common / Generic Name",
                "found": True,
                "product_name": best["text"],
                "source_text": best["text"],
                "confidence": confidence,
                "bounding_box": bounding_box,
                "status": "PASS"
            }

        # ============================================================
        # 11. NOTHING RELIABLE FOUND
        # ============================================================

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

    def check_dimensions(self):

        # ---------------------------------------------------------
        # 1. DIMENSION DECLARATION
        # ---------------------------------------------------------
        #
        # Examples:
        # DIMENSIONS: 20 x 10 x 5 cm
        # SIZE: 20 cm x 10 cm
        # LENGTH: 20 cm
        # WIDTH: 10 cm
        # HEIGHT: 5 cm
        # ---------------------------------------------------------

        dimension_declaration_pattern = re.compile(
            r"\b(?:"
            r"DIMENSIONS?"
            r"|SIZE"
            r"|LENGTH"
            r"|WIDTH"
            r"|HEIGHT"
            r"|DEPTH"
            r"|DIAMETER"
            r")\b",
            re.IGNORECASE
        )

        # ---------------------------------------------------------
        # 2. DIMENSION VALUE
        #
        # Supports:
        # 20 x 10 x 5 cm
        # 20 X 10 CM
        # 20×10×5 cm
        # 20 cm x 10 cm
        # 20 cm
        # ---------------------------------------------------------

        dimension_value_pattern = re.compile(
            r"\b"
            r"\d+(?:\.\d+)?"
            r"\s*"
            r"(?:"
            r"X|×"
            r")"
            r"\s*"
            r"\d+(?:\.\d+)?"
            r"(?:"
            r"\s*(?:X|×)\s*"
            r"\d+(?:\.\d+)?"
            r")?"
            r"\s*"
            r"(CM|MM|M|IN|INCH|INCHES|FT|FEET)"
            r"\b",
            re.IGNORECASE
        )

        # ---------------------------------------------------------
        # 3. SINGLE DIMENSION
        #
        # Example:
        # LENGTH: 20 cm
        # WIDTH: 10 cm
        # HEIGHT: 5 cm
        # ---------------------------------------------------------

        single_dimension_pattern = re.compile(
            r"\b"
            r"(\d+(?:\.\d+)?)"
            r"\s*"
            r"(CM|MM|M|IN|INCH|INCHES|FT|FEET)"
            r"\b",
            re.IGNORECASE
        )

        # ---------------------------------------------------------
        # 4. FIND DIMENSION DECLARATIONS
        # ---------------------------------------------------------

        dimension_detections = []

        for detection in self.detections:

            text = detection.get("text", "").strip()

            if not text:
                continue

            if dimension_declaration_pattern.search(text):
                dimension_detections.append(detection)

        # ---------------------------------------------------------
        # 5. SAME OCR BOX
        #
        # Example:
        # DIMENSIONS: 20 x 10 x 5 cm
        # ---------------------------------------------------------

        for detection in dimension_detections:

            text = detection.get("text", "").strip()

            declaration_match = (
                dimension_declaration_pattern.search(text)
            )

            if not declaration_match:
                continue

            dimension_match = dimension_value_pattern.search(
                text,
                declaration_match.end()
            )

            if dimension_match:

                return {
                    "rule": "Dimensions",
                    "found": True,
                    "dimensions": dimension_match.group(0),
                    "source_text": text,
                    "confidence": detection.get(
                        "confidence"
                    ),
                    "bounding_box": detection.get(
                        "bounding_box"
                    ),
                    "status": "PASS"
                }

            # Also support:
            # LENGTH: 20 cm
            # WIDTH: 10 cm
            # HEIGHT: 5 cm

            single_match = single_dimension_pattern.search(
                text,
                declaration_match.end()
            )

            if single_match:

                return {
                    "rule": "Dimensions",
                    "found": True,
                    "dimensions": single_match.group(0),
                    "source_text": text,
                    "confidence": detection.get(
                        "confidence"
                    ),
                    "bounding_box": detection.get(
                        "bounding_box"
                    ),
                    "status": "PASS"
                }

        # ---------------------------------------------------------
        # 6. DIMENSIONS IN SEPARATE OCR BOX
        #
        # Example:
        #
        # DIMENSIONS:
        # 20 x 10 x 5 cm
        # ---------------------------------------------------------

        for declaration in dimension_detections:

            declaration_box = declaration.get(
                "bounding_box"
            )

            if not declaration_box:
                continue

            declaration_x = (
                declaration_box["x1"] +
                declaration_box["x2"]
            ) / 2

            declaration_y = (
                declaration_box["y1"] +
                declaration_box["y2"]
            ) / 2

            nearby_candidates = []

            for candidate in self.detections:

                if candidate is declaration:
                    continue

                candidate_text = candidate.get(
                    "text",
                    ""
                ).strip()

                if not candidate_text:
                    continue

                dimension_match = (
                    dimension_value_pattern.search(
                        candidate_text
                    )
                )

                if not dimension_match:
                    dimension_match = (
                        single_dimension_pattern.search(
                            candidate_text
                        )
                    )

                if not dimension_match:
                    continue

                candidate_box = candidate.get(
                    "bounding_box"
                )

                if not candidate_box:
                    continue

                candidate_x = (
                    candidate_box["x1"] +
                    candidate_box["x2"]
                ) / 2

                candidate_y = (
                    candidate_box["y1"] +
                    candidate_box["y2"]
                ) / 2

                distance = (
                    (candidate_x - declaration_x) ** 2 +
                    (candidate_y - declaration_y) ** 2
                ) ** 0.5

                nearby_candidates.append(
                    (
                        distance,
                        candidate,
                        dimension_match
                    )
                )

            nearby_candidates.sort(
                key=lambda item: item[0]
            )

            for distance, candidate, dimension_match in (
                nearby_candidates[:10]
            ):

                declaration_height = (
                    declaration_box["y2"] -
                    declaration_box["y1"]
                )

                max_distance = max(
                    300,
                    declaration_height * 8
                )

                if distance > max_distance:
                    continue

                confidence_values = [
                    declaration.get("confidence"),
                    candidate.get("confidence")
                ]

                confidence_values = [
                    value
                    for value in confidence_values
                    if isinstance(value, (int, float))
                ]

                confidence = (
                    min(confidence_values)
                    if confidence_values
                    else None
                )

                candidate_box = candidate.get(
                    "bounding_box"
                )

                combined_box = {
                    "x1": min(
                        declaration_box["x1"],
                        candidate_box["x1"]
                    ),
                    "y1": min(
                        declaration_box["y1"],
                        candidate_box["y1"]
                    ),
                    "x2": max(
                        declaration_box["x2"],
                        candidate_box["x2"]
                    ),
                    "y2": max(
                        declaration_box["y2"],
                        candidate_box["y2"]
                    )
                }

                return {
                    "rule": "Dimensions",
                    "found": True,
                    "dimensions": dimension_match.group(0),
                    "source_text": (
                        declaration.get("text", "")
                        + " "
                        + candidate.get("text", "")
                    ),
                    "confidence": confidence,
                    "bounding_box": combined_box,
                    "status": "PASS"
                }

        # ---------------------------------------------------------
        # 7. DIMENSION DECLARATION FOUND BUT VALUE NOT READ
        # ---------------------------------------------------------

        if dimension_detections:

            best_detection = max(
                dimension_detections,
                key=lambda detection: detection.get(
                    "confidence",
                    0
                )
            )

            return {
                "rule": "Dimensions",
                "found": False,
                "dimensions": None,
                "source_text": best_detection.get(
                    "text"
                ),
                "confidence": best_detection.get(
                    "confidence"
                ),
                "bounding_box": best_detection.get(
                    "bounding_box"
                ),
                "status": "PARTIAL"
            }

        # ---------------------------------------------------------
        # 8. NO DIMENSION DECLARATION
        # ---------------------------------------------------------

        return {
            "rule": "Dimensions",
            "found": False,
            "dimensions": None,
            "source_text": None,
            "confidence": None,
            "bounding_box": None,
            "status": "NOT_APPLICABLE"
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

        # ============================================================
        # 7 MVP DECLARATION CHECKS
        # ============================================================

        mvp_results = {
            "MRP": self.check_mrp(),

            "Net Quantity":
                self.check_net_quantity(),

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

        mvp_checks = []

        for name, result in mvp_results.items():

            # -----------------------------
            # MRP
            # -----------------------------
            if name == "MRP":

                value = (
                    f"₹{result['mrp']:.2f}"
                    if result.get("mrp") is not None
                    else None
                )

            # -----------------------------
            # Net Quantity
            # -----------------------------
            elif name == "Net Quantity":

                if result.get("quantity") is not None:

                    value = (
                        f"{result['quantity']} "
                        f"{result['unit']}"
                    )

                else:
                    value = None

            # -----------------------------
            # Manufacturing Date
            # -----------------------------
            elif name == "Manufacturing / Packing Date":

                value = result.get("date")

            # -----------------------------
            # Consumer Care
            # -----------------------------
            elif name == "Consumer Care":

                value = (
                    result.get("email")
                    or result.get("phone")
                    or result.get("source_text")
                )

            # -----------------------------
            # Product Name
            # -----------------------------
            elif name == "Product Name":

                value = result.get("product_name")

            # -----------------------------
            # Unit of Measurement
            # -----------------------------
            elif name == "Unit of Measurement":

                if result.get("quantity") is not None:

                    value = (
                        f"{result['quantity']} "
                        f"{result['unit']}"
                    )

                else:
                    value = None

            # -----------------------------
            # Other MVP checks
            # -----------------------------
            else:

                value = result.get("source_text")

            mvp_checks.append({
                "name": name,
                "status": result.get("status"),
                "value": value,
                "confidence": result.get("confidence"),
                "bounding_box": result.get("bounding_box")
            })


        # ============================================================
        # MVP SUMMARY
        # ============================================================

        mvp_passed = sum(
            1
            for check in mvp_checks
            if check["status"] == "PASS"
        )

        mvp_failed = len(mvp_checks) - mvp_passed

        mvp_percentage = round(
            (mvp_passed / len(mvp_checks)) * 100,
            2
        ) if mvp_checks else 0


        # ============================================================
        # 4 ADDITIONAL RULES
        # ============================================================

        additional_results = {

            "Country of Origin":
                self.check_country_of_origin(),

            "Best Before / Use By":
                self.check_best_before_use_by(),

            "Unit Sale Price":
                self.check_unit_sale_price(),

            "Dimensions":
                self.check_dimensions()
        }

        additional_checks = []

        for name, result in additional_results.items():

            # Country of Origin
            if name == "Country of Origin":

                value = result.get("country")

                if value is None:
                    value = result.get("source_text")

            # Best Before / Use By
            elif name == "Best Before / Use By":

                value = (
                    result.get("date")
                    or result.get("duration")
                    or result.get("source_text")
                )

            # Unit Sale Price
            elif name == "Unit Sale Price":

                value = (
                    result.get("value")
                    or result.get("unit_sale_price")
                    or result.get("source_text")
                )

            # Dimensions
            elif name == "Dimensions":

                value = (
                    result.get("dimensions")
                    or result.get("source_text")
                )

            else:

                value = result.get("source_text")

            additional_checks.append({
                "name": name,
                "status": result.get("status"),
                "value": value,
                "confidence": result.get("confidence"),
                "bounding_box": result.get("bounding_box")
            })


        # ============================================================
        # RETURN STRUCTURED REPORT
        # ============================================================

        return {

            "image": self.ocr_result.get("image"),

            # Existing 7-check MVP report
            "summary": {

                "overall_status": (
                    "COMPLIANT"
                    if mvp_failed == 0
                    else "NON-COMPLIANT"
                ),

                "total_checks": len(mvp_checks),

                "passed": mvp_passed,

                "failed": mvp_failed,

                "compliance_percentage":
                    mvp_percentage
            },

            "checks": mvp_checks,

            # New rules kept separately
            "additional_rules": {

                "total_checks":
                    len(additional_checks),

                "checks":
                    additional_checks
            }
        }

    def generate_final_report(self):

        report = self.generate_structured_report()

        summary = report["summary"]
        checks = report["checks"]

        compliance_percentage = round(
            (summary["passed"] / summary["total_checks"]) * 100,
            2
        )

        final_status = (
            "COMPLIANT"
            if summary["failed"] == 0
            else "NON-COMPLIANT"
        )

        return {
            "compliance_report": {
                "status": final_status,
                "compliance_percentage": compliance_percentage,

                "summary": {
                    "total_checks": summary["total_checks"],
                    "passed": summary["passed"],
                    "failed": summary["failed"]
                },

                "checks": checks,

                "additional_rules": report.get(
                    "additional_rules",
                    {
                        "total_checks": 0,
                        "checks": []
                    }
                )
            }
        }
test_engine = LegalMetrologyRuleEngine(result)

# # print(ocr_json)
# print(test_engine.check_mrp())
# print(test_engine.check_unit_sale_price())
# print(test_engine.check_net_quantity())
# print(test_engine.check_manufacturer_packer_importer())
# print(test_engine.check_manufacturing_date())
# print(test_engine.check_best_before_use_by())
# print(test_engine.check_country_of_origin())
# print(test_engine.check_consumer_care())
# print(test_engine.check_product_name())
# print(test_engine.check_unit_of_measurement())
# print(test_engine.check_date_validity())
# print(test_engine.check_dimensions())
# print(test_engine.check_declaration_completeness())

# structured_output = test_engine.generate_final_report()
# print(json.dumps(structured_output,indent = 4))

