import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import type { ChainId } from "@aave/contract-helpers";
import { getAaveReservesData } from "./aave/aave";
import { markets } from "./aave/markets";
import "dotenv/config"

const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

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
    console.error("Error fetching reserves data:", err);
    throw new Error("Something went wrong fetching data, please contact the team");
  }
};

interface Asset {
  symbol: string;
  supplyCap: string;
  supplyRate: string;
  assetLink: string;
}

async function findBestApy() {
  const chainsToFetch = [
    "ethereum main",
    "arbitrum",
    "avalanche",
    "optimism",
    "polygon",
    "base",
  ];

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

  // Use AI to analyze and find the best APY
  const { text } = await generateText({
    model: openai('gpt-4o-mini'),
    system: 'You are a DeFi expert specializing in yield analysis. Analyze the provided AAVE data and identify the best APY opportunities.',
    prompt: `Analyze this AAVE data across different chains and tell me which asset on which chain currently offers the best supply APY. Also explain any relevant considerations for these options. Here's the data: ${JSON.stringify(results, null, 2)}`,
  });

  return {
    rawData: results,
    aiAnalysis: text
  };
}

async function main() {
  try {
    const analysis = await findBestApy();
    console.log("AI Analysis of Best APY Options:");
    console.log(analysis.aiAnalysis);
    console.log("\nRaw Data for Reference:");
    console.log(JSON.stringify(analysis.rawData, null, 2));
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

main();
