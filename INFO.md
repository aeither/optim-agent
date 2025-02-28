
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
  "utilsLibAddr": "0xF5a63F3Fa2D1fb33bB07B4f5BFf4a845e3b0b7f2",
  "opAgentContract": "0xBc8Ee037F1E30bF4d7f2A558E708ea1115767F9c",
  "isVerified": true,
  "hasRegistered": true,
  "registerHash": "0xec5c41fef106c167abdb4d72f3a074ceaf7c3f6b929b7c6870e816db3cfb7d0a"
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

```bash
PROMPT="i want to supply 0.1 USDC on base on 0xBc8Ee037F1E30bF4d7f2A558E708ea1115767F9c behalf with 0 as ref code" npx hardhat run scripts/offchainChat.ts --network base
```