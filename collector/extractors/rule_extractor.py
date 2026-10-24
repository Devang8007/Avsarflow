"""
Rule-Based Recruitment Extraction Engine.
Applies deterministic regex rules and heuristics for Indian recruitment notices.
Zero reliance on external generative AI or paid APIs.
"""
import re
from datetime import datetime, date
from typing import Dict, Any, Optional, Tuple, List

# Common Indian Month Names mapping
MONTH_MAP = {
    "jan": 1, "january": 1,
    "feb": 2, "february": 2,
    "mar": 3, "march": 3,
    "apr": 4, "april": 4,
    "may": 5,
    "jun": 6, "june": 6,
    "jul": 7, "july": 7,
    "aug": 8, "august": 8,
    "sep": 9, "sept": 9, "september": 9,
    "oct": 10, "october": 10,
    "nov": 11, "november": 11,
    "dec": 12, "december": 12
}

class RuleExtractor:
    # -------------------------------------------------------------------------
    # 1. DATE & DEADLINE EXTRACTION
    # -------------------------------------------------------------------------
    DATE_PATTERNS = [
        # DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
        r"\b(0?[1-9]|[12][0-9]|3[01])[-/.](0?[1-9]|1[012])[-/.](202[4-9]|203[0-5])\b",
        # DD Month YYYY (e.g., 28 August 2025 or 28th Aug 2025)
        r"\b(0?[1-9]|[12][0-9]|3[01])(?:st|nd|rd|th)?\s+(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[,\s]+(202[4-9]|203[0-5])\b",
        # Month DD, YYYY (e.g., August 28, 2025)
        r"\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(0?[1-9]|[12][0-9]|3[01])(?:st|nd|rd|th)?[,\s]+(202[4-9]|203[0-5])\b",
    ]

    DEADLINE_PREFIXES = [
        r"(?:last\s+date(?:\s+for\s+submission)?|closing\s+date|apply\s+by|valid\s+upto|extended\s+upto|deadline(?:\s+date)?)\s*(?:is|:|-)?\s*",
        r"(?:applications?\s+must\s+be\s+submitted\s+by)\s*",
        r"(?:last\s+date\s+and\s+time\s+for\s+receipt\s+of\s+online\s+applications?)\s*(?:is|:|-)?\s*"
    ]

    @classmethod
    def extract_deadline(cls, text: str) -> Tuple[Optional[str], Optional[str]]:
        """
        Extracts normalized ISO deadline (YYYY-MM-DD) and original raw text.
        """
        for prefix in cls.DEADLINE_PREFIXES:
            for pattern in cls.DATE_PATTERNS:
                full_regex = re.compile(prefix + pattern, re.IGNORECASE)
                match = full_regex.search(text)
                if match:
                    raw_str = match.group(0).strip()
                    iso_date = cls._normalize_date(match.groups())
                    if iso_date:
                        return iso_date, raw_str

        # Fallback: scan for any standard future date if keyword mentions "last date"
        if re.search(r"\b(last\s+date|closing|deadline)\b", text, re.IGNORECASE):
            for pattern in cls.DATE_PATTERNS:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    iso_date = cls._normalize_date(match.groups())
                    if iso_date:
                        return iso_date, match.group(0).strip()

        return None, None

    @classmethod
    def _normalize_date(cls, groups: tuple) -> Optional[str]:
        try:
            g1, g2, g3 = groups[0], groups[1], groups[2]
            # Pattern 1: DD, MM, YYYY
            if g1.isdigit() and g2.isdigit() and g3.isdigit():
                day = int(g1)
                month = int(g2)
                year = int(g3)
                return f"{year:04d}-{month:02d}-{day:02d}"

            # Pattern 2: DD, MonthName, YYYY
            if g1.isdigit() and not g2.isdigit():
                day = int(g1)
                month = MONTH_MAP.get(g2.lower()[:3], 1)
                year = int(g3)
                return f"{year:04d}-{month:02d}-{day:02d}"

            # Pattern 3: MonthName, DD, YYYY
            if not g1.isdigit() and g2.isdigit():
                month = MONTH_MAP.get(g1.lower()[:3], 1)
                day = int(g2)
                year = int(g3)
                return f"{year:04d}-{month:02d}-{day:02d}"
        except Exception:
            return None
        return None

    # -------------------------------------------------------------------------
    # 2. VACANCIES EXTRACTION
    # -------------------------------------------------------------------------
    VACANCY_PATTERNS = [
        r"(?:total\s+vacanc(?:ies|y)|number\s+of\s+posts?|tentative\s+vacanc(?:ies|y)|vacanc(?:ies|y))\s*(?:is|:|-|\b)\s*([0-9]{1,3}(?:,[0-9]{3})*|[0-9]{1,6})\b",
        r"\b([0-9]{1,3}(?:,[0-9]{3})*|[0-9]{2,6})\s+(?:vacancies|posts|openings)\b",
    ]

    @classmethod
    def extract_vacancies(cls, text: str) -> Optional[int]:
        for pattern in cls.VACANCY_PATTERNS:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                num_str = match.group(1).replace(",", "").strip()
                try:
                    val = int(num_str)
                    # Plausibility check (between 1 and 200,000)
                    if 1 <= val <= 200000:
                        return val
                except ValueError:
                    pass
        return None

    # -------------------------------------------------------------------------
    # 3. AGE LIMIT EXTRACTION
    # -------------------------------------------------------------------------
    AGE_PATTERNS = [
        r"\b(?:age\s+limit|age\s+as\s+on[^\n,;:]*?)[:\s]+(?:between\s+)?(\d{2})\s*(?:to|-)\s*(\d{2})\s*(?:years)?\b",
        r"\b(\d{2})\s*(?:to|-)\s*(\d{2})\s*years\b",
        r"\b(?:minimum\s+age|min\s+age)[:\s]+(\d{2})\b",
        r"\b(?:maximum\s+age|max\s+age|not\s+exceeding)[:\s]+(\d{2})\b",
    ]

    @classmethod
    def extract_age_limits(cls, text: str) -> Tuple[Optional[int], Optional[int]]:
        for pattern in cls.AGE_PATTERNS[:2]:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    min_age = int(match.group(1))
                    max_age = int(match.group(2))
                    if 14 <= min_age < max_age <= 65:
                        return min_age, max_age
                except (ValueError, IndexError):
                    pass

        # Check separate min/max
        min_age, max_age = None, None
        min_match = re.search(cls.AGE_PATTERNS[2], text, re.IGNORECASE)
        if min_match:
            try:
                min_age = int(min_match.group(1))
            except ValueError:
                pass

        max_match = re.search(cls.AGE_PATTERNS[3], text, re.IGNORECASE)
        if max_match:
            try:
                max_age = int(max_match.group(1))
            except ValueError:
                pass

        return min_age, max_age

    # -------------------------------------------------------------------------
    # 4. QUALIFICATION EXTRACTION
    # -------------------------------------------------------------------------
    QUALIFICATION_RULES = [
        ("B.E. / B.Tech / Engineering", [r"\bb\.?\s*e\.?\b", r"\bb\.?\s*tech\b", r"\bengineering\s+degree\b", r"\bm\.?\s*tech\b"]),
        ("Graduation / Bachelor's Degree in any discipline", [r"\bgraduate\b", r"\bgraduation\b", r"\bbachelor'?s?\s+degree\b", r"\bany\s+degree\b", r"\bdegree\s+from\s+recognized\b"]),
        ("10th / Matriculation Pass", [r"\b10th\s+pass\b", r"\bmatriculation\b", r"\bsecondary\s+school\b", r"\bssc\s+pass\b"]),
        ("12th / Higher Secondary / Intermediate", [r"\b12th\s+pass\b", r"\bintermediate\b", r"\bhigher\s+secondary\b", r"\b10\+2\b"]),
        ("Diploma in Engineering", [r"\bdiploma\b", r"\bpolytechnic\b"]),
        ("Post Graduate / Master's Degree", [r"\bpost\s+graduate\b", r"\bmaster'?s?\s+degree\b", r"\bmba\b", r"\bmca\b", r"\bm\.?\s*sc\b"]),
        ("MBBS / Medical Degree", [r"\bmbbs\b", r"\bmedical\s+degree\b", r"\bbds\b"]),
        ("CA / ICWA / CS", [r"\bchartered\s+accountant\b", r"\bca\b", r"\bicwa\b", r"\bcma\b"]),
    ]

    @classmethod
    def extract_qualification(cls, text: str) -> str:
        text_lower = text.lower()
        matched = []
        for qual_label, patterns in cls.QUALIFICATION_RULES:
            for p in patterns:
                if re.search(p, text_lower):
                    matched.append(qual_label)
                    break

        if matched:
            return " / ".join(matched[:2])

        # Check explicit section "Educational Qualification:"
        m = re.search(r"(?:educational\s+qualification|essential\s+qualification)[:\s]+([^\n\r.]+)", text, re.IGNORECASE)
        if m:
            extracted = m.group(1).strip()
            if len(extracted) > 5:
                return extracted[:120]

        return "Bachelor's Degree or as per official notification"

    # -------------------------------------------------------------------------
    # 5. SALARY & REMUNERATION EXTRACTION
    # -------------------------------------------------------------------------
    SALARY_PATTERNS = [
        r"(?:pay\s+level|level)\s*[-:]?\s*(\d{1,2})\s*(?:\([^\)]+\))?",
        r"(?:rs\.?|inr|₹)\s*([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{4,7})\s*(?:to|-)\s*(?:rs\.?|inr|₹)?\s*([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{4,7})",
        r"\b([0-9]+(?:\.[0-9]+)?)\s*(?:lpa|lakhs?\s+per\s+annum)\b",
        r"(?:stipend)[:\s]+(?:rs\.?|inr|₹)?\s*([0-9]{1,3}(?:,[0-9]{3})*|[0-9]{4,6})\s*(?:per\s+month|/month|\b)",
    ]

    @classmethod
    def extract_salary(cls, text: str) -> Tuple[Optional[str], Optional[str]]:
        """Returns: (salary_text, stipend_text)"""
        salary_text = None
        stipend_text = None

        # Stipend check
        stipend_match = re.search(cls.SALARY_PATTERNS[3], text, re.IGNORECASE)
        if stipend_match:
            amount = stipend_match.group(1).strip()
            stipend_text = f"₹{amount} / month"

        # Pay level check
        level_match = re.search(cls.SALARY_PATTERNS[0], text, re.IGNORECASE)
        if level_match:
            level = level_match.group(1).strip()
            salary_text = f"Pay Level {level} (7th CPC Matrix)"

        # Pay scale range check
        range_match = re.search(cls.SALARY_PATTERNS[1], text, re.IGNORECASE)
        if range_match and not salary_text:
            s_min = range_match.group(1)
            s_max = range_match.group(2)
            salary_text = f"₹{s_min} - ₹{s_max}"

        # LPA check
        lpa_match = re.search(cls.SALARY_PATTERNS[2], text, re.IGNORECASE)
        if lpa_match and not salary_text:
            val = lpa_match.group(1)
            salary_text = f"₹{val} LPA CTC"

        return salary_text, stipend_text

    # -------------------------------------------------------------------------
    # 6. CORRIGENDUM, EXTENSION & CANCELLATION DETECTION
    # -------------------------------------------------------------------------
    CORRIGENDUM_KEYWORDS = [
        "corrigendum", "extension of last date", "date extended",
        "revised vacancies", "addendum", "amendment", "cancellation", "withdrawn"
    ]

    @classmethod
    def detect_corrigendum(cls, text: str) -> Tuple[bool, Optional[str]]:
        text_lower = text.lower()
        for kw in cls.CORRIGENDUM_KEYWORDS:
            if kw in text_lower:
                m = re.search(rf"({kw}[^\n\r.]+)", text, re.IGNORECASE)
                note = m.group(1).strip() if m else f"Notice contains {kw}"
                return True, note[:150]
        return False, None

    # -------------------------------------------------------------------------
    # 7. MASTER EXTRACT METHOD
    # -------------------------------------------------------------------------
    @classmethod
    def extract_all(cls, raw_text: str, title: str = "", organization: str = "") -> Dict[str, Any]:
        combined_text = f"{title}\n{raw_text}"

        deadline_iso, deadline_raw = cls.extract_deadline(combined_text)
        vacancies = cls.extract_vacancies(combined_text)
        age_min, age_max = cls.extract_age_limits(combined_text)
        qualification = cls.extract_qualification(combined_text)
        salary_text, stipend = cls.extract_salary(combined_text)
        is_corrigendum, corrigendum_note = cls.detect_corrigendum(combined_text)

        # Confidence calculation
        confidence = 0.5
        if deadline_iso:
            confidence += 0.2
        if vacancies:
            confidence += 0.15
        if qualification and qualification != "Bachelor's Degree or as per official notification":
            confidence += 0.1
        if salary_text or stipend:
            confidence += 0.05

        return {
            "application_deadline": deadline_iso,
            "application_deadline_text": deadline_raw,
            "vacancies": vacancies,
            "age_min": age_min,
            "age_max": age_max,
            "qualification": qualification,
            "salary_text": salary_text,
            "stipend": stipend,
            "has_corrigendum": is_corrigendum,
            "corrigendum_note": corrigendum_note,
            "confidence_score": min(confidence, 1.0)
        }
