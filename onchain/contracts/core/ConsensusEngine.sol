// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title IL1Block
 * @notice Interface to read Ethereum L1 block data from Mantle L2
 */
interface IL1Block {
    function number() external view returns (uint256);
}

/**
 * @title ConsensusEngine
 * @notice Validates oracle responses and triggers tokenization with L1 anchoring
 * @dev Implements 2-of-3 consensus mechanism + rollup anchoring to Ethereum
 */
contract ConsensusEngine is Ownable {
    
    struct OracleResponse {
        address oracle;
        uint256 valuation;
        uint256 confidence;
        bytes32 evidenceHash;
        uint256 timestamp;
    }
    
    struct ConsensusResult {
        uint256 finalValuation;
        uint256 avgConfidence;
        uint256 responseCount;
        bool consensusReached;
        uint256 timestamp;
        uint256 l1BlockNumber;
        bytes32 verificationHash;
    }
    
    // State variables
    mapping(uint256 => OracleResponse[]) public requestResponses;
    mapping(uint256 => ConsensusResult) public consensusResults;
    mapping(address => bool) public authorizedOracles;
    
    address public tokenFactory;
    address public assetRegistry;
    address public verificationAnchor;
    
    // Mantle L1Block address
    address constant L1_BLOCK_ADDRESS = 0x4200000000000000000000000000000000000015;
    
    uint256 public minConfidenceThreshold = 80;
    uint256 public consensusThreshold = 2;
    
    // Events
    event OracleResponseSubmitted(
        uint256 indexed requestId,
        address indexed oracle,
        uint256 valuation,
        uint256 confidence
    );
    
    event ConsensusReached(
        uint256 indexed requestId,
        uint256 finalValuation,
        uint256 avgConfidence,
        uint256 responseCount
    );
    
    event AssetTokenized(
        uint256 indexed requestId,
        address indexed tokenAddress,
        uint256 valuation
    );
    
    event VerificationAnchored(
        uint256 indexed requestId,
        bytes32 verificationHash,
        uint256 l1BlockNumber
    );
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @notice Submit oracle response
     */
    function submitOracleResponse(
        uint256 _requestId,
        uint256 _valuation,
        uint256 _confidence,
        bytes32 _evidenceHash
    ) external {
        require(authorizedOracles[msg.sender], "Not authorized oracle");
        require(_confidence >= minConfidenceThreshold, "Confidence too low");
        require(_valuation > 0, "Invalid valuation");
        
        // Check if oracle already submitted
        OracleResponse[] storage responses = requestResponses[_requestId];
        for (uint i = 0; i < responses.length; i++) {
            require(responses[i].oracle != msg.sender, "Already submitted");
        }
        
        responses.push(OracleResponse({
            oracle: msg.sender,
            valuation: _valuation,
            confidence: _confidence,
            evidenceHash: _evidenceHash,
            timestamp: block.timestamp
        }));
        
        emit OracleResponseSubmitted(_requestId, msg.sender, _valuation, _confidence);
        
        // Check for consensus
        if (responses.length >= consensusThreshold) {
            _checkConsensus(_requestId);
        }
    }
    
    /**
     * @notice Check and calculate consensus + anchor to L1
     */
    function _checkConsensus(uint256 _requestId) internal {
        OracleResponse[] storage responses = requestResponses[_requestId];
        require(responses.length >= consensusThreshold, "Insufficient responses");
        
        // Calculate weighted average
        uint256 totalWeightedValuation = 0;
        uint256 totalConfidence = 0;
        
        for (uint i = 0; i < responses.length; i++) {
            totalWeightedValuation += responses[i].valuation * responses[i].confidence;
            totalConfidence += responses[i].confidence;
        }
        
        uint256 finalValuation = totalWeightedValuation / totalConfidence;
        uint256 avgConfidence = totalConfidence / responses.length;
        
        // Read Ethereum L1 block number
        uint256 l1BlockNumber = IL1Block(L1_BLOCK_ADDRESS).number();
        
        // Create verification hash
        bytes32 verificationHash = keccak256(
            abi.encode(_requestId, finalValuation, avgConfidence, l1BlockNumber, block.timestamp)
        );
        
        consensusResults[_requestId] = ConsensusResult({
            finalValuation: finalValuation,
            avgConfidence: avgConfidence,
            responseCount: responses.length,
            consensusReached: true,
            timestamp: block.timestamp,
            l1BlockNumber: l1BlockNumber,
            verificationHash: verificationHash
        });
        
        emit ConsensusReached(_requestId, finalValuation, avgConfidence, responses.length);
        
        // STEP 7.5: Anchor verification to Ethereum L1
        if (verificationAnchor != address(0)) {
            _anchorToL1(_requestId, verificationHash, l1BlockNumber);
        }
        
        // STEP 8: Trigger tokenization
        _tokenizeAsset(_requestId, finalValuation);
    }
    
    /**
     * @notice Anchor verification to Ethereum L1 via VerificationAnchor
     */
    function _anchorToL1(
        uint256 _requestId,
        bytes32 _verificationHash,
        uint256 _l1BlockNumber
    ) internal {
        // Call VerificationAnchor to send message to Ethereum
        (bool success, ) = verificationAnchor.call(
            abi.encodeWithSignature(
                "anchorVerification(uint256,bytes32,uint256)",
                _requestId,
                _verificationHash,
                _l1BlockNumber
            )
        );
        
        require(success, "Failed to anchor verification");
        emit VerificationAnchored(_requestId, _verificationHash, _l1BlockNumber);
    }
    
    /**
     * @notice Trigger asset tokenization
     */
    function _tokenizeAsset(uint256 _requestId, uint256 _valuation) internal {
        // This will call the TokenFactory contract
        // For now, emit event - implement in next phase
        emit AssetTokenized(_requestId, address(0), _valuation);
    }
    
    /**
     * @notice Get consensus result
     */
    function getConsensusResult(uint256 _requestId) external view returns (ConsensusResult memory) {
        return consensusResults[_requestId];
    }
    
    /**
     * @notice Get all responses for a request
     */
    function getResponses(uint256 _requestId) external view returns (OracleResponse[] memory) {
        return requestResponses[_requestId];
    }
    
    /**
     * @notice Authorize oracle
     */
    function authorizeOracle(address _oracle) external onlyOwner {
        authorizedOracles[_oracle] = true;
    }
    
    /**
     * @notice Revoke oracle
     */
    function revokeOracle(address _oracle) external onlyOwner {
        authorizedOracles[_oracle] = false;
    }
    
    /**
     * @notice Set token factory address
     */
    function setTokenFactory(address _tokenFactory) external onlyOwner {
        tokenFactory = _tokenFactory;
    }
    
    /**
     * @notice Set asset registry address
     */
    function setAssetRegistry(address _assetRegistry) external onlyOwner {
        assetRegistry = _assetRegistry;
    }
    
    /**
     * @notice Set verification anchor address
     */
    function setVerificationAnchor(address _verificationAnchor) external onlyOwner {
        verificationAnchor = _verificationAnchor;
    }
    
    /**
     * @notice Update thresholds
     */
    function setThresholds(uint256 _minConfidence, uint256 _consensusThreshold) external onlyOwner {
        minConfidenceThreshold = _minConfidence;
        consensusThreshold = _consensusThreshold;
    }
}
