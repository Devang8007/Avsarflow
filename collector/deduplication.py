"""
Multi-factor deduplication and change detection module.
"""
import re
import urllib.parse
from typing import Optional, Dict, Any, List

class DeduplicationEngine:
    @staticmethod
    def normalize_url(url: str) -> str:
        """
        Strips tracking parameters (utm_*, ref, etc.) and fragments.
        """
        if not url:
            return ""
        parsed = urllib.parse.urlparse(url)
        # Filter query params
        query_pairs = urllib.parse.parse_qsl(parsed.query)
        cleaned_pairs = [
            (k, v) for k, v in query_pairs
            if not k.lower().startswith("utm_") and k.lower() not in ("ref", "fbclid", "gclid")
        ]
        new_query = urllib.parse.urlencode(cleaned_pairs)
        return urllib.parse.urlunparse((
            parsed.scheme.lower(),
            parsed.netloc.lower(),
            parsed.path.rstrip("/"),
            "",
            new_query,
            ""
        ))

    @staticmethod
    def extract_recruitment_identifier(title: str, text: str = "") -> Optional[str]:
        """
        Extracts official advertisement or gazette numbers like:
        - Advt No. 01/2025
        - CEN 01/2024
        - Notice No. 3/2025-P&P-I
        - CRP PO/MT-XIV
        """
        patterns = [
            r"\b(?:advt(?:\.?\s*no\.?)?|notification\s+no\.?|cen\s+no\.?)\s*[:\s]?\s*([0-9A-Z/_-]+(?:\s*[0-9A-Z/_-]+)*)\b",
            r"\b(CEN\s+[0-9]{2}/[0-9]{4})\b",
            r"\b(CRP\s+[A-Z/]+-[A-Z0-9]+)\b",
            r"\b([0-9]{1,4}/[0-9]{4}(?:-[A-Za-z0-9]+)?)\b"
        ]
        combined = f"{title} {text}"
        for p in patterns:
            match = re.search(p, combined, re.IGNORECASE)
            if match:
                identifier = match.group(1).strip()
                if len(identifier) >= 4:
                    return identifier
        return None

    @classmethod
    def is_duplicate(
        cls,
        candidate_item: Dict[str, Any],
        existing_jobs: List[Dict[str, Any]]
    ) -> Tuple[bool, Optional[Dict[str, Any]], str]:
        """
        Checks candidate against existing jobs using:
        1. Document Hash (SHA-256)
        2. Normalized URL
        3. Recruitment Identifier + Organization match
        4. Exact title + Organization match

        Returns: (is_dup, existing_job_match, match_reason)
        """
        cand_hash = candidate_item.get("source_document_hash")
        cand_url = cls.normalize_url(candidate_item.get("application_url") or candidate_item.get("source_url", ""))
        cand_title = candidate_item.get("title", "").strip().lower()
        cand_org = candidate_item.get("organization", "").strip().lower()
        cand_id = cls.extract_recruitment_identifier(cand_title, candidate_item.get("raw_text", ""))

        for ex in existing_jobs:
            # 1. Document hash match
            if cand_hash and ex.get("source_document_hash") and cand_hash == ex.get("source_document_hash"):
                return True, ex, "document_hash_match"

            # 2. Normalized URL match
            ex_url = cls.normalize_url(ex.get("application_url") or ex.get("source_url", ""))
            if cand_url and ex_url and cand_url == ex_url:
                return True, ex, "url_match"

            # 3. Recruitment notice ID + Org match
            ex_title = ex.get("title", "").strip().lower()
            ex_org = ex.get("organization", "").strip().lower()
            ex_id = cls.extract_recruitment_identifier(ex_title, ex.get("description", ""))

            if cand_id and ex_id and cand_id.lower() == ex_id.lower():
                if cand_org and ex_org and (cand_org in ex_org or ex_org in cand_org):
                    return True, ex, "recruitment_id_match"

            # 4. Exact Title & Org match
            if cand_title == ex_title and cand_org == ex_org:
                return True, ex, "exact_title_org_match"

        return False, None, "none"
