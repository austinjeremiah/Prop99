# 📄 Evidence.json - Complete Metadata Structure

## Overview
**YES**, all metadata for each verification request is saved in **ONE single Evidence.json file** uploaded to IPFS.

## Complete Evidence.json Structure

```json
{
  "requestId": "30",
  "finalValuation": 36312318,
  "finalConfidence": 23,
  "timestamp": "2026-01-12T14:44:42.894Z",
  
  // ════════════════════════════════════════════════════════════
  // SATELLITE DATA SECTION
  // ════════════════════════════════════════════════════════════
  "satelliteData": {
    "latitude": 13.191204,
    "longitude": 80.313094,
    "area_sqm": 39779.77,
    "ndvi": 0.3448,
    "cloud_coverage": 0.854373,
    "resolution_meters": 10,
    "satellite": "Sentinel-2",
    "image_date": 1739430277000,
    
    // Permanent IPFS image URLs (new feature!)
    "rgb_image_url": "https://gateway.pinata.cloud/ipfs/QmXXX...",
    "ndvi_image_url": "https://gateway.pinata.cloud/ipfs/QmYYY..."
  },
  
  // ════════════════════════════════════════════════════════════
  // AI AGENT ANALYSIS SECTION
  // ════════════════════════════════════════════════════════════
  "agentAnalysis": {
    "agents": [
      {
        "agent": "groq",
        "model": "Llama 3.3 70B Versatile",
        "valuation": 235000,
        "confidence": 80,
        "reasoning": "The document provided is a Sale Deed...",
        "risk_factors": [
          "Area mismatch >20% with satellite data",
          "Potential for fraudulent activity"
        ],
        "document_verification": {
          "is_land_document": true,
          "document_type_found": "Sale Deed",
          "authenticity_score": 60,
          "missing_fields": [],
          "red_flags": [
            "Area mismatch >20% with satellite data"
          ]
        }
      },
      {
        "agent": "openrouter",
        "model": "GPT-4o-mini",
        "valuation": 54776743,
        "confidence": 75,
        "reasoning": "Analysis based on 39779.77 sqm property...",
        "risk_factors": ["Limited documentation"],
        "market_data": {}
      },
      {
        "agent": "llama",
        "model": "Meta Llama 3.1 8B Instruct",
        "valuation": 57760226,
        "confidence": 70,
        "reasoning": "Analysis based on vegetation health...",
        "risk_factors": ["Insufficient documentation"]
      }
    ],
    "consensusMethod": "weighted_average",
    "fullResponses": [
      // Complete raw responses from each agent
    ]
  }
}
```

## What Gets Stored in Evidence.json

### ✅ **Included in Evidence:**

1. **Request Metadata**
   - `requestId` - Blockchain request ID
   - `finalValuation` - Consensus valuation amount
   - `finalConfidence` - Consensus confidence percentage
   - `timestamp` - Verification timestamp

2. **Satellite Data** (Complete)
   - GPS coordinates (lat, lng)
   - Calculated area in square meters
   - NDVI (vegetation health index)
   - Cloud coverage percentage
   - Satellite resolution (10m for Sentinel-2)
   - Image acquisition date
   - **Permanent IPFS URLs** for RGB and NDVI images

3. **AI Agent Analysis** (All 3 Agents)
   - Agent name and model
   - Individual valuation
   - Individual confidence score
   - Detailed reasoning (4-5 sentences)
   - Risk factors detected
   - Document verification results
   - Market data (if available)

4. **Consensus Information**
   - Method used (weighted_average)
   - Full raw responses from all agents

### ❌ **NOT Included in Evidence:**

1. **Original Documents** - Stored separately in IPFS
2. **Property Photos** - Stored separately in IPFS
3. **Temporary File Paths** - Removed before storing
4. **API Keys** - Never stored

## Storage Flow

```
┌─────────────────────────────────────────────────────────┐
│  1. Verification Request Submitted                      │
└────────────────┬────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────────┐
│  2. Fetch Satellite Data (Google Earth Engine)          │
│     - Download RGB image to temp file                   │
│     - Download NDVI image to temp file                  │
└────────────────┬────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────────┐
│  3. Upload Satellite Images to IPFS (Pinata)            │
│     - Upload RGB → QmRGB...                             │
│     - Upload NDVI → QmNDVI...                           │
│     - Delete temp files                                 │
│     - Store IPFS URLs in satelliteData                  │
└────────────────┬────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────────┐
│  4. Run 3 AI Agents in Parallel                         │
│     - Agent 1 (Groq) → Analysis + Scores                │
│     - Agent 2 (OpenRouter) → Analysis + Scores          │
│     - Agent 3 (Gemini) → Analysis + Scores              │
└────────────────┬────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────────┐
│  5. Calculate Consensus                                 │
│     - Weighted average by confidence                    │
│     - Outlier detection                                 │
│     - Final valuation + confidence                      │
└────────────────┬────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────────┐
│  6. Create Evidence.json (ONE FILE)                     │
│     {                                                   │
│       requestId, finalValuation, finalConfidence,       │
│       satelliteData { with IPFS image URLs },           │
│       agentAnalysis { all 3 agents }                    │
│     }                                                   │
└────────────────┬────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────────┐
│  7. Upload Evidence.json to IPFS (Pinata)               │
│     - One JSON file with ALL metadata                  │
│     - Get hash: QmEvidence...                           │
└────────────────┬────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────────┐
│  8. Store Mapping Locally (evidence-map.json)           │
│     {                                                   │
│       "30": "QmEvidence..."                             │
│     }                                                   │
└────────────────┬────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────────┐
│  9. Submit to Blockchain                                │
│     - requestId, valuation, confidence                  │
│     - Evidence hash stored on-chain                     │
└─────────────────────────────────────────────────────────┘
```

## File Structure in IPFS

```
Request #30 has 3 separate IPFS files:

1. Evidence.json (Main Metadata)
   QmSie4AhKXoxS9jaM3e2sJRobRzGv8jjUpYVUkELhWPQW5
   └─ Contains ALL metadata (satellite + AI + consensus)

2. Satellite RGB Image
   QmXXX... (referenced in evidence.json)
   └─ Permanent satellite true-color image

3. Satellite NDVI Image
   QmYYY... (referenced in evidence.json)
   └─ Permanent vegetation health map

Plus user-uploaded files:
4. Property Documents (PDF, etc.)
5. Property Photos (if uploaded)
```

## How Frontend Accesses Evidence

```typescript
// 1. Fetch evidence mapping
const evidenceHash = evidenceMap["30"]
// "QmSie4AhKXoxS9jaM3e2sJRobRzGv8jjUpYVUkELhWPQW5"

// 2. Fetch evidence.json from IPFS
const evidence = await fetch(
  `https://gateway.pinata.cloud/ipfs/${evidenceHash}`
)

// 3. Parse and display
const data = await evidence.json()
console.log(data.satelliteData.rgb_image_url)
// "https://gateway.pinata.cloud/ipfs/QmRGB..."

console.log(data.agentAnalysis.agents[0].confidence)
// 80
```

## Storage Costs

### Per Request:
- Evidence.json: ~2-5 KB
- RGB Image: ~100 KB
- NDVI Image: ~100 KB
- **Total: ~200-205 KB per request**

### Pinata Free Tier:
- 1 GB storage = ~5,000 requests
- 100 GB bandwidth/month = ~500,000 image views

## Benefits of Single Evidence File

✅ **Atomic Storage** - All metadata together, no missing pieces
✅ **Verifiable** - Single IPFS hash proves complete evidence
✅ **Efficient** - One API call to get all data
✅ **Immutable** - Cannot modify satellite data without changing hash
✅ **Transparent** - Anyone can verify evidence via IPFS hash

## Summary

**YES** - Everything is in **ONE Evidence.json file**:
- ✅ Satellite data with permanent image URLs
- ✅ All 3 AI agent analyses
- ✅ Consensus results
- ✅ Risk factors and red flags
- ✅ Document verification results
- ✅ Timestamps and metadata

The satellite images are stored as **separate PNG files** in IPFS, but their **permanent URLs are included in the evidence.json**, so you have a complete record of all verification data in a single file! 🎉
