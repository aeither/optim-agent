import { UiPoolDataProvider } from "@aave/contract-helpers";
import { formatReserves } from "@aave/math-utils";
import dayjs from "dayjs";
import { Contract, ethers } from "ethers";

const chainIdToRPCProvider: Record<number, string> = {
	1: "https://eth-mainnet.alchemyapi.io/v2/demo",
	137: "https://polygon-rpc.com",
	43114: "https://api.avax.network/ext/bc/C/rpc",
	42161: "https://arb1.arbitrum.io/rpc",
	250: "https://rpc.ftm.tools",
	10: "https://optimism-mainnet.public.blastapi.io",
	1666600000: "https://api.harmony.one",
	1088: "https://andromeda.metis.io/?owner=1088",
	8453: "https://base-mainnet.public.blastapi.io",
	100: "https://gnosis-mainnet.public.blastapi.io",
	56: "https://bsc-mainnet.public.blastapi.io",
	534352: "https://scroll-mainnet.public.blastapi.io",
};

type ConfigInterface = {
	chainId: string;
	marketName: string;
	protocol: string;
	lendingPoolAddressProvider: string;
	uiDataProvider: string;
	pool: string;
};

export async function getAaveReservesData(config: ConfigInterface) {
	const currentTimestamp = dayjs().unix();
	const lendingPoolAddressProvider = config.lendingPoolAddressProvider;
	const chainId: number = Number.parseInt(config.chainId, 10);

	const provider = new ethers.providers.StaticJsonRpcProvider(
		chainIdToRPCProvider[chainId],
		chainId,
	);

	try {
		const poolDataProviderContract = new UiPoolDataProvider({
			uiPoolDataProviderAddress: config.uiDataProvider,
			provider,
			chainId,
		});

		let paused = false;
		if (config.protocol === "v2") {
			const abi = ["function paused() public view returns (bool)"];
			const poolContract = new Contract(config.pool, abi, provider);
			paused = await poolContract.paused();
		}

		const reserves = await poolDataProviderContract.getReservesHumanized({
			lendingPoolAddressProvider,
		});

		const formattedPoolReserves = formatReserves({
			reserves: reserves.reservesData,
			currentTimestamp,
			marketReferenceCurrencyDecimals:
				reserves.baseCurrencyData.marketReferenceCurrencyDecimals,
			marketReferencePriceInUsd:
				reserves.baseCurrencyData.marketReferenceCurrencyPriceInUsd,
		});

		const reservesArray = formattedPoolReserves.map((n) =>
			config.protocol === "v3"
				? {
						symbol: n.symbol,
						frozen: n.isFrozen ? "True" : "False",
						paused: n.isPaused ? "True" : "False",
						canCollateral: n.usageAsCollateralEnabled ? "True" : "False",
						LTV: `${Number(n.formattedBaseLTVasCollateral) * 100}%`,
						liqThereshold: `${Number(n.formattedReserveLiquidationThreshold) * 100}%`,
						liqBonus: `${Number(n.formattedReserveLiquidationBonus) * 100}%`,
						reserveFactor: `${Number(n.reserveFactor) * 100}%`,
						canBorrow: n.borrowingEnabled ? "True" : "False",
						optimalUtilization: `${((Number(n.optimalUsageRatio) / 1e27) * 100).toFixed(0)}%`,
						supplyRate: `${(Number(n.supplyAPY) * 100).toFixed(2)}%`,
						varBorrowRate: `${(Number(n.variableBorrowAPY) * 100).toFixed(2)}%`,
						shareOfStableRate: "0%",
						isIsolated: n.isIsolated ? "True" : "False",
						debtCeiling:
							n.debtCeiling === "0"
								? "N/A"
								: `${(Number(n.debtCeilingUSD) / 1e8).toFixed(3)}M`,
						supplyCap:
							n.supplyCap === "0"
								? "N/A"
								: `${(Number(n.supplyCapUSD) / 1e9).toFixed(4)}B`,
						borrowCap:
							n.borrowCap === "0"
								? "N/A"
								: `${(Number(n.borrowCapUSD) / 1e9).toFixed(4)}B`,
						borrowableInIsolation: n.borrowableInIsolation ? "True" : "False",
						flashloanEnabled: n.flashLoanEnabled ? "True" : "False",
						assetLink: `https://app.aave.com/reserve-overview/?underlyingAsset=${n.underlyingAsset}&marketName=${config.marketName}`,
					}
				: {},
		);

		return { data: reservesArray };
	} catch (e) {
		console.log(e);
		throw new Error("Failed to fetch data");
	}
}