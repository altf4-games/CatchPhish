import os
import io
import json
from google.cloud import vision
import google.generativeai as genai
from flask import Blueprint, request, jsonify

# Create a Blueprint for the phishing detection API
phishing_api = Blueprint('phishing_api', __name__)

def extract_image_data(image_content):
    """Extract text, logos, and labels from image content using Vision API"""
    # Initialize Vision client
    client = vision.ImageAnnotatorClient.from_service_account_json(
        './vision_api.json'  # Replace with your actual path
    )
    
    # Create image object from content
    image = vision.Image(content=image_content)
    
    # Get all the data we need from the image
    text_response = client.text_detection(image=image)
    logo_response = client.logo_detection(image=image)
    label_response = client.label_detection(image=image)
    
    # Extract text
    extracted_text = ""
    if text_response.text_annotations:
        extracted_text = text_response.text_annotations[0].description
    
    # Extract logos
    logos = []
    for logo in logo_response.logo_annotations:
        logos.append({
            "description": logo.description,
            "confidence": logo.score
        })
    
    # Extract labels (for context)
    labels = []
    for label in label_response.label_annotations:
        labels.append({
            "description": label.description,
            "confidence": label.score
        })
    
    return {
        "text": extracted_text,
        "logos": logos,
        "labels": labels
    }

def analyze_with_gemini(extracted_data):
    """Send extracted data to Gemini for phishing analysis"""
    # Direct use of Gemini API key
    gemini_api_key = "AIzaSyDc4B__rW4_zlwePV5xFiaUDOCBEbHtS0s"  # Replace with your actual Gemini API key
    genai.configure(api_key=gemini_api_key)
    model = genai.GenerativeModel('gemini-2.0-flash')
    
    # Create a prompt for Gemini
    prompt = f"""
    Analyze the following data extracted from an image and determine if it appears to be a phishing attempt.
    
    EXTRACTED TEXT:
    {extracted_data['text']}
    
    DETECTED LOGOS:
    {json.dumps(extracted_data['logos'], indent=2)}
    
    DETECTED LABELS:
    {json.dumps(extracted_data['labels'], indent=2)}
    
    Based on this data, please:
    1. Determine if this appears to be a phishing attempt
    2. Provide a phishing probability score between 0 and 1 (where 1 is definitely phishing)
    3. List specific suspicious elements that led to your conclusion
    4. Explain what legitimate elements are present, if any
    5. Provide an overall assessment of the risk level (High/Medium/Low/Minimal)
    
    Consider indicators like:
    - Brand impersonation (legitimate logos with suspicious text)
    - Misspellings of brand names (e.g., "hdffc" instead of "hdfc")
    - Urgency language or requests for sensitive information
    - Suspicious URLs or domains
    - Inconsistencies between the detected logos and text content
    
    Format your response as JSON with these fields:
    {{"phishing_score": float, "risk_level": string, "suspicious_elements": [list], "legitimate_elements": [list], "overall_assessment": string}}
    """
    
    # Send to Gemini and get response
    response = model.generate_content(prompt)
    
    try:
        # Parse the JSON response
        response_text = response.text
        # Extract just the JSON part if there's any additional text
        json_start = response_text.find('{')
        json_end = response_text.rfind('}') + 1
        if json_start >= 0 and json_end > 0:
            json_str = response_text[json_start:json_end]
            return json.loads(json_str)
        else:
            # If no JSON found, return the raw response
            return {"error": "No valid JSON in response", "raw_response": response_text}
    except json.JSONDecodeError:
        # If JSON parsing fails, return the raw response
        return {"error": "Invalid JSON in response", "raw_response": response.text}

def analyze_image_for_phishing(image_content):
    """Analyze image content for phishing"""
    # Extract data from image
    extracted_data = extract_image_data(image_content)
    
    # Send to Gemini for analysis
    analysis_result = analyze_with_gemini(extracted_data)
    
    # Add the extracted data to the result for reference
    full_result = {
        "analysis": analysis_result,
        "extracted_data": {
            "text": extracted_data["text"],
            "logos": extracted_data["logos"],
            "labels": extracted_data["labels"]
        }
    }
    
    return full_result

# API route to analyze an image
@phishing_api.route('/analyze', methods=['POST'])
def analyze_image():
    # Check if the post request has the file part
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
    
    file = request.files['image']
    
    # If user does not select file, browser also
    # submit an empty part without filename
    if file.filename == '':
        return jsonify({"error": "No image selected"}), 400
    
    # Read the image content
    image_content = file.read()
    
    # Analyze the image
    try:
        result = analyze_image_for_phishing(image_content)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# You can optionally add more routes if needed
@phishing_api.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "phishing-detection-api"})