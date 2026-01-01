'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Ear, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, companyName }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            // Redirect to setup wizard
            router.push('/setup');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-700 to-teal-800 p-12 flex-col justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                        <Ear className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-semibold text-xl text-white">Oh-liro</span>
                </div>
                <div>
                    <h2 className="text-4xl font-bold text-white mb-4">
                        Start for free
                    </h2>
                    <p className="text-white/80 text-lg">
                        Set up your AI-powered support in minutes.
                        No credit card required.
                    </p>
                    <div className="mt-8 space-y-4">
                        <div className="flex items-center gap-3 text-white/90">
                            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm">✓</div>
                            AI handles 80%+ of inquiries
                        </div>
                        <div className="flex items-center gap-3 text-white/90">
                            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm">✓</div>
                            Live chat, email & WhatsApp
                        </div>
                        <div className="flex items-center gap-3 text-white/90">
                            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm">✓</div>
                            14-day free trial
                        </div>
                    </div>
                </div>
                <div className="text-white/60 text-sm">
                    © 2026 Oh-liro
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="lg:hidden flex items-center gap-2 mb-8">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-700 to-teal-800 flex items-center justify-center">
                            <Ear className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-semibold text-lg">Oh-liro</span>
                    </div>

                    <h1 className="text-2xl font-bold mb-2">Create your account</h1>
                    <p className="text-muted-foreground mb-8">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary hover:underline">
                            Sign in
                        </Link>
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="text-sm font-medium mb-1.5 block">
                                    Your name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder="John"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="company" className="text-sm font-medium mb-1.5 block">
                                    Company
                                </label>
                                <input
                                    id="company"
                                    type="text"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="Acme Inc"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="text-sm font-medium mb-1.5 block">
                                Work email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="you@company.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="text-sm font-medium mb-1.5 block">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="••••••••"
                                    minLength={8}
                                    required
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Must be at least 8 characters
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>

                        <p className="text-xs text-center text-muted-foreground">
                            By creating an account, you agree to our{' '}
                            <Link href="/terms" className="underline">Terms</Link> and{' '}
                            <Link href="/privacy" className="underline">Privacy Policy</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
