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
    event Borrow(
        address asset,
        uint256 amount,
        uint256 interestRateMode,
        uint16 referralCode,
        address onBehalfOf
    );
    event Repay(
        address asset,
        uint256 amount,
        uint256 interestRateMode,
        address onBehalfOf,
        uint256 amountRepaid
    );
    event EModeSet(uint8 categoryId);
    event CollateralSet(address asset, bool useAsCollateral);
    event TokensWithdrawn(address token, uint256 amount);
    event Transfer(uint256 requestId, address to, uint256 amount);

    /// @notice Initialize the contract, binding it to a specified AIOracle contract and Aave Pool
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
     * @notice Borrows an asset from the Aave protocol
     * @param requestId uint256, the request ID in AI Oracle
     * @param asset The address of the asset to borrow
     * @param amount The amount to borrow
     * @param interestRateMode The interest rate mode (1 for stable, 2 for variable)
     * @param referralCode The referral code for the borrow
     * @param onBehalfOf The address that will receive the debt tokens
     */
    function borrowAsset(
        uint256 requestId,
        address asset,
        uint256 amount,
        uint256 interestRateMode,
        uint16 referralCode,
        address onBehalfOf
    ) public onlyOPAgentCallback {
        // Borrow the asset
        POOL.borrow(asset, amount, interestRateMode, referralCode, onBehalfOf);

        // Check if the borrowed asset was sent to this contract
        uint256 balance = IERC20(asset).balanceOf(address(this));
        if (balance >= amount) {
            // Transfer the borrowed asset to the user
            IERC20(asset).transfer(msg.sender, amount);
        }

        emit Borrow(asset, amount, interestRateMode, referralCode, onBehalfOf);
    }

    /**
     * @notice Repays a borrowed asset
     * @param requestId uint256, the request ID in AI Oracle
     * @param asset The address of the asset to repay
     * @param amount The amount to repay (use type(uint256).max for the entire debt)
     * @param interestRateMode The interest rate mode (1 for stable, 2 for variable)
     * @param onBehalfOf The address of the user who will get their debt reduced
     */
    function repayAsset(
        uint256 requestId,
        address asset,
        uint256 amount,
        uint256 interestRateMode,
        address onBehalfOf
    ) public onlyOPAgentCallback returns (uint256) {
        // Transfer the asset from the user to this contract
        IERC20(asset).transferFrom(msg.sender, address(this), amount);

        // Approve the Pool contract to spend the asset
        IERC20(asset).approve(address(POOL), amount);

        // Repay the borrowed asset
        uint256 amountRepaid = POOL.repay(
            asset,
            amount,
            interestRateMode,
            onBehalfOf
        );

        emit Repay(asset, amount, interestRateMode, onBehalfOf, amountRepaid);
        return amountRepaid;
    }

    /**
     * @notice Sets the E-Mode category for the user
     * @param requestId uint256, the request ID in AI Oracle
     * @param categoryId The ID of the category to set (0 to disable E-Mode)
     */
    function setEModeCategory(
        uint256 requestId,
        uint8 categoryId
    ) public onlyOPAgentCallback {
        POOL.setUserEMode(categoryId);

        emit EModeSet(categoryId);
    }

    /**
     * @notice Gets the user account data
     * @param user The address of the user
     * @return totalCollateralBase Total collateral in base currency
     * @return totalDebtBase Total debt in base currency
     * @return availableBorrowsBase Available borrowing power in base currency
     * @return currentLiquidationThreshold Current liquidation threshold
     * @return ltv Current loan to value
     * @return healthFactor Current health factor
     */
    function getUserAccountData(
        address user
    )
        public
        view
        returns (
            uint256 totalCollateralBase,
            uint256 totalDebtBase,
            uint256 availableBorrowsBase,
            uint256 currentLiquidationThreshold,
            uint256 ltv,
            uint256 healthFactor
        )
    {
        return POOL.getUserAccountData(user);
    }

    /**
     * @notice Sets or unsets an asset as collateral for the user
     * @param requestId uint256, the request ID in AI Oracle
     * @param asset The address of the asset to set as collateral
     * @param useAsCollateral True to use the asset as collateral, false to unset it
     */
    function setUserUseReserveAsCollateral(
        uint256 requestId,
        address asset,
        bool useAsCollateral
    ) public onlyOPAgentCallback {
        POOL.setUserUseReserveAsCollateral(asset, useAsCollateral);

        emit CollateralSet(asset, useAsCollateral);
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

    /**
     * This function is called by the OP Agent.
     * It transfers the specified amount of ETH to the specified address.
     *
     * @param requestId uint256, the request ID in AI Oracle
     * @param to address, the address to transfer to
     * @param amount uint256, the amount to transfer
     */
    function transferETH(
        uint256 requestId,
        address to,
        uint256 amount
    ) public onlyOPAgentCallback {
        // transfer ETH to the specified address
        (bool success, ) = to.call{value: amount}("");
        require(success, "Transfer failed");
        emit Transfer(requestId, to, amount);
    }
}