// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ComplianceModule
 * @notice Handles KYC/AML compliance for RWA tokens
 * @dev Stores verification status and enforces transfer restrictions
 */
contract ComplianceModule is Ownable {
    
    enum JurisdictionType { US, EU, UK, ASIA, OTHER }
    
    struct ComplianceData {
        bool kycVerified;
        bool accreditedInvestor;
        JurisdictionType jurisdiction;
        uint256 verificationDate;
        uint256 expirationDate;
        bool restricted;
    }
    
    mapping(address => ComplianceData) public userCompliance;
    mapping(JurisdictionType => bool) public restrictedJurisdictions;
    
    uint256 public kycValidityPeriod = 365 days;
    
    event KYCVerified(address indexed user, JurisdictionType jurisdiction);
    event KYCRevoked(address indexed user);
    event AccreditedInvestorSet(address indexed user, bool status);
    event UserRestricted(address indexed user, bool restricted);
    event JurisdictionRestricted(JurisdictionType jurisdiction, bool restricted);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @notice Set KYC verification status
     */
    function setKYCStatus(
        address _user,
        bool _verified,
        JurisdictionType _jurisdiction
    ) external onlyOwner {
        ComplianceData storage data = userCompliance[_user];
        data.kycVerified = _verified;
        data.jurisdiction = _jurisdiction;
        data.verificationDate = block.timestamp;
        data.expirationDate = block.timestamp + kycValidityPeriod;
        
        if (_verified) {
            emit KYCVerified(_user, _jurisdiction);
        } else {
            emit KYCRevoked(_user);
        }
    }
    
    /**
     * @notice Check if user is KYC verified
     */
    function isKYCVerified(address _user) public view returns (bool) {
        ComplianceData memory data = userCompliance[_user];
        return data.kycVerified && 
               block.timestamp <= data.expirationDate &&
               !data.restricted &&
               !restrictedJurisdictions[data.jurisdiction];
    }
    
    /**
     * @notice Set accredited investor status
     */
    function setAccreditedInvestor(address _user, bool _status) external onlyOwner {
        userCompliance[_user].accreditedInvestor = _status;
        emit AccreditedInvestorSet(_user, _status);
    }
    
    /**
     * @notice Check if user is accredited investor
     */
    function isAccredited(address _user) external view returns (bool) {
        return userCompliance[_user].accreditedInvestor;
    }
    
    /**
     * @notice Restrict/unrestrict user
     */
    function setUserRestriction(address _user, bool _restricted) external onlyOwner {
        userCompliance[_user].restricted = _restricted;
        emit UserRestricted(_user, _restricted);
    }
    
    /**
     * @notice Restrict/unrestrict jurisdiction
     */
    function setJurisdictionRestriction(
        JurisdictionType _jurisdiction,
        bool _restricted
    ) external onlyOwner {
        restrictedJurisdictions[_jurisdiction] = _restricted;
        emit JurisdictionRestricted(_jurisdiction, _restricted);
    }
    
    /**
     * @notice Check if transfer is allowed
     */
    function checkTransferAllowed(
        address _from,
        address _to
    ) external view returns (bool) {
        // Both parties must be KYC verified
        return isKYCVerified(_from) && isKYCVerified(_to);
    }
    
    /**
     * @notice Get user compliance data
     */
    function getUserCompliance(address _user) external view returns (ComplianceData memory) {
        return userCompliance[_user];
    }
    
    /**
     * @notice Set KYC validity period
     */
    function setKYCValidityPeriod(uint256 _period) external onlyOwner {
        kycValidityPeriod = _period;
    }
    
    /**
     * @notice Batch KYC verification
     */
    function batchSetKYC(
        address[] calldata _users,
        bool[] calldata _verified,
        JurisdictionType[] calldata _jurisdictions
    ) external onlyOwner {
        require(
            _users.length == _verified.length && 
            _users.length == _jurisdictions.length,
            "Array length mismatch"
        );
        
        for (uint256 i = 0; i < _users.length; i++) {
            ComplianceData storage data = userCompliance[_users[i]];
            data.kycVerified = _verified[i];
            data.jurisdiction = _jurisdictions[i];
            data.verificationDate = block.timestamp;
            data.expirationDate = block.timestamp + kycValidityPeriod;
            
            if (_verified[i]) {
                emit KYCVerified(_users[i], _jurisdictions[i]);
            }
        }
    }
}
