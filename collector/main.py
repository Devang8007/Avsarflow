"""
OpportunityHub India - Automated Recruitment Collection System.
Main Execution Engine and Command-Line Interface.
"""
import sys
import argparse
import json
import uuid
from datetime import datetime, date
from typing import Dict, Any, List

from collector.fetchers.http_client import SafeHttpClient
from collector.parsers.html_parser import HtmlListingParser
from collector.parsers.feed_parser import FeedParser
from collector.parsers.pdf_parser import PdfParser
from collector.extractors.rule_extractor import RuleExtractor
from collector.deduplication import DeduplicationEngine
from collector.validators.publishing_validator import PublishingValidator
from collector.status_updater import StatusUpdater
from collector.discovery.website_discoverer import WebsiteDiscoverer
from collector.database import DatabaseClient
from bs4 import BeautifulSoup

def process_source(source: Dict[str, Any], db: DatabaseClient, http_client: SafeHttpClient) -> Dict[str, Any]:
    """
    Executes collection, extraction, deduplication, and persistence for a single source.
    """
    source_id = source.get("id", str(uuid.uuid4()))
    source_name = source.get("name", "Unknown Source")
    listing_url = source.get("listing_url") or source.get("base_url")

    run_record: Dict[str, Any] = {
        "id": f"run-{int(datetime.utcnow().timestamp())}",
        "source_id": source_id,
        "source_name": source_name,
        "started_at": datetime.utcnow().isoformat() + "Z",
        "status": "running",
        "pages_scanned": 1,
        "items_discovered": 0,
        "new_items_saved": 0,
        "items_updated": 0,
        "duplicates_found": 0,
        "items_quarantined": 0,
        "errors_count": 0,
        "error_log": []
    }

    print(f"\n[Collector] Processing source '{source_name}' ({listing_url})...")

    try:
        # 1. Fetch listing page
        status_code, body_bytes, headers = http_client.fetch(listing_url)
        content_type = headers.get("Content-Type", "")

        candidate_items: List[Dict[str, Any]] = []

        # 2. Parse items based on collection method
        if source.get("collection_method") == "rss" or "xml" in content_type:
            candidate_items = FeedParser.parse_feed(body_bytes.decode("utf-8", errors="replace"))
        else:
            soup = BeautifulSoup(body_bytes.decode("utf-8", errors="replace"), "html.parser")
            parser = HtmlListingParser(soup, listing_url)
            candidate_items = parser.parse_items(
                item_selector=source.get("item_selector"),
                title_selector=source.get("title_selector"),
                link_selector=source.get("link_selector"),
                date_selector=source.get("date_selector")
            )

        run_record["items_discovered"] = len(candidate_items)
        print(f"[Collector] Discovered {len(candidate_items)} raw notices.")

        # 3. Load existing jobs for deduplication
        existing_jobs = db.get_existing_jobs()

        # 4. Extract, Validate, and Save
        for item in candidate_items:
            title = item.get("title", "").strip()
            raw_text = item.get("raw_text", "")
            item_url = item.get("url", listing_url)
            pdf_url = item.get("pdf_url")

            # Extract details using deterministic rules
            extracted = RuleExtractor.extract_all(raw_text, title=title, organization=source_name)

            # Build standardized job payload
            slug = f"{source_id}-{title.lower()[:50]}".replace(" ", "-").replace("/", "-")
            slug = "".join(c for c in slug if c.isalnum() or c == "-")

            job_dict: Dict[str, Any] = {
                "id": str(uuid.uuid4()),
                "title": title,
                "slug": slug,
                "organization": source.get("organization") or source_name,
                "category": source.get("category", "government"),
                "location": "All India",
                "employment_type": "Full-time",
                "qualification": extracted["qualification"],
                "vacancies": extracted["vacancies"],
                "salary_text": extracted["salary_text"],
                "stipend": extracted["stipend"],
                "age_min": extracted["age_min"],
                "age_max": extracted["age_max"],
                "application_deadline": extracted["application_deadline"],
                "application_deadline_text": extracted["application_deadline_text"],
                "publication_date": date.today().isoformat(),
                "description": f"Official recruitment notice issued by {source_name}. Extracted via deterministic gazette parsing.",
                "application_url": item_url,
                "official_notification_url": pdf_url,
                "source_id": source_id,
                "source_name": source_name,
                "source_url": listing_url,
                "has_corrigendum": extracted["has_corrigendum"],
                "corrigendum_note": extracted["corrigendum_note"],
                "extraction_confidence": extracted["confidence_score"]
            }

            # Check deduplication
            is_dup, ex_job, reason = DeduplicationEngine.is_duplicate(job_dict, existing_jobs)

            if is_dup and ex_job:
                run_record["duplicates_found"] += 1
                # Check for deadline extension or corrigendum change
                if extracted["application_deadline"] and ex_job.get("application_deadline") != extracted["application_deadline"]:
                    db.record_job_change({
                        "id": f"chg-{int(datetime.utcnow().timestamp())}",
                        "job_id": ex_job.get("id"),
                        "job_title": title,
                        "changed_field": "application_deadline",
                        "old_value": ex_job.get("application_deadline"),
                        "new_value": extracted["application_deadline"],
                        "change_type": "deadline_extension",
                        "detected_at": datetime.utcnow().isoformat() + "Z",
                        "notes": "Deadline change detected during automated collection."
                    })
                    run_record["items_updated"] += 1
                continue

            # Validate for automatic publication
            can_publish, status, quarantine_reason = PublishingValidator.validate_for_publication(job_dict)
            job_dict["status"] = status

            if not can_publish:
                run_record["items_quarantined"] += 1
                print(f"  [Quarantined] '{title}': {quarantine_reason}")
            else:
                run_record["new_items_saved"] += 1
                print(f"  [Saved] '{title}' ({status})")

            # Persist to Supabase
            db.save_job(job_dict)

        run_record["status"] = "success"
        db.update_source_health(source_id, success=True)

    except Exception as e:
        run_record["status"] = "failed"
        run_record["errors_count"] += 1
        run_record["error_log"].append(str(e))
        db.update_source_health(source_id, success=False, error_msg=str(e))
        print(f"[Collector] Error collecting source '{source_name}': {e}")

    run_record["completed_at"] = datetime.utcnow().isoformat() + "Z"
    db.record_run(run_record)
    return run_record

def main():
    parser = argparse.ArgumentParser(description="OpportunityHub India Automated Recruitment Collector")
    parser.add_argument("--run-all", action="store_true", help="Run all enabled sources due for collection")
    parser.add_argument("--source-id", type=str, help="Run collection for a specific source ID")
    parser.add_argument("--test-url", type=str, help="Discover and test extraction for any arbitrary URL")
    parser.add_argument("--update-statuses", action="store_true", help="Evaluate deadlines and update job statuses")

    args = parser.parse_args()
    db = DatabaseClient()
    http_client = SafeHttpClient()

    if args.test_url:
        print(f"\n[Test Discovery] Running layered analysis on {args.test_url}...")
        discoverer = WebsiteDiscoverer(http_client)
        result = discoverer.discover(args.test_url)
        print(json.dumps(result, indent=2))
        return

    if args.update_statuses:
        print("\n[Status Updater] Evaluating application deadlines against current date...")
        jobs = db.get_existing_jobs()
        updated = StatusUpdater.update_jobs_list(jobs)
        print(f"[Status Updater] Completed. Updated {updated} job records.")
        return

    if args.source_id:
        sources = [s for s in db.get_enabled_sources() if s.get("id") == args.source_id]
        if not sources:
            print(f"Source with ID '{args.source_id}' not found.")
            sys.exit(1)
        process_source(sources[0], db, http_client)
        return

    # Default: Run all due sources
    print("\n=======================================================")
    print("OpportunityHub India - Recruitment Collection Engine")
    print(f"Run started at {datetime.utcnow().isoformat()}Z")
    print("=======================================================")

    sources = db.get_enabled_sources()
    print(f"Found {len(sources)} active recruitment sources.")

    for s in sources:
        process_source(s, db, http_client)

    print("\n[Collector] All runs finished.")

if __name__ == "__main__":
    main()
