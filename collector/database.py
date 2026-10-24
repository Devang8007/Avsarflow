"""
Database Client Interface for Supabase PostgreSQL.
Supports live Supabase operations as well as local in-memory fallback.
"""
import os
import json
from datetime import datetime
from typing import List, Dict, Any, Optional
from collector.config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

class DatabaseClient:
    def __init__(self, url: Optional[str] = None, key: Optional[str] = None):
        self.url = url or SUPABASE_URL
        self.key = key or SUPABASE_SERVICE_ROLE_KEY
        self.is_connected = bool(self.url and self.key and not self.url.startswith("https://your-project"))
        self.client = None

        if self.is_connected:
            try:
                from supabase import create_client
                self.client = create_client(self.url, self.key)
            except Exception as e:
                print(f"[Database] Warning: Supabase client initialization failed: {e}. Falling back to offline mode.")
                self.is_connected = False

        # In-memory mock storage if offline
        self._mock_sources: List[Dict[str, Any]] = []
        self._mock_jobs: List[Dict[str, Any]] = []
        self._mock_runs: List[Dict[str, Any]] = []
        self._mock_changes: List[Dict[str, Any]] = []

    def get_enabled_sources(self) -> List[Dict[str, Any]]:
        """
        Loads all active sources due for collection.
        """
        if self.is_connected and self.client:
            try:
                res = self.client.table("sources").select("*").eq("status", "active").execute()
                return res.data or []
            except Exception as e:
                print(f"[Database] Error fetching sources from Supabase: {e}")

        # Return default mock starting sources
        return [
            {
                "id": "src-001",
                "name": "Staff Selection Commission (SSC)",
                "base_url": "https://ssc.gov.in/",
                "listing_url": "https://ssc.gov.in/notices",
                "category": "government",
                "collection_method": "html",
                "request_interval_hours": 6,
                "status": "active"
            },
            {
                "id": "src-002",
                "name": "Union Public Service Commission (UPSC)",
                "base_url": "https://upsc.gov.in/",
                "listing_url": "https://upsc.gov.in/examinations/active-examinations",
                "category": "government",
                "collection_method": "html",
                "request_interval_hours": 6,
                "status": "active"
            }
        ]

    def get_existing_jobs(self, limit: int = 500) -> List[Dict[str, Any]]:
        if self.is_connected and self.client:
            try:
                res = self.client.table("jobs").select("id, title, slug, organization, application_url, source_url, source_document_hash, status, application_deadline").order("publication_date", desc=True).limit(limit).execute()
                return res.data or []
            except Exception as e:
                print(f"[Database] Error fetching existing jobs: {e}")
        return self._mock_jobs

    def save_job(self, job_data: Dict[str, Any]) -> Dict[str, Any]:
        if self.is_connected and self.client:
            try:
                res = self.client.table("jobs").upsert(job_data, on_conflict="slug").execute()
                return res.data[0] if res.data else job_data
            except Exception as e:
                print(f"[Database] Error saving job to Supabase: {e}")

        # In-memory save
        self._mock_jobs.append(job_data)
        return job_data

    def record_run(self, run_data: Dict[str, Any]) -> None:
        if self.is_connected and self.client:
            try:
                self.client.table("collection_runs").insert(run_data).execute()
                return
            except Exception as e:
                print(f"[Database] Error logging run to Supabase: {e}")
        self._mock_runs.append(run_data)

    def record_job_change(self, change_data: Dict[str, Any]) -> None:
        if self.is_connected and self.client:
            try:
                self.client.table("job_changes").insert(change_data).execute()
                return
            except Exception as e:
                print(f"[Database] Error recording job change: {e}")
        self._mock_changes.append(change_data)

    def update_source_health(self, source_id: str, success: bool, error_msg: Optional[str] = None) -> None:
        now_iso = datetime.utcnow().isoformat() + "Z"
        updates: Dict[str, Any] = {
            "last_attempted_run_at": now_iso,
            "updated_at": now_iso
        }
        if success:
            updates["last_successful_run_at"] = now_iso
            updates["health_status"] = "healthy"
            updates["consecutive_failures"] = 0
            updates["last_error_message"] = None
        else:
            updates["health_status"] = "warning"
            updates["last_error_message"] = error_msg

        if self.is_connected and self.client:
            try:
                self.client.table("sources").update(updates).eq("id", source_id).execute()
            except Exception as e:
                print(f"[Database] Error updating source health: {e}")
