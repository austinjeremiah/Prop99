# Expected Output Examples

## 1️⃣ Testing Agents (`npm test`)

```
═══════════════════════════════════════════════════════════════
🧪 TESTING AI AGENTS
═══════════════════════════════════════════════════════════════

📡 Testing Satellite Service...

🧪 Testing Satellite Service...
✅ Satellite Service response:
   Valuation: N/A
   Confidence: 0%
   Agent: undefined

🤖 Testing AI Agents in Parallel...

🧪 Testing Agent 1 (Groq)...
✅ Agent 1 (Groq) response:
   Valuation: $485,000
   Confidence: 88%
   Agent: groq

🧪 Testing Agent 2 (ASI)...
✅ Agent 2 (ASI) response:
   Valuation: $465,000
   Confidence: 84%
   Agent: asi

🧪 Testing Agent 3 (Gemini)...
✅ Agent 3 (Gemini) response:
   Valuation: $475,000
   Confidence: 90%
   Agent: gemini

═══════════════════════════════════════════════════════════════
📊 TEST SUMMARY
═══════════════════════════════════════════════════════════════
Satellite Service: ✅ PASS
Agent 1 (Groq): ✅ PASS
Agent 2 (ASI): ✅ PASS
Agent 3 (Gemini): ✅ PASS
═══════════════════════════════════════════════════════════════

🔮 Consensus Calculation:
   Average valuation: $475,000
   Min: $465,000
   Max: $485,000
   Spread: $20,000
```

## 2️⃣ Starting Oracle (`npm run dev`)

```
2026-01-10 12:00:00 ═══════════════════════════════════════════════════════════════
2026-01-10 12:00:00 🤖 RWA ORACLE STARTING
2026-01-10 12:00:00 ═══════════════════════════════════════════════════════════════
2026-01-10 12:00:00 Oracle Address: 0xf4d1656069B739d652CdFC8Cc6ddE2Cd0b2d9A9C
2026-01-10 12:00:00 Network: Testnet
2026-01-10 12:00:00 ═══════════════════════════════════════════════════════════════

2026-01-10 12:00:01 🚀 Starting Oracle Listener...
2026-01-10 12:00:01 📡 Network: Mantle Testnet
2026-01-10 12:00:01 📍 Oracle Router: 0xf4d1656069B739d652CdFC8Cc6ddE2Cd0b2d9A9C
2026-01-10 12:00:02 📦 Current block: 12345678
2026-01-10 12:00:02 👂 Listening for VerificationRequested events...
2026-01-10 12:00:02 Press Ctrl+C to stop

[Waiting for events...]
```

## 3️⃣ Processing Request (When User Submits)

```
2026-01-10 12:05:30 ═══════════════════════════════════════════════════════════════
2026-01-10 12:05:30 🚨 NEW VERIFICATION REQUEST DETECTED
2026-01-10 12:05:30 ═══════════════════════════════════════════════════════════════
2026-01-10 12:05:30 📝 Request ID: 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
2026-01-10 12:05:30 👤 Requester: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb8
2026-01-10 12:05:30 🏠 Asset Type: 1
2026-01-10 12:05:30 📍 Location: 40.7128, -74.0060
2026-01-10 12:05:30 📄 Documents: 2 files
2026-01-10 12:05:30 📦 Block: 12345680
2026-01-10 12:05:30 ═══════════════════════════════════════════════════════════════

2026-01-10 12:05:30 🔄 Starting AI analysis pipeline...

2026-01-10 12:05:30 📡 Step 1: Fetching satellite imagery...
2026-01-10 12:05:33 ✅ Satellite data: 200 sqm, NDVI 0.65
2026-01-10 12:05:33    Cloud coverage: 5%, Resolution: 10m

2026-01-10 12:05:33 🤖 Step 2: Running 3 AI agents in parallel...
2026-01-10 12:05:38 ✅ Agent 1 (groq): $485,000 (88% confidence)
2026-01-10 12:05:38 ✅ Agent 2 (asi): $465,000 (84% confidence)
2026-01-10 12:05:38 ✅ Agent 3 (gemini): $475,000 (90% confidence)

2026-01-10 12:05:38 🔮 Step 3: Calculating consensus...
2026-01-10 12:05:38 ✅ Consensus reached: $475,000
2026-01-10 12:05:38    Final confidence: 87%
2026-01-10 12:05:38    Consensus score: 95/100
2026-01-10 12:05:38    Standard deviation: ±$8,165

2026-01-10 12:05:38 ⛓️  Step 4: Submitting to blockchain...
2026-01-10 12:05:38 📦 Uploading evidence to IPFS...
2026-01-10 12:05:39 ✅ Evidence uploaded: QmEvidence1234567890
2026-01-10 12:05:39 📤 Submitting transaction to Mantle...
2026-01-10 12:05:39 ⏳ Waiting for confirmation...
2026-01-10 12:05:41 ✅ Transaction submitted: 0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890

2026-01-10 12:05:41 ═══════════════════════════════════════════════════════════════
2026-01-10 12:05:41 ✅ REQUEST COMPLETED IN 11.2s
2026-01-10 12:05:41 ═══════════════════════════════════════════════════════════════

[Waiting for next event...]
```

## 4️⃣ Error Scenarios

### Missing API Key
```
2026-01-10 12:00:00 ❌ Missing required environment variables: GROQ_API_KEY, GOOGLE_GEMINI_API_KEY
2026-01-10 12:00:00 Please check your .env file
```

### Agent Timeout
```
2026-01-10 12:05:33 🤖 Step 2: Running 3 AI agents in parallel...
2026-01-10 12:05:38 ✅ Agent 1 (groq): $485,000 (88% confidence)
2026-01-10 12:06:03 ❌ Agent 2 failed: Agent timeout
2026-01-10 12:05:38 ✅ Agent 3 (gemini): $475,000 (90% confidence)

2026-01-10 12:06:03 🔮 Step 3: Calculating consensus...
2026-01-10 12:06:03 ✅ Consensus reached: $480,000
2026-01-10 12:06:03    Final confidence: 89%
2026-01-10 12:06:03    Consensus score: 98/100
2026-01-10 12:06:03    ⚠️  Only 2 agents responded (need at least 2)
```

### Outlier Detected
```
2026-01-10 12:05:38 🤖 Step 2: Running 3 AI agents in parallel...
2026-01-10 12:05:38 ✅ Agent 1 (groq): $485,000 (88% confidence)
2026-01-10 12:05:38 ✅ Agent 2 (asi): $950,000 (85% confidence)  ⚠️ OUTLIER
2026-01-10 12:05:38 ✅ Agent 3 (gemini): $475,000 (90% confidence)

2026-01-10 12:05:38 🔮 Step 3: Calculating consensus...
2026-01-10 12:05:38 ✅ Consensus reached: $512,000
2026-01-10 12:05:38    Final confidence: 81%
2026-01-10 12:05:38    Consensus score: 65/100
2026-01-10 12:05:38    Standard deviation: ±$223,607
2026-01-10 12:05:38    ⚠️  1 outlier(s) detected
```

## 5️⃣ Frontend View

### Submission
```
┌─────────────────────────────────────┐
│  Submit Asset for Verification      │
├─────────────────────────────────────┤
│  Latitude: [40.7128____________]    │
│  Longitude: [-74.0060___________]   │
│  Documents: [📄 deed.pdf]           │
│             [📷 photo1.jpg]         │
│                                      │
│  [Submit for Verification]          │
└─────────────────────────────────────┘
```

### Processing
```
┌─────────────────────────────────────┐
│  ⏳ Verification in Progress         │
├─────────────────────────────────────┤
│  3 AI oracles are analyzing your    │
│  property in parallel...            │
│                                      │
│  ⚫ Fetching satellite data          │
│  ⚫ Running AI analysis              │
│  ⚫ Calculating consensus            │
│  ⚫ Submitting to blockchain         │
│                                      │
│  Estimated time: ~15 seconds        │
└─────────────────────────────────────┘
```

### Complete
```
┌─────────────────────────────────────┐
│  ✅ Verification Complete!           │
├─────────────────────────────────────┤
│  💰 Valuation: $475,000             │
│  📊 Confidence: 87%                 │
│  🤖 AI Consensus: 95/100            │
│                                      │
│  📍 Location: 40.7128, -74.0060     │
│  🛰️ Satellite: Sentinel-2 (10m)     │
│  📄 Documents: 2 verified           │
│                                      │
│  Agent Responses:                   │
│  • Groq: $485,000 (88%)             │
│  • ASI: $465,000 (84%)              │
│  • Gemini: $475,000 (90%)           │
│                                      │
│  🔗 View Evidence on IPFS           │
│  [Mint RWA Token]                   │
└─────────────────────────────────────┘
```

## 6️⃣ Log File (oracle.log)

```
2026-01-10 12:00:00 🚀 Starting Oracle Listener...
2026-01-10 12:05:30 🚨 NEW VERIFICATION REQUEST DETECTED
2026-01-10 12:05:30 📝 Request ID: 0x1234...
2026-01-10 12:05:33 ✅ Satellite data: 200 sqm, NDVI 0.65
2026-01-10 12:05:38 ✅ Agent 1 (groq): $485,000 (88% confidence)
2026-01-10 12:05:38 ✅ Agent 2 (asi): $465,000 (84% confidence)
2026-01-10 12:05:38 ✅ Agent 3 (gemini): $475,000 (90% confidence)
2026-01-10 12:05:38 ✅ Consensus reached: $475,000
2026-01-10 12:05:41 ✅ Transaction submitted: 0xabcdef...
2026-01-10 12:05:41 ✅ REQUEST COMPLETED IN 11.2s
```

## 🎬 Summary

When everything is working:
- ✅ Test passes in < 30 seconds
- ✅ Oracle starts and listens
- ✅ Requests process in ~13 seconds
- ✅ All 3 agents respond successfully
- ✅ Consensus is calculated
- ✅ Transaction is submitted
- ✅ Frontend displays results

You'll know it's working when you see:
1. All agents return valuations
2. Consensus score > 80
3. Transaction hash appears
4. Completion message shows

Good luck! 🚀
