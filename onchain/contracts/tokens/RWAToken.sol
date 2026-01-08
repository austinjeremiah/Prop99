// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RWAToken
 * @notice ERC-20 token representing a real-world asset
 * @dev Each asset gets its own token contract instance
 */
contract RWAToken is ERC20, Ownable {
    
    uint256 public assetId;
    uint256 public assetValuation;
    address public assetRegistry;
    
    bool public transfersEnabled;
    mapping(address => bool) public whitelist;
    
    event TransfersEnabled();
    event TransfersDisabled();
    event AddressWhitelisted(address indexed account);
    event AddressRemovedFromWhitelist(address indexed account);
    
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _assetId,
        uint256 _assetValuation,
        address _assetRegistry,
        address _initialOwner
    ) ERC20(_name, _symbol) Ownable(_initialOwner) {
        assetId = _assetId;
        assetValuation = _assetValuation;
        assetRegistry = _assetRegistry;
        transfersEnabled = false;
        
        // Whitelist initial owner
        whitelist[_initialOwner] = true;
    }
    
    /**
     * @notice Mint tokens to owner
     */
    function mint(address _to, uint256 _amount) external onlyOwner {
        _mint(_to, _amount);
    }
    
    /**
     * @notice Enable transfers
     */
    function enableTransfers() external onlyOwner {
        transfersEnabled = true;
        emit TransfersEnabled();
    }
    
    /**
     * @notice Disable transfers
     */
    function disableTransfers() external onlyOwner {
        transfersEnabled = false;
        emit TransfersDisabled();
    }
    
    /**
     * @notice Add address to whitelist
     */
    function addToWhitelist(address _account) external onlyOwner {
        whitelist[_account] = true;
        emit AddressWhitelisted(_account);
    }
    
    /**
     * @notice Remove address from whitelist
     */
    function removeFromWhitelist(address _account) external onlyOwner {
        whitelist[_account] = false;
        emit AddressRemovedFromWhitelist(_account);
    }
    
    /**
     * @notice Update asset valuation
     */
    function updateValuation(uint256 _newValuation) external onlyOwner {
        assetValuation = _newValuation;
    }
    
    /**
     * @notice Override transfer to add restrictions
     */
    function transfer(address to, uint256 amount) public virtual override returns (bool) {
        require(transfersEnabled || whitelist[msg.sender] || whitelist[to], "Transfers disabled");
        return super.transfer(to, amount);
    }
    
    /**
     * @notice Override transferFrom to add restrictions
     */
    function transferFrom(address from, address to, uint256 amount) public virtual override returns (bool) {
        require(transfersEnabled || whitelist[from] || whitelist[to], "Transfers disabled");
        return super.transferFrom(from, to, amount);
    }
}
