# 🛰️ Satellite Imagery Features - Ultra HD Multi-Spectral Analysis

## Overview
The Prop99 platform now features **ultra-high resolution satellite imagery** (2048x2048 pixels) with **4 different spectral band composites** for comprehensive property analysis.

## 📸 Image Types

### 1. **CIR (Color Infrared)** 🌿 - **RECOMMENDED**
- **Bands:** B8 (Near-Infrared) / B4 (Red) / B3 (Green)
- **Best For:** Vegetation and land analysis
- **Appearance:** Vegetation appears bright red/pink, making it the clearest view for property assessment
- **Use Case:** Primary view for identifying land boundaries, vegetation health, and property features

### 2. **RGB Natural Color** 🖼️
- **Bands:** B4 (Red) / B3 (Green) / B2 (Blue)
- **Best For:** Natural appearance
- **Appearance:** Shows property as it would appear to the human eye from above
- **Use Case:** Familiar view for general property overview

### 3. **True Color Composite** 🌈
- **Bands:** B2 (Blue) / B3 (Green) / B4 (Red) with gamma correction (1.2)
- **Best For:** Enhanced clarity and color balance
- **Appearance:** Enhanced natural colors with better contrast
- **Use Case:** Detailed visual analysis with improved color accuracy

### 4. **NDVI (Normalized Difference Vegetation Index)** 🌱
- **Formula:** (B8 - B4) / (B8 + B4)
- **Best For:** Vegetation health analysis
- **Appearance:** Color-coded heatmap (green = healthy, yellow = stressed, red = bare soil)
- **Use Case:** Agricultural assessment, vegetation coverage analysis

## 🎯 Resolution & Quality

- **Dimensions:** 2048 x 2048 pixels (Ultra HD)
- **Satellite:** Sentinel-2 (ESA)
- **Ground Resolution:** 10 meters per pixel
- **Coverage Area:** 100-meter radius buffer around property location
- **Cloud Filtering:** Automatically selects least cloudy images from last 365 days

## 📊 Metrics Provided

Each satellite analysis includes:
- **GPS Coordinates:** Precise latitude/longitude
- **Area Calculation:** Square meters of property
- **NDVI Score:** Vegetation health (0-1 scale, displayed as percentage)
- **Cloud Coverage:** Percentage of clouds in image
- **Image Date:** When satellite captured the imagery
- **Resolution:** 10m ground sampling distance

## 💾 IPFS Storage

All satellite images are permanently stored on IPFS via Pinata:
- **Permanent URLs:** Never expire (unlike Google Earth Engine URLs)
- **4 Images Per Request:**
  - `satellite_cir_{requestId}.png` (~800KB)
  - `satellite_rgb_{requestId}.png` (~800KB)
  - `satellite_true_color_{requestId}.png` (~800KB)
  - `satellite_ndvi_{requestId}.png` (~400KB)
- **Total Storage:** ~2.8MB per property verification
- **Gateway:** `https://gateway.pinata.cloud/ipfs/{hash}`

## 🎨 Frontend Features

### Tabbed Interface
- Switch between all 4 image types with one click
- Default view: CIR (best for land analysis)
- Smooth transitions between views

### Thumbnail Grid
- Quick preview of all available images
- Click thumbnail to switch main view
- Visual indicator showing current selection

### Full-Resolution Preview
- Click main image to view in modal at full 2048x2048 resolution
- Zoom and pan capabilities
- Download option for offline analysis

### Image Descriptions
- Each view includes explanation of what you're seeing
- Band composition details
- Best use cases for each type

## 📝 Technical Implementation

### Backend (Python - satellite_service.py)
```python
# Fetches 4 different band composites
- RGB: B4/B3/B2 (Natural color)
- NDVI: (B8-B4)/(B8+B4) (Vegetation index)
- True Color: B2/B3/B4 with gamma 1.2
- CIR: B8/B4/B3 (Color infrared)

# Downloads to temp files
- Uses requests library to download from GEE URLs
- Returns temp file paths for IPFS upload
```

### Orchestrator (TypeScript - orchestrator.ts)
```typescript
// Step 1.5: Upload all 4 images to IPFS
- Uploads RGB, NDVI, CIR, and True Color images
- Replaces temp GEE URLs with permanent IPFS URLs
- Cleans up temp files after upload
- Handles Windows file handle issues with 500ms delay
```

### Frontend (React/Next.js - AssetRequestCard.tsx)
```tsx
// Tabbed interface with state management
- useState for selected image type (default: 'cir')
- Dynamic tab rendering based on available images
- Thumbnail grid for quick switching
- Full descriptions for each image type
```

## 🔄 Workflow

1. **User submits property** with GPS coordinates
2. **Satellite service** fetches 4 image types from Google Earth Engine
3. **Downloads images** to temporary files
4. **Uploads to IPFS** via Pinata (permanent storage)
5. **Stores IPFS URLs** in evidence.json
6. **Cleans up** temporary files
7. **Frontend displays** all 4 views in tabbed interface

## 🎯 Benefits

### For Businesses
- **Comprehensive Analysis:** 4 different views for thorough property assessment
- **Permanent Records:** IPFS ensures images never expire
- **Professional Quality:** Ultra-HD resolution for detailed examination
- **Vegetation Metrics:** NDVI provides quantitative vegetation data

### For Consumers
- **Transparency:** See exactly what AI agents analyzed
- **Multiple Views:** Different perspectives reveal different property features
- **High Quality:** Zoom in for detailed inspection
- **Easy Understanding:** Clear descriptions explain what each view shows

### For Developers
- **Modular Design:** Easy to add more band combinations
- **Error Handling:** Graceful fallbacks if images unavailable
- **Performance:** Lazy loading, optimized file sizes
- **Maintainability:** Clear separation of concerns

## 📈 Future Enhancements

Potential additions:
- **Thermal Imagery:** Landsat 8 thermal bands
- **Time Series:** Compare images from different dates
- **Change Detection:** Highlight property changes over time
- **3D Terrain:** Add elevation data visualization
- **Custom Band Math:** User-defined band combinations
- **Annotation Tools:** Draw on images, add markers
- **Export Options:** Download all images as ZIP
- **Comparison Mode:** Side-by-side view of different types

## 🛠️ Configuration

### Environment Variables
```env
GOOGLE_EARTH_ENGINE_PROJECT_ID=your-gee-project-id
PINATA_JWT=your-pinata-jwt-token
```

### Image Parameters (Customizable in satellite_service.py)
```python
dimensions: 2048  # Change to 1024 or 4096
buffer_radius: 100  # meters around point
date_range: 365  # days to look back
```

## 📊 Storage Cost Analysis

### Per Request (4 images):
- CIR: ~800 KB
- RGB: ~800 KB  
- True Color: ~800 KB
- NDVI: ~400 KB
- **Total: ~2.8 MB**

### Pinata Free Tier:
- Storage: 1 GB
- **Capacity:** ~357 property verifications
- Gateway Bandwidth: 100 GB/month

### Cost Optimization:
- Images compressed as PNG
- Lazy loading in frontend
- Only generate on verification (not for pending requests)
- Cleanup temp files immediately

## 🎓 Educational Content

### Why CIR is Best for Land Analysis?
Near-infrared light is strongly reflected by healthy vegetation but absorbed by water and buildings. This creates maximum contrast between:
- **Vegetation (red/pink):** Active plant growth
- **Buildings (blue/gray):** Man-made structures  
- **Water (dark blue/black):** Rivers, ponds
- **Bare Soil (brown/tan):** Unpaved areas

### Reading NDVI Values:
- **0.8-1.0:** Dense, healthy vegetation (forests)
- **0.5-0.8:** Moderate vegetation (grasslands)
- **0.2-0.5:** Sparse vegetation (scrubland)
- **0.0-0.2:** Bare soil, sand, urban areas
- **Negative:** Water, snow, clouds

## 🔗 Resources

- [Sentinel-2 Band Information](https://gisgeography.com/sentinel-2-bands-combinations/)
- [NDVI Explained](https://en.wikipedia.org/wiki/Normalized_difference_vegetation_index)
- [Google Earth Engine Docs](https://developers.google.com/earth-engine)
- [Pinata IPFS Docs](https://docs.pinata.cloud/)

---

**Last Updated:** January 12, 2026  
**Version:** 2.0 - Ultra HD Multi-Spectral
