import { NextResponse } from 'next/server';
import { sendTransactionWebhook, addWebhookUrl, removeWebhookUrl } from '@/lib/webhooks';

/**
 * API endpoint for testing webhooks
 * This allows developers to test the webhook system without having to perform real transactions
 * Only enabled in development mode
 */
export async function POST(request: Request) {
  // Only allow in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { action, url, transactionData } = body;

    // Handle different actions
    switch (action) {
      case 'add-url':
        if (!url) {
          return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }
        addWebhookUrl(url);
        return NextResponse.json({ 
          success: true, 
          message: `Webhook URL added: ${url}` 
        });

      case 'remove-url':
        if (!url) {
          return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }
        removeWebhookUrl(url);
        return NextResponse.json({ 
          success: true, 
          message: `Webhook URL removed: ${url}` 
        });

      case 'test-webhook':
        // Create a sample transaction for testing
        const testTransaction = transactionData || {
          id: `test-${Date.now()}`,
          fromWalletId: 'wallet-test-source',
          toWalletId: 'wallet-test-destination',
          amount: 100.0,
          timestamp: new Date(),
          status: 'COMPLETED',
          description: 'Test webhook transaction',
          type: 'TRANSFER'
        };

        const result = await sendTransactionWebhook(testTransaction);
        return NextResponse.json({
          success: result,
          message: result 
            ? 'Webhook test triggered successfully'
            : 'Webhook test triggered but delivery failed'
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: `Webhook test failed: ${error.message}` }, 
      { status: 500 }
    );
  }
}
