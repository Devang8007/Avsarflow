"""
PDF Parser using PyMuPDF (fitz) with graceful fallback and SHA-256 document hashing.
"""
import hashlib
from typing import Tuple, Optional

class PdfParser:
    @staticmethod
    def extract_text_and_hash(pdf_bytes: bytes) -> Tuple[str, str]:
        """
        Extracts plain text and SHA-256 hash from PDF document bytes.
        Returns: (extracted_text, sha256_hash)
        """
        # Calculate cryptographic hash
        sha256_hash = hashlib.sha256(pdf_bytes).hexdigest()

        text_content = ""
        try:
            import fitz  # PyMuPDF
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            pages_text = []
            # Extract first 20 pages max to prevent memory exhaustion on giant 500-page gazettes
            for page_idx in range(min(len(doc), 20)):
                page = doc[page_idx]
                pages_text.append(page.get_text())
            doc.close()
            text_content = "\n".join(pages_text).strip()
        except ImportError:
            # Fallback if PyMuPDF is not yet installed in local python environment
            # Extract basic ascii strings as simple heuristic fallback
            printable = []
            for b in pdf_bytes[:50000]:
                if 32 <= b <= 126 or b in (10, 13):
                    printable.append(chr(b))
            text_content = "".join(printable)
        except Exception as e:
            text_content = f"[PDF Extraction Error: {str(e)}]"

        return text_content, sha256_hash
