# 🛰️ Satellite Imagery Display Feature

## Overview
The system now displays real-time satellite imagery captured during property verification directly in the frontend dashboard.

## How It Works

### 1. **Backend (Satellite Service)**
When a property verification is requested with GPS coordinates:

```python
# offchain/satellite_service.py
- Fetches Sentinel-2 imagery from Google Earth Engine
- Generates two images:
  1. RGB True Color Image (natural view)
  2. NDVI Vegetation Index (health analysis)
- Returns public URLs for both images
- Calculates area, NDVI, cloud coverage
```

### 2. **Evidence Storage**
All satellite data (including image URLs) is stored in IPFS:

```typescript
// offchain/src/submitter.ts
evidenceData = {
  satelliteData: {
    latitude: 40,
    longitude: 70,
    area_sqm: 39779.77,
    ndvi: 0.1394,
    cloud_coverage: 0.002024,
    resolution_meters: 10,
    satellite: "Sentinel-2",
    rgb_image_url: "https://earthengine.googleapis.com/...",
    ndvi_image_url: "https://earthengine.googleapis.com/..."
  }
}
```

### 3. **Frontend Display**
The AssetRequestCard component now shows:

```tsx
// frontend/app/business/dashboard/AssetRequestCard.tsx
- 🛰️ Satellite Imagery Analysis section
- Metrics: Area, NDVI, Cloud Coverage, Resolution
- Two side-by-side satellite images:
  - RGB True Color Image (actual appearance)
  - NDVI Vegetation Index (green = healthy, red = poor)
- Click to enlarge functionality
- Location and capture date metadata
```

## User Flow

### For Business Users:
1. **Upload Property** (`/business/upload`)
   - Enter GPS coordinates (latitude, longitude)
   - Upload documents and photos
   - Submit for verification

2. **Backend Processing** (~13 seconds)
   - Oracle fetches satellite imagery at GPS coordinates
   - AI agents analyze using satellite data
   - Evidence stored to IPFS with image URLs

3. **View Results** (`/business/dashboard`)
   - Click "View Details" on verified request
   - Scroll to "🛰️ Satellite Imagery Analysis"
   - See real satellite images from Google Earth Engine
   - Click images to view full-size

## Satellite Metrics Explained

| Metric | Description | Good Range |
|--------|-------------|------------|
| **Area** | Property area in square meters | Matches document |
| **NDVI** | Vegetation health (0-1 scale) | 0.3-0.8 for land |
| **Cloud Coverage** | Percentage of clouds in image | <10% ideal |
| **Resolution** | Image pixel size (meters) | 10m (Sentinel-2) |

## Image Types

### RGB True Color
- **What it shows:** Natural appearance of property
- **Use case:** Visual verification of land features
- **Colors:** Blue = water, Green = vegetation, Brown/Gray = bare land

### NDVI Vegetation Index
- **What it shows:** Vegetation health using infrared
- **Use case:** Agricultural land quality assessment
- **Colors:**
  - Red (0-0.2): No vegetation / bare soil
  - Yellow (0.2-0.4): Sparse vegetation
  - Green (0.4-1.0): Healthy vegetation

## Technical Details

### Satellite Source
- **Satellite:** Sentinel-2 (ESA)
- **Resolution:** 10 meters per pixel
- **Bands Used:**
  - RGB: B4 (Red), B3 (Green), B2 (Blue)
  - NDVI: B8 (NIR), B4 (Red)
- **Refresh Rate:** New imagery every 5 days

### Image Generation
- **Method:** Google Earth Engine `getThumbURL()`
- **Format:** PNG (512x512 pixels)
- **Access:** Public HTTPS URLs (no auth required)
- **Storage:** URLs stored in IPFS evidence

### Frontend Integration
- **Fetch:** Via `/api/evidence?requestId=X`
- **Display:** Lazy loading with error fallbacks
- **Interaction:** Click to enlarge in lightbox
- **Caching:** Browser caches image URLs

## Example Evidence Data

```json
{
  "requestId": "27",
  "satelliteData": {
    "latitude": 12.97,
    "longitude": 79.13,
    "area_sqm": 223.45,
    "ndvi": 0.4521,
    "cloud_coverage": 1.24,
    "resolution_meters": 10,
    "satellite": "Sentinel-2",
    "image_date": "2026-01-11T10:30:00Z",
    "rgb_image_url": "https://earthengine.googleapis.com/v1/projects/.../thumbnails/...",
    "ndvi_image_url": "https://earthengine.googleapis.com/v1/projects/.../thumbnails/..."
  }
}
```

## Troubleshooting

### Images Not Showing
1. **Check Evidence Data:** Verify `evidenceData.satelliteData` exists
2. **Check URLs:** Image URLs must be valid HTTPS
3. **Google Earth Engine:** Ensure GEE authentication is working
4. **Network:** Check if earthengine.googleapis.com is accessible

### Image Load Errors
- Fallback to gray placeholder automatically
- Error: "Image Not Available" shown
- Check browser console for network errors

### No Satellite Section
- Only shows for verified requests (status = VERIFIED)
- Evidence must exist in IPFS
- Satellite data must be in evidence package

## Future Enhancements

### Planned Features:
- [ ] Download satellite images as PNG/JPEG
- [ ] Compare before/after imagery (time series)
- [ ] Overlay property boundaries on satellite view
- [ ] 3D terrain visualization
- [ ] Historical NDVI trends graph
- [ ] Multi-spectral analysis (moisture, temperature)
- [ ] Automatic change detection alerts

### API Enhancements:
- [ ] Higher resolution imagery (5m or 1m)
- [ ] Custom date range selection
- [ ] Multiple satellite sources (Landsat, Planet)
- [ ] Cloud-free composite generation

## Benefits

### For Property Owners:
- ✅ Visual proof of property location
- ✅ Vegetation health assessment
- ✅ Transparent AI analysis with real imagery
- ✅ Third-party verification (Google Earth Engine)

### For Buyers/Investors:
- ✅ See actual property before purchase
- ✅ Verify GPS coordinates match documents
- ✅ Assess land quality via NDVI
- ✅ Detect fraud (wrong location, area mismatch)

### For AI Agents:
- ✅ Real satellite data for valuation
- ✅ Area measurement verification
- ✅ Vegetation index for pricing
- ✅ Cloud coverage quality check

## Security & Privacy

### Data Privacy:
- Satellite imagery is **public** (10m resolution)
- No personally identifiable information in images
- GPS coordinates stored encrypted on blockchain
- Image URLs expire after ~24 hours (regenerate from IPFS evidence)

### Authenticity:
- Images from trusted source (Google Earth Engine)
- Cannot be manipulated (generated on-demand)
- Timestamp shows capture date
- IPFS hash proves data integrity

## Cost

### Google Earth Engine:
- **Free Tier:** Included with GEE account
- **Rate Limits:** 100 requests/day (free)
- **Image Generation:** No cost for thumbnails
- **Storage:** IPFS (Pinata free tier: 1GB)

### Total Cost per Request:
- Satellite imagery: **$0.00**
- IPFS storage: **$0.00** (under 1GB)
- Blockchain gas: **$0.06** (Mantle Sepolia)
- **Total: ~$0.06 per verification**

---

## Quick Start

1. **Submit Request:** Enter GPS coordinates in upload form
2. **Wait 13 seconds:** Oracle processing with satellite fetch
3. **View Dashboard:** Click "View Details" on verified request
4. **Scroll Down:** Find "🛰️ Satellite Imagery Analysis"
5. **Explore:** Click images to enlarge, view metrics

**That's it!** 🎉 Real satellite imagery now enhances your property verification.
