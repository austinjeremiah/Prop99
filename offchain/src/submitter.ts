/**
 * Blockchain Submitter
 * Submits verification results back to smart contract
 */
import { createWalletClient, http, parseEther, defineChain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { mantle } from 'viem/chains';
import { logger } from './utils/logger';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const ORACLE_ROUTER_ADDRESS = process.env.ORACLE_ROUTER_ADDRESS as `0x${string}`;
const ORACLE_PRIVATE_KEY = (process.env.ORACLE_PRIVATE_KEY?.trim().startsWith('0x') 
  ? process.env.ORACLE_PRIVATE_KEY.trim() 
  : `0x${process.env.ORACLE_PRIVATE_KEY?.trim()}`) as `0x${string}`;
const IS_TESTNET = process.env.NODE_ENV !== 'production';
const RPC_URL = IS_TESTNET ? process.env.MANTLE_TESTNET_RPC_URL : process.env.MANTLE_RPC_URL;
const PINATA_JWT = process.env.PINATA_JWT;

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

// Create wallet client
const account = privateKeyToAccount(ORACLE_PRIVATE_KEY);
const walletClient = createWalletClient({
  account,
  chain: IS_TESTNET ? mantleSepolia : mantle,
  transport: http(RPC_URL)
});

// Contract ABI - OracleRouter.sol
const ORACLE_ROUTER_ABI = [
  {
    inputs: [
      { name: '_requestId', type: 'uint256' },
      { name: '_valuation', type: 'uint256' },
      { name: '_confidence', type: 'uint256' }
    ],
    name: 'submitVerification',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const;

/**
 * Submit verification result to blockchain
 */
export async function submitVerification(
  requestId: string,
  valuation: number,
  confidence: number,
  satelliteData: any,
  agentResponses: any[]
): Promise<string> {
  try {
    // Upload evidence to IPFS
    logger.info('📦 Uploading evidence to IPFS...');
    const evidenceHash = await uploadEvidence({
      requestId,
      valuation,
      confidence,
      satelliteData,
      agentResponses,
      timestamp: new Date().toISOString()
    });
    logger.info(`✅ Evidence uploaded: ${evidenceHash}`);
    
    // Submit to blockchain
    logger.info('📤 Submitting transaction to Mantle Sepolia...');
    
    const hash = await walletClient.writeContract({
      address: ORACLE_ROUTER_ADDRESS,
      abi: ORACLE_ROUTER_ABI,
      functionName: 'submitVerification',
      args: [
        BigInt(requestId),
        BigInt(valuation),
        BigInt(confidence)
      ]
      // Let viem estimate gas automatically
    });
    
    logger.info(`⏳ Waiting for confirmation...`);
    
    // In production, you'd wait for the transaction receipt here
    // For now, just return the hash
    
    return hash;
    
  } catch (error) {
    logger.error('❌ Failed to submit verification:', error);
    throw error;
  }
}

/**
 * Upload evidence package to IPFS via Pinata
 */
async function uploadEvidence(evidence: any): Promise<string> {
  if (!PINATA_JWT) {
    throw new Error('PINATA_JWT not configured. Cannot upload evidence to IPFS.');
  }
  
  try {
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      {
        pinataContent: evidence,
        pinataMetadata: {
          name: `Evidence_${evidence.requestId.slice(2, 12)}.json`
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.IpfsHash;
    
  } catch (error) {
    logger.error('❌ IPFS upload failed:', error);
    throw new Error(`IPFS upload failed: ${error}`);
  }
}
