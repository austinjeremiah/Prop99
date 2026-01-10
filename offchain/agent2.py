"""
AI Agent 2 - OpenRouter Agent
Property analysis using OpenRouter API
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
    if ndvi > 0.6:
        base_price = 2500  # High vegetation = premium land
    elif ndvi > 0.4:
        base_price = 2200  # Moderate vegetation
    else:
        base_price = 1800  # Low vegetation
    
    # Area factor (larger properties may have lower per-sqm value)
    area_factor = 1.0 if area_sqm < 500 else 0.95 if area_sqm < 1000 else 0.90
    
    # Document confidence factor
    doc_factor = min(1.0, 0.7 + (document_count * 0.15))
    
    # Calculate valuation
    valuation = int(area_sqm * base_price * area_factor * doc_factor)
    
    # Calculate confidence based on data quality
    confidence = 85
    if cloud_coverage > 10:
        confidence -= 5
    if document_count < 2:
        confidence -= 10
    if ndvi < 0.3:
        confidence -= 5
    
    result = {
        "valuation": valuation,
        "confidence": max(60, min(95, confidence)),
        "factors": {
            "base_price_per_sqm": base_price,
            "area_factor": area_factor,
            "doc_factor": doc_factor,
            "ndvi_quality": "high" if ndvi > 0.6 else "moderate" if ndvi > 0.4 else "low"
        }
    }
    
    return result

def analyze_property(data):
    """Analyze property using OpenRouter with direct API call"""
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
        
        # Use OpenRouter API for reasoning
        try:
            response = client.chat.completions.create(
                model="openai/gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a real estate valuation expert. Provide brief, professional reasoning for property valuations."
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

Provide a brief 1-2 sentence reasoning for this valuation."""
                    }
                ]
            )
            
            reasoning = response.choices[0].message.content
        except Exception as e:
            reasoning = f"Analysis based on {area_sqm} sqm property with NDVI {ndvi} and {document_count} documents. Vegetation health indicates {'premium' if ndvi > 0.6 else 'moderate' if ndvi > 0.4 else 'standard'} land quality."
        
        result = {
            "valuation": valuation_result["valuation"],
            "confidence": valuation_result["confidence"],
            "reasoning": reasoning,
            "risk_factors": [
                "Cloud coverage impact" if cloud_coverage > 10 else None,
                "Limited documentation" if document_count < 2 else None,
                "Low vegetation index" if ndvi < 0.3 else None
            ],
            "agent": "openrouter"
        }
        
        # Filter out None values from risk_factors
        result["risk_factors"] = [r for r in result["risk_factors"] if r]
        
        return result
        
    except Exception as e:
        return {
            "error": str(e),
            "agent": "openrouter"
        }

if __name__ == "__main__":
    # Read input from stdin or args
    if len(sys.argv) > 1:
        input_data = json.loads(sys.argv[1])
    else:
        input_data = json.loads(sys.stdin.read())
    
    result = analyze_property(input_data)
    print(json.dumps(result))
