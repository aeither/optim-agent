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
    const waitingMsg = await ctx.reply("Processing your request with OpAgent...");
    
    // Log the incoming message
    console.log("Received message:", ctx.message.text);
    
    // Send the user's message to Ora Agent
    const result = await oraAgent.sendPrompt(ctx.message.text);
    
    // Log the successful response
    console.log("Ora Agent response:", result);
    
    // Delete the waiting message
    await ctx.api.deleteMessage(ctx.chat.id, waitingMsg.message_id);
    
    // Reply with the agent's response
    if (result && result.message) {
      await ctx.reply(result.message);
    } else {
      throw new Error("Empty response from Ora Agent");
    }
    
  } catch (error: any) {
    console.error("Error processing message with OpAgent:", error);
    
    // Extract the most meaningful error message
    let errorMessage = "An unexpected error occurred.";
    
    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.response?.data?.detail) {
      errorMessage = JSON.stringify(error.response.data.detail);
    }
    
    // Clean up the error message for display
    errorMessage = errorMessage.replace(/^\[|\]$/g, '').replace(/\\"/g, '"');
    
    await ctx.reply(`Sorry, there was an error: ${errorMessage}`);
  }
});

bot.start();

console.log("Bot is running!");
