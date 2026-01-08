const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting Prop99 deployment on Mantle...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString(), "\n");

  // 1. Deploy ComplianceModule
  console.log("📋 1/7 Deploying ComplianceModule...");
  const ComplianceModule = await hre.ethers.getContractFactory("ComplianceModule");
  const complianceModule = await ComplianceModule.deploy();
  await complianceModule.waitForDeployment();
  const complianceAddress = await complianceModule.getAddress();
  console.log("✅ ComplianceModule deployed to:", complianceAddress, "\n");

  // 2. Deploy ValuationOracle
  console.log("💰 2/7 Deploying ValuationOracle...");
  const ValuationOracle = await hre.ethers.getContractFactory("ValuationOracle");
  const valuationOracle = await ValuationOracle.deploy();
  await valuationOracle.waitForDeployment();
  const valuationOracleAddress = await valuationOracle.getAddress();
  console.log("✅ ValuationOracle deployed to:", valuationOracleAddress, "\n");

  // 3. Deploy AssetRegistry
  console.log("🗂️  3/7 Deploying AssetRegistry...");
  const AssetRegistry = await hre.ethers.getContractFactory("AssetRegistry");
  const assetRegistry = await AssetRegistry.deploy(valuationOracleAddress);
  await assetRegistry.waitForDeployment();
  const assetRegistryAddress = await assetRegistry.getAddress();
  console.log("✅ AssetRegistry deployed to:", assetRegistryAddress, "\n");

  // 4. Deploy RWATokenFactory
  console.log("🏭 4/7 Deploying RWATokenFactory...");
  const RWATokenFactory = await hre.ethers.getContractFactory("RWATokenFactory");
  const tokenFactory = await RWATokenFactory.deploy(assetRegistryAddress, complianceAddress);
  await tokenFactory.waitForDeployment();
  const tokenFactoryAddress = await tokenFactory.getAddress();
  console.log("✅ RWATokenFactory deployed to:", tokenFactoryAddress, "\n");

  // 5. Deploy ConsensusEngine
  console.log("⚖️  5/7 Deploying ConsensusEngine...");
  const ConsensusEngine = await hre.ethers.getContractFactory("ConsensusEngine");
  const consensusEngine = await ConsensusEngine.deploy();
  await consensusEngine.waitForDeployment();
  const consensusEngineAddress = await consensusEngine.getAddress();
  console.log("✅ ConsensusEngine deployed to:", consensusEngineAddress, "\n");

  // 6. Deploy OracleRouter
  console.log("🔀 6/7 Deploying OracleRouter...");
  const OracleRouter = await hre.ethers.getContractFactory("OracleRouter");
  const oracleRouter = await OracleRouter.deploy();
  await oracleRouter.waitForDeployment();
  const oracleRouterAddress = await oracleRouter.getAddress();
  console.log("✅ OracleRouter deployed to:", oracleRouterAddress, "\n");

  // 7. Configure contracts
  console.log("⚙️  7/7 Configuring contracts...");
  
  // Set ConsensusEngine dependencies
  await consensusEngine.setTokenFactory(tokenFactoryAddress);
  await consensusEngine.setAssetRegistry(assetRegistryAddress);
  console.log("✅ ConsensusEngine configured");

  // Set OracleRouter consensus engine
  await oracleRouter.setConsensusEngine(consensusEngineAddress);
  console.log("✅ OracleRouter configured");

  // Authorize deployer as oracle (for testing)
  await oracleRouter.authorizeOracle(deployer.address);
  await consensusEngine.authorizeOracle(deployer.address);
  await valuationOracle.authorizeUpdater(deployer.address);
  console.log("✅ Deployer authorized as oracle\n");

  // Print deployment summary
  console.log("=" .repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=" .repeat(60));
  console.log("\n📝 Contract Addresses:\n");
  console.log("OracleRouter:       ", oracleRouterAddress);
  console.log("ConsensusEngine:    ", consensusEngineAddress);
  console.log("AssetRegistry:      ", assetRegistryAddress);
  console.log("RWATokenFactory:    ", tokenFactoryAddress);
  console.log("ValuationOracle:    ", valuationOracleAddress);
  console.log("ComplianceModule:   ", complianceAddress);
  console.log("\n" + "=".repeat(60));

  // Save addresses to file
  const fs = require('fs');
  const addresses = {
    OracleRouter: oracleRouterAddress,
    ConsensusEngine: consensusEngineAddress,
    AssetRegistry: assetRegistryAddress,
    RWATokenFactory: tokenFactoryAddress,
    ValuationOracle: valuationOracleAddress,
    ComplianceModule: complianceAddress,
    network: hre.network.name,
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync(
    'deployment-addresses.json',
    JSON.stringify(addresses, null, 2)
  );
  console.log("\n✅ Addresses saved to deployment-addresses.json");

  // Print next steps
  console.log("\n📌 Next Steps:");
  console.log("1. Update frontend .env with contract addresses");
  console.log("2. Update offchain .env with contract addresses");
  console.log("3. Verify contracts on Mantle Explorer");
  console.log("4. Test verification flow");
  console.log("\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
