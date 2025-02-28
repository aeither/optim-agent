// botHandlers.ts
import type { Bot } from 'grammy';
import type Env from "../environment";

export const setupBotHandlers = (bot: Bot, env: Env) => {
	// Handle the /start command.
	bot.command('start', async (ctx) => await ctx.reply('Welcome! Up and running.'));
	// Handle other messages.
	bot.on('message', async (ctx) => {
		console.log("message: ", ctx.message.text);
		await ctx.reply('Got message!');
	});
};
