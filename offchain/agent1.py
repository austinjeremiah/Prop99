"""
AI Agent 1 - Groq (Llama 3.3 70B)
Fast inference for property valuation
"""
import os
import sys
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

def analyze_property(data):
    """Analyze property and return valuation"""
    try:
        client = Groq(api_key=os.getenv('GROQ_API_KEY'))
        
        prompt = f"""
Analyze this real estate property and provide a valuation in JSON format.

PROPERTY DATA:
Location: {data.get('latitude')}, {data.get('longitude')}
Satellite Area: {data.get('satellite_data', {}).get('area_sqm', 'N/A')} sqm
NDVI (vegetation): {data.get('satellite_data', {}).get('ndvi', 'N/A')}
Documents: {data.get('document_count', 0)} files

Provide valuation analysis. Return ONLY valid JSON:
{{
    "valuation": <number in USD>,
    "confidence": <number 0-100>,
    "reasoning": "<explanation>",
    "risk_factors": ["<risk1>", "<risk2>"]
}}
"""
        
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert real estate appraiser. Analyze property data and provide accurate valuations."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,
            max_tokens=2000,
            response_format={"type": "json_object"}
        )
        
        result = json.loads(completion.choices[0].message.content)
        result['agent'] = 'groq'
        return result
        
    except Exception as e:
        return {
            "error": str(e),
            "agent": "groq"
        }

if __name__ == "__main__":
    # Read input from stdin or args
    if len(sys.argv) > 1:
        input_data = json.loads(sys.argv[1])
    else:
        input_data = json.loads(sys.stdin.read())
    
    result = analyze_property(input_data)
    print(json.dumps(result))
