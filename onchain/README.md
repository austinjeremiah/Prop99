# Prop99 Smart Contracts

Smart contracts for RWA (Real World Asset) Oracle on Mantle blockchain.

## Architecture

### Core Contracts (7 Total)

1. **OracleRouter.sol** - Entry point for verification requests
2. **ConsensusEngine.sol** - Validates oracle responses (2-of-3 consensus)
3. **AssetRegistry.sol** - Central database of verified assets
4. **RWAToken.sol** - ERC-20 token template for assets
5. **RWATokenFactory.sol** - Creates new token contracts
6. **ValuationOracle.sol** - Price feeds for DeFi integration
7. **ComplianceModule.sol** - KYC/AML compliance checks

OracleRouter:        0xf4d1656069B739d652CdFC8Cc6ddE2Cd0b2d9A9C
ConsensusEngine:     0x9d80B22A0D2da86AA1406c1d587cd2E94793429c
AssetRegistry:       0x94768a15Cd37e07eEcc02eDe47D134A26C1ecB3f
RWATokenFactory:     0x68283AAa8899A4aA299141ca6f04dF8e5802509f
ValuationOracle:     0x522748669646A1a099474cd7f98060968A80E812
ComplianceModule:    0x0bfB6f131A99D5aaA3071618FFBD5bb3ea87C619
