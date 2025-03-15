import requests
import dns.resolver
import json
import re
import os
import numpy as np
from tensorflow import keras
from Feature_Extractor import extract_features
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from bs4 import BeautifulSoup
from google import genai
app = Flask(__name__)
CORS(app)

# API Keys
VT_API_KEY = "3ea2281a21cf2df9edd36bd5660fa0eaac196e49397ba87d71f118d98982289e"
WHOIS_API_HOST = "zozor54-whois-lookup-v1.p.rapidapi.com"
WHOIS_API_KEY = "d484df19c6msh9303ca1275ac1a8p191fbcjsn68f3d3e05b82"
SCREENSHOT_API_KEY = "6cf3c4e650cd4fe8acc7511abcbce32c"
SCREENSHOT_DIR = "screenshots"
MODEL_PATH = "Malicious_URL_Prediction.h5"
GEMINI_API_KEY = "AIzaSyDc4B__rW4_zlwePV5xFiaUDOCBEbHtS0s"
OPENPHISH_FEED_URL = "https://openphish.com/feed.txt"

# Ensure screenshot directory exists
if not os.path.exists(SCREENSHOT_DIR):
    os.makedirs(SCREENSHOT_DIR)


def get_dns_records(domain):
    records = {"A": [], "NS": [], "MX": []}
    for record_type in ["A", "NS", "MX"]:
        try:
            records[record_type] = [r.to_text() for r in dns.resolver.resolve(domain, record_type)]
        except:
            records[record_type] = "Not Found"
    return records


def check_virustotal(domain):
    headers = {"x-apikey": VT_API_KEY}
    try:
        response = requests.get(f"https://www.virustotal.com/api/v3/domains/{domain}", headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            results = data.get("data", {}).get("attributes", {}).get("last_analysis_results", {})
            return {
                "malicious_engines": sum(1 for r in results.values() if r["category"] == "malicious"),
                "total_engines": len(results),
                "creation_date": data.get("data", {}).get("attributes", {}).get("creation_date", "Unknown"),
                "reputation": data.get("data", {}).get("attributes", {}).get("reputation", 0)
            }
    except Exception as e:
        print(f"VirusTotal error: {e}")
    return {"error": "Could not fetch from VirusTotal"}


def fetch_openphish():
    try:
        response = requests.get(OPENPHISH_FEED_URL, timeout=10)
        response.raise_for_status()
        return response.text.split("\n")
    except Exception as e:
        print(f"OpenPhish error: {e}")
        return []


def check_openphish(domain, phishing_list):
    return any(domain in url for url in phishing_list if url)


def check_suspicious_patterns(domain):
    suspicious_indicators = []
    if domain.count('-') > 2:
        suspicious_indicators.append("Excessive dashes in domain name")
    if re.search(r"[^a-zA-Z0-9.-]", domain):
        suspicious_indicators.append("Contains unusual symbols")
    return suspicious_indicators


def get_gemini_analysis(url):
    try:
        response = requests.get(url, timeout=10)
        soup = BeautifulSoup(response.content, 'html5lib')

        prompt = f"""
        Analyze the following HTML for security risks:
        - Login form legitimacy
        - Brand impersonation
        - Malicious JavaScript
        - Social engineering
        
        Return JSON format:
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

        gemini_text = response.text.strip()

        # Remove ```json at the start and ``` at the end
        if gemini_text.startswith("```json"):
            gemini_text = gemini_text[7:]
        if gemini_text.endswith("```"):
            gemini_text = gemini_text[:-3]

        # Convert the cleaned response into JSON
        gemini_data = json.loads(gemini_text.strip())

        # Ensure all float32 values are converted to Python float
        gemini_data = json.loads(json.dumps(gemini_data, default=lambda x: float(x)))

        return gemini_data

    except Exception as e:
        print(f"Error in Gemini analysis: {e}")
        return {"risk_score": 0, "risk_factors": [], "confidence": 0}
    

def get_ml_prediction(url):
    try:
        model = keras.models.load_model(MODEL_PATH)
        url_features = np.array([extract_features(url)])
        prediction = model.predict(url_features)
        return float(prediction[0][0] * 100) 
    except Exception as e:
        print(f"ML error: {e}")
        return 0


def get_whois_data(domain):
    url = f"https://{WHOIS_API_HOST}/"
    params = {"domain": domain, "format": "json", "_forceRefresh": "0"}
    headers = {"x-rapidapi-host": WHOIS_API_HOST, "x-rapidapi-key": WHOIS_API_KEY}
    try:
        response = requests.get(url, headers=headers, params=params, timeout=10)
        return response.json() if response.status_code == 200 else {"error": "WHOIS lookup failed"}
    except Exception as e:
        print(f"WHOIS error: {e}")
        return {"error": "WHOIS lookup error"}


def capture_screenshot(url, filename):
    api_url = "https://api.apiflash.com/v1/urltoimage"
    params = {"access_key": SCREENSHOT_API_KEY, "url": url, "wait_until": "page_loaded"}
    try:
        response = requests.get(api_url, params=params, timeout=15)
        if response.status_code == 200:
            filepath = os.path.join(SCREENSHOT_DIR, filename)
            with open(filepath, "wb") as file:
                file.write(response.content)
            return f"/screenshot/{filename}"
        return {"error": "Screenshot capture failed"}
    except Exception as e:
        print(f"Screenshot error: {e}")
        return {"error": "Screenshot error"}


@app.route('/screenshot/<filename>', methods=['GET'])
def get_screenshot(filename):
    return send_from_directory(SCREENSHOT_DIR, filename)


@app.route('/analyze', methods=['POST'])
def analyze_url():
    try:
        data = request.get_json()
        if not data or "url" not in data:
            return jsonify({"error": "URL parameter is missing."}), 400

        url = data["url"]
        domain = url.replace("http://", "").replace("https://", "").split("/")[0]

        dns_data = get_dns_records(domain)
        vt_data = check_virustotal(domain)
        phishing_list = fetch_openphish()
        is_phishing_openphish = check_openphish(domain, phishing_list)
        suspicious_indicators = check_suspicious_patterns(domain)
        gemini_analysis = get_gemini_analysis(url)
        ml_prediction = get_ml_prediction(url)
        whois_data = get_whois_data(domain)
        screenshot_filename = f"{domain}.png"
        screenshot_url = capture_screenshot(url, screenshot_filename)

        risk_factors = [min(50, (vt_data.get("malicious_engines", 0) / max(1, vt_data.get("total_engines", 1))) * 100)]
        if is_phishing_openphish:
            risk_factors.append(30)
        risk_factors.append(min(20, len(suspicious_indicators) * 5))
        risk_factors.append(min(30, ml_prediction / 3.33))

        risk_score = sum(risk_factors)
        confidence = "High" if risk_score >= 70 else "Medium" if risk_score >= 40 else "Low"

        return jsonify({
            "domain": domain,
            "dns_records": dns_data,
            "virustotal": vt_data,
            "openphish_flagged": is_phishing_openphish,
            "suspicious_indicators": suspicious_indicators,
            "risk_score": risk_score,
            "confidence": confidence,
            "ml_prediction": ml_prediction,
            "gemini_analysis": gemini_analysis,
            "whois_data": whois_data,
            "screenshot": screenshot_url
        })

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": "Internal server error"}), 500




if __name__ == '__main__':
    app.run(debug=True, port=5001)
