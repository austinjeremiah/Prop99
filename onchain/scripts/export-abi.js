// Simple script to copy compiled ABIs into the frontend folder
// Usage:
//   node scripts/export-abi.js ../frontend/abis
// Make sure you've run `pnpm compile` (or `npm run compile`) in the onchain project first.

const fs = require('fs');
const path = require('path');

const OUT_DIR = process.argv[2] || path.resolve(__dirname, '../../frontend/abis');

const contracts = [
  { file: 'core/OracleRouter.sol/OracleRouter.json', out: 'OracleRouter.json' },
  { file: 'core/ConsensusEngine.sol/ConsensusEngine.json', out: 'ConsensusEngine.json' },
  { file: 'core/AssetRegistry.sol/AssetRegistry.json', out: 'AssetRegistry.json' },
  { file: 'tokens/RWATokenFactory.sol/RWATokenFactory.json', out: 'RWATokenFactory.json' },
  { file: 'tokens/RWAToken.sol/RWAToken.json', out: 'RWAToken.json' },
  { file: 'oracle/ValuationOracle.sol/ValuationOracle.json', out: 'ValuationOracle.json' },
  { file: 'compliance/ComplianceModule.sol/ComplianceModule.json', out: 'ComplianceModule.json' },
];

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function main() {
  const artifactsRoot = path.resolve(__dirname, '../artifacts/contracts');
  ensureDir(OUT_DIR);

  for (const c of contracts) {
    const artifactPath = path.join(artifactsRoot, c.file);
    if (!fs.existsSync(artifactPath)) {
      console.warn(`Skip ${c.out}: missing artifact ${artifactPath}. Did you run hardhat compile?`);
      continue;
    }
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf-8'));
    const abi = artifact.abi;
    const outPath = path.join(OUT_DIR, c.out);
    fs.writeFileSync(outPath, JSON.stringify(abi, null, 2));
    console.log(`Exported ABI: ${outPath}`);
  }
}

main();
