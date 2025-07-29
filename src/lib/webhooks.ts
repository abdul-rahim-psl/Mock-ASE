// src/lib/webhooks.ts - Webhook handling system for the Mock-ASE application

import { logger } from './logger';
import { Transaction } from './data-postgres';
import fetch from 'node-fetch';

// Configuration for webhooks
interface WebhookConfig {
  enabled: boolean;
  urls: string[];
  retryAttempts: number;
  retryDelay: number; // in milliseconds
  timeout: number; // in milliseconds
}

// Default configuration
const config: WebhookConfig = {
  enabled: true,
  urls: [], // URLs will be populated from environment variables or configuration
  retryAttempts: 3,
  retryDelay: 2000,
  timeout: 5000
};

// Initialize webhook URLs from environment variables
const initWebhooks = () => {
  try {
    // Check for webhook URLs in environment variables
    const envWebhookUrls = process.env.WEBHOOK_URLS;
    
    if (envWebhookUrls) {
      config.urls = envWebhookUrls.split(',').map(url => url.trim());
      logger.info(`Initialized webhooks with ${config.urls.length} endpoints`);
    } else {
      logger.warn('No webhook URLs configured. Set WEBHOOK_URLS environment variable to enable webhooks');
    }
    
    // Check for enabled flag
    if (process.env.WEBHOOK_ENABLED === 'false') {
      config.enabled = false;
      logger.info('Webhooks are disabled via environment configuration');
    }
    
    // Override retry attempts if specified
    if (process.env.WEBHOOK_RETRY_ATTEMPTS) {
      config.retryAttempts = parseInt(process.env.WEBHOOK_RETRY_ATTEMPTS, 10);
    }
    
    // Override retry delay if specified
    if (process.env.WEBHOOK_RETRY_DELAY) {
      config.retryDelay = parseInt(process.env.WEBHOOK_RETRY_DELAY, 10);
    }
    
    // Override timeout if specified
    if (process.env.WEBHOOK_TIMEOUT) {
      config.timeout = parseInt(process.env.WEBHOOK_TIMEOUT, 10);
    }
  } catch (error) {
    logger.error(`Error initializing webhooks: ${error}`);
  }
};

// Call initialization on module import
initWebhooks();

// Define the payload structure for webhooks
export interface TransactionWebhookPayload {
  eventType: 'transaction.created';
  timestamp: string;
  data: {
    transactionId: string;
    fromWalletId: string | null;
    toWalletId: string;
    amount: number;
    status: string;
    description: string;
    type: string;
    occurredAt: string;
  };
  metadata?: Record<string, any>;
}

/**
 * Add a webhook URL to the configuration
 * @param url The webhook endpoint URL
 */
export const addWebhookUrl = (url: string): void => {
  if (!config.urls.includes(url)) {
    config.urls.push(url);
    logger.info(`Added webhook URL: ${url}`);
  }
};

/**
 * Remove a webhook URL from the configuration
 * @param url The webhook endpoint URL to remove
 */
export const removeWebhookUrl = (url: string): void => {
  const initialLength = config.urls.length;
  config.urls = config.urls.filter(existingUrl => existingUrl !== url);
  
  if (config.urls.length < initialLength) {
    logger.info(`Removed webhook URL: ${url}`);
  }
};

/**
 * Toggle webhooks on or off
 * @param enabled Whether webhooks should be enabled
 */
export const setWebhooksEnabled = (enabled: boolean): void => {
  config.enabled = enabled;
  logger.info(`Webhooks ${enabled ? 'enabled' : 'disabled'}`);
};

/**
 * Send a webhook notification with retry logic
 * @param payload The webhook payload to send
 */
export const sendWebhookNotification = async (payload: TransactionWebhookPayload): Promise<boolean> => {
  if (!config.enabled || config.urls.length === 0) {
    logger.debug('Webhooks are disabled or no URLs configured');
    return false;
  }

  const headers = {
    'Content-Type': 'application/json',
    'X-Webhook-Source': 'Mock-ASE',
    'X-Webhook-Timestamp': new Date().toISOString()
  };

  const promises = config.urls.map(async (url) => {
    let success = false;
    let attempts = 0;
    let lastError: Error | null = null;

    while (!success && attempts < config.retryAttempts) {
      attempts++;
      try {
        logger.debug(`Sending webhook to ${url} (attempt ${attempts}/${config.retryAttempts})`);
        
        // Use AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.timeout);
        
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          logger.success(`Webhook sent successfully to ${url}`);
          success = true;
        } else {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
      } catch (error) {
        lastError = error as Error;
        logger.error(`Webhook delivery failed to ${url}: ${error}`);
        
        // If we have more attempts, wait before retrying
        if (attempts < config.retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, config.retryDelay));
        }
      }
    }

    // Log final status for this URL
    if (!success) {
      logger.error(`Webhook delivery to ${url} failed after ${attempts} attempts: ${lastError}`);
    }
    
    return { url, success };
  });

  // Wait for all webhook deliveries to complete
  const results = await Promise.all(promises);
  const allSuccessful = results.every(result => result.success);
  
  if (allSuccessful) {
    logger.success(`Successfully delivered webhooks to all ${config.urls.length} endpoints`);
  } else {
    const successCount = results.filter(result => result.success).length;
    logger.warn(`Webhooks delivered to ${successCount}/${config.urls.length} endpoints`);
  }
  
  return allSuccessful;
};

/**
 * Create and send a transaction webhook when a transfer occurs
 * @param transaction The transaction that triggered the webhook
 */
export const sendTransactionWebhook = async (transaction: Transaction): Promise<boolean> => {
  try {
    const payload: TransactionWebhookPayload = {
      eventType: 'transaction.created',
      timestamp: new Date().toISOString(),
      data: {
        transactionId: transaction.id,
        fromWalletId: transaction.fromWalletId || null,
        toWalletId: transaction.toWalletId,
        amount: transaction.amount,
        status: transaction.status,
        description: transaction.description,
        type: transaction.type,
        occurredAt: transaction.timestamp.toString()
      }
    };

    logger.info(`Triggering transaction webhook for ${transaction.type} (ID: ${transaction.id})`);
    return await sendWebhookNotification(payload);
  } catch (error) {
    logger.error(`Failed to send transaction webhook: ${error}`);
    return false;
  }
};

// Export the config for testing purposes
export const getWebhookConfig = () => ({ ...config });
