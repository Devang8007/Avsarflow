"""
Safe HTTP Fetcher with SSRF validation, redirect guards, and size limits.
"""
import time
import requests
import urllib.parse
from typing import Optional, Dict, Any, Tuple
from collector.ssrf_guard import validate_url_safe, SSRFSecurityException
from collector.config import (
    DEFAULT_TIMEOUT_SECONDS,
    MAX_PDF_SIZE_BYTES,
    MAX_HTML_SIZE_BYTES,
    MAX_REDIRECTS,
    USER_AGENT
)

class SafeHttpClient:
    def __init__(self, timeout: int = DEFAULT_TIMEOUT_SECONDS):
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": USER_AGENT,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,application/pdf;q=0.8,*/*;q=0.7",
            "Accept-Language": "en-US,en;q=0.9,hi;q=0.8",
        })

    def fetch(
        self,
        url: str,
        is_pdf: bool = False,
        custom_headers: Optional[Dict[str, str]] = None,
        max_retries: int = 3
    ) -> Tuple[int, bytes, Dict[str, str]]:
        """
        Safely fetches content from a URL with SSRF checks, redirect validation,
        and size limit enforcement.
        Returns: (status_code, content_bytes, headers_dict)
        """
        current_url = url
        redirect_count = 0
        max_size = MAX_PDF_SIZE_BYTES if is_pdf else MAX_HTML_SIZE_BYTES

        headers = self.session.headers.copy()
        if custom_headers:
            headers.update(custom_headers)

        for attempt in range(max_retries):
            try:
                # SSRF check on initial and redirected URLs
                validate_url_safe(current_url)

                # Stream response to check content length and prevent large memory spikes
                with self.session.get(
                    current_url,
                    headers=headers,
                    timeout=self.timeout,
                    allow_redirects=False,
                    stream=True
                ) as response:
                    # Handle redirects manually to revalidate destination URL against SSRF
                    if response.is_redirect or response.status_code in (301, 302, 303, 307, 308):
                        redirect_count += 1
                        if redirect_count > MAX_REDIRECTS:
                            raise ValueError(f"Exceeded maximum permitted redirects ({MAX_REDIRECTS})")

                        location = response.headers.get("Location")
                        if not location:
                            raise ValueError("Redirect received without Location header.")

                        current_url = urllib.parse.urljoin(current_url, location)
                        continue

                    # Check Content-Length header
                    content_length = response.headers.get("Content-Length")
                    if content_length and int(content_length) > max_size:
                        raise ValueError(f"Content-Length {content_length} exceeds limit of {max_size} bytes")

                    # Download with byte counter
                    content_chunks = []
                    downloaded = 0
                    for chunk in response.iter_content(chunk_size=16384):
                        if chunk:
                            downloaded += len(chunk)
                            if downloaded > max_size:
                                raise ValueError(f"Downloaded payload exceeded size limit of {max_size} bytes")
                            content_chunks.append(chunk)

                    body = b"".join(content_chunks)
                    return response.status_code, body, dict(response.headers)

            except (requests.exceptions.RequestException, SSRFSecurityException, ValueError) as err:
                if attempt == max_retries - 1:
                    raise err
                # Exponential backoff
                time.sleep(1.0 * (2 ** attempt))

        raise RuntimeError("Failed to fetch after retries.")
