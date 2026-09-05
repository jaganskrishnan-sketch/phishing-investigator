"""
Pydantic data schemas for request validation and structured API responses.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class EmailAnalyzeRequest(BaseModel):
    raw_content: Optional[str] = Field(None, description="Raw RFC-822 email text or forwarded message block")
    search_query: Optional[str] = Field(None, description="Optional search query filter for inbox fetch")


class IndicatorModel(BaseModel):
    category: str
    finding: str
    evidence: str
    points: int
    severity: Optional[str] = "MEDIUM"
    explanation: Optional[str] = ""


class UrlAnalysisItem(BaseModel):
    url: str
    risk: str
    reason: str


class RiskBreakdownModel(BaseModel):
    sender_risk: str
    url_risk: str
    content_risk: str
    auth_risk: str
    social_engineering_risk: str


class TimelineStep(BaseModel):
    step: str
    timestamp: str
    status: str


class IOCSummaryModel(BaseModel):
    sender_domain: Optional[str] = ""
    sender_address: Optional[str] = ""
    url_domain: Optional[str] = None
    malicious_urls: List[str] = []
    attachments: List[str] = []
    contact_addresses: List[str] = []
    threat_ips: List[str] = []


class AuthResultsModel(BaseModel):
    spf: str = "unknown"
    dkim: str = "unknown"
    dmarc: str = "unknown"
    raw: Optional[str] = ""


class EmailAnalysisResponse(BaseModel):
    investigation_id: str
    verdict: str
    risk_score: int
    attack_category: str
    confidence_level: str
    confidence_percentage: int
    indicators: List[IndicatorModel]
    risk_breakdown: RiskBreakdownModel
    url_analysis: List[UrlAnalysisItem]
    timeline: List[TimelineStep]
    llm_summary: str
    recommended_action: str
    mitre_attack_techniques: List[str] = []
    iocs: IOCSummaryModel
    auth_results: AuthResultsModel
    telemetry: Dict[str, Any]
    technical_details: Dict[str, Any] = {}
    analyzed_at: str


class GmailMessageSummary(BaseModel):
    id: str
    subject: str
    sender: str
    date: str
    snippet: str


class UserAuthStatus(BaseModel):
    is_authenticated: bool
    email: Optional[str] = None
    name: Optional[str] = None
    picture: Optional[str] = None
