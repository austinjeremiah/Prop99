/**
 * Oracle Listener
 * Monitors Mantle blockchain for VerificationRequested events
 */
import { createPublicClient, http, parseAbiItem, Log, defineChain } from 'viem';
import { mantle } from 'viem/chains';
import { logger } from './utils/logger';
import { processVerificationRequest } from './orchestrator';
import dotenv from 'dotenv';

dotenv.config();

const ORACLE_ROUTER_ADDRESS = process.env.ORACLE_ROUTER_ADDRESS as `0x${string}`;
const IS_TESTNET = process.env.NODE_ENV !== 'production';
const RPC_URL = IS_TESTNET ? process.env.MANTLE_TESTNET_RPC_URL : process.env.MANTLE_RPC_URL;

// Define Mantle Sepolia Testnet
const mantleSepolia = defineChain({
  id: 5003,
  name: 'Mantle Sepolia Testnet',
  network: 'mantle-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'MNT',
    symbol: 'MNT',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.sepolia.mantle.xyz'],
    },
    public: {
      http: ['https://rpc.sepolia.mantle.xyz'],
    },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://explorer.sepolia.mantle.xyz' },
  },
  testnet: true,
});

// Create public client
const publicClient = createPublicClient({
  chain: IS_TESTNET ? mantleSepolia : mantle,
  transport: http(RPC_URL)
});

// Event ABI - matches OracleRouter.sol
const VERIFICATION_REQUESTED_EVENT = parseAbiItem(
  'event VerificationRequested(uint256 indexed requestId, address indexed owner, uint8 assetType, string location, string[] ipfsHashes, uint256 timestamp)'
);

/**
 * Start listening for verification requests
 */
export async function startListener() {
  logger.info('🚀 Starting Oracle Listener...');
  logger.info(`📡 Network: ${IS_TESTNET ? 'Mantle Sepolia Testnet' : 'Mantle Mainnet'}`);
  logger.info(`🔗 RPC URL: ${RPC_URL}`);
  logger.info(`📍 Oracle Router: ${ORACLE_ROUTER_ADDRESS}`);
  
  try {
    // Get current block number
    const currentBlock = await publicClient.getBlockNumber();
    logger.info(`📦 Current block: ${currentBlock}`);
    
    // Process pending historical events - scan in chunks due to RPC limits
    logger.info('🔍 Scanning for pending requests from recent blocks...');
    const CHUNK_SIZE = 10000n;
    const SCAN_DEPTH = 50000n; // Scan last 50k blocks (adjust as needed)
    const fromBlock = currentBlock > SCAN_DEPTH ? currentBlock - SCAN_DEPTH : 0n;
    
    logger.info(`   Scanning from block ${fromBlock} to ${currentBlock} in ${CHUNK_SIZE} block chunks...`);
    
    let allLogs: any[] = [];
    let currentChunkStart = fromBlock;
    
    while (currentChunkStart < currentBlock) {
      const currentChunkEnd = currentChunkStart + CHUNK_SIZE > currentBlock 
        ? currentBlock 
        : currentChunkStart + CHUNK_SIZE;
      
      try {
        const chunkLogs = await publicClient.getLogs({
          address: ORACLE_ROUTER_ADDRESS,
          event: VERIFICATION_REQUESTED_EVENT,
          fromBlock: currentChunkStart,
          toBlock: currentChunkEnd
        });
        
        allLogs = allLogs.concat(chunkLogs);
        
        if (chunkLogs.length > 0) {
          logger.info(`   ✓ Blocks ${currentChunkStart}-${currentChunkEnd}: Found ${chunkLogs.length} event(s)`);
        }
        
        currentChunkStart = currentChunkEnd + 1n;
      } catch (error: any) {
        logger.warn(`   ⚠️  Failed to scan blocks ${currentChunkStart}-${currentChunkEnd}: ${error.message}`);
        currentChunkStart = currentChunkEnd + 1n;
      }
    }
    
    logger.info(`   Total events found: ${allLogs.length}`);
    
    if (allLogs.length > 0) {
      logger.info(`📜 Processing ${allLogs.length} historical request(s)...`);
      for (const log of allLogs) {
        await handleVerificationRequest(log);
      }
    } else {
      logger.info('⚠️  No VerificationRequested events found.');
      logger.info(`   Contract: ${ORACLE_ROUTER_ADDRESS}`);
      logger.info(`   Scanned: Blocks ${fromBlock} to ${currentBlock}`);
      logger.info(`   Event Signature: VerificationRequested(uint256,address,uint8,string,string[],uint256)`);
      logger.info(`   Please verify:`);
      logger.info(`   1. Contract address is correct`);
      logger.info(`   2. Requests were submitted to this contract`);
      logger.info(`   3. You're on the correct network (Mantle Sepolia)\n`);
    }
    
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
    
    logger.info('👂 Now listening for new VerificationRequested events...');
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
    
    // Parse location string to extract latitude and longitude
    // Expected format: "address | lat,lng" or "lat,lng"
    const location = args.location.trim();
    let latitude = 0;
    let longitude = 0;
    
    // Check if location contains pipe separator (address | coordinates)
    if (location.includes('|')) {
      const parts = location.split('|');
      const coords = parts[parts.length - 1].trim().split(',');
      latitude = parseFloat(coords[0]) || 0;
      longitude = parseFloat(coords[1]) || 0;
    } else {
      // Simple "lat,lng" format
      const coords = location.split(',').map((s: string) => s.trim());
      latitude = parseFloat(coords[0]) || 0;
      longitude = parseFloat(coords[1]) || 0;
    }
    
    logger.info('═══════════════════════════════════════════════════════════════');
    logger.info('🚨 NEW VERIFICATION REQUEST DETECTED');
    logger.info('═══════════════════════════════════════════════════════════════');
    logger.info(`📝 Request ID: ${args.requestId}`);
    logger.info(`👤 Owner: ${args.owner}`);
    logger.info(`🏠 Asset Type: ${args.assetType}`);
    logger.info(`📍 Location: ${args.location}`);
    logger.info(`   Parsed Coordinates: ${latitude}, ${longitude}`);
    logger.info(`📄 Documents: ${args.ipfsHashes.length} files`);
    logger.info(`⏰ Timestamp: ${new Date(Number(args.timestamp) * 1000).toISOString()}`);
    logger.info(`📦 Block: ${log.blockNumber}`);
    logger.info('═══════════════════════════════════════════════════════════════\n');
    
    // Process the request
    await processVerificationRequest({
      requestId: args.requestId.toString(),
      requester: args.owner,
      assetType: args.assetType,
      latitude,
      longitude,
      documentHashes: args.ipfsHashes,
      blockNumber: log.blockNumber!,
      transactionHash: log.transactionHash!
    });
    
  } catch (error) {
    logger.error('❌ Error handling verification request:', error);
  }
}
