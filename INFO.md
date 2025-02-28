
## Deployment Cost

$0.002643 Value
$0.001962 Fee
0.25 ORA

## Deployment

0x0499A8Eb93e89F2689b82d8D4169f58D65f269A5

registerHash
0xaf2dde265d8f4f24ffe0af0b87d2578f62e22f27ae30244e61b850e4854d1d75

## Last deployment

```json
{
  "network": "base",
  "aiOracleAddress": "0x0A0f4321214BB6C7811dD8a71cF587bdaF03f0A0",
  "modelName": "ora/opagent",
  "systemPrompt": "Your system prompt here",
  "contractName": "NewAgent",
  "utilsLibAddr": "0xD06CEfaE49f5c92733Bb4dcF1a7b20482E3D2AE3",
  "opAgentContract": "0x28f87aE396812D70E40Dd1f6a10Ed4FD233688D3",
  "isVerified": true,
  "hasRegistered": true,
  "registerHash": "0xcb9c56bb806304150c1dfc87f8f0048462e50f5276771b453e34cba450f18aae"
}
```

## Interact

```bash
PROMPT="who are u" npx hardhat run scripts/onchainChat.ts --network base
PROMPT="who are u" npx hardhat run scripts/offchainChat.ts --network base
```

```bash
PROMPT="supply 0.1 USDC on base. on 0xBc8Ee037F1E30bF4d7f2A558E708ea1115767F9c behalf with 0 as ref code" npx hardhat run scripts/offchainChat.ts --network base
```

```bash
PROMPT="withdraw all USDC on base" npx hardhat run scripts/onchainChat.ts --network base

PROMPT="withdraw all USDC on base" npx hardhat run scripts/offchainChat.ts --network base
```

supply and get aausdc in smart contract or user wallet
```bash
PROMPT="i want to supply 0.1 USDC on base on 0x28f87aE396812D70E40Dd1f6a10Ed4FD233688D3 behalf with 0 as ref code" npx hardhat run scripts/offchainChat.ts --network base

PROMPT="i want to supply 0.1 USDC on base on 0x28f87aE396812D70E40Dd1f6a10Ed4FD233688D3 behalf with 0 as ref code" npx hardhat run scripts/onchainChat.ts --network base

PROMPT="i want to withdraw 0.05 USDC on base to 0x28f87aE396812D70E40Dd1f6a10Ed4FD233688D3" npx hardhat run scripts/offchainChat.ts --network base

PROMPT="i want to withdraw 0.05 USDC on base to 0x28f87aE396812D70E40Dd1f6a10Ed4FD233688D3" npx hardhat run scripts/onchainChat.ts --network base
```

## Get APY

```bash
npx tsx agent/index.ts
```

## Deploy

npx hardhat run scripts/createAgent.ts 

## Steps

npx tsx agent/index.ts

PROMPT="i want to supply 0.1 USDC on base on 0x28f87aE396812D70E40Dd1f6a10Ed4FD233688D3 behalf with 0 as ref code" npx hardhat run scripts/onchainChat.ts --network base

PROMPT="i want to withdraw 0.05 USDC on base to 0x28f87aE396812D70E40Dd1f6a10Ed4FD233688D3" npx hardhat run scripts/onchainChat.ts --network base

## Run Telegram Bot

```bash
npx tsx telegram-bot/index.ts
```
