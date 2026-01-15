/**
 * Authorize New ConsensusEngine & VerificationAnchor
 * This script authorizes the oracle wallet on both newly deployed contracts
 */
const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🔐 Authorizing New ConsensusEngine & VerificationAnchor...\n");

  // Load deployment addresses
  const deploymentAddresses = require("../deployment-addresses.json");
  
  const CONSENSUS_ENGINE_ADDRESS = deploymentAddresses.ConsensusEngine;
  const VERIFICATION_ANCHOR_ADDRESS = deploymentAddresses.VerificationAnchor;
  
  // Oracle wallet address (the one submitting verifications)
  const ORACLE_WALLET_ADDRESS = "0xe01Add0c3640a8314132bAF491d101A38ffEF4f0";

  const [deployer] = await hre.ethers.getSigners();
  const deployerAddress = await deployer.getAddress();

  console.log(`📍 Deployer: ${deployerAddress}`);
  console.log(`📍 ConsensusEngine: ${CONSENSUS_ENGINE_ADDRESS}`);
  console.log(`📍 VerificationAnchor: ${VERIFICATION_ANCHOR_ADDRESS}`);
  console.log(`👤 Oracle Wallet: ${ORACLE_WALLET_ADDRESS}\n`);

  // Get the contracts
  const ConsensusEngine = await hre.ethers.getContractAt("ConsensusEngine", CONSENSUS_ENGINE_ADDRESS);
  const VerificationAnchor = await hre.ethers.getContractAt("VerificationAnchor", VERIFICATION_ANCHOR_ADDRESS);

  // ============ 1. Authorize Oracle on ConsensusEngine ============
  console.log("⏳ 1/3 Authorizing oracle on ConsensusEngine...");
  try {
    const isAuthorized = await ConsensusEngine.authorizedOracles(ORACLE_WALLET_ADDRESS);
    
    if (isAuthorized) {
      console.log("✅ Oracle already authorized on ConsensusEngine");
    } else {
      const tx = await ConsensusEngine.authorizeOracle(ORACLE_WALLET_ADDRESS);
      console.log(`📤 Transaction sent: ${tx.hash}`);
      await tx.wait();
      console.log("✅ Oracle authorized on ConsensusEngine\n");
    }
  } catch (error) {
    console.log(`❌ Failed to authorize on ConsensusEngine: ${error.message}\n`);
  }

  // ============ 2. Verify VerificationAnchor is linked ============
  console.log("⏳ 2/3 Verifying VerificationAnchor linkage...");
  try {
    const linkedEngine = await VerificationAnchor.consensusEngine();
    console.log(`   VerificationAnchor linked to: ${linkedEngine}`);
    
    if (linkedEngine.toLowerCase() === CONSENSUS_ENGINE_ADDRESS.toLowerCase()) {
      console.log("✅ VerificationAnchor correctly linked to ConsensusEngine\n");
    } else {
      console.log("⚠️  VerificationAnchor not linked to new ConsensusEngine, linking...");
      const tx = await VerificationAnchor.setConsensusEngine(CONSENSUS_ENGINE_ADDRESS);
      console.log(`📤 Transaction sent: ${tx.hash}`);
      await tx.wait();
      console.log("✅ VerificationAnchor linked to ConsensusEngine\n");
    }
  } catch (error) {
    console.log(`❌ Failed to verify linkage: ${error.message}\n`);
  }

  // ============ 3. Verify ConsensusEngine can call VerificationAnchor ============
  console.log("⏳ 3/3 Verifying ConsensusEngine → VerificationAnchor link...");
  try {
    const linkedAnchor = await ConsensusEngine.verificationAnchor();
    console.log(`   ConsensusEngine linked to VerificationAnchor: ${linkedAnchor}`);
    
    if (linkedAnchor.toLowerCase() === VERIFICATION_ANCHOR_ADDRESS.toLowerCase()) {
      console.log("✅ ConsensusEngine correctly linked to VerificationAnchor\n");
    } else {
      console.log("⚠️  ConsensusEngine not linked to new VerificationAnchor, linking...");
      const tx = await ConsensusEngine.setVerificationAnchor(VERIFICATION_ANCHOR_ADDRESS);
      console.log(`📤 Transaction sent: ${tx.hash}`);
      await tx.wait();
      console.log("✅ ConsensusEngine linked to VerificationAnchor\n");
    }
  } catch (error) {
    console.log(`❌ Failed to verify ConsensusEngine link: ${error.message}\n`);
  }

  // ============ Summary ============
  console.log("════════════════════════════════════════════════════════");
  console.log("✅ AUTHORIZATION COMPLETE");
  console.log("════════════════════════════════════════════════════════\n");
  console.log("📝 Authorization Summary:");
  console.log(`   Oracle: ${ORACLE_WALLET_ADDRESS}`);
  console.log(`   ConsensusEngine: ${CONSENSUS_ENGINE_ADDRESS}`);
  console.log(`   VerificationAnchor: ${VERIFICATION_ANCHOR_ADDRESS}`);
  console.log("\n✅ The oracle can now:");
  console.log("   • Submit oracle responses to ConsensusEngine");
  console.log("   • Trigger verification anchoring to L1");
  console.log("   • Access all L2-to-L1 bridging features");
  console.log("\n════════════════════════════════════════════════════════\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
