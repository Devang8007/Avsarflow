"""
Unit tests for SSRF Security Guard.
"""
import pytest
from collector.ssrf_guard import validate_url_safe, SSRFSecurityException, is_ip_private_or_restricted

def test_reject_localhost():
    with pytest.raises(SSRFSecurityException):
        validate_url_safe("http://localhost:8080/admin")

    with pytest.raises(SSRFSecurityException):
        validate_url_safe("http://127.0.0.1:3000")

def test_reject_private_subnets():
    # 10.0.0.0/8
    assert is_ip_private_or_restricted("10.0.0.1") is True
    # 192.168.0.0/16
    assert is_ip_private_or_restricted("192.168.1.1") is True
    # 172.16.0.0/12
    assert is_ip_private_or_restricted("172.16.0.5") is True
    # Loopback
    assert is_ip_private_or_restricted("127.0.0.1") is True

def test_reject_cloud_metadata():
    with pytest.raises(SSRFSecurityException):
        validate_url_safe("http://169.254.169.254/latest/meta-data/")

def test_reject_invalid_schemes():
    with pytest.raises(SSRFSecurityException):
        validate_url_safe("file:///etc/passwd")

    with pytest.raises(SSRFSecurityException):
        validate_url_safe("ftp://ftp.example.com")

def test_accept_valid_public_domain():
    is_safe, resolved_ip = validate_url_safe("https://upsc.gov.in")
    assert is_safe is True
    assert resolved_ip != ""
