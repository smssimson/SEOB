#!/usr/bin/env python3
"""S:ARCH official construction wage watcher (fail-closed).

Checks the Korea Construction Association's latest wage report twice a month.
Updates survey/cost-data.json only after parsing three expected professions and
cross-checking period, effective date and plausible amounts. Does NOT invent or
treat material prices as official. On inaccessible/changed reports, writes a
status file for GitHub Actions to open a review issue.
"""
from __future__ import annotations
import datetime as dt
import io
import json
import os
import re
import sys
import zipfile
from pathlib import Path
from urllib.parse import urljoin, urlparse, parse_qs

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "survey" / "cost-data.json"
STATUS = ROOT / "cost-update-status.txt"
LIST_URL = "https://www.cak.or.kr/lay1/bbs/S1T41C42/A/14/list.do"
BASE_URL = "https://www.cak.or.kr"
UA = "SARCH-Cost-Refresh/1.0 (public statistical bulletins; source attribution)"
WANTED = {"normal": "보통인부", "special": "특별인부", "plaster": "미장공"}
REPORT_RE = re.compile(r"(20\d{2})년\s*(상|하)반기.{0,55}(?:건설업\s*임금실태|임금실태\s*조사)", re.S)


def get(url: str, session: requests.Session) -> requests.Response:
    u = urlparse(url)
    if u.scheme != "https" or not (u.hostname or "").endswith("cak.or.kr"):
        raise ValueError("Untrusted official host: " + url)
    r = session.get(url, timeout=25, allow_redirects=True)
    r.raise_for_status()
    if len(r.content) > 15 * 1024 * 1024:
        raise ValueError("Download too large")
    return r


def text_report_from_hwpx(raw: bytes) -> str:
    from lxml import etree
    z = zipfile.ZipFile(io.BytesIO(raw))
    out = []
    for name in z.namelist():
        if not name.startswith("Contents/section") or not name.endswith(".xml"):
            continue
        root = etree.fromstring(z.read(name))
        for row in root.xpath("//*[local-name()='tr']"):
            cells = [" ".join(c.xpath(".//*[local-name()='t']/text()")) for c in row.xpath("./*[local-name()='tc']")]
            if cells:
                out.append(" | ".join(cells))
        out.append(" ".join(root.xpath("//*[local-name()='t']/text()")))
    return "\n".join(out)


def text_report(raw: bytes, url: str) -> str:
    if raw[:4] == b"%PDF":
        from pypdf import PdfReader
        pdf = PdfReader(io.BytesIO(raw))
        return "\n".join(p.extract_text(extraction_mode="layout") or "" for p in list(pdf.pages)[:35])
    if raw[:2] == b"PK":
        return text_report_from_hwpx(raw)
    raise ValueError("Unsupported attachment format: " + url)


def parse_wages(raw: str) -> dict:
    # Each table row contains occupation name followed by the latest wage.
    wages = {}
    normalized = re.sub(r"[ \t]+", " ", raw.replace("\u00a0", " "))
    for key, occupation in WANTED.items():
        rows = [r for r in normalized.splitlines() if occupation in r]
        found = None
        for row in rows:
            tail = row.split(occupation, 1)[-1]
            tokens = re.findall(r"(?<!\d)(?:[1-9]\d{1,2},\d{3}|[1-9]\d{5})(?!\d)", tail)
            if tokens:
                found = int(tokens[0].replace(",", ""))
                break
        if found is None or not 80000 <= found <= 700000:
            raise ValueError("Missing/unverified wage row for " + occupation)
        wages[key] = found
    return wages


def candidate_links(html: str, page_url: str, session: requests.Session):
    soup = BeautifulSoup(html, "html.parser")
    candidates = {}
    for tag in soup.select("a"):
        title = tag.get_text(" ", strip=True)
        parent_text = tag.parent.get_text(" ", strip=True)[:350] if tag.parent else title
        target = title if REPORT_RE.search(title) else parent_text
        match = REPORT_RE.search(target)
        if not match:
            continue
        year, h = int(match.group(1)), match.group(2)
        if year < 2026:
            continue
        href = tag.get("href", "")
        m = re.search(r"article_seq[=,'\"\s(]+(\d{5,9})", href + " " + tag.get("onclick", ""))
        if m:
            view = urljoin(page_url, "view.do?article_seq=" + m.group(1))
        elif href.startswith("http") or href.startswith("view.do"):
            view = urljoin(page_url, href)
        else:
            continue
        candidates[(year, "H2" if h == "하" else "H1")] = view
    return sorted(candidates.items(), reverse=True)


def find_attachments(view_html: str, view_url: str):
    soup = BeautifulSoup(view_html, "html.parser")
    urls = []
    for a in soup.find_all("a"):
        href, onclick = a.get("href", ""), a.get("onclick", "")
        text = a.get_text(" ", strip=True).lower()
        guess = href + " " + onclick
        match = re.search(r"(https?://[^'\" ]+/download\.do\?uuid=[^'\" )]+|/download\.do\?uuid=[^'\" )]+|download\.do\?uuid=[^'\" )]+)", guess)
        if match:
            urls.append(urljoin(view_url, match.group(1)))
        elif re.search(r"\.(pdf|hwpx)(?:\?|$)", href, re.I) and ("보고서" in text or "붙임" in text):
            urls.append(urljoin(view_url, href))
    return list(dict.fromkeys(urls))


def main():
    today = dt.date.today()
    current = json.loads(TARGET.read_text(encoding="utf-8"))
    existing = (current["rateYear"], 2 if current["half"] == "H2" else 1)
    status = []
    ses = requests.Session()
    ses.headers["User-Agent"] = UA

    try:
        listing = get(LIST_URL, ses)
        candidates = candidate_links(listing.text, listing.url, ses)
        if not candidates:
            raise ValueError("No usable CAK bulletin links detected; layout may have changed.")
        for (year, half), view in candidates:
            period = (year, 2 if half == "H2" else 1)
            if period <= existing:
                break
            effective = dt.date(year, 9 if half == "H2" else 1, 1)
            if effective > today:
                continue
            try:
                page = get(view, ses)
                attachments = find_attachments(page.text, page.url)
                if not attachments:
                    raise ValueError("No PDF/HWPX attachment link found.")
                parsed = None
                for link in attachments:
                    try:
                        report = text_report(get(link, ses).content, link)
                        parsed = parse_wages(report)
                        break
                    except Exception as err:
                        status.append(f"{link}: {err}")
                if parsed is None:
                    raise ValueError("Cannot extract 3 verified wages.")
                old = current["wagesKRWPerDay"]
                # Reject anomalous changes rather than writing wrong wages.
                if any(not 0.72 < parsed[k] / old[k] < 1.45 for k in parsed):
                    raise ValueError("Unusual wage delta - requires manual verification.")
                current.update(rateYear=year, half=half, effectiveFrom=effective.isoformat(),
                               checkedAt=today.isoformat(), wagesKRWPerDay=parsed,
                               publisher="대한건설협회", status="published",
                               sourceUrl=view)
                TARGET.write_text(json.dumps(current, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
                print(f"VERIFIED {year} {half} CAK wages updated: {parsed}")
                STATUS.write_text("ok", encoding="utf-8")
                return
            except Exception as err:
                status.append(f"{year} {half}: {err}")
    except Exception as err:
        status.append(f"CAK fetch: {err}")

    date_need = (today.year, 2 if today.month >= 9 else 1)
    if date_need > existing or status and any(re.search(r"20\d\d H[12]:", q) for q in status):
        STATUS.write_text("REVIEW_NEEDED\n" + "\n".join(status)[:2500], encoding="utf-8")
    else:
        STATUS.write_text("ok", encoding="utf-8")
    print(STATUS.read_text(encoding="utf-8"))

if __name__ == "__main__":
    main()
