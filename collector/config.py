"""
OpportunityHub India - Collector Configuration
"""
import os
from typing import Set

# Environment & Supabase
SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", os.getenv("SUPABASE_KEY", ""))

# Network Limits & Safety
DEFAULT_TIMEOUT_SECONDS: int = int(os.getenv("COLLECTOR_TIMEOUT_SECONDS", "20"))
MAX_PDF_SIZE_BYTES: int = 15 * 1024 * 1024  # 15 MB
MAX_HTML_SIZE_BYTES: int = 5 * 1024 * 1024   # 5 MB
MAX_REDIRECTS: int = 5

# Bot Identification
USER_AGENT: str = os.getenv(
    "COLLECTOR_USER_AGENT",
    "OpportunityHubIndia-Bot/1.0 (+https://opportunityhub.in/crawler; transparent public recruitment indexer)"
)

# SSRF Prohibited Hostnames and Domains
FORBIDDEN_HOSTS: Set[str] = {
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "169.254.169.254",  # AWS/GCP/Azure instance metadata
    "metadata.google.internal",
    "instance-data",
}

# Default Collection Interval
DEFAULT_INTERVAL_HOURS: int = 6
