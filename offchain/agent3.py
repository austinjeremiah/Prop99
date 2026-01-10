"""
AI Agent 3 - Google Gemini 2.0 Flash
Fast and efficient property analysis
"""
import os
import sys
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

def analyze_property(data):
    """Analyze property using Gemini"""
    try:
        genai.configure(api_key=os.getenv('GOOGLE_GEMINI_API_KEY'))
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        prompt = f"""
You are an expert real estate appraiser analyzing property data.

PROPERTY DETAILS:
Location: {data.get('latitude')}, {data.get('longitude')}
Satellite Area: {data.get('satellite_data', {}).get('area_sqm', 'N/A')} sqm
Vegetation Index (NDVI): {data.get('satellite_data', {}).get('ndvi', 'N/A')}
Cloud Coverage: {data.get('satellite_data', {}).get('cloud_coverage', 0)}%
Documents: {data.get('document_count', 0)} files

Provide a property valuation. Return ONLY valid JSON:
{{
    "valuation": <number in USD>,
    "confidence": <number 0-100>,
    "reasoning": "<detailed explanation>",
    "risk_factors": ["<risk1>", "<risk2>"]
}}

Consider satellite imagery quality, property condition, location desirability, and document authenticity.
Respond with ONLY the JSON, no markdown or other text.
"""
        
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                temperature=0.3,
                max_output_tokens=2000,
                response_mime_type="application/json"
            )
        )
        
        result = json.loads(response.text)
        result['agent'] = 'gemini'
        return result
        
    except Exception as e:
        return {
            "error": str(e),
            "agent": "gemini"
        }

if __name__ == "__main__":
    # Read input from stdin or args
    if len(sys.argv) > 1:
        input_data = json.loads(sys.argv[1])
    else:
        input_data = json.loads(sys.stdin.read())
    
    result = analyze_property(input_data)
    print(json.dumps(result))
