# 🛰️ Satellite Image IPFS Storage - Implementation Complete

## Problem Solved
Google Earth Engine image URLs expire after some time, causing "Image Not Available" errors in the frontend. Now satellite images are permanently stored in IPFS.

## What Changed

### 1. **satellite_service.py** - Download Images Locally
```python
# After generating GEE URLs, download the actual images
import requests
import tempfile

# Download RGB image
rgb_response = requests.get(rgb_url, timeout=30)
with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as f:
    f.write(rgb_response.content)
    rgb_image_path = f.name

# Download NDVI image  
ndvi_response = requests.get(ndvi_url, timeout=30)
with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as f:
    f.write(ndvi_response.content)
    ndvi_image_path = f.name

# Return paths in result
result = {
    ...
    'rgb_image_path': rgb_image_path,
    'ndvi_image_path': ndvi_image_path
}
```

### 2. **orchestrator.ts** - Upload Images to IPFS
```typescript
// Step 1.5: Upload satellite images to IPFS
if (satelliteData.rgb_image_path || satelliteData.ndvi_image_path) {
  // Upload RGB image
  const rgbFormData = new FormData();
  rgbFormData.append('file', fs.createReadStream(satelliteData.rgb_image_path));
  
  const rgbResponse = await axios.post(
    'https://api.pinata.cloud/pinning/pinFileToIPFS',
    rgbFormData,
    { headers: { 'Authorization': `Bearer ${process.env.PINATA_JWT}` } }
  );
  
  // Replace GEE URL with permanent IPFS URL
  satelliteData.rgb_image_url = `https://gateway.pinata.cloud/ipfs/${rgbResponse.data.IpfsHash}`;
  
  // Clean up temp file
  fs.unlinkSync(satelliteData.rgb_image_path);
}
```

### 3. **requirements.txt** - Added Dependency
```plaintext
requests>=2.31.0
```

## How It Works Now

### Old Flow (URLs Expired):
```
1. Fetch satellite data from Google Earth Engine
2. Get temporary image URLs (getThumbURL)
3. Store URLs in evidence.json
4. Frontend loads URLs → ❌ URLs expire after 24 hours
```

### New Flow (Permanent Storage):
```
1. Fetch satellite data from Google Earth Engine
2. Get temporary image URLs (getThumbURL)
3. Download images to local temp files
4. Upload images to IPFS via Pinata
5. Replace temporary URLs with permanent IPFS URLs
6. Store IPFS URLs in evidence.json
7. Delete local temp files
8. Frontend loads IPFS URLs → ✅ Images accessible forever
```

## Evidence.json Structure (New)

```json
{
  "requestId": "30",
  "satelliteData": {
    "latitude": 13.191204,
    "longitude": 80.313094,
    "area_sqm": 39779.77,
    "ndvi": 0.3448,
    "cloud_coverage": 0.854373,
    "resolution_meters": 10,
    "satellite": "Sentinel-2",
    "rgb_image_url": "https://gateway.pinata.cloud/ipfs/QmXXX...",  ← Permanent!
    "ndvi_image_url": "https://gateway.pinata.cloud/ipfs/QmYYY...", ← Permanent!
    "image_date": 1739430277000
  }
}
```

## Benefits

1. ✅ **Permanent Storage** - Images stored forever on IPFS
2. ✅ **No Expiration** - Pinata gateway URLs never expire
3. ✅ **Verifiable** - Anyone can access images via IPFS hash
4. ✅ **Decentralized** - Not dependent on Google Earth Engine availability
5. ✅ **Evidence Integrity** - Images prove satellite data authenticity

## Storage Costs

### Pinata Free Tier:
- **Storage:** 1 GB free
- **Bandwidth:** 100 GB/month free
- **Average Image Size:** ~100 KB per satellite image
- **Total per Request:** ~200 KB (RGB + NDVI)
- **Capacity:** ~5,000 requests on free tier

### Paid Tier (if needed):
- **Picnic Plan:** $20/month for 50 GB storage
- **Capacity:** ~250,000 requests

## Testing

### Install Python Dependency:
```bash
cd offchain
pip install requests
```

### Submit New Request:
1. Go to `/business/upload`
2. Enter property details with GPS coordinates
3. Upload documents
4. Submit

### Expected Flow:
```
📡 Fetching satellite imagery...
  ✅ Satellite data: 223.45 sqm, NDVI 0.4521

📸 Uploading satellite images to IPFS...
  ✅ RGB image uploaded: QmXXX...
  ✅ NDVI image uploaded: QmYYY...
  
📦 Uploading evidence to IPFS...
  ✅ Evidence uploaded: QmZZZ...
```

### View Images:
1. Go to `/business/dashboard`
2. Click "View Details" on verified request
3. Scroll to "🛰️ Satellite Imagery Analysis"
4. **Images will load from IPFS** ✅

## Troubleshooting

### Images Still Not Showing:
1. **Check evidence.json** - Verify `rgb_image_url` starts with `https://gateway.pinata.cloud/ipfs/`
2. **Check IPFS hash** - Try opening URL directly in browser
3. **Check Pinata JWT** - Verify `PINATA_JWT` in `.env`
4. **Check logs** - Look for "Satellite images uploaded to IPFS"

### Upload Failures:
- **Error: PINATA_JWT not configured** → Add JWT to `.env`
- **Error: File not found** → Python `requests` not installed
- **Error: Failed to download** → Google Earth Engine issue, retry

## Next Steps

### For Existing Requests:
Old requests (25, 26, 27, 28, 29) have **expired GEE URLs**. Options:
1. **Re-verify** - Trigger backend to re-process with new IPFS upload
2. **Accept** - Show GPS location without images for old requests
3. **Regenerate** - Call satellite service manually and update evidence

### For New Requests:
All future requests will have **permanent IPFS images** ✅

---

**Status:** ✅ **COMPLETE - Satellite images now permanently stored in IPFS!**
