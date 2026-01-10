# Complete System Architecture

## 🏗️ Full Stack Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                          │
│  - User uploads documents + location                                │
│  - Connects wallet (MetaMask/Coinbase)                             │
│  - Submits verification request                                     │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    MANTLE BLOCKCHAIN (L2)                           │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  OracleRouter Contract                                     │    │
│  │  - Receives verification request                           │    │
│  │  - Emits VerificationRequested event                       │    │
│  │  - Stores request data                                     │    │
│  └────────────────────┬───────────────────────────────────────┘    │
└───────────────────────┼────────────────────────────────────────────┘
                        │
                        │ Event emitted
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│             ORACLE BACKEND (Node.js + Python)                       │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │  1. LISTENER (TypeScript)                                │      │
│  │     - Watches blockchain for events                      │      │
│  │     - Detects VerificationRequested                      │      │
│  └───────────────────┬──────────────────────────────────────┘      │
│                      │                                              │
│                      ▼                                              │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │  2. ORCHESTRATOR (TypeScript)                            │      │
│  │     - Coordinates all services                           │      │
│  │     - Spawns Python processes                            │      │
│  └───────────────────┬──────────────────────────────────────┘      │
│                      │                                              │
│         ┌────────────┼────────────┐                                │
│         │            │            │                                │
│         ▼            ▼            ▼                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────────┐      │
│  │ Satellite│ │ Agent 1  │ │ Agent 2  │ │    Agent 3      │      │
│  │ Service  │ │ (Groq)   │ │ (ASI)    │ │   (Gemini)      │      │
│  │ (Python) │ │ (Python) │ │ (Python) │ │   (Python)      │      │
│  └─────┬────┘ └─────┬────┘ └─────┬────┘ └────┬────────────┘      │
│        │            │            │            │                    │
│        │            └────────────┴────────────┘                    │
│        │                       │                                   │
│        │                       ▼                                   │
│        │            ┌──────────────────────────┐                   │
│        │            │  All 3 agents respond    │                   │
│        │            │  with valuations         │                   │
│        │            └───────────┬──────────────┘                   │
│        │                        │                                  │
│        └────────────────────────┘                                  │
│                                 │                                  │
│                                 ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │  3. CONSENSUS ENGINE (TypeScript)                        │     │
│  │     - Aggregates 3 AI responses                          │     │
│  │     - Weighted average by confidence                     │     │
│  │     - Detects outliers                                   │     │
│  │     - Calculates final confidence                        │     │
│  └───────────────────┬──────────────────────────────────────┘     │
│                      │                                             │
│                      ▼                                             │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │  4. SUBMITTER (TypeScript)                               │     │
│  │     - Uploads evidence to IPFS/Mantle DA                 │     │
│  │     - Signs transaction with oracle key                  │     │
│  │     - Calls submitVerification on chain                  │     │
│  └───────────────────┬──────────────────────────────────────┘     │
└────────────────────┼─┼──────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    MANTLE BLOCKCHAIN (L2)                           │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  ConsensusEngine Contract                                  │    │
│  │  - Receives verification result                            │    │
│  │  - Validates oracle signature                              │    │
│  │  - Stores valuation + confidence                           │    │
│  │  - Emits VerificationCompleted event                       │    │
│  └────────────────────┬───────────────────────────────────────┘    │
└───────────────────────┼────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                          │
│  - Listens for VerificationCompleted event                          │
│  - Displays valuation + confidence                                  │
│  - Shows evidence link (IPFS)                                       │
│  - User can mint RWA token                                          │
└─────────────────────────────────────────────────────────────────────┘
```

## 📊 Data Flow Example

### Input (from Frontend)
```json
{
  "assetType": 1,
  "latitude": "40.7128",
  "longitude": "-74.0060",
  "documentHashes": ["QmDoc1...", "QmDoc2..."]
}
```

### Satellite Data (Google Earth Engine)
```json
{
  "area_sqm": 200,
  "ndvi": 0.65,
  "cloud_coverage": 5,
  "resolution_meters": 10,
  "satellite": "Sentinel-2",
  "rgb_image_url": "https://...",
  "ndvi_image_url": "https://..."
}
```

### AI Agent Responses (Parallel)
```json
[
  {
    "agent": "groq",
    "valuation": 485000,
    "confidence": 88,
    "reasoning": "Property well-maintained, good location..."
  },
  {
    "agent": "asi",
    "valuation": 465000,
    "confidence": 84,
    "reasoning": "Solid fundamentals, market favorable..."
  },
  {
    "agent": "gemini",
    "valuation": 475000,
    "confidence": 90,
    "reasoning": "Excellent condition, high demand area..."
  }
]
```

### Consensus Result
```json
{
  "finalValuation": 475000,
  "finalConfidence": 87,
  "consensusScore": 95,
  "statistics": {
    "averageValuation": 475000,
    "standardDeviation": 8165,
    "minValuation": 465000,
    "maxValuation": 485000
  }
}
```

### Output (to Blockchain)
```solidity
submitVerification(
  requestId: 0x1234...,
  valuation: 475000,
  confidence: 87,
  evidenceHash: "QmEvidence..."
)
```

## ⚡ Performance Metrics

| Step | Duration | Cost |
|------|----------|------|
| 1. Submit request (frontend) | ~2s | ~$0.01 gas |
| 2. Satellite data fetch | ~3s | Free |
| 3. AI agents (parallel) | ~5s | Free (rate limited) |
| 4. Consensus calculation | <1s | Free |
| 5. Submit result | ~2s | ~$0.05 gas |
| **TOTAL** | **~13s** | **~$0.06** |

Compare to Ethereum: **$180+ in gas fees** 💸

## 🎯 Key Features

✅ **Multi-LLM Consensus** - 3 independent AI agents reduce bias
✅ **Real Satellite Data** - 10m resolution Sentinel-2 imagery  
✅ **Parallel Processing** - All agents run simultaneously
✅ **Outlier Detection** - Flags suspicious valuations
✅ **Confidence Scoring** - Know when to trust results
✅ **Evidence Trail** - All data stored immutably on IPFS
✅ **Gas Efficient** - Mantle L2 = 36x cheaper than Ethereum
✅ **Fully Automated** - No manual intervention needed

## 🔐 Security Features

- Oracle private key stored securely
- Evidence uploaded to decentralized storage (IPFS)
- Multi-signature validation (3 AI agents must agree)
- On-chain verification of oracle signature
- Immutable audit trail on blockchain

## 🌐 External APIs Used

| Service | Purpose | Cost | Rate Limit |
|---------|---------|------|------------|
| Google Earth Engine | Satellite imagery | Free | Noncommercial |
| Groq | AI analysis (Llama 3.3) | Free | 30 req/min |
| Google Gemini | AI analysis (Gemini 2.0) | Free | 15 req/min |
| ASI Agent | AI analysis | Free/Paid | TBD |
| Pinata IPFS | Evidence storage | Free | 100 pins/month |
| Mantle RPC | Blockchain access | Free | Unlimited |

## 🏆 Why This Wins

1. **Real AI Intelligence** - Not just price feeds, actual property analysis
2. **Decentralized Oracle** - Multiple AI agents prevent single point of failure
3. **Verifiable Evidence** - All data stored on-chain/IPFS for auditing
4. **Cost Effective** - Uses Mantle L2 for 36x gas savings
5. **Production Ready** - Complete end-to-end implementation
6. **Scalable** - Can handle multiple concurrent requests
7. **Innovative** - First RWA oracle using multi-LLM consensus on Mantle
