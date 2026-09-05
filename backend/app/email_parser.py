"""
Parses raw RFC-822 emails, .eml files, or copy-pasted forwarded messages
into a structured dictionary for the security analysis engine.

Features:
  - Full RFC-822 header extraction (From, To, Reply-To, Return-Path, Date, Subject)
  - Dedicated Forwarded Message Parser (---------- Forwarded message ---------)
  - Markdown mailto & anchor link cleaning
  - SPF / DKIM / DMARC authentication header extractor
  - URL and embedded link destination mismatch detection
  - Body contact address extraction (for sender vs contact discrepancy checks)
"""

import re
import email
from email import policy
from email.utils import parseaddr, getaddresses

URL_REGEX = re.compile(r'https?://[^\s\'"<>\)\]]+')
MARKDOWN_LINK_REGEX = re.compile(r'\[([^\]]+)\]\((https?://[^\s\)]+)\)')
MARKDOWN_MAILTO_REGEX = re.compile(r'\[([^\]]+)\]\(mailto:([^\s\)]+)\)')
HREF_REGEX = re.compile(r'href\s*=\s*["\']([^"\']+)["\']', re.IGNORECASE)
ANCHOR_REGEX = re.compile(r'<a\s+[^>]*href\s*=\s*["\']([^"\']+)["\'][^>]*>(.*?)</a>', re.IGNORECASE | re.DOTALL)
IMG_TAG_REGEX = re.compile(r'<img\b', re.IGNORECASE)
EMAIL_PATTERN = re.compile(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+')


def parse_raw_email(raw_bytes_or_str) -> dict:
    """Main entry point to parse either raw bytes, .eml text, or pasted email text."""
    if isinstance(raw_bytes_or_str, bytes):
        try:
            text = raw_bytes_or_str.decode('utf-8', errors='replace')
        except Exception:
            text = str(raw_bytes_or_str)
    else:
        text = str(raw_bytes_or_str)

    # Clean leading/trailing whitespaces
    text = text.strip()

    # Check if this is a forwarded message dump (e.g. Gmail / Outlook forward)
    if _is_forwarded_block(text):
        return _parse_forwarded_message(text)

    # Standard RFC-822 message parsing
    return _parse_rfc822(text)


def _is_forwarded_block(text: str) -> bool:
    """Detect common forwarded message headers."""
    indicators = [
        "---------- Forwarded message ---------",
        "-----Forwarded Message-----",
        "-----Original Message-----",
        "________________________________",
    ]
    for ind in indicators:
        if ind.lower() in text.lower():
            return True
    
    # Also check if text starts with From: / Date: / Subject: in plain text without typical RFC-822 mime
    first_lines = "\n".join(text.splitlines()[:8])
    if re.search(r'(?i)^from:\s*<.*?>', first_lines, re.MULTILINE) or \
       (re.search(r'(?i)^from:', first_lines, re.MULTILINE) and re.search(r'(?i)^subject:', first_lines, re.MULTILINE)):
        # If it doesn't look like standard RFC822 with headers at top, treat as text
        if "MIME-Version:" not in first_lines and "Received:" not in first_lines:
            return True
    return False


def _clean_markdown_text(text: str) -> str:
    """Converts markdown mailto and links into clean plain text for inspection."""
    # Convert [name](mailto:email@domain.com) -> email@domain.com
    text = MARKDOWN_MAILTO_REGEX.sub(r'\2', text)
    return text


def _parse_forwarded_message(raw_text: str) -> dict:
    """Specialized parser for forwarded messages and webmail copy-pastes."""
    cleaned = _clean_markdown_text(raw_text)
    
    # If the text has no newlines between From:, Date:, Subject:, To:, insert newlines
    header_keywords = ["From:", "Date:", "Subject:", "To:", "Reply-To:", "Return-Path:"]
    for kw in header_keywords:
        cleaned = re.sub(rf'(?i)(?<!\n)({kw})', r'\n\1', cleaned)
    cleaned = re.sub(r'(?i)(---------- forwarded message ---------)', r'\1\n', cleaned)

    lines = cleaned.splitlines()

    headers = {}
    body_lines = []
    in_headers = False
    header_done = False

    for line in lines:
        line_s = line.strip()
        if not line_s:
            if "From" in headers or "Subject" in headers:
                in_headers = False
                header_done = True
            continue

        if any(ind.lower() in line_s.lower() for ind in [
            "---------- forwarded message ---------",
            "-----forwarded message-----",
            "-----original message-----",
            "________________________________"
        ]):
            in_headers = True
            continue

        if (not in_headers and not header_done) and re.match(r'^(from|date|subject|to|reply-to):', line_s, re.IGNORECASE):
            in_headers = True

        if in_headers:
            header_match = re.match(r'^(From|Date|Subject|To|Reply-To|Return-Path):\s*(.*)', line_s, re.IGNORECASE)
            if header_match:
                headers[header_match.group(1).title()] = header_match.group(2).strip()
            else:
                if "From" in headers or "Subject" in headers:
                    in_headers = False
                    header_done = True
                    body_lines.append(line)
        else:
            body_lines.append(line)

    body_text = "\n".join(body_lines).strip()
    if not body_text and lines:
        body_text = "\n".join(lines).strip()

    from_raw = headers.get("From", "").strip()
    # Clean brackets and markdown artifacts
    from_raw_clean = re.sub(r'[\[\]]', '', from_raw)
    display_name, sender_address = parseaddr(from_raw_clean)
    if not sender_address and "@" in from_raw:
        em = EMAIL_PATTERN.search(from_raw)
        if em:
            sender_address = em.group(0)
            display_name = from_raw.replace(sender_address, "").replace("<", "").replace(">", "").strip()

    reply_to_raw = headers.get("Reply-To", "").strip()
    _, reply_to_address = parseaddr(re.sub(r'[\[\]]', '', reply_to_raw))
    if not reply_to_address and "@" in reply_to_raw:
        em = EMAIL_PATTERN.search(reply_to_raw)
        if em:
            reply_to_address = em.group(0)

    _, return_path_address = parseaddr(re.sub(r'[\[\]]', '', headers.get("Return-Path", "")))
    subject = headers.get("Subject", "")
    date = headers.get("Date", "")
    to_raw = re.sub(r'[\[\]]', '', headers.get("To", ""))
    to_addrs = [addr for _, addr in getaddresses([to_raw])] if to_raw else []

    # Extract all URLs (Plain URLs + Markdown Links [text](url))
    text_urls = URL_REGEX.findall(body_text)
    md_links = MARKDOWN_LINK_REGEX.findall(body_text)
    md_urls = [url for _, url in md_links]
    urls = list(dict.fromkeys(text_urls + md_urls))

    # Link text mismatches from Markdown syntax
    link_mismatches = []
    for text_label, url in md_links:
        visible_domain_match = re.search(r'([a-z0-9-]+\.[a-z]{2,})', text_label.lower())
        if visible_domain_match:
            claimed_domain = visible_domain_match.group(1)
            actual_domain = re.sub(r'^https?://', '', url.lower()).split('/')[0].split(':')[0]
            if claimed_domain not in actual_domain and actual_domain not in claimed_domain:
                link_mismatches.append({
                    "visible_text": text_label[:80],
                    "actual_url": url,
                })

    # Extract body contact emails
    body_emails = EMAIL_PATTERN.findall(body_text)
    body_contact_emails = [e for e in set(body_emails) if e.lower() != sender_address.lower() and e.lower() not in [t.lower() for t in to_addrs]]

    return {
        "display_name": display_name,
        "sender_address": sender_address,
        "reply_to_address": reply_to_address,
        "return_path_address": return_path_address,
        "to_addresses": to_addrs,
        "subject": subject,
        "date": date,
        "body": body_text,
        "urls": urls,
        "url": urls[0] if urls else "",
        "link_mismatches": link_mismatches,
        "attachments": [],
        "auth_results": {"spf": "unknown", "dkim": "unknown", "dmarc": "unknown", "raw": "Forwarded message"},
        "received_hop_count": 0,
        "received_headers": [],
        "html_image_count": 0,
        "body_contact_emails": body_contact_emails,
        "is_forwarded": True,
    }


def _parse_rfc822(text: str) -> dict:
    """Standard RFC-822 email parser."""
    msg = email.message_from_string(text, policy=policy.default)

    display_name, sender_address = parseaddr(msg.get("From", ""))
    _, reply_to_address = parseaddr(msg.get("Reply-To", ""))
    _, return_path_address = parseaddr(msg.get("Return-Path", ""))

    subject = msg.get("Subject", "")
    date = msg.get("Date", "")
    to_addrs = [addr for _, addr in getaddresses([msg.get("To", "")])]

    body_text = ""
    html_content = ""
    attachments = []

    if msg.is_multipart():
        for part in msg.walk():
            content_disposition = str(part.get("Content-Disposition", ""))
            content_type = part.get_content_type()

            if "attachment" in content_disposition:
                filename = part.get_filename()
                if filename:
                    attachments.append(filename)
                continue

            if content_type == "text/plain" and not body_text:
                try:
                    body_text = part.get_content()
                except Exception:
                    pass
            elif content_type == "text/html" and not html_content:
                try:
                    html_content = part.get_content()
                except Exception:
                    pass
    else:
        if msg.get_content_type() == "text/html":
            try:
                html_content = msg.get_content()
            except Exception:
                html_content = str(msg.get_payload())
        else:
            try:
                body_text = msg.get_content()
            except Exception:
                body_text = str(msg.get_payload())

    if not body_text and html_content:
        body_text = re.sub(r"<[^>]+>", " ", html_content)
        body_text = re.sub(r"\s+", " ", body_text).strip()

    # URL Extraction
    text_urls = URL_REGEX.findall(body_text)
    href_urls = HREF_REGEX.findall(html_content) if html_content else []
    href_urls = [u for u in href_urls if u.startswith(("http://", "https://"))]
    md_links = MARKDOWN_LINK_REGEX.findall(body_text)
    md_urls = [url for _, url in md_links]
    urls = list(dict.fromkeys(text_urls + href_urls + md_urls))

    # Link mismatches
    link_mismatches = []
    if html_content:
        for href, anchor_text in ANCHOR_REGEX.findall(html_content):
            if not href.startswith(("http://", "https://")):
                continue
            visible_text = re.sub(r"<[^>]+>", "", anchor_text).strip()
            visible_domain_match = re.search(r'([a-z0-9-]+\.[a-z]{2,})', visible_text.lower())
            if visible_domain_match:
                claimed_domain = visible_domain_match.group(1)
                actual_domain = re.sub(r'^https?://', '', href.lower()).split('/')[0].split(':')[0]
                if claimed_domain not in actual_domain and actual_domain not in claimed_domain:
                    link_mismatches.append({
                        "visible_text": visible_text[:80],
                        "actual_url": href,
                    })

    for text_label, url in md_links:
        visible_domain_match = re.search(r'([a-z0-9-]+\.[a-z]{2,})', text_label.lower())
        if visible_domain_match:
            claimed_domain = visible_domain_match.group(1)
            actual_domain = re.sub(r'^https?://', '', url.lower()).split('/')[0].split(':')[0]
            if claimed_domain not in actual_domain and actual_domain not in claimed_domain:
                link_mismatches.append({
                    "visible_text": text_label[:80],
                    "actual_url": url,
                })

    auth_header = msg.get("Authentication-Results", "") or ""
    spf = _extract_auth_result(auth_header, "spf")
    dkim = _extract_auth_result(auth_header, "dkim")
    dmarc = _extract_auth_result(auth_header, "dmarc")

    received_headers = msg.get_all("Received", []) or []
    html_image_count = len(IMG_TAG_REGEX.findall(html_content)) if html_content else 0

    body_emails = EMAIL_PATTERN.findall(body_text)
    body_contact_emails = [e for e in set(body_emails) if e.lower() != sender_address.lower() and e.lower() not in [t.lower() for t in to_addrs]]

    return {
        "display_name": display_name,
        "sender_address": sender_address,
        "reply_to_address": reply_to_address,
        "return_path_address": return_path_address,
        "to_addresses": to_addrs,
        "subject": subject,
        "date": date,
        "body": body_text.strip(),
        "urls": urls,
        "url": urls[0] if urls else "",
        "link_mismatches": link_mismatches,
        "attachments": attachments,
        "auth_results": {"spf": spf, "dkim": dkim, "dmarc": dmarc, "raw": auth_header},
        "received_hop_count": len(received_headers),
        "received_headers": received_headers,
        "html_image_count": html_image_count,
        "body_contact_emails": body_contact_emails,
        "is_forwarded": False,
    }


def _extract_auth_result(auth_header: str, mechanism: str) -> str:
    """Pull 'pass'/'fail'/'none'/'softfail' out of an Authentication-Results header."""
    match = re.search(rf"{mechanism}=(\w+)", auth_header, re.IGNORECASE)
    return match.group(1).lower() if match else "unknown"
