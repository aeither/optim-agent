import { webhookCallback } from 'grammy';
import { initBot } from './bot';
import type Env from './environment.d';
import { handleWebhook } from './webhook';

/**
 * ===
 * Development Using Webhook Steps:
 *     1. npm run start
 *     2. Port forwarding inv VS Code
 *     3. Set Webhook
 *     4. Test the bot
 * ===
 * Production Steps:
 *     1. Enable routing in Cloudflare Workers
 *     2. npm run deploy
 *     3. Set Webhook to the deployed URL
 *     4. Test the bot
 * ===
 * setWebhook
 * To set webhook: https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<MY_BOT>.<MY_SUBDOMAIN>.workers.dev/<BOT_TOKEN>
 * To delete webhook: https://api.telegram.org/bot<BOT_TOKEN>/deleteWebhook?drop_pending_updates=true
 * ===
 */

export default {
	async fetch(req: Request, env: Env): Promise<Response> {
		const bot = initBot(env, true);

		const url = new URL(req.url);
		if (url.pathname.slice(1) === 'health') {
			return new Response('OK', { status: 200 });
		}

		if (url.pathname.slice(1) === bot.token) {
			try {
				const callback = webhookCallback(bot, 'cloudflare-mod');
				return await callback(req);
			} catch (error: any) {
				return new Response(error.message, { status: 500 });
			}
		}

		if (url.pathname.slice(1) === 'webhook') {
			return handleWebhook(req, env);
		}

		return new Response('Not found', { status: 404 });
	},
};
