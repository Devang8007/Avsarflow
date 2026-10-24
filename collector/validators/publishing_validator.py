"""
Automatic Publishing Validator.
Determines whether a recruitment notice can be automatically published or quarantined.
"""
from typing import Dict, Any, Tuple, Optional
import urllib.parse

class PublishingValidator:
    @staticmethod
    def validate_for_publication(item: Dict[str, Any]) -> Tuple[bool, str, Optional[str]]:
        """
        Validates a notice record.
        Returns: (can_publish, status, quarantine_reason)
        status: 'open', 'upcoming', or 'needs_review'
        """
        title = (item.get("title") or "").strip()
        org = (item.get("organization") or "").strip()
        source_url = (item.get("source_url") or "").strip()
        app_url = (item.get("application_url") or "").strip()

        # 1. Essential field checks
        if not title or len(title) < 5:
            return False, "needs_review", "Missing or abnormally short recruitment title."

        if not org or len(org) < 2:
            return False, "needs_review", "Missing recruiting organization name."

        if not source_url and not app_url:
            return False, "needs_review", "Missing source and application URLs."

        # Validate URL formats
        url_to_check = app_url or source_url
        try:
            parsed = urllib.parse.urlparse(url_to_check)
            if parsed.scheme.lower() not in ("http", "https") or not parsed.netloc:
                return False, "needs_review", f"Invalid URL scheme '{parsed.scheme}'."
        except Exception as e:
            return False, "needs_review", f"Malformed URL: {e}"

        # 2. Check for keywords indicating cancellation or tenders
        title_lower = title.lower()
        if any(w in title_lower for w in ("tender", "eoi", "quotation", "auction", "vendor registration", "rfp")):
            return False, "needs_review", "Non-recruitment procurement / tender notice detected."

        if any(w in title_lower for w in ("cancelled", "cancellation of examination", "withdrawn")):
            return False, "withdrawn", "Notice explicitly marked as cancelled or withdrawn by commission."

        # 3. Check dates consistency
        open_date = item.get("application_open_date")
        deadline = item.get("application_deadline")

        if open_date and deadline and open_date > deadline:
            return False, "needs_review", f"Contradictory dates: Open date ({open_date}) is after deadline ({deadline})."

        # 4. Confidence threshold check
        confidence = item.get("extraction_confidence", 0.5)
        if confidence < 0.4:
            return False, "needs_review", f"Extraction confidence ({confidence}) is below automatic publishing threshold (0.40)."

        # Determine if 'upcoming' or 'open'
        if open_date:
            from datetime import date
            today = date.today().isoformat()
            if open_date > today:
                return True, "upcoming", None

        return True, "open", None
