import Link from 'next/link';
import { Ear, Zap, Shield, ArrowRight, Sparkles } from 'lucide-react';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
            {/* Header */}
            <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-700 to-teal-800 flex items-center justify-center">
                            <Ear className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-semibold text-lg">Oh-liro</span>
                    </div>
                    <nav className="flex items-center gap-4">
                        <Link
                            href="/login"
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/register"
                            className="text-sm font-medium bg-gradient-to-r from-teal-700 to-teal-800 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                        >
                            Get Started
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Hero */}
            <section className="container mx-auto px-4 py-24 text-center">
                <div className="inline-flex items-center gap-2 bg-teal-700/10 text-teal-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                    <Sparkles className="w-4 h-4" />
                    AI that listens first
                </div>
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Customer Support That
                    <br />
                    <span className="bg-gradient-to-r from-teal-700 to-teal-800 bg-clip-text text-transparent">Actually Understands</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                    Oh-liro listens, understands, and responds with empathy.
                    Automate 80% of inquiries while keeping the human touch.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/register"
                        className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-700 to-teal-800 text-white px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
                    >
                        Start Free Trial
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                        href="/demo"
                        className="inline-flex items-center justify-center gap-2 border border-border px-8 py-3 rounded-lg font-medium hover:bg-muted transition-colors"
                    >
                        Watch Demo
                    </Link>
                </div>
            </section>

            {/* Features */}
            <section className="container mx-auto px-4 py-24">
                <div className="grid md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<Ear className="w-6 h-6" />}
                        title="Listens First"
                        description="Oh-liro understands context and intent before responding. No more robotic, frustrating chatbot experiences."
                    />
                    <FeatureCard
                        icon={<Zap className="w-6 h-6" />}
                        title="Instant & Accurate"
                        description="AI-powered responses that are fast, accurate, and trained on your knowledge base. 24/7 availability."
                    />
                    <FeatureCard
                        icon={<Shield className="w-6 h-6" />}
                        title="Human When Needed"
                        description="Seamless handoff to your team with full context. The AI knows when to escalate."
                    />
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t py-8">
                <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                    © 2026 Oh-liro. All rights reserved.
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-teal-700/10 text-teal-700 flex items-center justify-center mb-4">
                {icon}
            </div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
        </div>
    );
}

