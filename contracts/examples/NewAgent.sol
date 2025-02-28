// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "../OPAgent.sol";
import {IPool} from "@aave/core-v3/contracts/interfaces/IPool.sol";
import {IPoolAddressesProvider} from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract NewAgent is OPAgent {
    IPoolAddressesProvider public constant ADDRESSES_PROVIDER =
        IPoolAddressesProvider(0xe20fCBdBfFC4Dd138cE8b2E6FBb6CB49777ad64D);
    IPool public immutable POOL;

    event Supply(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    );
    event Withdraw(
        address asset,
        uint256 amount,
        address to,
        uint256 amountWithdrawn
    );
    event TokensWithdrawn(address token, uint256 amount);

    constructor(
        IAIOracle _aiOracle,
        string memory _modelName,
        string memory _systemPrompt
    ) OPAgent(_aiOracle, _modelName, _systemPrompt) {
        POOL = IPool(ADDRESSES_PROVIDER.getPool());
    }

    /**
     * @notice Supplies an asset to the Aave protocol
     * @param requestId uint256, the request ID in AI Oracle
     * @param asset The address of the asset to supply
     * @param amount The amount to supply
     * @param onBehalfOf The address that will receive the aTokens
     * @param referralCode The referral code for the supply
     */
    function supplyAsset(
        uint256 requestId,
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    ) public onlyOPAgentCallback {
        // Transfer the asset from the user to this contract
        IERC20(asset).transferFrom(msg.sender, address(this), amount);

        // Approve the Pool contract to spend the asset
        IERC20(asset).approve(address(POOL), amount);

        // Supply the asset to Aave
        POOL.supply(asset, amount, onBehalfOf, referralCode);

        emit Supply(asset, amount, onBehalfOf, referralCode);
    }

    /**
     * @notice Withdraws an asset from the Aave protocol
     * @param requestId uint256, the request ID in AI Oracle
     * @param asset The address of the asset to withdraw
     * @param amount The amount to withdraw (use type(uint256).max for the entire balance)
     * @param to The address that will receive the withdrawn assets
     */
    function withdrawAsset(
        uint256 requestId,
        address asset,
        uint256 amount,
        address to
    ) public onlyOPAgentCallback returns (uint256) {
        // The msg.sender must be the one who has the aTokens
        uint256 amountWithdrawn = POOL.withdraw(asset, amount, to);

        emit Withdraw(asset, amount, to, amountWithdrawn);
        return amountWithdrawn;
    }

    /**
     * @notice Withdraws all tokens of a specific ERC20 from the contract to the caller
     * @param requestId uint256, the request ID in AI Oracle
     * @param tokenAddress The address of the ERC20 token to withdraw
     * @return The amount withdrawn
     */
    function withdrawAllERC20(
        uint256 requestId,
        address tokenAddress
    ) public onlyOPAgentCallback returns (uint256) {
        IERC20 token = IERC20(tokenAddress);
        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");

        bool success = token.transfer(msg.sender, balance);
        require(success, "Transfer failed");

        emit TokensWithdrawn(tokenAddress, balance);
        return balance;
    }
}
