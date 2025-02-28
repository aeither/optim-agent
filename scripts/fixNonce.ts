import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
dotenv.config();

async function replaceTransaction(
  action: 'speedup' | 'cancel',
  pendingTxHash?: string
) {
  // Connect to provider
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.BASE_MAINNET_RPC
  );
  
  // Create wallet from private key
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);
  
  // Get current address
  const address = wallet.address;
  console.log(`Using address: ${address}`);
  
  // Get latest nonce (the one used by your pending transaction)
  let nonce: number;
  
  if (pendingTxHash) {
    // If tx hash is provided, get its nonce
    const pendingTx = await provider.getTransaction(pendingTxHash);
    if (!pendingTx) {
      throw new Error('Transaction not found');
    }
    nonce = pendingTx.nonce;
  } else {
    // Otherwise get the latest pending nonce
    nonce = await provider.getTransactionCount(address, 'pending') - 1;
  }
  
  console.log(`Targeting transaction with nonce: ${nonce}`);
  
  // Get current fee data
  const feeData = await provider.getFeeData();
  
  // Create replacement transaction
  const tx: ethers.utils.Deferrable<ethers.providers.TransactionRequest> = {
    nonce: nonce,
    type: 2, // EIP-1559 transaction
  };
  
  // Increase gas price significantly to ensure replacement
  tx.maxFeePerGas = feeData.maxFeePerGas?.mul(2); // Double the max fee
  tx.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas?.mul(3); // Triple the priority fee
  
  if (action === 'cancel') {
    // For cancellation, send 0 ETH to yourself
    tx.to = address;
    tx.value = ethers.utils.parseEther('0');
    tx.gasLimit = 21000; // Standard gas limit for ETH transfer
  } else {
    // For speedup, you need to include the original transaction details
    // This is a simplified example - you would need the original tx data
    console.log('For speedup, include original tx details (to, value, data)');
    // Get the pending transaction details if hash is provided
    if (pendingTxHash) {
      const pendingTx = await provider.getTransaction(pendingTxHash);
      tx.to = pendingTx?.to;
      tx.value = pendingTx?.value;
      tx.data = pendingTx?.data;
      tx.gasLimit = pendingTx?.gasLimit.mul(12).div(10); // Add 20% to original gas limit
    } else {
      throw new Error('For speedup, transaction hash is required');
    }
  }
  
  console.log(`Sending ${action} transaction...`);
  const sentTx = await wallet.sendTransaction(tx);
  console.log(`Transaction sent: ${sentTx.hash}`);
  
  console.log('Waiting for transaction to be mined...');
  const receipt = await sentTx.wait();
  console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
  
  return sentTx.hash;
}

// Example usage
async function main() {
  try {
    // To cancel the latest pending transaction:
    await replaceTransaction('cancel');
    
    // To speed up a specific transaction (provide the tx hash):
    // await replaceTransaction('speedup', '0x123...'); 
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
