// index.ts
import { Bot } from "grammy";
import dotenv from "dotenv";
import { OraAgentService } from "./offchainChat";
import { ApyService } from "./apy";

dotenv.config();

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);

// Initialize services
const oraAgent = new OraAgentService();
const apyService = new ApyService();

bot.command("start", (ctx) => ctx.reply("Hello! I'm a Telegram bot powered by Bun and grammY."));

bot.command("apy", async (ctx) => {
  try {
    ctx.reply("Fetching the best APY data from Aave, please wait...");
    const analysis = await apyService.findBestApy();
    ctx.reply(analysis);
  } catch (error) {
    console.error("Error in apy command:", error);
    ctx.reply("Sorry, there was an error fetching APY data. Please try again later.");
  }
});

// Add handler for text messages to use Ora Agent
bot.on("message:text", async (ctx) => {
  try {
    // Send a waiting message
    await ctx.reply("Processing your request with OpAgent...");
    
    // Send the user's message to Ora Agent
    const result = await oraAgent.sendPrompt(ctx.message.text);
    
    // Reply with the agent's response
    await ctx.reply(result.message);
    
    // If there are tool calls, inform the user
    if (result.toolCalls && result.toolCalls.length > 0) {
      await ctx.reply("The agent has performed the following actions: " + 
        JSON.stringify(result.toolCalls, null, 2));
    }
  } catch (error) {
    console.error("Error processing message with OpAgent:", error);
    await ctx.reply("Sorry, there was an error processing your request with OpAgent.");
  }
});

bot.start();

console.log("Bot is running!");
