import requests
import dns.resolver
import json
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from bs4 import BeautifulSoup
from google import genai

app = Flask(__name__)
CORS(app)

VT_API_KEY = "3ea2281a21cf2df9edd36bd5660fa0eaac196e49397ba87d71f118d98982289e"
VT_URL = "https://www.virustotal.com/api/v3/domains/"
OPENPHISH_FEED_URL = "https://openphish.com/feed.txt"
GEMINI_API_KEY = "AIzaSyDc4B__rW4_zlwePV5xFiaUDOCBEbHtS0s"

client = genai.Client(api_key=GEMINI_API_KEY)


def get_dns_records(domain):
    records = {"A": [], "NS": [], "MX": []}
    try:
        records["A"] = [r.to_text() for r in dns.resolver.resolve(domain, "A")]
    except:
        records["A"] = "Not Found"

    try:
        records["NS"] = [r.to_text() for r in dns.resolver.resolve(domain, "NS")]
    except:
        records["NS"] = "Not Found"

    try:
        records["MX"] = [r.to_text() for r in dns.resolver.resolve(domain, "MX")]
    except:
        records["MX"] = "Not Found"

    return records


def check_virustotal(domain):
    headers = {"x-apikey": VT_API_KEY}
    try:
        response = requests.get(VT_URL + domain, headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            results = data.get("data", {}).get("attributes", {}).get("last_analysis_results", {})
            malicious_count = sum(1 for r in results.values() if r["category"] == "malicious")
            suspicious_count = sum(1 for r in results.values() if r["category"] == "suspicious")

            return {
                "malicious_engines": malicious_count,
                "suspicious_engines": suspicious_count,
                "total_engines": len(results),
                "creation_date": data.get("data", {}).get("attributes", {}).get("creation_date", "Unknown"),
                "reputation": data.get("data", {}).get("attributes", {}).get("reputation", 0)
            }
    except Exception as e:
        print(f"Error fetching from VirusTotal: {e}")

    return {"error": "Could not fetch from VirusTotal", "malicious_engines": 0, "total_engines": 1}


def fetch_openphish():
    try:
        response = requests.get(OPENPHISH_FEED_URL, timeout=10)
        response.raise_for_status()
        return response.text.split("\n")
    except requests.exceptions.RequestException as e:
        print(f"Error fetching OpenPhish data: {e}")
        return []


def check_openphish(domain, phishing_list):
    phishing_domains = [url.replace("http://", "").replace("https://", "").split("/")[0] for url in phishing_list if url]
    domain = domain.lower()
    return domain in phishing_domains or any(domain.endswith('.' + d) for d in phishing_domains)


def check_suspicious_patterns(domain):
    suspicious_indicators = []
    domain = domain.lower()

    # Detect excessive dashes or special characters
    if domain.count("-") > 2:
        suspicious_indicators.append("Excessive use of dashes in domain name")
    if re.search(r'[^a-z0-9.-]', domain):
        suspicious_indicators.append("Contains special characters in domain name")

    # Check for typo-squatting in Indian banks
    indian_banks = [
        "hdfcbank.com", "icicibank.com", "sbi.co.in", "axisbank.com",
        "pnbindia.in", "bankofbaroda.in", "canarabank.com", "unionbankofindia.co.in"
    ]
    for bank in indian_banks:
        base_bank = bank.split('.')[0]
        if base_bank in domain and domain != bank and not domain.endswith('.' + bank):
            suspicious_indicators.append(f"Possible typo-squatting of {bank}")

    # Check for excessive subdomains
    if domain.count('.') > 2:
        suspicious_indicators.append("Excessive number of subdomains")

    # Suspicious TLDs
    suspicious_tlds = [".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top", ".club"]
    if any(domain.endswith(tld) for tld in suspicious_tlds):
        suspicious_indicators.append("Uses suspicious TLD commonly associated with phishing")

    # Check for numeric patterns
    if re.search(r'\d{4,}', domain):
        suspicious_indicators.append("Contains long numeric sequences")

    return suspicious_indicators


def analyze_webpage(url):
    try:
        response = requests.get(url, timeout=10)
        soup = BeautifulSoup(response.content, 'html5lib')

        prompt = f"""
        Analyze the following HTML content for security risks:
        1. Login forms
        2. Brand impersonation
        3. Malicious JavaScript
        4. Social engineering
        5. Suspicious redirects
        6. Hidden elements

        Return JSON with:
        {{
            "risk_score": float,
            "risk_factors": list,
            "confidence": float
        }}

        HTML Content:
        {soup.prettify()}
        """

        response = client.models.generate_content(
            model="gemini-2.0-flash", contents=prompt
        )

        cleaned_response = response.text.strip('```')

        if cleaned_response.startswith('json'):
            cleaned_response = cleaned_response[len('json'):].strip()

        return json.loads(cleaned_response)
    except Exception as e:
        print("Error analyzing webpage with Gemini:", str(e))
        return {"error": "Gemini analysis failed"}


@app.route('/analyze', methods=['POST'])
def analyze_url():
    try:
        data = request.get_json()
        if not data or "url" not in data:
            return jsonify({"error": "URL parameter is missing."}), 400

        url = data["url"]
        if not url.startswith("http"):
            url = "http://" + url
        domain = url.replace("http://", "").replace("https://", "").split("/")[0]

        dns_data = get_dns_records(domain)
        vt_data = check_virustotal(domain)
        phishing_list = fetch_openphish()
        is_phishing_openphish = check_openphish(domain, phishing_list)
        suspicious_indicators = check_suspicious_patterns(domain)

        # Perform webpage analysis with Gemini
        gemini_analysis = analyze_webpage(url)

        # Risk Score Calculation
        risk_factors = []
        vt_score = (vt_data.get("malicious_engines", 0) / max(1, vt_data.get("total_engines", 1))) * 100
        risk_factors.append(min(50, vt_score))

        if is_phishing_openphish:
            risk_factors.append(30)

        risk_factors.append(min(20, len(suspicious_indicators) * 5))
        if "risk_score" in gemini_analysis:
            risk_factors.append(min(50, gemini_analysis["risk_score"] * 100))

        risk_score = sum(risk_factors)

        confidence = "High" if risk_score >= 70 else "Medium" if risk_score >= 40 else "Low" if risk_score >= 20 else "Very Low"
        is_phishing = risk_score >= 75 or is_phishing_openphish

        result = {
            "domain": domain,
            "dns_records": dns_data,
            "virustotal": vt_data,
            "openphish_flagged": is_phishing_openphish,
            "suspicious_indicators": suspicious_indicators,
            "risk_score": risk_score,
            "is_phishing": is_phishing,
            "confidence": confidence,
            "gemini_analysis": gemini_analysis
        }

        return jsonify(result)

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": "Internal server error"}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5001)
