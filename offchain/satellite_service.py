"""
Satellite Service
Fetches satellite imagery using Google Earth Engine
"""
import os
import sys
import json
import ee
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

def fetch_satellite_data(latitude, longitude):
    """Fetch satellite imagery and metrics"""
    try:
        # Initialize Earth Engine with project ID
        project_id = os.getenv('GOOGLE_EARTH_ENGINE_PROJECT_ID')
        ee.Initialize(project=project_id)
        
        # Create point of interest
        poi = ee.Geometry.Point([longitude, latitude])
        
        # Create buffer area (100m radius) and get bounds
        roi = poi.buffer(100).bounds()
        
        # Get recent Sentinel-2 imagery (last 365 days for better availability)
        end_date = datetime.now()
        start_date = end_date - timedelta(days=365)
        
        # Use HARMONIZED collection for better availability
        sentinel = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED') \
            .filterBounds(roi) \
            .filterDate(start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d')) \
            .sort('CLOUDY_PIXEL_PERCENTAGE') \
            .first()
        
        # Calculate NDVI (vegetation health)
        ndvi = sentinel.normalizedDifference(['B8', 'B4']).rename('NDVI')
        ndvi_stats = ndvi.reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=roi,
            scale=10,
            maxPixels=1e9
        ).getInfo()
        
        ndvi_value = ndvi_stats.get('NDVI', 0.5)
        
        # Calculate area
        area_sqm = roi.area(maxError=1).getInfo()
        
        # Get RGB visualization URL
        rgb_params = {
            'bands': ['B4', 'B3', 'B2'],
            'min': 0,
            'max': 3000,
            'dimensions': 512
        }
        rgb_url = sentinel.getThumbURL(rgb_params)
        
        # Get NDVI visualization URL
        ndvi_params = {
            'min': 0,
            'max': 1,
            'palette': ['red', 'yellow', 'green'],
            'dimensions': 512
        }
        ndvi_url = ndvi.getThumbURL(ndvi_params)
        
        # Get image metadata
        image_info = sentinel.getInfo()
        properties = image_info['properties']
        
        result = {
            'latitude': latitude,
            'longitude': longitude,
            'area_sqm': round(area_sqm, 2),
            'ndvi': round(ndvi_value, 4),
            'cloud_coverage': properties.get('CLOUDY_PIXEL_PERCENTAGE', 0),
            'resolution_meters': 10,
            'image_date': properties.get('GENERATION_TIME', 'N/A'),
            'satellite': 'Sentinel-2',
            'rgb_image_url': rgb_url,
            'ndvi_image_url': ndvi_url
        }
        
        return result
        
    except Exception as e:
        # Fail with real error - no mock data
        print(f"Error: Satellite service failed: {e}", file=sys.stderr)
        raise Exception(f"Satellite service failed: {str(e)}")

if __name__ == "__main__":
    # Read input from stdin or args
    try:
        if len(sys.argv) > 2:
            lat = float(sys.argv[1])
            lon = float(sys.argv[2])
        else:
            input_data = json.loads(sys.stdin.read())
            lat = input_data['latitude']
            lon = input_data['longitude']
        
        result = fetch_satellite_data(lat, lon)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
