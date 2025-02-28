import { Bot } from "grammy";
import dotenv from "dotenv";

dotenv.config();

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);

bot.command("start", (ctx) => ctx.reply("Hello! I'm a Telegram bot powered by Bun and grammY."));

bot.on("message:text", (ctx) => ctx.reply(`You said: ${ctx.message.text}`));

bot.start();

console.log("Bot is running!");
