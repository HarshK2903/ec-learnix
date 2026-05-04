import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/layout/Navbar';
import { FileText, Zap, Download, ArrowRight, Sparkles, Shield, Clock } from 'lucide-react';
import { TEMPLATE_INFO } from '@/types';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center animate-slide-up">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-medium">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              AI-Powered Document Formatting
            </Badge>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
              Transform Your{' '}
              <span className="gradient-text">Documents</span>
              {' '}with AI
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Upload your raw DOCX manuscript and get a professionally formatted, 
              publication-ready document in seconds. No manual formatting required.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 text-white border-0 px-8 h-12 text-base shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40">
                <Link to="/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base">
                <Link to="/login">
                  Sign In
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="border-t border-border/40 bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Three simple steps to publication-ready documents
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                step: '01',
                icon: FileText,
                title: 'Upload Your DOCX',
                description: 'Drag and drop your unformatted document. We accept any .docx file up to 10MB.',
                color: 'from-violet-500 to-violet-600',
              },
              {
                step: '02',
                icon: Zap,
                title: 'Choose Template & Tone',
                description: 'Select from 5 professional templates and customize the tone to match your style.',
                color: 'from-cyan-500 to-cyan-600',
              },
              {
                step: '03',
                icon: Download,
                title: 'Download Formatted File',
                description: 'AI enhances and formats your document. Download as DOCX or PDF instantly.',
                color: 'from-emerald-500 to-emerald-600',
              },
            ].map((item) => (
              <Card key={item.step} className="group relative overflow-hidden border-border/40 bg-card/50 backdrop-blur transition-all hover:border-border hover:shadow-xl">
                <CardContent className="p-8">
                  <div className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} shadow-lg transition-transform group-hover:scale-110`}>
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="absolute top-6 right-6 text-5xl font-black text-muted-foreground/10">
                    {item.step}
                  </span>
                  <h3 className="mb-3 text-xl font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Showcase */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Professional Templates
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Choose from our curated collection of document templates
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {Object.entries(TEMPLATE_INFO).map(([key, info]) => (
              <Card key={key} className="group overflow-hidden border-border/40 bg-card/50 transition-all hover:border-border hover:shadow-lg hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <div className="mb-4 text-4xl transition-transform group-hover:scale-110">
                    {info.icon}
                  </div>
                  <h3 className="mb-2 font-semibold">{info.label}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{info.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border/40 bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { icon: Sparkles, title: 'AI-Enhanced Content', description: 'Missing fields are auto-generated. Existing content is refined for clarity and impact.' },
              { icon: Shield, title: 'Secure & Private', description: 'Your documents are encrypted and never shared. Processed securely on our servers.' },
              { icon: Clock, title: 'Lightning Fast', description: 'Get your formatted document in under a minute. Real-time progress tracking included.' },
            ].map((feature) => (
              <div key={feature.title} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to transform your documents?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join DocForge today and never worry about document formatting again.
          </p>
          <Button size="lg" asChild className="mt-8 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 text-white border-0 px-8 h-12 text-base shadow-lg shadow-violet-500/25">
            <Link to="/signup">
              Start Formatting Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-violet-600 to-cyan-500">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">DocForge</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} DocForge. AI-powered document formatting.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
