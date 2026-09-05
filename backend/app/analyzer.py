"""
Core phishing & scam analysis engine.
Combines:
  1. A structured LLM call (the "prompt engineering" part) that reasons
     over the email and returns strict JSON.
  2. Deterministic local checks (typosquat distance, advance-fee lures,
     forms.gle abuse, sender vs contact discrepancy, IP-literal URLs,
     suspicious TLDs, auth failures) that validate the score.
"""

import json
import re
import difflib
import os
from anthropic import Anthropic

_client = None


def get_client():
    """Lazy init so the module can be imported/tested without an API key set."""
    global _client
    if _client is None:
        api_key = os.environ.get("ANTHROPIC_API_KEY")
        if api_key:
            _client = Anthropic(api_key=api_key)
        else:
            _client = Anthropic()
    return _client


# ---------------------------------------------------------------------
# 1. KNOWN BRANDS & DICTIONARIES
# ---------------------------------------------------------------------
KNOWN_BRANDS = {
    "paypal": "paypal.com",
    "microsoft": "microsoft.com",
    "google": "google.com",
    "amazon": "amazon.com",
    "apple": "apple.com",
    "netflix": "netflix.com",
    "facebook": "facebook.com",
    "instagram": "instagram.com",
    "bankofamerica": "bankofamerica.com",
    "chase": "chase.com",
    "wellsfargo": "wellsfargo.com",
    "linkedin": "linkedin.com",
    "dhl": "dhl.com",
    "fedex": "fedex.com",
    "irs": "irs.gov",
    "bookmyshow": "bookmyshow.com",
    "corizo": "corizo.in",
    "nsdc": "nsdcindia.org",
    "aicte": "aicte-india.org",
    "msme": "msme.gov.in",
}

# Major authority brands frequently stacked/name-dropped in scam emails
AUTHORITY_BRANDS = [
    "nsdc", "aicte", "msme", "ibm", "deloitte", "kpmg", "goldman sachs",
    "tcs", "infosys", "wipro", "nit", "vit", "bit", "srm", "dypu",
    "accenture", "cognizant", "capgemini", "mckinsey",
]

URGENCY_PHRASES = [
    "act now", "urgent", "immediately", "suspend", "suspended",
    "verify your account", "will be closed", "24 hours", "48 hours",
    "final notice", "limited time", "click here", "confirm your",
    "unusual activity", "unauthorized", "security alert",
    "your account will be", "expire", "restricted", "account access restricted",
]

SCAM_ADVANCE_FEE_PHRASES = [
    "training fees are applicable", "training fee", "fees are applicable",
    "registration fee", "processing fee", "caution deposit", "refundable fee",
    "nominal fee", "program fee", "pay fee to secure", "slots remaining",
    "scholarship slots remaining", "only 11 scholarship", "exclusive opportunity",
    "flagship summer campaign", "100% placement", "guaranteed placement",
    "letter of recommendation", "lifetime lms access", "all semester students",
    "kindly enroll", "act fast! only", "limited seats",
]

CREDENTIAL_REQUEST_PHRASES = [
    "enter your password", "confirm your password", "verify your password",
    "update your password", "your password", "one-time password", "one time password",
    "otp code", "enter otp", "enter your otp", "enter your pin", "pin number",
    "social security number", "ssn", "card number", "cvv", "cvv2",
    "login credentials", "verify your identity", "confirm your identity",
    "banking details", "account number", "routing number", "wire transfer",
    "gift card", "reset your password", "update your payment",
]

FREE_FORM_HOSTS = {
    "forms.gle", "docs.google.com/forms", "typeform.com", "tally.so",
    "airtable.com", "forms.office.com", "formstack.com", "jotform.com",
    "surveymonkey.com", "cognitoforms.com", "123formbuilder.com",
}

URL_SHORTENERS = {
    "bit.ly", "tinyurl.com", "goo.gl", "t.co", "ow.ly", "is.gd", "buff.ly",
    "rebrand.ly", "cutt.ly", "shorturl.at", "tiny.cc", "rb.gy", "s.id", "lnkd.in",
}

KNOWN_EMAIL_SERVICE_PROVIDERS = {
    "moengage.com", "mailchimp.com", "sendgrid.net", "sendgrid.com",
    "hubspot.com", "hs-sites.com", "klaviyo.com", "constantcontact.com",
    "campaign-monitor.com", "createsend.com", "mailgun.org", "mailgun.net",
    "sparkpost.com", "amazonses.com", "salesforce.com", "marketo.com",
    "braze.com", "iterable.com", "customer.io", "postmarkapp.com",
    "mandrillapp.com", "list-manage.com", "mailerlite.com", "convertkit.com",
    "netcorecloud.net", "pepipost.net", "exacttarget.com",
}

COMMON_EXTERNAL_WHITELIST = {
    "facebook.com", "instagram.com", "twitter.com", "x.com", "linkedin.com",
    "youtube.com", "play.google.com", "apps.apple.com", "apple.com", "google.com",
    "microsoft.com", "bmscdn.com", "cloudfront.net", "akamaihd.net", "fastly.net",
    "branch.io", "app.link", "adjust.com", "appsflyer.com", "pinterest.com",
    "whatsapp.com", "t.me", "stripe.com", "razorpay.com", "paypal.com",
}

DANGEROUS_ATTACHMENT_EXT = [
    ".exe", ".scr", ".bat", ".cmd", ".js", ".vbs", ".jar",
    ".docm", ".xlsm", ".pptm", ".zip", ".iso", ".lnk",
]


# ---------------------------------------------------------------------
# 2. DETERMINISTIC CHECKS
# ---------------------------------------------------------------------
def extract_domain(address_or_url: str) -> str:
    """Pull a bare domain out of an email address or URL."""
    if not address_or_url:
        return ""
    address_or_url = address_or_url.strip().lower()
    if "@" in address_or_url:
        domain = address_or_url.split("@")[-1]
    else:
        domain = re.sub(r"^https?://", "", address_or_url)
        domain = domain.split("/")[0]
    domain = domain.split(":")[0]
    return domain.strip()


def normalize_leetspeak(s: str) -> str:
    s = s.replace("vv", "w")
    table = str.maketrans({'1': 'l', '0': 'o', '3': 'e', '4': 'a', '@': 'a', '5': 's'})
    return s.translate(table)


def check_typosquatting(domain: str):
    """Compare domain against known brand domains using similarity ratio."""
    findings = []
    if not domain:
        return findings

    base = domain.replace("www.", "")
    core = re.split(r"[.\-]", base)[0]
    normalized_core = normalize_leetspeak(core)

    for brand, real_domain in KNOWN_BRANDS.items():
        if normalized_core == brand and base != real_domain and brand not in base.split("."):
            findings.append({
                "category": "Domain Similarity",
                "finding": f"Domain resembles brand '{brand}' using character substitution",
                "evidence": f"'{base}' vs '{real_domain}'",
                "points": 25,
            })
            continue

        ratio = difflib.SequenceMatcher(None, core, brand).ratio()
        if ratio > 0.75 and base != real_domain and brand not in base.split("."):
            findings.append({
                "category": "Domain Similarity",
                "finding": f"Domain resembles brand '{brand}' but is not '{real_domain}'",
                "evidence": f"'{base}' vs '{real_domain}' (similarity {ratio:.2f})",
                "points": 25,
            })
        elif brand in core and base != real_domain:
            findings.append({
                "category": "Domain Similarity",
                "finding": f"Domain contains brand name '{brand}' but is not the official domain",
                "evidence": f"'{base}' is not '{real_domain}'",
                "points": 20,
            })
    return findings


def check_url_structure(urls):
    findings = []
    if isinstance(urls, str):
        urls = [urls] if urls else []

    seen_domains = set()
    for url in urls:
        domain = extract_domain(url)
        if domain in seen_domains:
            continue
        seen_domains.add(domain)

        if re.match(r"^\d{1,3}(\.\d{1,3}){3}$", domain):
            findings.append({
                "category": "URL Analysis",
                "finding": "URL uses a raw IP address instead of a domain name",
                "evidence": url,
                "points": 20,
            })
        if url.startswith("http://"):
            findings.append({
                "category": "URL Analysis",
                "finding": "Link uses insecure HTTP, not HTTPS",
                "evidence": url,
                "points": 10,
            })
        if domain.count("-") >= 2:
            findings.append({
                "category": "URL Analysis",
                "finding": "Domain contains multiple hyphens, common in spoofed domains",
                "evidence": domain,
                "points": 8,
            })
    return findings


def check_urgency_language(subject: str, body: str):
    findings = []
    text = f"{subject} {body}".lower()
    hits = [p for p in URGENCY_PHRASES if p in text]
    if hits:
        findings.append({
            "category": "Urgency Language",
            "finding": "Message uses urgency/fear-based manipulation phrases",
            "evidence": ", ".join(sorted(set(hits))[:6]),
            "points": min(15, 4 * len(set(hits))),
        })
    return findings


def check_scam_advance_fee_language(subject: str, body: str):
    findings = []
    text = f"{subject} {body}".lower()
    hits = [p for p in SCAM_ADVANCE_FEE_PHRASES if p in text]
    
    if hits:
        has_fee = any("fee" in h for h in hits)
        has_scarcity = any("slot" in h or "limited" in h or "fast" in h or "remaining" in h for h in hits)

        if has_fee and has_scarcity:
            findings.append({
                "category": "Scam Heuristics",
                "finding": "High-pressure bait-and-switch: Scholarship/internship offer with mandatory training fees and slot countdown",
                "evidence": ", ".join(f'"{h}"' for h in sorted(set(hits))[:5]),
                "points": 25,
            })
        elif has_fee:
            findings.append({
                "category": "Scam Heuristics",
                "finding": "Educational or internship offer requesting mandatory upfront training/processing fees",
                "evidence": ", ".join(f'"{h}"' for h in sorted(set(hits))[:4]),
                "points": 20,
            })
        elif len(hits) >= 2:
            findings.append({
                "category": "Urgency Language",
                "finding": "Scarcity & pressure tactics used to compel immediate registration",
                "evidence": ", ".join(f'"{h}"' for h in sorted(set(hits))[:4]),
                "points": 12,
            })
    return findings


def check_free_form_abuse(urls):
    findings = []
    if isinstance(urls, str):
        urls = [urls] if urls else []

    seen = set()
    for url in urls:
        url_lower = url.lower()
        for form_host in FREE_FORM_HOSTS:
            if form_host in url_lower and form_host not in seen:
                seen.add(form_host)
                findings.append({
                    "category": "URL Analysis",
                    "finding": f"Uses free unauthenticated form provider ({form_host}) for registration or data collection",
                    "evidence": url,
                    "points": 20,
                })
    return findings


def check_sender_contact_discrepancy(sender_address: str, body_contact_emails: list, body: str):
    findings = []
    if not sender_address or not body_contact_emails:
        return findings

    sender_domain = extract_domain(sender_address)
    for contact in body_contact_emails:
        contact_domain = extract_domain(contact)
        if contact_domain and sender_domain and contact_domain != sender_domain:
            findings.append({
                "category": "Sender Address",
                "finding": "Sender domain differs from the official contact/support domain in the email body",
                "evidence": f"From: {sender_domain} vs Support: {contact_domain}",
                "points": 20,
            })
            break
    return findings


def check_authority_brand_stacking(subject: str, body: str, sender_address: str):
    findings = []
    sender_domain = extract_domain(sender_address)
    text = f"{subject} {body}".lower()

    dropped_brands = []
    for brand in AUTHORITY_BRANDS:
        pattern = rf"\b{re.escape(brand)}\b"
        if re.search(pattern, text):
            if brand not in sender_domain:
                dropped_brands.append(brand.upper())

    if len(dropped_brands) >= 4:
        findings.append({
            "category": "Brand Impersonation",
            "finding": f"Excessive corporate/government name-dropping ({len(dropped_brands)} brands) without matching sender affiliation",
            "evidence": f"Brands: {', '.join(dropped_brands[:6])}",
            "points": 18,
        })
    return findings


def check_attachments(attachments: list):
    findings = []
    for att in attachments:
        att_lower = att.lower().strip()
        for ext in DANGEROUS_ATTACHMENT_EXT:
            if att_lower.endswith(ext):
                findings.append({
                    "category": "Attachment Risk",
                    "finding": f"Attachment has a high-risk extension ({ext})",
                    "evidence": att,
                    "points": 15,
                })
        if att_lower.count(".") >= 2:
            findings.append({
                "category": "Attachment Risk",
                "finding": "Attachment has a double extension (common malware disguise)",
                "evidence": att,
                "points": 15,
            })
    return findings


def check_sender_display_mismatch(display_name: str, sender_address: str):
    findings = []
    if not display_name or not sender_address:
        return findings
    domain = extract_domain(sender_address)
    for brand, real_domain in KNOWN_BRANDS.items():
        if brand in display_name.lower() and domain != real_domain:
            findings.append({
                "category": "Sender Address",
                "finding": f"Display name claims to be '{brand.title()}' but sender domain does not match",
                "evidence": f'"{display_name}" <{sender_address}> — expected domain {real_domain}',
                "points": 20,
            })
    return findings


def check_authentication_results(auth_results: dict):
    findings = []
    if not auth_results:
        return findings

    labels = {"fail": "FAILED", "softfail": "soft-failed", "none": "not present", "unknown": "not evaluated"}

    if auth_results.get("spf") in ("fail", "softfail"):
        findings.append({
            "category": "Email Authentication",
            "finding": f"SPF check {labels.get(auth_results['spf'], auth_results['spf'])} — sending server not authorized for this domain",
            "evidence": f"spf={auth_results['spf']}",
            "points": 20 if auth_results["spf"] == "fail" else 12,
        })
    if auth_results.get("dkim") in ("fail", "none"):
        findings.append({
            "category": "Email Authentication",
            "finding": f"DKIM signature {labels.get(auth_results['dkim'], auth_results['dkim'])} — message integrity/origin cannot be verified",
            "evidence": f"dkim={auth_results['dkim']}",
            "points": 15 if auth_results["dkim"] == "fail" else 8,
        })
    if auth_results.get("dmarc") in ("fail",):
        findings.append({
            "category": "Email Authentication",
            "finding": "DMARC policy check failed — domain owner's own policy rejects this message as unauthenticated",
            "evidence": "dmarc=fail",
            "points": 20,
        })
    return findings


def check_credential_request(subject: str, body: str):
    findings = []
    text = f"{subject} {body}".lower()
    hits = [p for p in CREDENTIAL_REQUEST_PHRASES if p in text]
    if hits:
        findings.append({
            "category": "Credential Harvesting",
            "finding": "Email explicitly requests sensitive information (password/PIN/payment details)",
            "evidence": "Exact phrase(s) found: " + ", ".join(f'"{h}"' for h in sorted(set(hits))[:4]),
            "points": min(25, 10 + 6 * len(set(hits))),
        })
    return findings


def check_url_shorteners(urls):
    findings = []
    if isinstance(urls, str):
        urls = [urls] if urls else []
    seen = set()
    for url in urls:
        domain = extract_domain(url)
        if domain in URL_SHORTENERS and domain not in seen:
            seen.add(domain)
            findings.append({
                "category": "URL Analysis",
                "finding": f"Link uses a URL shortener ({domain}), hiding the real destination",
                "evidence": url,
                "points": 15,
            })
    return findings


def check_link_domain_mismatch(sender_address: str, urls):
    findings = []
    if isinstance(urls, str):
        urls = [urls] if urls else []
    if not sender_address:
        return findings

    sender_domain = extract_domain(sender_address)
    flagged_domains = set()

    for url in urls:
        link_domain = extract_domain(url)
        if not link_domain or link_domain == sender_domain:
            continue
        if sender_domain.endswith("." + link_domain) or link_domain.endswith("." + sender_domain):
            continue
        if link_domain in COMMON_EXTERNAL_WHITELIST or any(link_domain.endswith("." + w) for w in COMMON_EXTERNAL_WHITELIST):
            continue
        if link_domain in KNOWN_EMAIL_SERVICE_PROVIDERS or any(link_domain.endswith("." + esp) for esp in KNOWN_EMAIL_SERVICE_PROVIDERS):
            continue

        flagged_domains.add(link_domain)

    if flagged_domains:
        findings.append({
            "category": "URL Analysis",
            "finding": "Link leads to a domain unrelated to the sender's own domain",
            "evidence": f"Sender: {sender_domain}  →  Links: {', '.join(sorted(flagged_domains)[:2])}",
            "points": 12,
        })
    return findings


def check_reply_to_mismatch(sender_address: str, reply_to_address: str):
    findings = []
    if not reply_to_address:
        return findings
    sender_domain = extract_domain(sender_address) if sender_address else ""
    reply_domain = extract_domain(reply_to_address)
    if sender_domain and reply_domain and sender_domain != reply_domain:
        findings.append({
            "category": "Sender Address",
            "finding": "Reply-To address points to a completely different domain than the sender",
            "evidence": f"From: {sender_domain}  vs  Reply-To: {reply_domain}",
            "points": 20,
        })
    return findings


def check_link_text_mismatch(link_mismatches: list):
    findings = []
    for m in link_mismatches:
        findings.append({
            "category": "URL Analysis",
            "finding": "Link text displays one destination but actually points elsewhere",
            "evidence": f'Text shows "{m["visible_text"]}" but link goes to {m["actual_url"]}',
            "points": 20,
        })
    return findings


def run_deterministic_checks(data: dict):
    findings = []
    sender_domain = extract_domain(data.get("sender_address", ""))
    findings += check_sender_display_mismatch(data.get("display_name", ""), data.get("sender_address", ""))
    findings += check_typosquatting(sender_domain)
    findings += check_url_structure(data.get("urls", data.get("url", "")))
    findings += check_urgency_language(data.get("subject", ""), data.get("body", ""))
    findings += check_scam_advance_fee_language(data.get("subject", ""), data.get("body", ""))
    findings += check_free_form_abuse(data.get("urls", []))
    findings += check_sender_contact_discrepancy(data.get("sender_address", ""), data.get("body_contact_emails", []), data.get("body", ""))
    findings += check_authority_brand_stacking(data.get("subject", ""), data.get("body", ""), data.get("sender_address", ""))
    findings += check_attachments(data.get("attachments", []))
    findings += check_authentication_results(data.get("auth_results", {}))
    findings += check_reply_to_mismatch(data.get("sender_address", ""), data.get("reply_to_address", ""))
    findings += check_link_text_mismatch(data.get("link_mismatches", []))
    findings += check_credential_request(data.get("subject", ""), data.get("body", ""))
    findings += check_url_shorteners(data.get("urls", []))
    findings += check_link_domain_mismatch(data.get("sender_address", ""), data.get("urls", []))
    return findings


# ---------------------------------------------------------------------
# 3. LLM REASONING LAYER
# ---------------------------------------------------------------------
SYSTEM_PROMPT = """You are a phishing analysis engine used by a security operations team.
You will be given raw email metadata: display name, sender address, subject, body, a URL, and attachment names.

Do NOT visit any links. Analyze only the text and structure provided, plus the
deterministic findings already computed by a rule engine (given to you as context).

Your job: add any ADDITIONAL indicators the rule engine would miss — e.g. social
engineering tactics, pretexting, grammar/tone inconsistent with the claimed brand,
mismatched context, suspicious requests (credentials, gift cards, wire transfers),
or anything else a human analyst would flag. Do not repeat findings already listed
in the deterministic findings you're given.

Output ONLY valid JSON, no markdown fences, no preamble, in exactly this schema:

{
  "additional_indicators": [
    {"category": "string", "finding": "string", "evidence": "string", "points": integer}
  ],
  "llm_summary": "one paragraph plain-English summary of why this is or isn't phishing",
  "recommended_action": "one specific, actionable recommendation for the security team"
}

Rules:
- points must be an integer between 0 and 20 per indicator.
- Only include indicators you are confident about; do not pad with speculation.
- If nothing additional is found, return an empty "additional_indicators" list.
- Base recommended_action on severity: e.g. block sender domain, alert affected user,
  quarantine similar emails, force password reset, or "no action needed" if benign.
"""


def call_llm(data: dict, deterministic_findings: list):
    auth = data.get("auth_results", {})
    user_content = f"""EMAIL TO ANALYZE:
Display name: {data.get('display_name', 'N/A')}
Sender address: {data.get('sender_address', 'N/A')}
Reply-To: {data.get('reply_to_address', 'N/A')}
Return-Path: {data.get('return_path_address', 'N/A')}
Subject: {data.get('subject', 'N/A')}
Date: {data.get('date', 'N/A')}
Body: {data.get('body', 'N/A')}
URLs in message: {', '.join(data.get('urls', [])) or data.get('url', 'N/A')}
Attachments: {', '.join(data.get('attachments', [])) or 'None'}
SPF: {auth.get('spf', 'unknown')} | DKIM: {auth.get('dkim', 'unknown')} | DMARC: {auth.get('dmarc', 'unknown')}

DETERMINISTIC FINDINGS ALREADY DETECTED (do not repeat these):
{json.dumps(deterministic_findings, indent=2)}
"""

    response = get_client().messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_content}],
    )

    text = response.content[0].text.strip()
    text = re.sub(r"^```json|```$", "", text, flags=re.MULTILINE).strip()
    return json.loads(text)


# ---------------------------------------------------------------------
# 4. ORCHESTRATOR — EXACT CALIBRATED VERDICT THRESHOLDS
# ---------------------------------------------------------------------
def analyze_email(data: dict):
    deterministic_findings = run_deterministic_checks(data)

    try:
        llm_result = call_llm(data, deterministic_findings)
    except Exception as e:
        if deterministic_findings:
            top_findings = [f['finding'] for f in deterministic_findings[:2]]
            llm_summary = f"Rule engine detected threat indicators: {'; '.join(top_findings)}."
            recommended_action = "Block sender domain and alert recipient to avoid interacting with this message."
        else:
            llm_summary = "No anomalous patterns or phishing indicators detected. The message conforms to authentic communication standards."
            recommended_action = "No immediate security action required."

        llm_result = {
            "additional_indicators": [],
            "llm_summary": llm_summary,
            "recommended_action": recommended_action,
        }

    all_findings = deterministic_findings + llm_result.get("additional_indicators", [])
    total_score = min(100, sum(f.get("points", 0) for f in all_findings))

    # EXACT ORIGINAL THRESHOLDS:
    # 0 to 30: LIKELY SAFE
    # 31 to 65: SUSPICIOUS
    # 66 to 100: PHISHING
    if total_score >= 66:
        verdict = "PHISHING"
    elif total_score >= 31:
        verdict = "SUSPICIOUS"
    else:
        verdict = "LIKELY SAFE"

    sender_domain = extract_domain(data.get("sender_address", ""))
    url_domain = extract_domain(data.get("url", "")) if data.get("url") else None

    return {
        "verdict": verdict,
        "risk_score": total_score,
        "attack_category": "Phishing / Malicious Scam" if total_score >= 31 else "Benign",
        "indicators": all_findings,
        "llm_summary": llm_result.get("llm_summary", ""),
        "recommended_action": llm_result.get("recommended_action", "Review manually."),
        "iocs": {
            "sender_domain": sender_domain,
            "url_domain": url_domain,
            "malicious_urls": data.get("urls", [data.get("url")] if data.get("url") else []),
            "attachments": data.get("attachments", []),
            "contact_addresses": data.get("body_contact_emails", []),
        },
        "auth_results": data.get("auth_results", {}),
        "raw_input": data,
    }
