const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 Deploying VerificationAnchor & Updated ConsensusEngine...\n");

  const signers = await hre.ethers.getSigners();
  if (!signers || signers.length === 0) {
    throw new Error("No signers available. Check your PRIVATE_KEY environment variable.");
  }
  
  const deployer = signers[0];
  const deployerAddress = await deployer.getAddress();
  console.log("Deploying contracts with account:", deployerAddress);
  
  const balance = await hre.ethers.provider.getBalance(deployerAddress);
  console.log("Account balance:", balance.toString(), "\n");

  // Load existing addresses
  let deploymentAddresses = {};
  if (fs.existsSync("./deployment-addresses.json")) {
    deploymentAddresses = JSON.parse(fs.readFileSync("./deployment-addresses.json", "utf8"));
  }

  // 1. Deploy VerificationAnchor
  console.log("🔗 1/2 Deploying VerificationAnchor (L1 Anchoring)...");
  const VerificationAnchor = await hre.ethers.getContractFactory("VerificationAnchor");
  const verificationAnchor = await VerificationAnchor.deploy();
  await verificationAnchor.waitForDeployment();
  const verificationAnchorAddress = await verificationAnchor.getAddress();
  console.log("✅ VerificationAnchor deployed to:", verificationAnchorAddress, "\n");

  // 2. Update ConsensusEngine (redeploy with L1 anchoring)
  console.log("⚖️  2/2 Updating ConsensusEngine (with L1 Anchoring)...");
  const ConsensusEngine = await hre.ethers.getContractFactory("ConsensusEngine");
  const consensusEngine = await ConsensusEngine.deploy();
  await consensusEngine.waitForDeployment();
  const consensusEngineAddress = await consensusEngine.getAddress();
  console.log("✅ Updated ConsensusEngine deployed to:", consensusEngineAddress, "\n");

  // 3. Link VerificationAnchor to ConsensusEngine
  console.log("🔗 3/3 Linking VerificationAnchor to ConsensusEngine...");
  try {
    const tx1 = await verificationAnchor.setConsensusEngine(consensusEngineAddress);
    await tx1.wait();
    console.log("✅ VerificationAnchor linked to ConsensusEngine\n");
  } catch (error) {
    console.log("⚠️  setConsensusEngine not required or already set\n");
  }

  // 4. Link ConsensusEngine to VerificationAnchor
  console.log("🔗 4/3 Linking ConsensusEngine to VerificationAnchor...");
  const tx2 = await consensusEngine.setVerificationAnchor(verificationAnchorAddress);
  await tx2.wait();
  console.log("✅ ConsensusEngine linked to VerificationAnchor\n");

  // 5. Set other required addresses if they exist
  if (deploymentAddresses.RWATokenFactory) {
    console.log("⚙️  Setting RWATokenFactory address...");
    try {
      const tx3 = await consensusEngine.setTokenFactory(deploymentAddresses.RWATokenFactory);
      await tx3.wait();
      console.log("✅ RWATokenFactory linked\n");
    } catch (error) {
      console.log("⚠️  RWATokenFactory linking failed:", error.message, "\n");
    }
  }

  if (deploymentAddresses.AssetRegistry) {
    console.log("⚙️  Setting AssetRegistry address...");
    try {
      const tx4 = await consensusEngine.setAssetRegistry(deploymentAddresses.AssetRegistry);
      await tx4.wait();
      console.log("✅ AssetRegistry linked\n");
    } catch (error) {
      console.log("⚠️  AssetRegistry linking failed:", error.message, "\n");
    }
  }

  // Update deployment addresses
  deploymentAddresses.VerificationAnchor = verificationAnchorAddress;
  deploymentAddresses.ConsensusEngine = consensusEngineAddress;

  // Save updated addresses
  fs.writeFileSync(
    "./deployment-addresses.json",
    JSON.stringify(deploymentAddresses, null, 2)
  );
  console.log("📝 Deployment addresses saved to deployment-addresses.json\n");

  // Summary
  console.log("════════════════════════════════════════════════════════");
  console.log("✅ DEPLOYMENT COMPLETE");
  console.log("════════════════════════════════════════════════════════");
  console.log("\n📍 Deployed Addresses:");
  console.log("   VerificationAnchor:", verificationAnchorAddress);
  console.log("   ConsensusEngine (Updated):", consensusEngineAddress);
  console.log("\n🔗 Key Features:");
  console.log("   • VerificationAnchor: L1 anchoring via L2CrossDomainMessenger");
  console.log("   • ConsensusEngine: Enhanced with L1 block reading & verification hashing");
  console.log("   • Ethereum L1 Integration: Mantle rollup-to-Ethereum bridging");
  console.log("\n📋 Next Steps:");
  console.log("   1. Update OracleRouter to use new ConsensusEngine address");
  console.log("   2. Authorize oracle wallets on new ConsensusEngine");
  console.log("   3. Verify L1 message passing on Ethereum Mainnet");
  console.log("════════════════════════════════════════════════════════\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
