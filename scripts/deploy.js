const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting AgeVerificationZKP contract deployment...");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);

  // Check balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  if (balance < hre.ethers.parseEther("0.01")) {
    throw new Error(
      "Insufficient balance. Please fund your account with test ETH from the Sepolia faucet."
    );
  }

  // Deploy contract
  console.log("\nDeploying AgeVerificationZKP...");
  const AgeVerificationZKP = await hre.ethers.getContractFactory(
    "AgeVerificationZKP"
  );
  const contract = await AgeVerificationZKP.deploy();

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("✓ AgeVerificationZKP deployed to:", contractAddress);

  // Get deployment receipt
  const deploymentTx = contract.deploymentTransaction();
  if (deploymentTx) {
    const receipt = await deploymentTx.wait();
    console.log("  Transaction hash:", receipt.hash);
    console.log("  Block number:", receipt.blockNumber);
    console.log("  Gas used:", receipt.gasUsed.toString());
  }

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contract: "AgeVerificationZKP",
    address: contractAddress,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    chainId: (await deployer.provider.getNetwork()).chainId,
  };

  const deploymentPath = path.join(__dirname, "../deployments.json");
  let deployments = {};

  if (fs.existsSync(deploymentPath)) {
    deployments = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));
  }

  deployments[hre.network.name] = deploymentInfo;
  fs.writeFileSync(deploymentPath, JSON.stringify(deployments, null, 2));

  console.log("\nDeployment info saved to deployments.json");

  // Verify on Etherscan (with delay)
  if (hre.network.name === "sepolia") {
    console.log("\nWaiting 30 seconds before Etherscan verification...");
    await new Promise((resolve) => setTimeout(resolve, 30000));

    try {
      console.log("Verifying contract on Etherscan...");
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✓ Contract verified on Etherscan");
    } catch (err) {
      console.log("⚠ Etherscan verification failed (might already be verified)");
      console.log("  Manual verification:", err.message);
    }
  }

  console.log("\n=== Deployment Complete ===");
  console.log("Contract Address:", contractAddress);
  console.log("Network:", hre.network.name);
  console.log(
    "View on Etherscan: https://sepolia.etherscan.io/address/" + contractAddress
  );

  console.log("\nNext steps:");
  console.log(
    "1. Update CONTRACT_ADDRESS in your frontend with:",
    contractAddress
  );
  console.log("2. Add environment variable:");
  console.log("   NEXT_PUBLIC_CONTRACT_ADDRESS=" + contractAddress);
  console.log("3. Test proof submission in the frontend");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
