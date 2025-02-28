import { ethers } from "hardhat";

async function main() {
  const provider = ethers.provider;
  
  // Get signer's balance
  const signer = await ethers.getSigners();
  const balance = await provider.getBalance(signer[0].address);
  console.log("Signer balance:", ethers.utils.formatEther(balance), "ETH");

  // Get current gas prices
  const feeData = await provider.getFeeData();
  console.log("Current gas prices:");
  console.log("- maxFeePerGas:", ethers.utils.formatUnits(feeData.maxFeePerGas || 0, "gwei"), "gwei");
  console.log("- maxPriorityFeePerGas:", ethers.utils.formatUnits(feeData.maxPriorityFeePerGas || 0, "gwei"), "gwei");
  console.log("- gasPrice:", ethers.utils.formatUnits(feeData.gasPrice || 0, "gwei"), "gwei");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
