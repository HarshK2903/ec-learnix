import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Particles } from '@/components/ui/particles';
import Navbar from '@/components/layout/Navbar';
import { FileText, Zap, Download, ArrowRight, Sparkles, Shield, Clock, ChevronRight, Star } from 'lucide-react';
import { TEMPLATE_INFO } from '@/types';
import type { TemplateType } from '@/types';
import {  useNavigate } from 'react-router-dom';
 
const navigate = useNavigate();

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background dark">
      <Navbar />

      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Particles Background */}
        <Particles
          className="absolute inset-0 -z-10"
          quantity={120}
          staticity={30}
          ease={70}
          size={1}
          color="#8b5cf6"
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-violet-600/8 blur-[100px]" />
          <div className="absolute bottom-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-cyan-500/8 blur-[100px]" />
          <div className="absolute top-[40%] left-[50%] h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-indigo-500/5 blur-[80px]" />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 -z-10 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 w-full">
          <div className="mx-auto max-w-4xl text-center">
            {/* Floating badge */}
            <div className="animate-slide-up mb-8">
              <Badge variant="secondary" className="px-5 py-2 text-sm font-medium border border-violet-500/20 bg-violet-500/10 text-violet-300 backdrop-blur-sm">
                <Sparkles className="mr-2 h-3.5 w-3.5 text-violet-400" />
                AI-Powered Document Formatting
                <ChevronRight className="ml-2 h-3.5 w-3.5" />
              </Badge>
            </div>

            {/* Hero title */}
            <h1 className="animate-slide-up text-5xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl leading-[0.9]" style={{ animationDelay: '0.1s' }}>
              Transform Your{' '}
              <span className="gradient-text">Documents</span>
              <br />
              <span className="text-muted-foreground/80 text-[0.65em]">with AI</span>
            </h1>

            {/* Subtitle */}
            <p className="animate-slide-up mt-8 text-lg leading-relaxed text-muted-foreground sm:text-xl max-w-2xl mx-auto" style={{ animationDelay: '0.2s' }}>
              Upload your raw DOCX manuscript and get a professionally formatted,
              publication-ready document in seconds.
              <span className="text-foreground/80 font-medium"> No manual formatting required.</span>
            </p>

            {/* CTA Buttons */}
            <div className="animate-slide-up mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center" style={{ animationDelay: '0.3s' }}>
              <Button size="lg"  className="group relative bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 text-white border-0 px-10 h-14 text-base font-semibold shadow-2xl shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:scale-[1.02]">
                <Link to="/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline"  className="h-14 px-10 text-base backdrop-blur-sm border-border/60 hover:bg-white/5">
                <Link to="/login">
                  Sign In
                </Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="animate-slide-up mt-12 flex items-center justify-center gap-6 text-sm text-muted-foreground" style={{ animationDelay: '0.4s' }}>
              <span className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-emerald-400" />
                Secure & Private
              </span>
              <span className="h-4 w-px bg-border" />
              <span className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-amber-400" />
                Under 60s
              </span>
              <span className="h-4 w-px bg-border" />
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-violet-400" />
                Free to use
              </span>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-muted/20 to-background" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <Badge variant="outline" className="mb-4 text-xs uppercase tracking-wider">How It Works</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
              Three steps to <span className="gradient-text">perfection</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              From raw manuscript to publication-ready in under a minute
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 relative">
            {/* Connection line (desktop) */}
            <div className="hidden md:block absolute top-24 left-[20%] right-[20%] h-px bg-gradient-to-r from-violet-500/20 via-cyan-500/20 to-emerald-500/20" />

            {[
              {
                step: '01',
                icon: FileText,
                title: 'Upload Your DOCX',
                description: 'Drag and drop your unformatted document. We accept any .docx file up to 10MB.',
                gradient: 'from-violet-500 to-violet-600',
                glowColor: 'violet',
              },
              {
                step: '02',
                icon: Zap,
                title: 'Configure & Customize',
                description: 'Pick a template, set the tone, and choose your AI processing mode.',
                gradient: 'from-cyan-500 to-cyan-600',
                glowColor: 'cyan',
              },
              {
                step: '03',
                icon: Download,
                title: 'Download Result',
                description: 'AI enhances your content and formats it professionally. Download as DOCX or PDF.',
                gradient: 'from-emerald-500 to-emerald-600',
                glowColor: 'emerald',
              },
            ].map((item) => (
              <Card key={item.step} className="group relative overflow-hidden border-border/30 bg-card/30 backdrop-blur-sm transition-all duration-500 hover:border-border/60 hover:shadow-2xl hover:-translate-y-2">
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-${item.glowColor}-500/5 to-transparent`} />
                <CardContent className="p-8 relative">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl`}>
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-6xl font-black text-muted-foreground/5 group-hover:text-muted-foreground/10 transition-colors">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="mb-3 text-xl font-bold">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TEMPLATES SHOWCASE ===== */}
      <section className="py-28 relative">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-violet-500/5 blur-[100px]" />
          <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-cyan-500/5 blur-[100px]" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <Badge variant="outline" className="mb-4 text-xs uppercase tracking-wider">Templates</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
              Professional <span className="gradient-text">Templates</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              Choose from our curated collection designed for every use case
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {(Object.entries(TEMPLATE_INFO) as [TemplateType, typeof TEMPLATE_INFO[TemplateType]][]).map(([key, info]) => (
              <Card key={key} className="group overflow-hidden border-border/30 bg-card/30 backdrop-blur-sm transition-all duration-500 hover:border-violet-500/30 hover:shadow-xl hover:shadow-violet-500/5 hover:-translate-y-2">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-muted/80 to-muted/40 text-4xl transition-all duration-300 group-hover:scale-110 group-hover:from-violet-500/10 group-hover:to-cyan-500/10">
                    {info.icon}
                  </div>
                  <h3 className="mb-2 font-bold">{info.label}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{info.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-muted/20 to-background" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <Badge variant="outline" className="mb-4 text-xs uppercase tracking-wider">Features</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
              Why choose <span className="gradient-text">DocForge</span>?
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                icon: Sparkles,
                title: 'AI-Enhanced Content',
                description: 'Missing fields are auto-generated. Existing content is refined for clarity, grammar, and professional impact.',
                gradient: 'from-violet-500 to-indigo-600',
              },
              {
                icon: Shield,
                title: 'Secure & Private',
                description: 'Your documents are processed securely and never stored permanently. Enterprise-grade encryption at rest.',
                gradient: 'from-emerald-500 to-teal-600',
              },
              {
                icon: Clock,
                title: 'Lightning Fast',
                description: 'Get your formatted document in under a minute. Real-time progress tracking keeps you informed.',
                gradient: 'from-amber-500 to-orange-600',
              },
            ].map((feature) => (
              <div key={feature.title} className="group flex gap-5 p-6 rounded-2xl border border-border/20 bg-card/20 backdrop-blur-sm transition-all duration-300 hover:border-border/40 hover:bg-card/40">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold mb-2 text-lg">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-cyan-500/10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-violet-500/5 blur-[100px]" />
        </div>

        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <div className="text-5xl mb-6">🚀</div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl mb-6">
            Ready to transform<br />your documents?
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-lg mx-auto">
            Join DocForge today and never worry about document formatting again. Start for free — no credit card required.
          </p>
          <Button size="lg" onClick={() => navigate('/signup')} className="group bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 text-white border-0 px-12 h-14 text-lg font-semibold shadow-2xl shadow-violet-500/25 hover:shadow-violet-500/40 transition-all hover:scale-[1.02]">
            
              Start Formatting Now
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            
          </Button>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-border/20 py-10 bg-muted/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 shadow-lg shadow-violet-500/20">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg">DocForge</span>
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

