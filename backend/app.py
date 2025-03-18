import os
import json
import requests
from flask import Blueprint, request, jsonify, send_file

# =======================
# Configuration
# =======================
MOBSF_URL = "http://localhost:8000"
API_KEY = "1d2a1e38c27d6d0609e1a57b146674f7c5a40014a701967df8fa6c769e21b511"
UPLOAD_FOLDER = 'uploads'
REPORTS_FOLDER = 'reports'

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(REPORTS_FOLDER, exist_ok=True)

# Create a blueprint to integrate into your Flask app
mobsf_blueprint = Blueprint('mobsf', __name__, url_prefix='/api')

@mobsf_blueprint.route('/analyze-apk', methods=['POST'])
def analyze_apk():
    if 'apk_file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['apk_file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and file.filename.endswith('.apk'):
        filepath = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(filepath)

        try:
            scan_results = process_with_mobsf(filepath)
            # If the report isn’t a dict, something is off.
            if not isinstance(scan_results, dict):
                raise Exception("Invalid report format received from MobSF")

            # Log the complete scan results for debugging
            print("Scan Results:", json.dumps(scan_results, indent=2))

            frontend_results = {
                "package_name": scan_results.get("package_name", "Unknown"),
                "version": scan_results.get("version_name", "Unknown"),
                "sdk_version": f"{scan_results.get('min_sdk', 'Unknown')} - {scan_results.get('target_sdk', 'Unknown')}",
                "malware_score": calculate_malware_score(scan_results),
                "permissions": format_permissions(scan_results.get("permissions", [])),
                "detections": get_security_issues(scan_results),
                "pdf_url": f"/api/download-pdf/{scan_results.get('file_hash', 'unknown')}"
            }
            return jsonify(frontend_results)
        except Exception as e:
            # Log the error to help with debugging
            print("Error in analyze_apk:", e)
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': 'Please select a valid APK file'}), 400

@mobsf_blueprint.route('/download-pdf/<file_hash>', methods=['GET'])
def download_pdf(file_hash):
    pdf_path = os.path.join(REPORTS_FOLDER, f"{file_hash}_report.pdf")
    if os.path.exists(pdf_path):
        return send_file(
            pdf_path,
            mimetype="application/pdf",
            as_attachment=True,
            download_name=f"{file_hash}_report.pdf"
        )
    else:
        return jsonify({"error": "PDF report not found"}), 404

def process_with_mobsf(apk_file_path):
    # Define endpoints
    upload_endpoint = f"{MOBSF_URL}/api/v1/upload"
    scan_endpoint = f"{MOBSF_URL}/api/v1/scan"
    report_endpoint = f"{MOBSF_URL}/api/v1/report_json"
    download_pdf_endpoint = f"{MOBSF_URL}/api/v1/download_pdf"

    headers = {"X-Mobsf-Api-Key": API_KEY}

    # -----------------------
    # Step 1: Upload the APK
    # -----------------------
    print("Uploading APK file for static analysis...")
    with open(apk_file_path, "rb") as f:
        files = {"file": (os.path.basename(apk_file_path), f, "application/vnd.android.package-archive")}
        upload_response = requests.post(upload_endpoint, headers=headers, files=files)

    if upload_response.status_code != 200:
        raise Exception(f"Upload error: {upload_response.status_code} - {upload_response.text}")

    upload_result = upload_response.json()
    file_hash = upload_result.get("hash")
    print("Upload successful! File hash:", file_hash)

    # -----------------------
    # Step 2: Trigger the scan
    # -----------------------
    print("Triggering scan for file...")
    data_scan = {"hash": file_hash}
    scan_response = requests.post(scan_endpoint, headers=headers, data=data_scan)
    if scan_response.status_code != 200:
        raise Exception(f"Scan error: {scan_response.status_code} - {scan_response.text}")
    print("Scan triggered successfully!")

    # -----------------------
    # Step 3: Get JSON report
    # -----------------------
    print("Getting JSON results...")
    data_report = {"hash": file_hash}
    report_response = requests.post(report_endpoint, headers=headers, data=data_report)
    if report_response.status_code != 200:
        raise Exception(f"Report error: {report_response.status_code} - {report_response.text}")
    report_data = report_response.json()

    # Save JSON report for debugging
    report_json_path = os.path.join(REPORTS_FOLDER, f"{file_hash}_report.json")
    with open(report_json_path, "w") as f:
        json.dump(report_data, f, indent=4)

    # -----------------------
    # Step 4: Download PDF report
    # -----------------------
    try:
        data_pdf = {"hash": file_hash}
        pdf_response = requests.post(download_pdf_endpoint, headers=headers, data=data_pdf)
        if pdf_response.status_code == 200 and pdf_response.headers.get("Content-Type", "").lower().startswith("application/pdf"):
            pdf_path = os.path.join(REPORTS_FOLDER, f"{file_hash}_report.pdf")
            with open(pdf_path, "wb") as f:
                f.write(pdf_response.content)
            print(f"PDF report saved to {pdf_path}")
        else:
            print("PDF report was not generated successfully by MobSF.")
    except Exception as e:
        print(f"Error downloading PDF: {e}")

    # Add the file hash to the report data for constructing the PDF URL
    report_data['file_hash'] = file_hash
    return report_data
def calculate_malware_score(scan_results):
    """
    Calculate a malware risk score (0-100) based on security findings.
    
    - If the scan result provides a valid security_score (> 0), that value is used.
      Otherwise, we default to a baseline (50).
    - The risk is computed as a weighted combination of the inverted security score,
      plus penalties for detected trackers and dangerous permissions.
    """
    try:
        # Use provided security_score if it exists and is > 0; otherwise default to 50.
        security_score = int(scan_results.get("security_score", 50))
        if security_score <= 0:
            security_score = 50
    except (ValueError, TypeError):
        security_score = 50

    # Calculate base risk from security score: Higher security_score means lower risk.
    # Here, (100 - security_score) gives the inverted value.
    # We weight it at 50% of its value.
    base_risk = (100 - security_score) * 0.5

    # Process trackers: if "detected_trackers" is an int, use it directly; if a list, count its length.
    trackers = scan_results.get("trackers", {}) or {}
    dt = trackers.get("detected_trackers", [])
    if isinstance(dt, int):
        trackers_count = dt
    elif isinstance(dt, list):
        trackers_count = len(dt)
    else:
        trackers_count = 0

    # Process permissions: ensure it is a list.
    permissions = scan_results.get("permissions", [])
    if not isinstance(permissions, list):
        permissions = []
    high_risk_permissions = sum(
        1 for perm in permissions 
        if "dangerous" in (perm.get("status", "") or "").lower()
    )

    # Adjust risk using trackers and dangerous permissions (weighted at 5 points each)
    risk = base_risk + (trackers_count * 5) + (high_risk_permissions * 5)
    # Ensure the final risk score is between 0 and 100.
    risk = max(0, min(100, risk))
    return risk
def format_permissions(permissions_list):
    """Format permissions for frontend display"""
    formatted_permissions = []
    # Ensure permissions_list is a list; otherwise, ignore it.
    if not isinstance(permissions_list, list):
        permissions_list = []
    for perm in permissions_list:
        perm_name = perm.get("permission", "Unknown Permission")
        short_name = perm_name.split(".")[-1] if "." in perm_name else perm_name
        status = (perm.get("status", "") or "").lower()
        risk_level = "high" if "dangerous" in status else "medium" if "signature" in status else "low"
        formatted_permissions.append({
            "name": short_name,
            "risk": risk_level
        })
    return formatted_permissions

def get_security_issues(scan_results):
    issues = []
    findings = scan_results.get("findings") or {}
    vulnerabilities = findings.get("vulnerabilities") or []
    for vuln in vulnerabilities:
        issues.append({
            "type": f"Vulnerability: {vuln.get('title', 'Unknown')}",
            "description": vuln.get("description", "No description available")
        })
    code_findings = (findings.get("code_analysis") or {}).get("findings") or []
    for issue in code_findings:
        if issue.get("severity", "").lower() == "high":
            issues.append({
                "type": f"Code Issue: {issue.get('title', 'Unknown')}",
                "description": issue.get("description", "No description available")
            })
    malware_findings = (scan_results.get("malware_analysis") or {}).get("malware_findings") or []
    for malware in malware_findings:
        issues.append({
            "type": f"Malware: {malware.get('title', 'Unknown')}",
            "description": malware.get("description", "Potential malware detected")
        })
    return issues
