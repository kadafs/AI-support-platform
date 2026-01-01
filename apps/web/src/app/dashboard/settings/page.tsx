'use client';

import { useState } from 'react';
import {
    Save,
    Palette,
    MessageSquare,
    Users,
    Bell,
    Shield,
    Globe,
    Mail,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
    { id: 'general', name: 'General', icon: Globe },
    { id: 'widget', name: 'Chat Widget', icon: MessageSquare },
    { id: 'team', name: 'Team', icon: Users },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('general');
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [workspaceName, setWorkspaceName] = useState('Acme Inc');
    const [widgetColor, setWidgetColor] = useState('#3b82f6');
    const [widgetPosition, setWidgetPosition] = useState('bottom-right');
    const [greeting, setGreeting] = useState('Hi there! 👋 How can we help you today?');

    const handleSave = async () => {
        setIsSaving(true);
        // TODO: Save to API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="h-16 px-6 border-b flex items-center justify-between bg-card">
                <div>
                    <h1 className="font-semibold text-lg">Settings</h1>
                    <p className="text-sm text-muted-foreground">Manage your workspace settings</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    Save Changes
                </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <nav className="w-56 border-r bg-muted/30 p-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-1',
                                activeTab === tab.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.name}
                        </button>
                    ))}
                </nav>

                {/* Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                    {activeTab === 'general' && (
                        <div className="max-w-2xl space-y-6">
                            <div>
                                <h2 className="text-lg font-medium mb-4">General Settings</h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block">Workspace Name</label>
                                        <input
                                            type="text"
                                            value={workspaceName}
                                            onChange={(e) => setWorkspaceName(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block">Workspace ID</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value="ws_abc123xyz"
                                                readOnly
                                                className="flex-1 px-4 py-2.5 rounded-lg border bg-muted text-muted-foreground"
                                            />
                                            <button className="px-4 py-2.5 rounded-lg border hover:bg-muted transition-colors">
                                                Copy
                                            </button>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Use this ID to configure your chat widget
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <hr />

                            <div>
                                <h3 className="font-medium mb-4">Danger Zone</h3>
                                <button className="px-4 py-2 rounded-lg border border-destructive text-destructive hover:bg-destructive/10 transition-colors">
                                    Delete Workspace
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'widget' && (
                        <div className="max-w-2xl space-y-6">
                            <div>
                                <h2 className="text-lg font-medium mb-4">Chat Widget Settings</h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block">Primary Color</label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                value={widgetColor}
                                                onChange={(e) => setWidgetColor(e.target.value)}
                                                className="w-12 h-12 rounded-lg border cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={widgetColor}
                                                onChange={(e) => setWidgetColor(e.target.value)}
                                                className="w-32 px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block">Widget Position</label>
                                        <div className="flex gap-3">
                                            {['bottom-right', 'bottom-left'].map((pos) => (
                                                <button
                                                    key={pos}
                                                    onClick={() => setWidgetPosition(pos)}
                                                    className={cn(
                                                        'px-4 py-2 rounded-lg border transition-colors',
                                                        widgetPosition === pos
                                                            ? 'border-primary bg-primary/10 text-primary'
                                                            : 'hover:bg-muted'
                                                    )}
                                                >
                                                    {pos === 'bottom-right' ? 'Bottom Right' : 'Bottom Left'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block">Greeting Message</label>
                                        <textarea
                                            value={greeting}
                                            onChange={(e) => setGreeting(e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <hr />

                            <div>
                                <h3 className="font-medium mb-4">Installation Code</h3>
                                <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                                    <code>
                                        {`<script
  src="https://cdn.supportai.com/widget.js"
  data-workspace-id="ws_abc123xyz"
  data-primary-color="${widgetColor}"
></script>`}
                                    </code>
                                </div>
                                <button className="mt-2 px-4 py-2 rounded-lg border hover:bg-muted transition-colors text-sm">
                                    Copy Code
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'team' && (
                        <div className="max-w-2xl">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-medium">Team Members</h2>
                                <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
                                    <Mail className="w-4 h-4" />
                                    Invite
                                </button>
                            </div>

                            <div className="rounded-xl border bg-card overflow-hidden">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Member</th>
                                            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Role</th>
                                            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                                            <th className="w-12"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-xs font-medium">
                                                        JD
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm">John Doe</p>
                                                        <p className="text-xs text-muted-foreground">john@acme.com</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                                    Admin
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-muted-foreground">You</span>
                                            </td>
                                            <td className="px-4 py-3"></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="max-w-2xl">
                            <h2 className="text-lg font-medium mb-4">Notification Preferences</h2>
                            <div className="space-y-4">
                                {[
                                    { label: 'New conversations', description: 'When a new conversation starts' },
                                    { label: 'Escalations', description: 'When AI escalates to human' },
                                    { label: 'Mentions', description: 'When you are mentioned in a conversation' },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center justify-between p-4 rounded-lg border">
                                        <div>
                                            <p className="font-medium text-sm">{item.label}</p>
                                            <p className="text-xs text-muted-foreground">{item.description}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="max-w-2xl">
                            <h2 className="text-lg font-medium mb-4">Security Settings</h2>
                            <div className="space-y-6">
                                <div className="p-4 rounded-lg border">
                                    <h3 className="font-medium mb-1">Change Password</h3>
                                    <p className="text-sm text-muted-foreground mb-4">Update your account password</p>
                                    <button className="px-4 py-2 rounded-lg border hover:bg-muted transition-colors">
                                        Change Password
                                    </button>
                                </div>
                                <div className="p-4 rounded-lg border">
                                    <h3 className="font-medium mb-1">Two-Factor Authentication</h3>
                                    <p className="text-sm text-muted-foreground mb-4">Add an extra layer of security</p>
                                    <button className="px-4 py-2 rounded-lg border hover:bg-muted transition-colors">
                                        Enable 2FA
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
