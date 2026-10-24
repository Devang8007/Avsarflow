"""
HTML Listing Parser.
Extracts recruitment notice candidate items using configured selectors or fallback heuristics.
"""
import urllib.parse
from typing import List, Dict, Any, Optional
from bs4 import BeautifulSoup

class HtmlListingParser:
    def __init__(self, soup: BeautifulSoup, base_url: str):
        self.soup = soup
        self.base_url = base_url

    def parse_items(
        self,
        item_selector: Optional[str] = None,
        title_selector: Optional[str] = None,
        link_selector: Optional[str] = None,
        date_selector: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Extracts candidate notice items from HTML using CSS selectors or table/link fallbacks.
        """
        results: List[Dict[str, Any]] = []

        # 1. Custom CSS selector path if provided
        if item_selector:
            try:
                elements = self.soup.select(item_selector)
                for el in elements:
                    item_data = self._extract_from_element(el, title_selector, link_selector, date_selector)
                    if item_data:
                        results.append(item_data)
                if results:
                    return results
            except Exception:
                pass

        # 2. Table rows fallback
        rows = self.soup.find_all("tr")
        for row in rows:
            # Skip header rows
            if row.find("th") and not row.find("td"):
                continue

            links = row.find_all("a", href=True)
            if not links:
                continue

            title_link = links[0]
            title = title_link.get_text().strip()
            if len(title) < 5:
                continue

            href = urllib.parse.urljoin(self.base_url, title_link["href"].strip())

            # Find PDF link in row if distinct
            pdf_url = None
            for a in links:
                if a["href"].strip().lower().endswith(".pdf"):
                    pdf_url = urllib.parse.urljoin(self.base_url, a["href"].strip())
                    break

            # Date text in row
            date_text = None
            for td in row.find_all("td"):
                t = td.get_text().strip()
                # Check for standard date pattern
                if any(sep in t for sep in ("-", "/", ".")) and any(char.isdigit() for char in t):
                    date_text = t
                    break

            results.append({
                "title": title,
                "url": href,
                "pdf_url": pdf_url or (href if href.lower().endswith(".pdf") else None),
                "date_text": date_text,
                "raw_text": row.get_text(separator=" ", strip=True)
            })

        if results:
            return results

        # 3. Direct Anchor fallback
        for a in self.soup.find_all("a", href=True):
            href = a["href"].strip()
            text = a.get_text().strip()
            if len(text) > 10 and any(k in text.lower() or k in href.lower() for k in ("recruitment", "notice", "advertisement", "cgl", "post", "apply")):
                full_url = urllib.parse.urljoin(self.base_url, href)
                results.append({
                    "title": text,
                    "url": full_url,
                    "pdf_url": full_url if full_url.lower().endswith(".pdf") else None,
                    "date_text": None,
                    "raw_text": text
                })

        return results

    def _extract_from_element(
        self,
        el,
        title_selector: Optional[str],
        link_selector: Optional[str],
        date_selector: Optional[str]
    ) -> Optional[Dict[str, Any]]:
        title = None
        if title_selector:
            t_el = el.select_one(title_selector)
            if t_el:
                title = t_el.get_text().strip()

        link_url = None
        if link_selector:
            l_el = el.select_one(link_selector)
            if l_el and l_el.has_attr("href"):
                link_url = urllib.parse.urljoin(self.base_url, l_el["href"].strip())

        # Fallback to first link inside element
        if not link_url:
            first_a = el.find("a", href=True)
            if first_a:
                link_url = urllib.parse.urljoin(self.base_url, first_a["href"].strip())
                if not title:
                    title = first_a.get_text().strip()

        if not title:
            title = el.get_text().strip()[:100]

        if not link_url:
            return None

        date_text = None
        if date_selector:
            d_el = el.select_one(date_selector)
            if d_el:
                date_text = d_el.get_text().strip()

        return {
            "title": title,
            "url": link_url,
            "pdf_url": link_url if link_url.lower().endswith(".pdf") else None,
            "date_text": date_text,
            "raw_text": el.get_text(separator=" ", strip=True)
        }
