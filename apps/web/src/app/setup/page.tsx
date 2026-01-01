'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Building2,
    Palette,
    MessageSquare,
    Globe,
    ArrowRight,
    ArrowLeft,
    Check,
    Loader2,
    Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
    { id: 'company', title: 'Your Company', icon: Building2 },
    { id: 'branding', title: 'Branding', icon: Palette },
    { id: 'widget', title: 'Chat Widget', icon: MessageSquare },
    { id: 'knowledge', title: 'Knowledge Base', icon: Globe },
];

const COLORS = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Teal', value: '#14b8a6' },
];

export default function SetupWizard() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [companyName, setCompanyName] = useState('');
    const [industry, setIndustry] = useState('');
    const [teamSize, setTeamSize] = useState('');
    const [primaryColor, setPrimaryColor] = useState('#3b82f6');
    const [greeting, setGreeting] = useState('Hi there! 👋 How can we help you today?');
    const [widgetPosition, setWidgetPosition] = useState('bottom-right');
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [importWebsite, setImportWebsite] = useState(false);

    const canProceed = () => {
        switch (currentStep) {
            case 0:
                return companyName.trim().length > 0;
            case 1:
                return true;
            case 2:
                return greeting.trim().length > 0;
            case 3:
                return true;
            default:
                return false;
        }
    };

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleComplete = async () => {
        setIsLoading(true);

        try {
            // Save workspace settings
            await fetch('/api/workspaces', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: companyName,
                    settings: {
                        industry,
                        teamSize,
                        widgetColor: primaryColor,
                        widgetPosition,
                        greeting,
                        setupCompleted: true,
                    },
                }),
            });

            // Optionally import website as knowledge source
            if (importWebsite && websiteUrl) {
                await fetch('/api/knowledge', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'URL',
                        name: `${companyName} Website`,
                        sourceUrl: websiteUrl,
                    }),
                });
            }

            router.push('/dashboard');
        } catch (error) {
            console.error('Setup error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-8">
                    {STEPS.map((step, index) => (
                        <div key={step.id} className="flex items-center">
                            <div
                                className={cn(
                                    'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                                    index < currentStep
                                        ? 'bg-primary text-primary-foreground'
                                        : index === currentStep
                                            ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                                            : 'bg-muted text-muted-foreground'
                                )}
                            >
                                {index < currentStep ? (
                                    <Check className="w-5 h-5" />
                                ) : (
                                    <step.icon className="w-5 h-5" />
                                )}
                            </div>
                            {index < STEPS.length - 1 && (
                                <div
                                    className={cn(
                                        'w-16 h-1 mx-2 rounded-full transition-all',
                                        index < currentStep ? 'bg-primary' : 'bg-muted'
                                    )}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Card */}
                <div className="bg-card rounded-2xl shadow-xl border p-8">
                    {/* Step 1: Company Info */}
                    {currentStep === 0 && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <h1 className="text-2xl font-bold mb-2">Welcome to Oh-liro!</h1>
                                <p className="text-muted-foreground">
                                    Let's set up your workspace in just a few steps
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1.5 block">
                                    Company Name <span className="text-destructive">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    placeholder="Acme Inc"
                                    className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Industry</label>
                                <select
                                    value={industry}
                                    onChange={(e) => setIndustry(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                                >
                                    <option value="">Select industry...</option>
                                    <option value="ecommerce">E-commerce</option>
                                    <option value="saas">SaaS / Software</option>
                                    <option value="healthcare">Healthcare</option>
                                    <option value="finance">Finance</option>
                                    <option value="education">Education</option>
                                    <option value="hospitality">Hospitality</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Team Size</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {['1-5', '6-20', '21-50', '50+'].map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setTeamSize(size)}
                                            className={cn(
                                                'px-4 py-2 rounded-lg border transition-all',
                                                teamSize === size
                                                    ? 'border-primary bg-primary/10 text-primary'
                                                    : 'hover:bg-muted'
                                            )}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Branding */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <h1 className="text-2xl font-bold mb-2">Brand Your Widget</h1>
                                <p className="text-muted-foreground">
                                    Choose colors that match your brand identity
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-3 block">Primary Color</label>
                                <div className="grid grid-cols-6 gap-3">
                                    {COLORS.map((color) => (
                                        <button
                                            key={color.value}
                                            onClick={() => setPrimaryColor(color.value)}
                                            className={cn(
                                                'aspect-square rounded-xl transition-all',
                                                primaryColor === color.value
                                                    ? 'ring-4 ring-offset-2 ring-offset-background'
                                                    : 'hover:scale-105'
                                            )}
                                            style={{
                                                backgroundColor: color.value,
                                                ringColor: color.value,
                                            }}
                                            title={color.name}
                                        />
                                    ))}
                                </div>
                                <div className="mt-4 flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={primaryColor}
                                        onChange={(e) => setPrimaryColor(e.target.value)}
                                        className="w-12 h-12 rounded-lg border cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={primaryColor}
                                        onChange={(e) => setPrimaryColor(e.target.value)}
                                        className="w-32 px-3 py-2 rounded-lg border bg-background text-sm font-mono"
                                    />
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="mt-8 p-4 bg-muted/50 rounded-xl">
                                <p className="text-sm text-muted-foreground mb-3">Preview</p>
                                <div className="flex justify-end">
                                    <div
                                        className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        <MessageSquare className="w-6 h-6" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Widget Settings */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <h1 className="text-2xl font-bold mb-2">Customize Your Widget</h1>
                                <p className="text-muted-foreground">
                                    Set up how your chat widget will greet customers
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1.5 block">
                                    Greeting Message <span className="text-destructive">*</span>
                                </label>
                                <textarea
                                    value={greeting}
                                    onChange={(e) => setGreeting(e.target.value)}
                                    rows={3}
                                    placeholder="Hi there! 👋 How can we help you today?"
                                    className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-3 block">Widget Position</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { value: 'bottom-right', label: 'Bottom Right' },
                                        { value: 'bottom-left', label: 'Bottom Left' },
                                    ].map((pos) => (
                                        <button
                                            key={pos.value}
                                            onClick={() => setWidgetPosition(pos.value)}
                                            className={cn(
                                                'p-4 rounded-xl border transition-all relative h-24',
                                                widgetPosition === pos.value
                                                    ? 'border-primary bg-primary/5'
                                                    : 'hover:bg-muted'
                                            )}
                                        >
                                            <span className="text-sm font-medium">{pos.label}</span>
                                            <div
                                                className={cn(
                                                    'absolute bottom-3 w-4 h-4 rounded-full',
                                                    pos.value === 'bottom-right' ? 'right-3' : 'left-3'
                                                )}
                                                style={{ backgroundColor: primaryColor }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Knowledge Base */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <h1 className="text-2xl font-bold mb-2">Train Your AI</h1>
                                <p className="text-muted-foreground">
                                    Give your AI assistant knowledge about your business
                                </p>
                            </div>

                            <div
                                className={cn(
                                    'p-4 rounded-xl border-2 transition-all cursor-pointer',
                                    importWebsite
                                        ? 'border-primary bg-primary/5'
                                        : 'border-dashed hover:border-primary/50'
                                )}
                                onClick={() => setImportWebsite(!importWebsite)}
                            >
                                <div className="flex items-start gap-4">
                                    <div
                                        className={cn(
                                            'w-10 h-10 rounded-lg flex items-center justify-center',
                                            importWebsite ? 'bg-primary text-white' : 'bg-muted'
                                        )}
                                    >
                                        <Globe className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium mb-1">Import from Website</h3>
                                        <p className="text-sm text-muted-foreground">
                                            We'll automatically crawl your website and train your AI on your content
                                        </p>
                                    </div>
                                    <div
                                        className={cn(
                                            'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                                            importWebsite ? 'border-primary bg-primary' : 'border-muted'
                                        )}
                                    >
                                        {importWebsite && <Check className="w-4 h-4 text-white" />}
                                    </div>
                                </div>
                            </div>

                            {importWebsite && (
                                <div className="ml-14">
                                    <label className="text-sm font-medium mb-1.5 block">Website URL</label>
                                    <input
                                        type="url"
                                        value={websiteUrl}
                                        onChange={(e) => setWebsiteUrl(e.target.value)}
                                        placeholder="https://yourcompany.com"
                                        className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                    <p className="text-xs text-muted-foreground mt-2">
                                        We'll crawl up to 60 pages from your website
                                    </p>
                                </div>
                            )}

                            <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                                <div className="flex items-start gap-3">
                                    <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">You can always add more later</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Upload Q&A pairs, CSV files, or manually add content in the Knowledge section
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t">
                        <button
                            onClick={handleBack}
                            disabled={currentStep === 0}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
                                currentStep === 0
                                    ? 'text-muted-foreground cursor-not-allowed'
                                    : 'hover:bg-muted'
                            )}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>

                        {currentStep < STEPS.length - 1 ? (
                            <button
                                onClick={handleNext}
                                disabled={!canProceed()}
                                className={cn(
                                    'flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all',
                                    canProceed()
                                        ? 'bg-primary text-primary-foreground hover:opacity-90'
                                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                                )}
                            >
                                Continue
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={handleComplete}
                                disabled={isLoading}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium bg-primary text-primary-foreground hover:opacity-90 transition-all disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Setting up...
                                    </>
                                ) : (
                                    <>
                                        Complete Setup
                                        <Check className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Skip link */}
                <p className="text-center text-sm text-muted-foreground mt-4">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="hover:underline"
                    >
                        Skip for now
                    </button>
                </p>
            </div>
        </div>
    );
}
