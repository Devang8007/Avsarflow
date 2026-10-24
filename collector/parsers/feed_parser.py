"""
RSS/Atom Feed Parser.
Extracts recruitment items from XML feeds.
"""
import xml.etree.ElementTree as ET
from typing import List, Dict, Any

class FeedParser:
    @staticmethod
    def parse_feed(xml_content: str) -> List[Dict[str, Any]]:
        """
        Parses RSS or Atom XML string and returns list of candidate items.
        """
        items: List[Dict[str, Any]] = []
        try:
            root = ET.fromstring(xml_content)
        except Exception:
            return items

        # RSS 2.0 (<channel><item>)
        channel = root.find("channel")
        if channel is not None:
            for item in channel.findall("item"):
                title = (item.findtext("title") or "").strip()
                link = (item.findtext("link") or "").strip()
                pub_date = (item.findtext("pubDate") or "").strip()
                desc = (item.findtext("description") or "").strip()

                if title and link:
                    items.append({
                        "title": title,
                        "url": link,
                        "pdf_url": link if link.lower().endswith(".pdf") else None,
                        "date_text": pub_date,
                        "raw_text": f"{title} {desc}"
                    })
            return items

        # Atom (<entry>)
        atom_ns = {"atom": "http://www.w3.org/2005/Atom"}
        entries = root.findall("atom:entry", atom_ns) or root.findall("entry")
        for entry in entries:
            title = (entry.findtext("atom:title", namespaces=atom_ns) or entry.findtext("title") or "").strip()
            link_el = entry.find("atom:link", namespaces=atom_ns) or entry.find("link")
            link = link_el.get("href", "").strip() if link_el is not None else ""
            updated = (entry.findtext("atom:updated", namespaces=atom_ns) or entry.findtext("updated") or "").strip()

            if title and link:
                items.append({
                    "title": title,
                    "url": link,
                    "pdf_url": link if link.lower().endswith(".pdf") else None,
                    "date_text": updated,
                    "raw_text": title
                })

        return items
