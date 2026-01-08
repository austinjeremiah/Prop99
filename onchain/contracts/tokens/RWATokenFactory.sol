// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./RWAToken.sol";

/**
 * @title RWATokenFactory
 * @notice Factory contract to create new RWA tokens
 * @dev Deploys new RWAToken contracts for verified assets
 */
contract RWATokenFactory is Ownable {
    
    mapping(uint256 => address) public assetToToken; // assetId => tokenAddress
    address[] public allTokens;
    
    address public assetRegistry;
    address public complianceModule;
    
    event TokenCreated(
        uint256 indexed assetId,
        address indexed tokenAddress,
        address indexed owner,
        uint256 valuation
    );
    
    constructor(address _assetRegistry, address _complianceModule) Ownable(msg.sender) {
        assetRegistry = _assetRegistry;
        complianceModule = _complianceModule;
    }
    
    /**
     * @notice Create new RWA token for an asset
     */
    function createToken(
        uint256 _assetId,
        uint256 _valuation,
        address _owner,
        string memory _assetName
    ) external onlyOwner returns (address) {
        require(assetToToken[_assetId] == address(0), "Token already exists");
        require(_owner != address(0), "Invalid owner");
        require(_valuation > 0, "Invalid valuation");
        
        // Create token name and symbol
        string memory tokenName = string(abi.encodePacked("RWA-", _assetName));
        string memory tokenSymbol = string(abi.encodePacked("RWA", _toString(_assetId)));
        
        // Deploy new token contract
        RWAToken newToken = new RWAToken(
            tokenName,
            tokenSymbol,
            _assetId,
            _valuation,
            assetRegistry,
            _owner
        );
        
        address tokenAddress = address(newToken);
        
        // Store mapping
        assetToToken[_assetId] = tokenAddress;
        allTokens.push(tokenAddress);
        
        // Mint tokens to owner (1 token = $1 of valuation)
        newToken.mint(_owner, _valuation);
        
        emit TokenCreated(_assetId, tokenAddress, _owner, _valuation);
        
        return tokenAddress;
    }
    
    /**
     * @notice Get token address for an asset
     */
    function getTokenForAsset(uint256 _assetId) external view returns (address) {
        return assetToToken[_assetId];
    }
    
    /**
     * @notice Get all tokens created
     */
    function getAllTokens() external view returns (address[] memory) {
        return allTokens;
    }
    
    /**
     * @notice Get total tokens created
     */
    function getTotalTokens() external view returns (uint256) {
        return allTokens.length;
    }
    
    /**
     * @notice Set asset registry address
     */
    function setAssetRegistry(address _assetRegistry) external onlyOwner {
        assetRegistry = _assetRegistry;
    }
    
    /**
     * @notice Set compliance module address
     */
    function setComplianceModule(address _complianceModule) external onlyOwner {
        complianceModule = _complianceModule;
    }
    
    /**
     * @notice Convert uint to string
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
