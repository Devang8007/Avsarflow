"""
Job Status & Deadline Updater.
Transitions jobs to 'closing_soon' or 'closed' based on current calendar date.
"""
from datetime import date, timedelta
from typing import List, Dict, Any, Tuple

class StatusUpdater:
    @staticmethod
    def evaluate_status(current_status: str, deadline_str: Optional[str]) -> Tuple[str, bool]:
        """
        Evaluates job status against the current date.
        Returns: (new_status, has_changed)
        """
        if not deadline_str:
            return current_status, False

        # If already closed or withdrawn, do not change
        if current_status in ("closed", "withdrawn", "needs_review"):
            return current_status, False

        try:
            deadline = date.fromisoformat(deadline_str[:10])
            today = date.today()

            # Deadline passed -> closed
            if deadline < today:
                return "closed", (current_status != "closed")

            # Within 3 days -> closing_soon
            if deadline <= today + timedelta(days=3):
                return "closing_soon", (current_status != "closing_soon")

            # Otherwise, keep open
            if current_status != "open":
                return "open", True

            return "open", False
        except Exception:
            return current_status, False

    @classmethod
    def update_jobs_list(cls, jobs: List[Dict[str, Any]]) -> int:
        """
        In-place updates of a list of job dicts. Returns count of changed statuses.
        """
        changed_count = 0
        for job in jobs:
            new_status, changed = cls.evaluate_status(
                job.get("status", "open"),
                job.get("application_deadline")
            )
            if changed:
                job["status"] = new_status
                changed_count += 1
        return changed_count
