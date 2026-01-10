# Quick Start Guide - AI Oracle Backend

## 🚀 Complete Setup (5 minutes)

### 1. Install Dependencies

**Python packages:**
```bash
cd offchain
pip install -r requirements.txt
```

**Node.js packages:**
```bash
npm install
```

### 2. Get Free API Keys (2 minutes)

**Groq (30 req/min free):**
1. Go to https://console.groq.com
2. Sign up with GitHub/Google
3. Create API Key
4. Copy the key

**Google Gemini (15 RPM free):**
1. Go to https://makersuite.google.com/app/apikey
2. Sign in with Google
3. Create API Key
4. Copy the key

**ASI Agent:**
- Follow ASI Agent documentation

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and fill in:
- `ORACLE_PRIVATE_KEY` - Your oracle wallet private key (with MNT for gas)
- `GROQ_API_KEY` - From step 2
- `GOOGLE_GEMINI_API_KEY` - From step 2
- `ASI_AGENT_API_KEY` - Your ASI key
- Other values are already set from deployment

### 4. Test Everything

```bash
npm test
```

You should see all 3 agents respond with valuations!

### 5. Start the Oracle

```bash
npm run dev
```

The oracle is now listening for verification requests!

## 📝 How to Use

### From Frontend

When a user submits an asset in your Next.js frontend:

```typescript
await oracleRouter.requestVerification(
  1, // REAL_ESTATE
  "40.7128", // latitude
  "-74.0060", // longitude  
  ["QmDoc1", "QmDoc2"] // IPFS document hashes
);
```

### What Happens

1. ✅ Smart contract emits `VerificationRequested` event
2. ✅ Oracle listener detects it
3. ✅ Fetches satellite data (10m resolution Sentinel-2)
4. ✅ Runs 3 AI agents **in parallel**:
   - Groq (Llama-3.3-70B) - Fast inference
   - ASI Agent - Autonomous analysis
   - Gemini 2.0 Flash - Google AI
5. ✅ Calculates consensus (weighted by confidence)
6. ✅ Uploads evidence to IPFS
7. ✅ Submits result to blockchain
8. ✅ Frontend displays verification ✨

## 🎯 Expected Output

```
🚨 NEW VERIFICATION REQUEST DETECTED
📝 Request ID: 0x1234...
📍 Location: 40.7128, -74.0060
📄 Documents: 2 files

🔄 Starting AI analysis pipeline...

📡 Step 1: Fetching satellite imagery...
✅ Satellite data: 200 sqm, NDVI 0.65
   Cloud coverage: 5%, Resolution: 10m

🤖 Step 2: Running 3 AI agents in parallel...
✅ Agent 1 (groq): $485,000 (88% confidence)
✅ Agent 2 (asi): $465,000 (84% confidence)
✅ Agent 3 (gemini): $475,000 (90% confidence)

🔮 Step 3: Calculating consensus...
✅ Consensus reached: $475,000
   Final confidence: 87%
   Consensus score: 95/100
   Standard deviation: ±$8,165

⛓️  Step 4: Submitting to blockchain...
📦 Evidence uploaded: QmEvidence1234
📤 Submitting transaction to Mantle...
✅ Transaction submitted: 0xabc...

✅ REQUEST COMPLETED IN 12.5s
```

## ⚡ Gas Costs on Mantle

- Submit verification: ~$0.05 per transaction
- vs Ethereum: ~$180 💰
- **36x cheaper!**

## 🔧 Troubleshooting

**"Missing required environment variables":**
- Make sure you copied `.env.example` to `.env`
- Fill in all API keys

**"Python not found":**
- Install Python 3.8+: https://python.org
- Or set `PYTHON_PATH` in `.env` to your Python location

**"Earth Engine permission denied":**
- Make sure Earth Engine API is enabled
- Wait 5-10 minutes for permissions

**"Transaction failed":**
- Check oracle wallet has MNT for gas
- Get testnet MNT from https://faucet.testnet.mantle.xyz

**"Agent timeout":**
- Check your API keys are valid
- Groq/Gemini have rate limits (30/15 req/min)

## 📊 Production Deployment

For hackathon/production:

1. **Security:**
   - Use environment variable service (not .env file)
   - Never commit private keys to git

2. **Reliability:**
   - Run multiple oracle instances for redundancy
   - Use PM2 or Docker for process management

3. **Monitoring:**
   - Check `oracle.log` for detailed logs
   - Set up alerts for failed transactions

4. **Rate Limits:**
   - Groq: 30 requests/min (free)
   - Gemini: 15 requests/min (free)
   - Consider paid tiers for high volume

## 🏆 Winning Features

✅ **Multi-LLM Consensus** - 3 AI agents reduce bias
✅ **Real Satellite Data** - 10m Sentinel-2 imagery
✅ **Outlier Detection** - Flags suspicious valuations
✅ **Mantle DA Storage** - Cheap evidence storage
✅ **Gas Efficient** - $0.05 vs $180 on Ethereum
✅ **Fully Automated** - No manual intervention needed

Good luck with the hackathon! 🚀
