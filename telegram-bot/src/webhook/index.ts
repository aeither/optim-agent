import type Env from "../environment";

// Webhook payload interface
interface WebhookPayload {
    id: string;
    action: string;
    data: Record<string, any>;
    timestamp: string;
}

// Main webhook handler
export async function handleWebhook(req: Request, env: Env): Promise<Response> {
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        const payload = (await req.json()) as WebhookPayload;

        switch (payload.action) {
            case 'hello':
                return await handleHello(payload.data);
            default:
                return new Response(`Unknown action: ${payload.action}`, { status: 400 });
        }
    } catch (error) {
        console.error('Webhook error:', error);
        return new Response('Invalid payload', { status: 400 });
    }
}

// Hello world handler
async function handleHello(data: Record<string, any>): Promise<Response> {
    return new Response(
        JSON.stringify({
            success: true,
            message: 'Hello World!',
            receivedData: data
        }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}

/**
 * 
 * POST
{
    "id": "1",
    "action": "hello",
    "data": { "test": "value" },
    "timestamp": "2024-01-01T00:00:00Z"
}
 */