"""
Universal Website Discovery Engine.
Analyzes arbitrary websites to detect recruitment listings, feeds, sitemaps, and structure.
"""
import urllib.parse
from typing import Dict, Any, List, Optional
from bs4 import BeautifulSoup
from collector.fetchers.http_client import SafeHttpClient

class WebsiteDiscoverer:
    RECRUITMENT_KEYWORDS = [
        "recruitment", "notices", "vacancies", "careers", "jobs",
        "current openings", "employment", "advertisement", "notifications"
    ]

    def __init__(self, client: Optional[SafeHttpClient] = None):
        self.client = client or SafeHttpClient()

    def discover(self, base_url: str) -> Dict[str, Any]:
        """
        Executes multi-layer discovery on the target URL.
        """
        parsed = urllib.parse.urlparse(base_url)
        origin = f"{parsed.scheme}://{parsed.netloc}"

        result: Dict[str, Any] = {
            "url": base_url,
            "success": False,
            "detected_method": "html",
            "detected_listing_url": base_url,
            "detected_feeds": [],
            "detected_sitemaps": [],
            "sample_notices_found": 0,
            "sample_pdfs_found": 0,
            "proposed_selectors": {},
            "warnings": [],
            "robots_txt_status": "not_checked"
        }

        # Layer 1: Check robots.txt
        try:
            robots_url = urllib.parse.urljoin(origin, "/robots.txt")
            status, robots_body, _ = self.client.fetch(robots_url, max_retries=1)
            if status == 200:
                result["robots_txt_status"] = "allowed"
                # Check for Sitemap references in robots.txt
                for line in robots_body.decode("utf-8", errors="ignore").splitlines():
                    if line.lower().startswith("sitemap:"):
                        sitemap_url = line.split(":", 1)[1].strip()
                        result["detected_sitemaps"].append(sitemap_url)
        except Exception:
            result["robots_txt_status"] = "not_found"

        # Layer 2: Check standard sitemap paths
        if not result["detected_sitemaps"]:
            for path in ("/sitemap.xml", "/sitemap_index.xml"):
                try:
                    s_url = urllib.parse.urljoin(origin, path)
                    status, _, _ = self.client.fetch(s_url, max_retries=1)
                    if status == 200:
                        result["detected_sitemaps"].append(s_url)
                        break
                except Exception:
                    pass

        # Layer 3: Fetch starting page and inspect HTML
        try:
            status, html_bytes, headers = self.client.fetch(base_url)
            html_text = html_bytes.decode("utf-8", errors="replace")
            soup = BeautifulSoup(html_text, "html.parser")

            # Check for RSS/Atom feeds
            for link in soup.find_all("link", rel=lambda r: r and "alternate" in r):
                feed_type = link.get("type", "")
                if "rss" in feed_type or "atom" in feed_type or "xml" in feed_type:
                    href = link.get("href")
                    if href:
                        feed_full = urllib.parse.urljoin(base_url, href)
                        result["detected_feeds"].append(feed_full)
                        result["detected_method"] = "rss"

            # Check for internal recruitment links
            discovered_recruitment_links: List[str] = []
            candidate_cards = 0
            pdf_links = 0

            for a_tag in soup.find_all("a", href=True):
                href = a_tag["href"].strip()
                full_url = urllib.parse.urljoin(base_url, href)
                text = (a_tag.get_text() or "").lower()

                if href.lower().endswith(".pdf"):
                    pdf_links += 1

                for kw in self.RECRUITMENT_KEYWORDS:
                    if kw in text or kw in href.lower():
                        if full_url not in discovered_recruitment_links and full_url != base_url:
                            discovered_recruitment_links.append(full_url)
                        break

            # If the current page itself looks like a recruitment listing
            notices_found = len(soup.find_all(class_=lambda c: c and any(k in c.lower() for k in ("notice", "job", "career", "vacancy", "post"))))
            if notices_found > 0:
                candidate_cards = notices_found

            # Proposed listing URL
            if discovered_recruitment_links:
                result["detected_listing_url"] = discovered_recruitment_links[0]
            else:
                result["detected_listing_url"] = base_url

            result["sample_notices_found"] = max(candidate_cards, len(discovered_recruitment_links))
            result["sample_pdfs_found"] = pdf_links

            # Layer 4: Proposed CSS Selectors based on detected DOM elements
            result["proposed_selectors"] = {
                "item_selector": ".notice-item, .views-row, tr:has(a)",
                "title_selector": "a, td.title, h3",
                "link_selector": "a[href$='.pdf'], a",
                "date_selector": ".date, td.date, time"
            }

            result["success"] = True

        except Exception as e:
            result["warnings"].append(f"Page fetch failed: {str(e)}")

        return result
