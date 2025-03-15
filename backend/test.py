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
from docx import Document
import smtplib
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
import logging

app = Flask(__name__)
CORS(app)

# API and configuration keys
VT_API_KEY = "3ea2281a21cf2df9edd36bd5660fa0eaac196e49397ba87d71f118d98982289e"
WHOIS_API_HOST = "zozor54-whois-lookup-v1.p.rapidapi.com"
WHOIS_API_KEY = "d484df19c6msh9303ca1275ac1a8p191fbcjsn68f3d3e05b82"
SCREENSHOT_API_KEY = "6cf3c4e650cd4fe8acc7511abcbce32c"
SCREENSHOT_DIR = "screenshots"
MODEL_PATH = "Malicious_URL_Prediction.h5"
GEMINI_API_KEY = "AIzaSyDc4B__rW4_zlwePV5xFiaUDOCBEbHtS0s"
OPENPHISH_FEED_URL = "https://openphish.com/feed.txt"

# CERT-In report configuration
CONFIG = {
    "template_path": "./templates/certin_form.docx",
    "output_dir": "filled_reports/",
    "processed_dir": "processed_files/",
    "watch_dir": "incoming_json/",
    "sender_email": "chiragsolanki9821@gmail.com",
    "sender_password": "ekly segp gngi jjzw",  # Use environment variables in production
    "cert_in_email": "cygnusprofile@gmail.com",
}

if not os.path.exists(SCREENSHOT_DIR):
    os.makedirs(SCREENSHOT_DIR)
for dir_path in [CONFIG["output_dir"], CONFIG["processed_dir"]]:
    os.makedirs(dir_path, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.FileHandler("cert_reporting.log"), logging.StreamHandler()]
)
logger = logging.getLogger("cert_reporter")

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
        if gemini_text.startswith("```json"):
            gemini_text = gemini_text[7:]
        if gemini_text.endswith("```"):
            gemini_text = gemini_text[:-3]
        gemini_data = json.loads(gemini_text.strip())
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

def get_risk_factors(gemini_analysis):
    if not gemini_analysis or not gemini_analysis.get("risk_factors"):
        return "No specific risk factors identified."
    return "\n".join([f"- {factor}" for factor in gemini_analysis["risk_factors"]])

def format_datetime(timestamp):
    if not timestamp:
        return "Unknown"
    try:
        dt = datetime.fromtimestamp(timestamp)
        return dt.strftime("%d/%m/%Y %H:%M UTC")
    except:
        return "Invalid timestamp"

def extract_location_from_whois(whois_data):
    if not whois_data or not whois_data.get("contacts"):
        return "Unknown"
    contacts = whois_data.get("contacts", {})
    for contact_type in ["owner", "admin", "tech"]:
        if contact_type in contacts and contacts[contact_type]:
            contact = contacts[contact_type][0]
            country = contact.get("country", "")
            state = contact.get("state", "")
            city = contact.get("city", "")
            if country:
                location_parts = [part for part in [city, state, country] if part]
                return ", ".join(location_parts)
    return "Unknown"

def extract_registrar_info(whois_data):
    if not whois_data or not whois_data.get("registrar"):
        return "Unknown"
    registrar = whois_data.get("registrar", {})
    return registrar.get("name", "Unknown")

def extract_ip_info(dns_records):
    if not dns_records or not dns_records.get("A"):
        return "Unknown"
    ip_addresses = dns_records.get("A", [])
    return ", ".join(ip_addresses) if ip_addresses else "Unknown"

def generate_unique_filename(domain, base_dir):
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    sanitized_domain = ''.join(c if c.isalnum() else '_' for c in domain)
    return os.path.join(base_dir, f"cert_report_{sanitized_domain}_{timestamp}.docx")

def process_phishing_report(phishing_data):
    try:
        domain = phishing_data.get("domain", "Unknown")
        risk_score = phishing_data.get("risk_score", 0)
        confidence = phishing_data.get("confidence", "Unknown")
        gemini_analysis = phishing_data.get("gemini_analysis", {})
        whois_data = phishing_data.get("whois_data", {})
        dns_records = phishing_data.get("dns_records", {})
        virustotal = phishing_data.get("virustotal", {})
        creation_time = virustotal.get("creation_date", None)
        detection_time = datetime.now().timestamp()
        phishing_details = {
            "[PHISHING_URL]": f"http://{domain}",
            "[IP_ADDRESS]": extract_ip_info(dns_records),
            "[OS_DETAILS]": "Unknown (Hosting Server Details Not Available)",
            "[CLOUD_DETAILS]": f"Hosted by {extract_registrar_info(whois_data)}",
            "[AFFECTED_APP]": f"Potential phishing website at {domain}",
            "[LOCATION]": extract_location_from_whois(whois_data),
            "[ISP_DETAILS]": f"{extract_registrar_info(whois_data)}, IP: {extract_ip_info(dns_records)}",
            "[OCCURRENCE_TIME]": format_datetime(creation_time),
            "[DETECTION_TIME]": format_datetime(detection_time),
            "[INCIDENT_DESCRIPTION]": (
                f"A potential phishing website was detected at {domain}. "
                f"Risk Score: {risk_score}/10 (Confidence: {confidence}). "
                f"The site was created on {format_datetime(creation_time)}. "
                f"\n\nRisk Analysis:\n{get_risk_factors(gemini_analysis)}"
                f"\n\nThe domain is registered with {extract_registrar_info(whois_data)}. "
                f"VirusTotal scan shows {virustotal.get('malicious_engines', 0)} engines flagged this domain as malicious "
                f"out of {virustotal.get('total_engines', 0)} total engines. "
                f"Immediate intervention is recommended to prevent potential data theft and financial fraud."
            )
        }
        output_path = generate_unique_filename(domain, CONFIG["output_dir"])
        doc = Document(CONFIG["template_path"])
        for para in doc.paragraphs:
            for key, value in phishing_details.items():
                if key in para.text:
                    para.text = para.text.replace(key, value)
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    for key, value in phishing_details.items():
                        if key in cell.text:
                            cell.text = cell.text.replace(key, value)
        doc.save(output_path)
        logger.info(f"Report for {domain} saved to {output_path}!")
        return phishing_details, output_path
    except Exception as e:
        logger.error(f"Error processing phishing report: {e}")
        return None, None

def send_cert_email(sender_email, sender_password, cert_in_email, report_file_path, phishing_details):
    try:
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = cert_in_email
        domain = phishing_details.get('[PHISHING_URL]', 'Unknown URL').replace('http://', '')
        msg['Subject'] = f"URGENT: Phishing Report - {domain}"
        email_body = f"""
Dear CERT-In Team,

Please find attached the phishing incident report generated by our automated detection system. This report provides all necessary details for immediate action.

**Key Details:**
- **Phishing URL:** {phishing_details.get('[PHISHING_URL]', 'Unknown')}
- **Risk Score:** {phishing_details.get('[INCIDENT_DESCRIPTION]', '').split('Risk Score: ')[1].split(' ')[0] if 'Risk Score: ' in phishing_details.get('[INCIDENT_DESCRIPTION]', '') else 'Unknown'}
- **IP Address:** {phishing_details.get('[IP_ADDRESS]', 'Unknown')}
- **Incident Detection:** {phishing_details.get('[DETECTION_TIME]', 'Unknown')}

{phishing_details.get('[INCIDENT_DESCRIPTION]', '').split("\n\n")[0]}

We request your urgent intervention to take down this phishing site to protect users from potential fraud.

Best regards,
CatchPhish AI Security Team
contact@catchphish.com
"""
        msg.attach(MIMEText(email_body, 'plain'))
        with open(report_file_path, "rb") as attachment:
            part = MIMEBase("application", "octet-stream")
            part.set_payload(attachment.read())
            encoders.encode_base64(part)
            part.add_header("Content-Disposition", f"attachment; filename={os.path.basename(report_file_path)}")
            msg.attach(part)
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, cert_in_email, msg.as_string())
        server.quit()
        logger.info(f"Phishing report for {domain} sent to CERT-In!")
        return True
    except Exception as e:
        logger.error(f"Error sending email: {e}")
        return False

@app.route('/generate-certin-report', methods=['POST'])
def generate_certin_report():
    try:
        data = request.json
        report_data = json.loads(data['reportData'])
        domain = report_data.get('domain', 'unknown domain')
        phishing_details, output_path = process_phishing_report(report_data)
        print(phishing_details, output_path)
        if phishing_details and output_path:
            success = send_cert_email(
                CONFIG["sender_email"], 
                CONFIG["sender_password"], 
                CONFIG["cert_in_email"], 
                output_path, 
                phishing_details
            )
            if success:
                return jsonify({
                    'success': True,
                    'message': 'CERT-In report successfully generated and sent.'
                })
            else:
                return jsonify({
                    'success': False,
                    'message': 'Generated report but failed to send email.'
                })
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to process phishing report.'
            })
    except Exception as e:
        logger.error(f"Error in generate_certin_report: {e}")
        return jsonify({
            'success': False,
            'message': f'Error processing request: {str(e)}'
        })

if __name__ == '__main__':
    app.run(debug=True, port=5001)
