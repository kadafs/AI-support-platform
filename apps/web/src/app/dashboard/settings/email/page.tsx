'use client';

import { useState, useEffect } from 'react';

export default function EmailSettingsPage() {
    const [config, setConfig] = useState({
        isConfigured: false,
        fromEmail: '',
        supportEmail: '',
        webhookUrl: '',
    });

    useEffect(() => {
        // Construct the webhook URL based on the current origin
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        setConfig(prev => ({
            ...prev,
            webhookUrl: `${origin}/api/webhooks/email`,
            supportEmail: 'support+{workspace-id}@mail.oh-liro.com',
        }));
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">Email Channel Settings</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Configure email integration to receive and respond to customer emails
                </p>
            </div>

            {/* Configuration Status */}
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Configuration Status</h2>
                <div className="flex items-center gap-2">
                    <span className={`inline-flex h-3 w-3 rounded-full ${process.env.NEXT_PUBLIC_RESEND_CONFIGURED === 'true'
                            ? 'bg-green-500'
                            : 'bg-yellow-500'
                        }`}></span>
                    <span className="text-sm text-gray-600">
                        {process.env.NEXT_PUBLIC_RESEND_CONFIGURED === 'true'
                            ? 'Email channel is configured'
                            : 'Email channel needs configuration'}
                    </span>
                </div>
            </div>

            {/* Setup Instructions */}
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Setup Instructions</h2>

                <div className="space-y-6">
                    {/* Step 1 */}
                    <div className="border-l-4 border-blue-500 pl-4">
                        <h3 className="font-medium text-gray-900">Step 1: Get Resend API Key</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Create a free account at{' '}
                            <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                resend.com
                            </a>
                            {' '}and get your API key from the dashboard.
                        </p>
                    </div>

                    {/* Step 2 */}
                    <div className="border-l-4 border-blue-500 pl-4">
                        <h3 className="font-medium text-gray-900">Step 2: Set Environment Variables</h3>
                        <p className="text-sm text-gray-600 mt-1 mb-2">
                            Add these to your Vercel project settings:
                        </p>
                        <div className="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm font-mono overflow-x-auto">
                            <div>RESEND_API_KEY=re_xxxxxx</div>
                            <div>EMAIL_FROM_ADDRESS=support@yourdomain.com</div>
                            <div>EMAIL_FROM_NAME=Your Company Support</div>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="border-l-4 border-blue-500 pl-4">
                        <h3 className="font-medium text-gray-900">Step 3: Configure Webhook</h3>
                        <p className="text-sm text-gray-600 mt-1 mb-2">
                            In your Resend dashboard, add a webhook with this URL:
                        </p>
                        <div className="flex items-center gap-2">
                            <code className="bg-gray-100 px-3 py-2 rounded text-sm flex-1">
                                {config.webhookUrl}
                            </code>
                            <button
                                onClick={() => navigator.clipboard.writeText(config.webhookUrl)}
                                className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                            >
                                Copy
                            </button>
                        </div>
                    </div>

                    {/* Step 4 */}
                    <div className="border-l-4 border-blue-500 pl-4">
                        <h3 className="font-medium text-gray-900">Step 4: Verify Domain</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Verify your domain in Resend to send emails from your own address.
                            You can also use inbound email if you configure a subdomain.
                        </p>
                    </div>
                </div>
            </div>

            {/* Support Email Format */}
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Support Email Address</h2>
                <p className="text-sm text-gray-600 mb-3">
                    Customers can email you at this address (replace workspace-id with your actual ID):
                </p>
                <code className="bg-gray-100 px-3 py-2 rounded text-sm block">
                    {config.supportEmail}
                </code>
            </div>

            {/* Test Section */}
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Test Connection</h2>
                <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    onClick={async () => {
                        try {
                            const res = await fetch('/api/webhooks/email');
                            const data = await res.json();
                            alert(`Webhook status: ${data.status || 'Ready'}`);
                        } catch (err) {
                            alert('Error testing webhook endpoint');
                        }
                    }}
                >
                    Test Webhook Endpoint
                </button>
            </div>
        </div>
    );
}
