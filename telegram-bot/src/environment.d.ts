import { UserFromGetMe } from 'grammy/types';
export default interface Env {
	BOT_TOKEN: string;
	BOT_TOKEN_DEV?: string;
	BOT_INFO: UserFromGetMe;
	NODE_ENV?: string;
}

declare global {
	namespace NodeJS {
		interface ProcessEnv extends Env {}
	}
}
