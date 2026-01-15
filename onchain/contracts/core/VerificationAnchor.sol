// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title VerificationAnchor
 * @notice Anchors L2 verification to Ethereum L1 via Mantle's rollup system
 * @dev Uses L2CrossDomainMessenger to bridge verification hashes to Ethereum
 */
contract VerificationAnchor is Ownable {
    
    // Mantle's L2CrossDomainMessenger address
    address constant MESSENGER = 0x4200000000000000000000000000000000000007;
    
    struct AnchorRecord {
        uint256 requestId;
        bytes32 verificationHash;
        uint256 l1BlockNumber;
        uint256 timestamp;
        bool anchored;
    }
    
    // State variables
    mapping(uint256 => AnchorRecord) public anchorRecords;
    mapping(bytes32 => bool) public anchoredHashes;
    
    address public consensusEngine;
    
    // Events
    event VerificationAnchored(
        uint256 indexed requestId,
        bytes32 verificationHash,
        uint256 l1BlockNumber,
        uint256 timestamp
    );
    
    event MessageSentToL1(
        uint256 indexed requestId,
        bytes32 verificationHash,
        uint256 gasLimit
    );
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @notice Set ConsensusEngine address
     */
    function setConsensusEngine(address _consensusEngine) external onlyOwner {
        consensusEngine = _consensusEngine;
    }
    
    /**
     * @notice Anchor verification to Ethereum L1
     * @param _requestId The original verification request ID
     * @param _verificationHash Hash of the verification data
     * @param _l1BlockNumber Current Ethereum L1 block number
     */
    function anchorVerification(
        uint256 _requestId,
        bytes32 _verificationHash,
        uint256 _l1BlockNumber
    ) external {
        require(msg.sender == consensusEngine || msg.sender == owner(), "Not authorized");
        require(_verificationHash != bytes32(0), "Invalid hash");
        require(!anchoredHashes[_verificationHash], "Already anchored");
        require(_l1BlockNumber > 0, "Invalid L1 block");
        
        // Record the anchor
        anchorRecords[_requestId] = AnchorRecord({
            requestId: _requestId,
            verificationHash: _verificationHash,
            l1BlockNumber: _l1BlockNumber,
            timestamp: block.timestamp,
            anchored: true
        });
        
        anchoredHashes[_verificationHash] = true;
        
        emit VerificationAnchored(
            _requestId,
            _verificationHash,
            _l1BlockNumber,
            block.timestamp
        );
        
        // Send message to Ethereum L1 via CrossDomainMessenger
        _sendAnchorToL1(_requestId, _verificationHash, _l1BlockNumber);
    }
    
    /**
     * @notice Send anchor message to Ethereum L1
     * @dev Uses Mantle's L2-to-L1 messaging system
     */
    function _sendAnchorToL1(
        uint256 _requestId,
        bytes32 _verificationHash,
        uint256 _l1BlockNumber
    ) internal {
        bytes memory payload = abi.encode(
            _requestId,
            _verificationHash,
            _l1BlockNumber,
            block.timestamp
        );
        
        // Call L2CrossDomainMessenger
        // The message will be recorded in L2_TO_L1_MESSAGE_PASSER
        (bool success, ) = MESSENGER.call{gas: 1_000_000}(
            abi.encodeWithSignature(
                "sendMessage(address,bytes,uint32)",
                address(this),
                payload,
                1_000_000
            )
        );
        
        require(success, "Failed to send L1 anchor message");
        
        emit MessageSentToL1(_requestId, _verificationHash, 1_000_000);
    }
    
    /**
     * @notice Get anchor record
     */
    function getAnchorRecord(uint256 _requestId) 
        external 
        view 
        returns (AnchorRecord memory) 
    {
        return anchorRecords[_requestId];
    }
    
    /**
     * @notice Check if hash is anchored
     */
    function isHashAnchored(bytes32 _hash) external view returns (bool) {
        return anchoredHashes[_hash];
    }
}
