// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AssetRegistry
 * @notice Central registry of all verified assets
 * @dev Stores permanent record of all RWA assets
 */
contract AssetRegistry is Ownable {
    
    enum AssetType { REAL_ESTATE, INVOICE, VEHICLE, ART, COMMODITY, OTHER }
    enum AssetStatus { ACTIVE, INACTIVE, TRANSFERRED, LIQUIDATED }
    
    struct Asset {
        uint256 assetId;
        uint256 requestId;
        address tokenAddress;
        address owner;
        AssetType assetType;
        string location;
        uint256 valuation;
        uint256 confidence;
        bytes32 evidenceHash;
        uint256 createdAt;
        uint256 lastUpdated;
        AssetStatus status;
    }
    
    // State variables
    uint256 private assetCounter;
    mapping(uint256 => Asset) public assets;
    mapping(address => uint256[]) public ownerAssets;
    mapping(uint256 => uint256) public requestToAsset; // requestId => assetId
    mapping(address => uint256) public tokenToAsset; // tokenAddress => assetId
    
    address public valuationOracle;
    
    // Events
    event AssetRegistered(
        uint256 indexed assetId,
        uint256 indexed requestId,
        address indexed owner,
        address tokenAddress,
        uint256 valuation
    );
    
    event AssetUpdated(
        uint256 indexed assetId,
        uint256 newValuation,
        uint256 confidence
    );
    
    event AssetTransferred(
        uint256 indexed assetId,
        address indexed from,
        address indexed to
    );
    
    event AssetStatusChanged(
        uint256 indexed assetId,
        AssetStatus newStatus
    );
    
    constructor(address _valuationOracle) Ownable(msg.sender) {
        valuationOracle = _valuationOracle;
        assetCounter = 0;
    }
    
    /**
     * @notice Register new asset
     */
    function registerAsset(
        uint256 _requestId,
        address _tokenAddress,
        address _owner,
        AssetType _assetType,
        string memory _location,
        uint256 _valuation,
        uint256 _confidence,
        bytes32 _evidenceHash
    ) external onlyOwner returns (uint256) {
        require(_owner != address(0), "Invalid owner");
        require(_valuation > 0, "Invalid valuation");
        require(requestToAsset[_requestId] == 0, "Request already registered");
        
        uint256 assetId = ++assetCounter;
        
        Asset storage asset = assets[assetId];
        asset.assetId = assetId;
        asset.requestId = _requestId;
        asset.tokenAddress = _tokenAddress;
        asset.owner = _owner;
        asset.assetType = _assetType;
        asset.location = _location;
        asset.valuation = _valuation;
        asset.confidence = _confidence;
        asset.evidenceHash = _evidenceHash;
        asset.createdAt = block.timestamp;
        asset.lastUpdated = block.timestamp;
        asset.status = AssetStatus.ACTIVE;
        
        ownerAssets[_owner].push(assetId);
        requestToAsset[_requestId] = assetId;
        tokenToAsset[_tokenAddress] = assetId;
        
        emit AssetRegistered(assetId, _requestId, _owner, _tokenAddress, _valuation);
        
        return assetId;
    }
    
    /**
     * @notice Update asset valuation
     */
    function updateValuation(
        uint256 _assetId,
        uint256 _newValuation,
        uint256 _confidence,
        bytes32 _evidenceHash
    ) external {
        require(msg.sender == valuationOracle || msg.sender == owner(), "Not authorized");
        require(assets[_assetId].assetId != 0, "Asset not found");
        
        Asset storage asset = assets[_assetId];
        asset.valuation = _newValuation;
        asset.confidence = _confidence;
        asset.evidenceHash = _evidenceHash;
        asset.lastUpdated = block.timestamp;
        
        emit AssetUpdated(_assetId, _newValuation, _confidence);
    }
    
    /**
     * @notice Transfer asset ownership
     */
    function transferAsset(uint256 _assetId, address _newOwner) external {
        require(assets[_assetId].owner == msg.sender, "Not asset owner");
        require(_newOwner != address(0), "Invalid new owner");
        
        address previousOwner = assets[_assetId].owner;
        assets[_assetId].owner = _newOwner;
        assets[_assetId].lastUpdated = block.timestamp;
        
        ownerAssets[_newOwner].push(_assetId);
        
        emit AssetTransferred(_assetId, previousOwner, _newOwner);
    }
    
    /**
     * @notice Update asset status
     */
    function updateAssetStatus(uint256 _assetId, AssetStatus _newStatus) external onlyOwner {
        require(assets[_assetId].assetId != 0, "Asset not found");
        
        assets[_assetId].status = _newStatus;
        assets[_assetId].lastUpdated = block.timestamp;
        
        emit AssetStatusChanged(_assetId, _newStatus);
    }
    
    /**
     * @notice Get asset details
     */
    function getAsset(uint256 _assetId) external view returns (Asset memory) {
        require(assets[_assetId].assetId != 0, "Asset not found");
        return assets[_assetId];
    }
    
    /**
     * @notice Get assets by owner
     */
    function getAssetsByOwner(address _owner) external view returns (uint256[] memory) {
        return ownerAssets[_owner];
    }
    
    /**
     * @notice Get asset by request ID
     */
    function getAssetByRequest(uint256 _requestId) external view returns (Asset memory) {
        uint256 assetId = requestToAsset[_requestId];
        require(assetId != 0, "Asset not found");
        return assets[assetId];
    }
    
    /**
     * @notice Get asset by token address
     */
    function getAssetByToken(address _tokenAddress) external view returns (Asset memory) {
        uint256 assetId = tokenToAsset[_tokenAddress];
        require(assetId != 0, "Asset not found");
        return assets[assetId];
    }
    
    /**
     * @notice Get total assets count
     */
    function getTotalAssets() external view returns (uint256) {
        return assetCounter;
    }
    
    /**
     * @notice Set valuation oracle address
     */
    function setValuationOracle(address _valuationOracle) external onlyOwner {
        valuationOracle = _valuationOracle;
    }
}
