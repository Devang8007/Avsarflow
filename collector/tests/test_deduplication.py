"""
Unit tests for Deduplication and StatusUpdater.
"""
from datetime import date, timedelta
from collector.deduplication import DeduplicationEngine
from collector.status_updater import StatusUpdater
from collector.validators.publishing_validator import PublishingValidator

def test_url_normalization():
    url1 = "https://ssc.gov.in/notices?utm_source=twitter&utm_medium=social&page=1"
    clean = DeduplicationEngine.normalize_url(url1)
    assert "utm_source" not in clean
    assert "page=1" in clean

def test_deduplication_by_hash():
    existing = [
        {"id": "1", "source_document_hash": "abc123hash", "title": "Job 1", "organization": "SSC"}
    ]
    cand = {"source_document_hash": "abc123hash", "title": "Other title", "organization": "SSC"}
    is_dup, match, reason = DeduplicationEngine.is_duplicate(cand, existing)
    assert is_dup is True
    assert reason == "document_hash_match"

def test_deduplication_by_recruitment_id():
    existing = [
        {"id": "1", "title": "Assistant Loco Pilot CEN 01/2024", "organization": "Railway Recruitment Board", "description": ""}
    ]
    cand = {
        "title": "Corrigendum to CEN 01/2024 ALP",
        "organization": "Railway Recruitment Board",
        "raw_text": "Notice regarding CEN 01/2024"
    }
    is_dup, match, reason = DeduplicationEngine.is_duplicate(cand, existing)
    assert is_dup is True
    assert reason == "recruitment_id_match"

def test_status_updater_transitions():
    today = date.today()

    # Expired -> closed
    past_date = (today - timedelta(days=2)).isoformat()
    new_status, changed = StatusUpdater.evaluate_status("open", past_date)
    assert new_status == "closed"
    assert changed is True

    # Closing soon (tomorrow)
    tomorrow = (today + timedelta(days=1)).isoformat()
    new_status2, changed2 = StatusUpdater.evaluate_status("open", tomorrow)
    assert new_status2 == "closing_soon"
    assert changed2 is True

    # Far future -> open
    future = (today + timedelta(days=30)).isoformat()
    new_status3, changed3 = StatusUpdater.evaluate_status("open", future)
    assert new_status3 == "open"
    assert changed3 is False

def test_publishing_validator():
    valid_job = {
        "title": "Combined Graduate Level 2025",
        "organization": "Staff Selection Commission",
        "application_url": "https://ssc.gov.in/apply",
        "extraction_confidence": 0.95
    }
    can_publish, status, reason = PublishingValidator.validate_for_publication(valid_job)
    assert can_publish is True
    assert status == "open"

    # Tender should be quarantined
    tender_job = {
        "title": "Notice Inviting Tender for Office Stationery",
        "organization": "Staff Selection Commission",
        "application_url": "https://ssc.gov.in/tender",
        "extraction_confidence": 0.9
    }
    can_publish, status, reason = PublishingValidator.validate_for_publication(tender_job)
    assert can_publish is False
    assert status == "needs_review"
