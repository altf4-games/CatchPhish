import requests
import dns.resolver
import json
import re
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# VirusTotal API Key (Replace with your key)
VT_API_KEY = "3ea2281a21cf2df9edd36bd5660fa0eaac196e49397ba87d71f118d98982289e"
VT_URL = "https://www.virustotal.com/api/v3/domains/"
OPENPHISH_FEED_URL = "https://openphish.com/feed.txt"

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
            
            # Include more detailed information
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
        return response.text.split("\n")  # Convert feed to a list of URLs
    except requests.exceptions.RequestException as e:
        print(f"Error fetching OpenPhish data: {e}")
        return []

def check_openphish(domain, phishing_list):
    # Extract domains from the phishing URLs for proper comparison
    phishing_domains = []
    for url in phishing_list:
        if url:  # Skip empty lines
            try:
                phish_domain = url.replace("http://", "").replace("https://", "").split("/")[0]
                phishing_domains.append(phish_domain.lower())
            except:
                pass
    
    domain = domain.lower()
    # Exact match or subdomain match
    return domain in phishing_domains or any(domain.endswith('.' + d) for d in phishing_domains)

def check_suspicious_patterns(domain):
    suspicious_indicators = []
    
    # Lowercase for consistent checking
    domain = domain.lower()
    
    # Check for common brand names in domain but not exact matches
    popular_brands = {
        "google": "google.com", 
        "facebook": "facebook.com", 
        "microsoft": "microsoft.com", 
        "apple": "apple.com", 
        "amazon": "amazon.com", 
        "paypal": "paypal.com", 
        "netflix": "netflix.com",
        "instagram": "instagram.com",
        "twitter": "twitter.com",
        "linkedin": "linkedin.com",
        "bank": None  # Generic financial term
    }
    
    for brand, official_domain in popular_brands.items():
        if brand in domain:
            if official_domain and domain != official_domain and not domain.endswith('.' + official_domain):
                suspicious_indicators.append(f"Contains '{brand}' but is not the official domain")
    
    # Check for excessive subdomains (common in phishing)
    if domain.count('.') > 2:
        suspicious_indicators.append("Excessive number of subdomains")
    
    # Check for suspicious TLDs often used in phishing
    suspicious_tlds = [".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top", ".club"]
    if any(domain.endswith(tld) for tld in suspicious_tlds):
        suspicious_indicators.append("Uses suspicious TLD commonly associated with phishing")
    
    # Check for random-looking or unusually long domains
    if len(domain.split('.')[0]) > 15:
        suspicious_indicators.append("Unusually long domain name")
    
    # Check for numeric patterns (often in phishing domains)
    if re.search(r'\d{4,}', domain):
        suspicious_indicators.append("Contains long numeric sequences")
    
    # Check for character substitution (common phishing tactic)
    substitutions = [
        ('0', 'o'), ('1', 'l'), ('5', 's'), ('vv', 'w'), ('rn', 'm')
    ]
    
    for sub_pair in substitutions:
        if sub_pair[0] in domain:
            suspicious_indicators.append(f"Contains potential character substitution: '{sub_pair[0]}' for '{sub_pair[1]}'")
    
    return suspicious_indicators

@app.route('/analyze', methods=['POST'])
def analyze_url():
    try:
        data = request.get_json()
        if not data or "url" not in data:
            return jsonify({"error": "URL parameter is missing."}), 400

        url = data["url"]
        print(f"Received URL: {url}")  # Debugging

        # Clean and normalize the URL
        if not url.startswith("http"):
            url = "http://" + url
        
        # Extract domain from URL (remove http/https)
        domain = url.replace("http://", "").replace("https://", "").split("/")[0]

        # Perform analysis
        dns_data = get_dns_records(domain)
        vt_data = check_virustotal(domain)
        phishing_list = fetch_openphish()
        is_phishing_openphish = check_openphish(domain, phishing_list)
        
        # Check for suspicious patterns
        suspicious_indicators = check_suspicious_patterns(domain)
        
        # Calculate comprehensive risk score (0-100)
        risk_factors = []
        
        # VT score factor (0-50 points)
        if "malicious_engines" in vt_data and "total_engines" in vt_data:
            vt_score = (vt_data["malicious_engines"] / max(1, vt_data["total_engines"])) * 100
            risk_factors.append(min(50, vt_score))
            
            # Add points for suspicious engines
            if "suspicious_engines" in vt_data:
                suspicious_score = (vt_data["suspicious_engines"] / max(1, vt_data["total_engines"])) * 30
                risk_factors.append(min(10, suspicious_score))
        
        # OpenPhish factor (0 or 30 points)
        if is_phishing_openphish:
            risk_factors.append(30)
        
        # Suspicious indicators (up to 20 points)
        risk_factors.append(min(20, len(suspicious_indicators) * 5))
        
        # Final risk score
        risk_score = sum(risk_factors)
        
        # Determine phishing confidence level
        if risk_score >= 70:
            confidence = "High"
        elif risk_score >= 40:
            confidence = "Medium"
        elif risk_score >= 20:
            confidence = "Low"
        else:
            confidence = "Very Low"
        
        # Determine if phishing based on comprehensive analysis
        is_phishing = risk_score >= 40 or is_phishing_openphish

        result = {
            "domain": domain,
            "dns_records": dns_data,
            "virustotal": vt_data,
            "openphish_flagged": is_phishing_openphish,
            "suspicious_indicators": suspicious_indicators,
            "risk_score": risk_score,
            "is_phishing": is_phishing,
            "confidence": confidence,
            "analysis_details": {
                "vt_score": vt_data.get("malicious_engines", 0),
                "vt_total": vt_data.get("total_engines", 0),
                "suspicious_indicators_count": len(suspicious_indicators),
                "openphish_detected": is_phishing_openphish
            }
        }

        return jsonify(result)

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)