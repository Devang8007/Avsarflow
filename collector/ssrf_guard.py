"""
SSRF Protection Module for OpportunityHub India Collector.
Validates URLs and resolved IP addresses against private and restricted networks.
"""
import ipaddress
import socket
import urllib.parse
from typing import Tuple
from collector.config import FORBIDDEN_HOSTS

class SSRFSecurityException(Exception):
    """Raised when a URL attempts to access private, local, or prohibited IP addresses."""
    pass

def is_ip_private_or_restricted(ip_str: str) -> bool:
    """
    Checks if an IP address belongs to private, loopback, link-local, multicast,
    or cloud metadata ranges.
    """
    try:
        ip = ipaddress.ip_address(ip_str)
        return (
            ip.is_private or
            ip.is_loopback or
            ip.is_link_local or
            ip.is_multicast or
            ip.is_reserved or
            ip.is_unspecified or
            str(ip) == "169.254.169.254"
        )
    except ValueError:
        return False

def validate_url_safe(url: str) -> Tuple[bool, str]:
    """
    Validates a URL against SSRF attacks:
    1. Checks protocol scheme (http/https only).
    2. Checks forbidden hostnames.
    3. Resolves DNS and checks resolved IPs against private ranges.
    Returns (True, resolved_ip) or raises SSRFSecurityException.
    """
    if not url:
        raise SSRFSecurityException("Empty URL provided")

    parsed = urllib.parse.urlparse(url)
    if parsed.scheme.lower() not in ("http", "https"):
        raise SSRFSecurityException(f"Unsupported protocol scheme '{parsed.scheme}'. Only HTTP and HTTPS are permitted.")

    hostname = parsed.hostname
    if not hostname:
        raise SSRFSecurityException("No valid hostname found in URL.")

    hostname_lower = hostname.lower()

    if hostname_lower in FORBIDDEN_HOSTS or hostname_lower.endswith(".local") or hostname_lower.endswith(".internal"):
        raise SSRFSecurityException(f"Access to host '{hostname}' is prohibited (SSRF protection).")

    # If hostname is already an IP address
    try:
        ipaddress.ip_address(hostname_lower)
        if is_ip_private_or_restricted(hostname_lower):
            raise SSRFSecurityException(f"IP '{hostname_lower}' belongs to a private/restricted network range.")
        return True, hostname_lower
    except ValueError:
        pass  # Hostname is a domain name, proceed to DNS resolution below

    # Resolve DNS
    try:
        addr_info = socket.getaddrinfo(hostname, None, socket.AF_UNSPEC, socket.SOCK_STREAM)
        for family, socktype, proto, canonname, sockaddr in addr_info:
            resolved_ip = sockaddr[0]
            if is_ip_private_or_restricted(resolved_ip):
                raise SSRFSecurityException(
                    f"Host '{hostname}' resolved to restricted IP address '{resolved_ip}' (SSRF protection)."
                )
        resolved_ip = addr_info[0][4][0]
        return True, resolved_ip
    except socket.gaierror as e:
        raise SSRFSecurityException(f"DNS resolution failed for host '{hostname}': {e}")
