/**
 * Oracle Listener
 * Monitors Mantle blockchain for VerificationRequested events
 */
import { createPublicClient, http, parseAbiItem, Log } from 'viem';
import { mantle, mantleTestnet } from 'viem/chains';
import { logger } from './utils/logger';
import { processVerificationRequest } from './orchestrator';
import dotenv from 'dotenv';

dotenv.config();

const ORACLE_ROUTER_ADDRESS = process.env.ORACLE_ROUTER_ADDRESS as `0x${string}`;
const RPC_URL = process.env.MANTLE_RPC_URL || process.env.MANTLE_TESTNET_RPC_URL;
const IS_TESTNET = process.env.NODE_ENV !== 'production';

// Create public client
const publicClient = createPublicClient({
  chain: IS_TESTNET ? mantleTestnet : mantle,
  transport: http(RPC_URL)
});

// Event ABI
const VERIFICATION_REQUESTED_EVENT = parseAbiItem(
  'event VerificationRequested(bytes32 indexed requestId, address indexed requester, uint8 assetType, string latitude, string longitude, string[] documentHashes)'
);

/**
 * Start listening for verification requests
 */
export async function startListener() {
  logger.info('🚀 Starting Oracle Listener...');
  logger.info(`📡 Network: ${IS_TESTNET ? 'Mantle Testnet' : 'Mantle Mainnet'}`);
  logger.info(`📍 Oracle Router: ${ORACLE_ROUTER_ADDRESS}`);
  
  try {
    // Get current block number
    const currentBlock = await publicClient.getBlockNumber();
    logger.info(`📦 Current block: ${currentBlock}`);
    
    // Watch for new events
    const unwatch = publicClient.watchEvent({
      address: ORACLE_ROUTER_ADDRESS,
      event: VERIFICATION_REQUESTED_EVENT,
      onLogs: async (logs) => {
        for (const log of logs) {
          await handleVerificationRequest(log);
        }
      }
    });
    
    logger.info('👂 Listening for VerificationRequested events...');
    logger.info('Press Ctrl+C to stop\n');
    
    // Keep process alive
    process.on('SIGINT', () => {
      logger.info('\n🛑 Stopping oracle listener...');
      unwatch();
      process.exit(0);
    });
    
  } catch (error) {
    logger.error('❌ Failed to start listener:', error);
    throw error;
  }
}

/**
 * Handle a VerificationRequested event
 */
async function handleVerificationRequest(log: Log) {
  try {
    const { args } = log as any;
    
    logger.info('═══════════════════════════════════════════════════════════════');
    logger.info('🚨 NEW VERIFICATION REQUEST DETECTED');
    logger.info('═══════════════════════════════════════════════════════════════');
    logger.info(`📝 Request ID: ${args.requestId}`);
    logger.info(`👤 Requester: ${args.requester}`);
    logger.info(`🏠 Asset Type: ${args.assetType}`);
    logger.info(`📍 Location: ${args.latitude}, ${args.longitude}`);
    logger.info(`📄 Documents: ${args.documentHashes.length} files`);
    logger.info(`📦 Block: ${log.blockNumber}`);
    logger.info('═══════════════════════════════════════════════════════════════\n');
    
    // Process the request
    await processVerificationRequest({
      requestId: args.requestId,
      requester: args.requester,
      assetType: args.assetType,
      latitude: parseFloat(args.latitude),
      longitude: parseFloat(args.longitude),
      documentHashes: args.documentHashes,
      blockNumber: log.blockNumber!,
      transactionHash: log.transactionHash!
    });
    
  } catch (error) {
    logger.error('❌ Error handling verification request:', error);
  }
}
