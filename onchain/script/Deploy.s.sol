// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/VerificationRegistry.sol";
import "../src/Groth16Verifier.sol";

/**
 * @title Deploy Script for DuDucks Smart Contracts
 * @notice Deploy VerificationRegistry and Groth16Verifier to Base Sepolia
 * 
 * Usage:
 * forge script script/Deploy.s.sol:DeployScript --rpc-url $BASE_SEPOLIA_RPC \
 *   --private-key $PRIVATE_KEY_RELAYER --broadcast --verify
 */
contract DeployScript is Script {
    address public verifierAddress;
    address public registryAddress;
    address public relayerAddress;

    function setUp() public {
        relayerAddress = vm.envAddress("RELAYER_ADDRESS");
    }

    function run() public {
        vm.startBroadcast();

        // Step 1: Deploy Groth16Verifier
        Groth16Verifier verifier = new Groth16Verifier();
        verifierAddress = address(verifier);
        console.log("Groth16Verifier deployed to:", verifierAddress);

        // Step 2: Deploy VerificationRegistry
        VerificationRegistry registry = new VerificationRegistry(
            verifierAddress,
            relayerAddress
        );
        registryAddress = address(registry);
        console.log("VerificationRegistry deployed to:", registryAddress);

        vm.stopBroadcast();

        // Log deployment info
        console.log("\n========== DEPLOYMENT SUMMARY ==========");
        console.log("Network: Base Sepolia");
        console.log("Groth16Verifier:", verifierAddress);
        console.log("VerificationRegistry:", registryAddress);
        console.log("Relayer Address:", relayerAddress);
        console.log("=========================================\n");

        // Save addresses to file
        _saveDeploymentAddresses();
    }

    function _saveDeploymentAddresses() internal {
        string memory path = "onchain/deployments.json";
        string memory json = string(abi.encodePacked(
            '{"network":"base-sepolia","verifier":"',
            _addressToString(verifierAddress),
            '","registry":"',
            _addressToString(registryAddress),
            '","relayer":"',
            _addressToString(relayerAddress),
            '"}'
        ));
        vm.writeFile(path, json);
        console.log("Deployment addresses saved to:", path);
    }

    function _addressToString(address addr) internal pure returns (string memory) {
        bytes memory addrBytes = abi.encodePacked(addr);
        bytes memory hexChars = "0123456789abcdef";
        bytes memory result = new bytes(42);
        result[0] = '0';
        result[1] = 'x';
        
        for (uint i = 0; i < 20; i++) {
            uint8 value = uint8(addrBytes[i]);
            result[2 + i * 2] = hexChars[value >> 4];
            result[3 + i * 2] = hexChars[value & 0x0f];
        }
        
        return string(result);
    }
}
