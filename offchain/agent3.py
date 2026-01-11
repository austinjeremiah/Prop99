"""
AI Agent 3 - OpenRouter Agent (Llama 3.1)
Property analysis using OpenRouter with Llama 3.1
"""
import os
import sys
import json
from datetime import datetime
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

# Configure OpenAI client for OpenRouter
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv('OPENROUTER_API_KEY')
)

def calculate_valuation(area_sqm: float, ndvi: float, cloud_coverage: float, document_count: int) -> dict:
    """
    Calculate property valuation based on satellite data and documents.
    
    Args:
        area_sqm: Property area in square meters
        ndvi: Normalized Difference Vegetation Index (0-1)
        cloud_coverage: Cloud coverage percentage
        document_count: Number of submitted documents
    
    Returns:
        Dictionary with valuation and analysis
    """
    # Base price per sqm based on vegetation health
    if ndvi > 0.65:
        base_price = 2700  # Excellent vegetation = premium land
    elif ndvi > 0.5:
        base_price = 2400  # Good vegetation
    elif ndvi > 0.3:
        base_price = 2000  # Moderate vegetation
    else:
        base_price = 1700  # Poor vegetation
    
    # Area factor (larger properties may have lower per-sqm value)
    area_factor = 1.0 if area_sqm < 500 else 0.93 if area_sqm < 1000 else 0.88
    
    # Document confidence factor
    doc_factor = min(1.0, 0.65 + (document_count * 0.175))
    
    # Calculate valuation
    valuation = int(area_sqm * base_price * area_factor * doc_factor)
    
    # Calculate confidence based on data quality
    confidence = 82
    if cloud_coverage > 15:
        confidence -= 8
    if document_count < 2:
        confidence -= 12
    if ndvi < 0.25:
        confidence -= 7
    
    return {
        "valuation": valuation,
        "confidence": max(55, min(95, confidence))
    }

def analyze_property(data):
    """Analyze property using OpenRouter with Llama 3.1"""
    try:
        api_key = os.getenv('OPENROUTER_API_KEY')
        
        if not api_key:
            raise ValueError("OPENROUTER_API_KEY not configured")
        
        # Extract data
        satellite_data = data.get('satellite_data', {})
        area_sqm = satellite_data.get('area_sqm', 200)
        ndvi = satellite_data.get('ndvi', 0.5)
        cloud_coverage = satellite_data.get('cloud_coverage', 5)
        document_count = data.get('document_count', 0)
        
        # Calculate valuation directly
        valuation_result = calculate_valuation(area_sqm, ndvi, cloud_coverage, document_count)
        
        # Use OpenRouter API for reasoning with Llama 3.1
        try:
            response = client.chat.completions.create(
                model="meta-llama/llama-3.1-8b-instruct:free",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a real estate valuation expert. Provide brief, professional reasoning for property valuations in 1-2 sentences."
                    },
                    {
                        "role": "user",
                        "content": f"""Property Analysis:
- Area: {area_sqm} sqm
- Vegetation Health (NDVI): {ndvi}
- Cloud Coverage: {cloud_coverage}%
- Documents: {document_count}
- Calculated Valuation: ${valuation_result['valuation']:,}
- Confidence: {valuation_result['confidence']}%

Provide a brief reasoning for this valuation."""
                    }
                ]
            )
            
            reasoning = response.choices[0].message.content
        except Exception as e:
            reasoning = f"Analysis based on {area_sqm} sqm property with NDVI {ndvi} and {document_count} documents. Vegetation health and area indicate {'strong' if ndvi > 0.6 else 'moderate' if ndvi > 0.4 else 'fair'} land quality with documentation {'complete' if document_count >= 2 else 'limited'}."
        
        result = {
            "valuation": valuation_result["valuation"],
            "confidence": valuation_result["confidence"],
            "reasoning": reasoning,
            "risk_factors": [
                "High cloud coverage" if cloud_coverage > 15 else None,
                "Insufficient documentation" if document_count < 2 else None,
                "Poor vegetation health" if ndvi < 0.25 else None
            ],
            "agent": "llama"
        }
        
        # Filter out None values from risk_factors
        result["risk_factors"] = [r for r in result["risk_factors"] if r]
        
        return result
        
    except Exception as e:
        return {
            "error": str(e),
            "agent": "llama"
        }

if __name__ == "__main__":
    # Read input from stdin or args
    if len(sys.argv) > 1:
        input_data = json.loads(sys.argv[1])
    else:
        input_data = json.loads(sys.stdin.read())
    
    result = analyze_property(input_data)
    print(json.dumps(result))
