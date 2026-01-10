/**
 * Example: How to integrate the frontend with the oracle
 * Place this in your Next.js app
 */

// 1. Contract ABIs (create these in your frontend)
export const ORACLE_ROUTER_ABI = [
  {
    inputs: [
      { name: '_assetType', type: 'uint8' },
      { name: '_latitude', type: 'string' },
      { name: '_longitude', type: 'string' },
      { name: '_documentHashes', type: 'string[]' }
    ],
    name: 'requestVerification',
    outputs: [{ name: 'requestId', type: 'bytes32' }],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    anonymous: true,
    inputs: [
      { indexed: true, name: 'requestId', type: 'bytes32' },
      { indexed: true, name: 'requester', type: 'address' },
      { indexed: false, name: 'assetType', type: 'uint8' },
      { indexed: false, name: 'latitude', type: 'string' },
      { indexed: false, name: 'longitude', type: 'string' },
      { indexed: false, name: 'documentHashes', type: 'string[]' }
    ],
    name: 'VerificationRequested',
    type: 'event'
  },
  {
    anonymous: true,
    inputs: [
      { indexed: true, name: 'requestId', type: 'bytes32' },
      { indexed: false, name: 'valuation', type: 'uint256' },
      { indexed: false, name: 'confidence', type: 'uint8' },
      { indexed: false, name: 'evidenceHash', type: 'string' }
    ],
    name: 'VerificationCompleted',
    type: 'event'
  }
] as const;

// 2. Submit asset for verification
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

export function useSubmitAsset() {
  const { writeContract, data: hash } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  const submitAsset = async (data: {
    assetType: number;
    latitude: string;
    longitude: string;
    documentHashes: string[];
  }) => {
    // Upload documents to IPFS first (using Pinata)
    // Then call smart contract
    
    writeContract({
      address: process.env.NEXT_PUBLIC_ORACLE_ROUTER_ADDRESS as `0x${string}`,
      abi: ORACLE_ROUTER_ABI,
      functionName: 'requestVerification',
      args: [
        data.assetType,
        data.latitude,
        data.longitude,
        data.documentHashes
      ],
      value: parseEther('0.01') // Fee for oracle service
    });
  };

  return { submitAsset, isLoading, isSuccess, hash };
}

// 3. Watch for verification results
import { useWatchContractEvent } from 'wagmi';
import { useState } from 'react';

export function useWatchVerification(requestId?: string) {
  const [result, setResult] = useState<{
    valuation: bigint;
    confidence: number;
    evidenceHash: string;
  } | null>(null);

  useWatchContractEvent({
    address: process.env.NEXT_PUBLIC_ORACLE_ROUTER_ADDRESS as `0x${string}`,
    abi: ORACLE_ROUTER_ABI,
    eventName: 'VerificationCompleted',
    onLogs(logs) {
      for (const log of logs) {
        if (requestId && log.args.requestId === requestId) {
          setResult({
            valuation: log.args.valuation!,
            confidence: log.args.confidence!,
            evidenceHash: log.args.evidenceHash!
          });
        }
      }
    }
  });

  return result;
}

// 4. Example component
export function AssetSubmissionForm() {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [documents, setDocuments] = useState<File[]>([]);
  const [requestId, setRequestId] = useState<string>();
  
  const { submitAsset, isLoading } = useSubmitAsset();
  const verificationResult = useWatchVerification(requestId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Upload documents to IPFS
    const documentHashes = await uploadToIPFS(documents);
    
    // 2. Submit to oracle
    const hash = await submitAsset({
      assetType: 1, // REAL_ESTATE
      latitude,
      longitude,
      documentHashes
    });
    
    // 3. Get requestId from transaction receipt
    // (You'd parse the VerificationRequested event)
    setRequestId(hash);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          placeholder="Latitude"
        />
        <input
          type="text"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          placeholder="Longitude"
        />
        <input
          type="file"
          multiple
          onChange={(e) => setDocuments(Array.from(e.target.files || []))}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Submitting...' : 'Submit Asset'}
        </button>
      </form>

      {isLoading && (
        <div className="mt-4">
          <p>⏳ Waiting for AI oracles to verify...</p>
          <p className="text-sm text-gray-600">
            3 AI agents are analyzing your property in parallel
          </p>
        </div>
      )}

      {verificationResult && (
        <div className="mt-4 p-4 border rounded-lg">
          <h3 className="font-bold">Verification Complete!</h3>
          <p>Valuation: ${Number(verificationResult.valuation).toLocaleString()}</p>
          <p>Confidence: {verificationResult.confidence}%</p>
          <a 
            href={`https://gateway.pinata.cloud/ipfs/${verificationResult.evidenceHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View Evidence
          </a>
        </div>
      )}
    </div>
  );
}

// 5. Helper: Upload to IPFS
async function uploadToIPFS(files: File[]): Promise<string[]> {
  const hashes: string[] = [];
  
  for (const file of files) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`
      },
      body: formData
    });
    
    const data = await response.json();
    hashes.push(data.IpfsHash);
  }
  
  return hashes;
}
