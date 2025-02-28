import { Bot } from "grammy";
import type { UserFromGetMe } from "grammy/types";
import type Env from "../environment";
import { setupBotHandlers } from "./handlers";

export const initBot = (env: Env, test = false): Bot => {
	let BOT_TOKEN = env.BOT_TOKEN;
	if (env.NODE_ENV === "development") {
		BOT_TOKEN = env.BOT_TOKEN_DEV!;
		console.log("Running in development mode");
	} else {
		console.log("Running in production mode");
	}

	const BOT_INFO: UserFromGetMe = env.BOT_INFO;
	const bot = new Bot(BOT_TOKEN, {
		botInfo: BOT_INFO,
		client: {
			apiRoot: "https://api.telegram.org",
			environment: test ? "test" : "prod"
		}
	});

	setupBotHandlers(bot, env);

	return bot;
};
