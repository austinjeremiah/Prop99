const hre = require("hardhat");

async function main() {
  console.log("🔍 Verifying VerificationAnchor & ConsensusEngine Deployment...\n");

  const addresses = require("../deployment-addresses.json");
  const verificationAnchorAddress = addresses.VerificationAnchor;
  const consensusEngineAddress = addresses.ConsensusEngine;

  // Connect to contracts
  const VerificationAnchor = await hre.ethers.getContractAt("VerificationAnchor", verificationAnchorAddress);
  const ConsensusEngine = await hre.ethers.getContractAt("ConsensusEngine", consensusEngineAddress);

  console.log("📍 Contract Addresses:");
  console.log(`   VerificationAnchor: ${verificationAnchorAddress}`);
  console.log(`   ConsensusEngine: ${consensusEngineAddress}\n`);

  // Verify VerificationAnchor is callable
  console.log("✅ VerificationAnchor Contract:");
  try {
    const owner = await VerificationAnchor.owner();
    console.log(`   Owner: ${owner}`);
    console.log(`   Status: ✅ Contract is callable`);
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }

  // Verify ConsensusEngine is callable
  console.log("\n✅ ConsensusEngine Contract:");
  try {
    const owner = await ConsensusEngine.owner();
    console.log(`   Owner: ${owner}`);
    
    const verificationAnchorLinked = await ConsensusEngine.verificationAnchor();
    console.log(`   VerificationAnchor Linked: ${verificationAnchorLinked}`);
    
    const tokenFactory = await ConsensusEngine.tokenFactory();
    console.log(`   Token Factory: ${tokenFactory}`);
    
    const assetRegistry = await ConsensusEngine.assetRegistry();
    console.log(`   Asset Registry: ${assetRegistry}`);
    
    console.log(`   Status: ✅ Contract is callable`);
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }

  console.log("\n✅ Deployment Verification Complete!");
  console.log("\n📝 Next Steps:");
  console.log("   1. Update OracleRouter to use new ConsensusEngine address");
  console.log("   2. Authorize oracle wallets on new ConsensusEngine");
  console.log("   3. Test verification → anchoring flow");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
