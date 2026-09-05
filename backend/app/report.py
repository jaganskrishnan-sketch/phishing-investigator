"""
Generates shareable SOC Incident Reports in Markdown and high-quality PDF format.
Includes:
  - Executive Verdict Banner & Risk Meter
  - Threat Categorization & MITRE ATT&CK Mapping
  - Complete Message Telemetry & Authentication Signals (SPF, DKIM, DMARC)
  - Color-Coded Evidence & Indicator Tables
  - Structured IOC Section & Actionable SOC Playbook Recommendations
"""

import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)


def generate_report_markdown(result: dict, analyzed_at: datetime) -> str:
    data = result["raw_input"]
    iocs = result.get("iocs", {})
    score = result.get("risk_score", 0)
    verdict = result.get("verdict", "UNKNOWN")
    category = result.get("attack_category", "Phishing / Malicious Scam")

    lines = []
    lines.append(f"# 🛡️ Security Operations Center (SOC) Incident Report")
    lines.append(f"**Incident Reference:** `INC-{analyzed_at.strftime('%Y%m%d')}-{abs(hash(data.get('sender_address', '') + data.get('subject', '')))%10000:04d}`")
    lines.append(f"**Generated:** {analyzed_at.strftime('%Y-%m-%d %H:%M:%S UTC')}")
    lines.append(f"**Classification:** AI & Multi-Vector Threat Analysis\n")

    lines.append("## 1. Executive Summary")
    lines.append(f"- **Verdict:** **{verdict}**")
    lines.append(f"- **Risk Score:** **{score} / 100**")
    lines.append(f"- **Threat Category:** **{category}**")
    lines.append(f"- **Summary:** {result.get('llm_summary', 'No summary provided.')}\n")

    lines.append("## 2. Message Telemetry & Origin")
    lines.append(f"- **Display Name:** {data.get('display_name') or 'N/A'}")
    lines.append(f"- **Sender Address (From):** `{data.get('sender_address') or 'N/A'}`")
    lines.append(f"- **Reply-To Address:** `{data.get('reply_to_address') or 'N/A'}`")
    lines.append(f"- **Subject:** {data.get('subject') or 'N/A'}")
    lines.append(f"- **Date:** {data.get('date') or 'N/A'}")
    lines.append(f"- **Ingestion Mode:** {'Forwarded Email Block' if data.get('is_forwarded') else 'Direct RFC-822'}\n")

    auth = result.get("auth_results", {})
    if auth:
        lines.append("## 3. Email Authentication Signals")
        lines.append(f"- **SPF:** `{auth.get('spf', 'unknown').upper()}`")
        lines.append(f"- **DKIM:** `{auth.get('dkim', 'unknown').upper()}`")
        lines.append(f"- **DMARC:** `{auth.get('dmarc', 'unknown').upper()}`\n")

    lines.append("## 4. MITRE ATT&CK Technique Mapping")
    mitre_tags = []
    if any(f.get("category") in ("Domain Typosquatting", "Domain Similarity", "Sender Address Spoofing") for f in result["indicators"]):
        mitre_tags.append("- **T1566.002 - Spearphishing Link**: Lookalike or typosquatted domain used to deceive user")
    if any(f.get("category") in ("Credential Harvesting") for f in result["indicators"]):
        mitre_tags.append("- **T1598 - Phishing for Information**: Direct solicitation of credentials, OTPs, or financial secrets")
    if any(f.get("category") in ("Advance-Fee / Scholarship Scam", "Advance-Fee Scam", "Scarcity & Pressure Tactics") for f in result["indicators"]):
        mitre_tags.append("- **T1566 - Phishing (Social Engineering)**: Pretexting via fake academic/internship scholarship with advance fee trap")
    if any(f.get("category") in ("Attachment Risk") for f in result["indicators"]):
        mitre_tags.append("- **T1566.001 - Spearphishing Attachment**: Suspicious or malicious file payload attached")
    if not mitre_tags:
        mitre_tags.append("- **None**: No active attack techniques recognized")
    lines.extend(mitre_tags)
    lines.append("")

    lines.append("## 5. Evidence & Indicator Breakdown")
    if result["indicators"]:
        lines.append("| Severity | Category | Finding | Evidence | Weight |")
        lines.append("|---|---|---|---|---|")
        for f in sorted(result["indicators"], key=lambda x: -x.get("points", 0)):
            pts = f.get("points", 0)
            sev = "HIGH" if pts >= 20 else ("MED" if pts >= 12 else "LOW")
            evidence = str(f.get("evidence", "")).replace("|", "\\|")
            finding = str(f.get("finding", "")).replace("|", "\\|")
            lines.append(f"| **{sev}** | {f.get('category','')} | {finding} | `{evidence}` | +{pts} |")
    else:
        lines.append("*No threat indicators triggered. Message passed all security heuristics.*")
    lines.append("")

    lines.append("## 6. Indicators of Compromise (IOC) Summary")
    lines.append(f"- **Sender Domain:** `{iocs.get('sender_domain') or 'N/A'}`")
    lines.append(f"- **Sender Address:** `{iocs.get('sender_address') or 'N/A'}`")
    
    mal_urls = iocs.get('malicious_urls', [])
    lines.append(f"- **Extracted URLs ({len(mal_urls)}):**")
    if mal_urls:
        for u in mal_urls:
            lines.append(f"  - `{u}`")
    else:
        lines.append("  - None")

    lines.append("")
    lines.append("## 7. Recommended SOC Playbook Action")
    lines.append(f"> **Action Required:** {result.get('recommended_action', 'Review message manually.')}\n")
    return "\n".join(lines)


def generate_report_pdf(result: dict, analyzed_at: datetime) -> bytes:
    """Generates a styled, multi-page ready PDF report using ReportLab."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    PRIMARY = colors.HexColor("#0f172a")
    ACCENT_CYAN = colors.HexColor("#0284c7")
    ACCENT_RED = colors.HexColor("#dc2626")
    ACCENT_AMBER = colors.HexColor("#d97706")
    ACCENT_GREEN = colors.HexColor("#16a34a")
    TEXT_DARK = colors.HexColor("#1e293b")
    BG_LIGHT = colors.HexColor("#f8fafc")
    BORDER_COLOR = colors.HexColor("#cbd5e1")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=PRIMARY,
        spaceAfter=4,
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#64748b"),
        spaceAfter=12,
    )
    section_heading = ParagraphStyle(
        'SecHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11.5,
        leading=15,
        textColor=PRIMARY,
        spaceBefore=10,
        spaceAfter=5,
    )
    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=TEXT_DARK,
    )
    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10.5,
        textColor=TEXT_DARK,
    )
    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10.5,
        textColor=PRIMARY,
    )
    mono_style = ParagraphStyle(
        'MonoText',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor("#0f172a"),
    )

    story = []

    # 1. Header Banner
    story.append(Paragraph("🛡️ SECURITY OPERATIONS CENTER (SOC) - INCIDENT REPORT", title_style))
    incident_ref = f"INC-{analyzed_at.strftime('%Y%m%d')}-{abs(hash(result['raw_input'].get('sender_address', '') + result['raw_input'].get('subject', '')))%10000:04d}"
    story.append(Paragraph(f"<b>Incident Reference:</b> {incident_ref} &nbsp;|&nbsp; <b>Analyzed:</b> {analyzed_at.strftime('%Y-%m-%d %H:%M:%S UTC')} &nbsp;|&nbsp; <b>Engine:</b> Multi-Vector Threat Analyzer", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=ACCENT_CYAN, spaceAfter=10))

    # 2. Verdict Banner
    verdict = result.get("verdict", "UNKNOWN")
    score = result.get("risk_score", 0)
    category = result.get("attack_category", "Threat")

    if "PHISHING" in verdict or "SCAM" in verdict:
        v_color = ACCENT_RED
        v_bg = colors.HexColor("#fee2e2")
    elif "SUSPICIOUS" in verdict:
        v_color = ACCENT_AMBER
        v_bg = colors.HexColor("#fef3c7")
    else:
        v_color = ACCENT_GREEN
        v_bg = colors.HexColor("#dcfce7")

    verdict_html = f"""
    <b><font size="13" color="{v_color.hexval()}">{verdict}</font></b> &nbsp;&nbsp;&nbsp;&nbsp;
    <b>Risk Score:</b> {score}/100 &nbsp;&nbsp;|&nbsp;&nbsp; <b>Threat Category:</b> {category}
    """
    verdict_table = Table([[Paragraph(verdict_html, body_style)]], colWidths=[540])
    verdict_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), v_bg),
        ('BOX', (0, 0), (-1, -1), 1.5, v_color),
        ('PADDING', (0, 0), (-1, -1), 7),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(verdict_table)
    story.append(Spacer(1, 8))

    # 3. Message Telemetry Table
    data = result["raw_input"]
    story.append(Paragraph("1. Message Origin & Telemetry", section_heading))
    
    auth = result.get("auth_results", {})
    auth_summary = f"SPF: {auth.get('spf', 'unknown').upper()} | DKIM: {auth.get('dkim', 'unknown').upper()} | DMARC: {auth.get('dmarc', 'unknown').upper()}"

    telemetry_data = [
        [Paragraph("<b>Sender (From):</b>", table_cell_bold), Paragraph(f"{data.get('display_name', '')} &lt;{data.get('sender_address', 'N/A')}&gt;", table_cell)],
        [Paragraph("<b>Subject:</b>", table_cell_bold), Paragraph(data.get('subject', 'N/A'), table_cell)],
        [Paragraph("<b>Date:</b>", table_cell_bold), Paragraph(data.get('date', 'N/A'), table_cell)],
        [Paragraph("<b>Reply-To:</b>", table_cell_bold), Paragraph(data.get('reply_to_address') or 'None', table_cell)],
        [Paragraph("<b>Authentication:</b>", table_cell_bold), Paragraph(auth_summary, table_cell)],
    ]
    t_table = Table(telemetry_data, colWidths=[100, 440])
    t_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), BG_LIGHT),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('PADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_table)
    story.append(Spacer(1, 8))

    # 4. Summary Box
    story.append(Paragraph("2. Threat Analysis Summary", section_heading))
    summary_p = Paragraph(result.get("llm_summary", "No summary provided."), body_style)
    s_table = Table([[summary_p]], colWidths=[540])
    s_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f1f5f9")),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(s_table)
    story.append(Spacer(1, 8))

    # 5. Indicators Table
    story.append(Paragraph(f"3. Fired Indicators of Compromise ({len(result['indicators'])})", section_heading))
    if result["indicators"]:
        ind_rows = [
            [
                Paragraph("<b>Sev</b>", table_cell_bold),
                Paragraph("<b>Category</b>", table_cell_bold),
                Paragraph("<b>Finding & Rule Description</b>", table_cell_bold),
                Paragraph("<b>Evidence</b>", table_cell_bold),
                Paragraph("<b>Pts</b>", table_cell_bold)
            ]
        ]
        for f in sorted(result["indicators"], key=lambda x: -x.get("points", 0)):
            pts = f.get("points", 0)
            sev_tag = "HIGH" if pts >= 20 else ("MED" if pts >= 12 else "LOW")
            ind_rows.append([
                Paragraph(f"<b>{sev_tag}</b>", table_cell_bold),
                Paragraph(f.get('category', ''), table_cell),
                Paragraph(f.get('finding', ''), table_cell),
                Paragraph(str(f.get('evidence', ''))[:100], mono_style),
                Paragraph(f"+{pts}", table_cell_bold),
            ])
        ind_table = Table(ind_rows, colWidths=[35, 100, 190, 180, 35])
        ind_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#e2e8f0")),
            ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ('PADDING', (0, 0), (-1, -1), 4),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        story.append(ind_table)
    else:
        story.append(Paragraph("<i>No malicious indicators detected. Email conforms to authentic standards.</i>", body_style))
    story.append(Spacer(1, 8))

    # 6. Technical IOCs
    story.append(Paragraph("4. Technical Indicators of Compromise (IOCs)", section_heading))
    iocs = result.get("iocs", {})
    ioc_lines = []
    if iocs.get("sender_domain"):
        ioc_lines.append(f"• <b>Sender Domain:</b> {iocs.get('sender_domain')}")
    if iocs.get("malicious_urls"):
        ioc_lines.append(f"• <b>Extracted URLs ({len(iocs['malicious_urls'])}):</b><br/>" + "<br/>".join([f"&nbsp;&nbsp;- {u}" for u in iocs['malicious_urls'][:4]]))
    if iocs.get("contact_addresses"):
        ioc_lines.append(f"• <b>Discrepant Contacts:</b> {', '.join(iocs.get('contact_addresses'))}")
    
    if not ioc_lines:
        ioc_lines.append("• No external suspicious IOCs identified.")

    ioc_table = Table([[Paragraph("<br/>".join(ioc_lines), body_style)]], colWidths=[540])
    ioc_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), BG_LIGHT),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(ioc_table)
    story.append(Spacer(1, 8))

    # 7. SOC Recommended Action
    story.append(Paragraph("5. Recommended SOC Mitigation Playbook", section_heading))
    action_text = f"<b>Action:</b> {result.get('recommended_action', 'Review manually.')}"
    action_table = Table([[Paragraph(action_text, body_style)]], colWidths=[540])
    action_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#eff6ff")),
        ('BOX', (0, 0), (-1, -1), 1, ACCENT_CYAN),
        ('PADDING', (0, 0), (-1, -1), 7),
    ]))
    story.append(action_table)

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
