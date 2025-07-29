'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';

export default function WebhookManager() {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookUrls, setWebhookUrls] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load webhook URLs from local storage for testing
  useEffect(() => {
    try {
      const savedUrls = localStorage.getItem('mock-ase-webhook-urls');
      if (savedUrls) {
        setWebhookUrls(JSON.parse(savedUrls));
      }
    } catch (e) {
      console.error('Error loading webhook URLs', e);
    }
  }, []);

  // Save URLs to local storage when updated
  useEffect(() => {
    try {
      localStorage.setItem('mock-ase-webhook-urls', JSON.stringify(webhookUrls));
    } catch (e) {
      console.error('Error saving webhook URLs', e);
    }
  }, [webhookUrls]);

  const handleAddUrl = async () => {
    if (!webhookUrl) {
      setError('Please enter a webhook URL');
      return;
    }

    if (!webhookUrl.startsWith('http://') && !webhookUrl.startsWith('https://')) {
      setError('Webhook URL must start with http:// or https://');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/test-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'add-url',
          url: webhookUrl
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage(data.message || 'Webhook URL added successfully');
        setWebhookUrls([...webhookUrls, webhookUrl]);
        setWebhookUrl('');
      } else {
        setError(data.error || 'Failed to add webhook URL');
      }
    } catch (e) {
      setError('Error adding webhook URL');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUrl = async (url: string) => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/test-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'remove-url',
          url
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage(data.message || 'Webhook URL removed successfully');
        setWebhookUrls(webhookUrls.filter(existingUrl => existingUrl !== url));
      } else {
        setError(data.error || 'Failed to remove webhook URL');
      }
    } catch (e) {
      setError('Error removing webhook URL');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleTestWebhook = async () => {
    if (webhookUrls.length === 0) {
      setError('No webhook URLs configured');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/test-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'test-webhook'
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage(data.message || 'Test webhook triggered successfully');
      } else {
        setError(data.error || 'Failed to trigger test webhook');
      }
    } catch (e) {
      setError('Error triggering test webhook');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        totalBalance={0}
        onRefresh={() => {}}
        activeView="users"
        onViewChange={() => {}}
      />

      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Webhook Manager</h1>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Add Webhook URL</h2>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://webhook.site/your-unique-id"
              className="flex-1 border border-gray-300 dark:border-gray-600 rounded px-4 py-2 dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={handleAddUrl}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Add URL
            </button>
          </div>

          {message && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-md">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-md">
              {error}
            </div>
          )}

          <div className="mt-6">
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Configured Webhook URLs</h3>
            {webhookUrls.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 italic">No webhook URLs configured</p>
            ) : (
              <ul className="space-y-2">
                {webhookUrls.map((url, index) => (
                  <li key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="text-sm font-mono truncate max-w-md">{url}</span>
                    <button
                      onClick={() => handleRemoveUrl(url)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Test Webhooks</h2>
          
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            Send a test webhook to all configured endpoints. This simulates a transaction event.
          </p>
          
          <button
            onClick={handleTestWebhook}
            disabled={loading || webhookUrls.length === 0}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Send Test Webhook
          </button>
          
          <div className="mt-6">
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Testing Tips</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-400">
              <li>Use <a href="https://webhook.site" target="_blank" rel="noopener" className="text-blue-500 hover:underline">webhook.site</a> to generate a temporary webhook endpoint for testing</li>
              <li>You can view the full payload structure in the webhook response</li>
              <li>Webhooks will automatically trigger on all transfers and deposits</li>
              <li>In production, configure webhook URLs in your environment variables</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
