# 🛰️ Google Earth Engine Setup Guide

## Step 1: Create Google Cloud Project (FREE)

1. Go to: https://console.cloud.google.com/
2. Click "Create Project"
3. Project name: `rwa-oracle-satellite`
4. Click "Create"
5. **Copy your Project ID** (e.g., `rwa-oracle-satellite-123456`)

## Step 2: Enable Earth Engine API

1. Go to: https://console.cloud.google.com/apis/library/earthengine.googleapis.com
2. Make sure your project is selected (top dropdown)
3. Click "Enable"

## Step 3: Register for Earth Engine

1. Go to: https://code.earthengine.google.com/register
2. Select your project: `rwa-oracle-satellite`
3. Choose "Unpaid usage" (for testing)
4. Accept terms
5. Wait for approval (usually instant)

## Step 4: Update satellite_tester.py

Replace the project ID in the file with your actual project ID:
```python
ee.Initialize(project='YOUR-PROJECT-ID')  # e.g., rwa-oracle-satellite-123456
```

## Free Tier Limits

- ✅ 250,000 API calls per day
- ✅ 50 concurrent requests
- ✅ Perfect for testing and development
- ✅ No credit card required

## Alternative: Use Mock Data for Testing

If you don't want to set up GCP now, we can create a mock satellite service that simulates the data for frontend testing.
