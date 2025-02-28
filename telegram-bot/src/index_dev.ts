import { config } from 'dotenv';
import { initBot } from './bot';

// Read the environment variables from the .dev.vars file
config({ path: '.dev.vars' });

const env = process.env;
const botToken = env.BOT_TOKEN_DEV ?? '';
if (!botToken) {
	throw new Error('BOT_TOKEN_DEV is not set');
}

console.log('🟢 Started Dev Long Polling 🟢');

const bot = initBot(env, true);

// Function to gracefully stop the bot
const gracefulShutdown = () => {
	console.log('Shutting down gracefully...');
	bot
		.stop()
		.then(() => {
			console.log('Bot stopped.');
			process.exit(0);
		})
		.catch((err) => {
			console.error('Error while stopping the bot:', err);
			process.exit(1);
		});
};

// Handle SIGINT and SIGTERM signals
process.once('SIGINT', gracefulShutdown);
process.once('SIGTERM', gracefulShutdown);

// Start the bot using grammY runner
bot.start();
