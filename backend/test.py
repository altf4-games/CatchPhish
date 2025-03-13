import requests
import dns.resolver
import json
import re
import numpy as np
from tensorflow import keras
from Feature_Extractor import extract_features
from flask import Flask, request, jsonify
from flask_cors import CORS
from bs4 import BeautifulSoup
from google import genai

app = Flask(__name__)
CORS(app)

# VirusTotal API Key (Replace with your key)
VT_API_KEY = "3ea2281a21cf2df9edd36bd5660fa0eaac196e49397ba87d71f118d98982289e"
VT_URL = "https://www.virustotal.com/api/v3/domains/"
OPENPHISH_FEED_URL = "https://openphish.com/feed.txt"
MODEL_PATH = "Malicious_URL_Prediction.h5"
GEMINI_API_KEY = "AIzaSyDc4B__rW4_zlwePV5xFiaUDOCBEbHtS0s"


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
    return domain in phishing_domains or any(domain.endswith('.' + d) for d in phishing_domains)


def check_suspicious_patterns(domain):
    suspicious_indicators = []
    
    # Check for excessive dashes or special symbols
    if domain.count('-') > 2:
        suspicious_indicators.append("Excessive dashes in domain name")
    if re.search(r"[^a-zA-Z0-9.-]", domain):
        suspicious_indicators.append("Contains unusual symbols")

    # Check for typo-squatting of Indian banks
    indian_banks = ["sbi", "hdfc", "icici", "axis", "kotak", "yesbank", "pnb", "bob", "idbi", "rbl"]
    for bank in indian_banks:
        if bank in domain and domain != f"{bank}.com":
            suspicious_indicators.append(f"Potential typo-squatting of {bank.upper()} Bank")

    return suspicious_indicators


def get_gemini_analysis(url):
    try:
        response = requests.get(url, timeout=10)
        soup = BeautifulSoup(response.content, 'html5lib')
        
        prompt = f"""
        Analyze the following HTML content for potential security risks:
        1. Login form legitimacy
        2. Brand impersonation
        3. Malicious JavaScript patterns
        4. Social engineering attempts
        5. Suspicious redirects
        6. Hidden elements or obfuscation
        
        Return JSON:
        {{
            "risk_score": float,
            "risk_factors": list,
            "confidence": float
        }}
        
        HTML Content:
        {soup.prettify()}
        """

        client = genai.Client(api_key=GEMINI_API_KEY)
        response = client.models.generate_content(model="gemini-2.0-flash", contents=prompt)
        return json.loads(response.text)
    except Exception as e:
        print(f"Error in Gemini analysis: {e}")
        return {"risk_score": 0, "risk_factors": [], "confidence": 0}


def get_ml_prediction(url):
    try:
        model = keras.models.load_model(MODEL_PATH)
        url_features = np.array([extract_features(url)])
        prediction = model.predict(url_features)
        return round(prediction[0][0] * 100, 3)
    except Exception as e:
        print(f"Error in ML prediction: {e}")
        return 0


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
        gemini_analysis = get_gemini_analysis(url)
        ml_prediction = get_ml_prediction(url)

        risk_factors = []
        vt_score = (vt_data["malicious_engines"] / max(1, vt_data["total_engines"])) * 100
        risk_factors.append(min(50, vt_score))
        
        if is_phishing_openphish:
            risk_factors.append(30)
        
        risk_factors.append(min(20, len(suspicious_indicators) * 5))
        risk_factors.append(min(30, ml_prediction / 3.33))

        risk_score = sum(risk_factors)
        confidence = "High" if risk_score >= 70 else "Medium" if risk_score >= 40 else "Low" if risk_score >= 20 else "Very Low"
        is_phishing = risk_score >= 40 or is_phishing_openphish

        return jsonify({
            "domain": domain,
            "dns_records": dns_data,
            "virustotal": vt_data,
            "openphish_flagged": is_phishing_openphish,
            "suspicious_indicators": suspicious_indicators,
            "risk_score": risk_score,
            "is_phishing": is_phishing,
            "confidence": confidence,
            "ml_prediction": ml_prediction,
            "gemini_analysis": gemini_analysis
        })

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": "Internal server error"}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5001)
