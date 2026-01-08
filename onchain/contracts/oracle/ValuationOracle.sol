// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ValuationOracle
 * @notice Price feed oracle for RWA assets
 * @dev Provides current and historical valuations for DeFi integration
 */
contract ValuationOracle is Ownable {
    
    struct PriceData {
        uint256 price;
        uint256 confidence;
        uint256 timestamp;
    }
    
    struct AssetPriceHistory {
        uint256 currentPrice;
        uint256 currentConfidence;
        uint256 lastUpdate;
        PriceData[] history;
    }
    
    mapping(uint256 => AssetPriceHistory) public assetPrices;
    mapping(address => bool) public authorizedUpdaters;
    
    uint256 public maxHistoryLength = 30; // Keep 30 historical prices
    
    event PriceUpdated(
        uint256 indexed assetId,
        uint256 price,
        uint256 confidence,
        uint256 timestamp
    );
    
    event UpdaterAuthorized(address indexed updater);
    event UpdaterRevoked(address indexed updater);
    
    modifier onlyAuthorized() {
        require(authorizedUpdaters[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @notice Update asset price
     */
    function updatePrice(
        uint256 _assetId,
        uint256 _price,
        uint256 _confidence
    ) external onlyAuthorized {
        require(_price > 0, "Invalid price");
        require(_confidence > 0 && _confidence <= 100, "Invalid confidence");
        
        AssetPriceHistory storage priceHistory = assetPrices[_assetId];
        
        // Save current price to history before updating
        if (priceHistory.currentPrice > 0) {
            priceHistory.history.push(PriceData({
                price: priceHistory.currentPrice,
                confidence: priceHistory.currentConfidence,
                timestamp: priceHistory.lastUpdate
            }));
            
            // Keep only recent history
            if (priceHistory.history.length > maxHistoryLength) {
                // Remove oldest entry
                for (uint i = 0; i < priceHistory.history.length - 1; i++) {
                    priceHistory.history[i] = priceHistory.history[i + 1];
                }
                priceHistory.history.pop();
            }
        }
        
        // Update current price
        priceHistory.currentPrice = _price;
        priceHistory.currentConfidence = _confidence;
        priceHistory.lastUpdate = block.timestamp;
        
        emit PriceUpdated(_assetId, _price, _confidence, block.timestamp);
    }
    
    /**
     * @notice Get latest price for an asset
     */
    function getLatestPrice(uint256 _assetId) external view returns (
        uint256 price,
        uint256 confidence,
        uint256 timestamp
    ) {
        AssetPriceHistory storage priceHistory = assetPrices[_assetId];
        return (
            priceHistory.currentPrice,
            priceHistory.currentConfidence,
            priceHistory.lastUpdate
        );
    }
    
    /**
     * @notice Get price at specific index in history
     */
    function getPriceAt(uint256 _assetId, uint256 _index) external view returns (
        uint256 price,
        uint256 confidence,
        uint256 timestamp
    ) {
        AssetPriceHistory storage priceHistory = assetPrices[_assetId];
        require(_index < priceHistory.history.length, "Index out of bounds");
        
        PriceData memory data = priceHistory.history[_index];
        return (data.price, data.confidence, data.timestamp);
    }
    
    /**
     * @notice Get full price history for an asset
     */
    function getPriceHistory(uint256 _assetId) external view returns (PriceData[] memory) {
        return assetPrices[_assetId].history;
    }
    
    /**
     * @notice Get price history length
     */
    function getHistoryLength(uint256 _assetId) external view returns (uint256) {
        return assetPrices[_assetId].history.length;
    }
    
    /**
     * @notice Authorize price updater
     */
    function authorizeUpdater(address _updater) external onlyOwner {
        authorizedUpdaters[_updater] = true;
        emit UpdaterAuthorized(_updater);
    }
    
    /**
     * @notice Revoke updater authorization
     */
    function revokeUpdater(address _updater) external onlyOwner {
        authorizedUpdaters[_updater] = false;
        emit UpdaterRevoked(_updater);
    }
    
    /**
     * @notice Set max history length
     */
    function setMaxHistoryLength(uint256 _length) external onlyOwner {
        maxHistoryLength = _length;
    }
}
