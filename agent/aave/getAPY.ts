import type { ChainId } from "@aave/contract-helpers";
import { getAaveReservesData } from "./aave";
import { markets } from "./markets";

const fetchReservesAny = async (
	config: {
		chainId: ChainId;
		publicJsonRPCUrl: string;
		LENDING_POOL_ADDRESS_PROVIDER: string;
		UI_POOL_DATA_PROVIDER: string;
		POOL: string;
		marketName: string;
	},
	protocol: string,
) => {
	try {
		const response = await getAaveReservesData({
			chainId: config.chainId.toString(),
			marketName: config.marketName,
			protocol: protocol,
			lendingPoolAddressProvider: config.LENDING_POOL_ADDRESS_PROVIDER,
			uiDataProvider: config.UI_POOL_DATA_PROVIDER,
			pool: config.POOL,
		});
		return response.data;
	} catch (err) {
		alert("something went wrong fetching data, please contact the team");
	}
};

interface Asset {
	symbol: string;
	supplyCap: string;
	supplyRate: string;
	assetLink: string;
}

async function main() {
	const chainsToFetch = [
		"ethereum main",
		"arbitrum",
		"avalanche",
		"optimism",
		"polygon",
		"base",
	];

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const results: Record<string, any[]> = {};

	for (const chainName of chainsToFetch) {
		const mkt = markets.v3.find((n: { name: string }) => n.name === chainName);

		if (!mkt) continue;

		const protocol = "v3";
		const data = await fetchReservesAny(mkt.config, protocol);

		if (!data) continue;

		results[chainName] = (data as Asset[])
			.filter((asset): asset is Asset =>
				["USDT", "USDC", "WETH"].includes(asset.symbol),
			)
			.map((asset) => ({
				symbol: asset.symbol,
				supplyCap: asset.supplyCap,
				supplyRate: asset.supplyRate,
				assetLink: asset.assetLink,
			}));
	}

	console.log(JSON.stringify(results, null, 2));
}

main().catch((error) => {
	console.error("Fatal error:", error);
	process.exit(1);
});