"""
Unit tests for deterministic RuleExtractor.
"""
import pytest
from collector.extractors.rule_extractor import RuleExtractor

def test_extract_deadline_dd_mm_yyyy():
    text = "The last date for submission of online application is 27-07-2025 up to 23:00 Hrs."
    deadline, raw = RuleExtractor.extract_deadline(text)
    assert deadline == "2025-07-27"
    assert "27-07-2025" in raw

def test_extract_deadline_month_name():
    text = "Applications must be submitted by 15th August 2025 on the official portal."
    deadline, raw = RuleExtractor.extract_deadline(text)
    assert deadline == "2025-08-15"

def test_extract_deadline_slash_format():
    text = "Closing date: 05/03/2025 till 18:00 Hours."
    deadline, raw = RuleExtractor.extract_deadline(text)
    assert deadline == "2025-03-05"

def test_extract_vacancies():
    text1 = "Staff Selection Commission announces Total Vacancies: 17,727 across ministries."
    assert RuleExtractor.extract_vacancies(text1) == 17727

    text2 = "There are 1056 posts to be filled through the Civil Services Examination."
    assert RuleExtractor.extract_vacancies(text2) == 1056

    text3 = "No vacancy figures given in notice."
    assert RuleExtractor.extract_vacancies(text3) is None

def test_extract_age_limits():
    text1 = "Candidate age limit: 18 to 32 years as on crucial date."
    min_age, max_age = RuleExtractor.extract_age_limits(text1)
    assert min_age == 18
    assert max_age == 32

def test_extract_qualification():
    text1 = "Applicant must hold a Bachelor's Degree in any discipline from a recognized University."
    qual = RuleExtractor.extract_qualification(text1)
    assert "Bachelor's Degree" in qual or "Graduation" in qual

    text2 = "Candidate must have passed 10th pass / matriculation with ITI in trade."
    qual2 = RuleExtractor.extract_qualification(text2)
    assert "10th" in qual2

    text3 = "B.E. or B.Tech in Electronics and Communication Engineering with 65% marks."
    qual3 = RuleExtractor.extract_qualification(text3)
    assert "B.E. / B.Tech" in qual3

def test_extract_salary_and_stipend():
    text1 = "The post carries Pay Level 7 (₹44,900 to ₹1,42,400) in 7th CPC."
    sal, stip = RuleExtractor.extract_salary(text1)
    assert "Pay Level 7" in sal
    assert stip is None

    text2 = "Selected interns will receive a stipend: ₹25,000 per month."
    sal, stip = RuleExtractor.extract_salary(text2)
    assert stip == "₹25,000 / month"

def test_detect_corrigendum():
    text1 = "Corrigendum-I: Last date of application is extended upto 28.08.2025."
    is_corr, note = RuleExtractor.detect_corrigendum(text1)
    assert is_corr is True
    assert note is not None

    text2 = "Routine notification for fresh recruitment."
    is_corr, _ = RuleExtractor.detect_corrigendum(text2)
    assert is_corr is False
