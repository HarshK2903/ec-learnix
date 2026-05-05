import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Navbar from '@/components/layout/Navbar';
import api from '@/lib/api';
import { toast } from 'sonner';
import { TEMPLATE_INFO, type DocumentItem, type ChangeSummary } from '@/types';
import {
  Download, ArrowLeft, CheckCircle2, Sparkles, FileText, Clock,
  Loader2, PenLine, Plus, ArrowRight, ChevronDown, ChevronUp, Eye
} from 'lucide-react';

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [doc, setDoc] = useState<DocumentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [expandedField, setExpandedField] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    api.get(`/documents/${id}`)
      .then((res) => setDoc(res.data.document))
      .catch(() => toast.error('Failed to load document'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownload = async () => {
    if (!doc) return;
    setDownloading(true);
    try {
      const res = await api.get(`/documents/${doc._id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      const ext = doc.outputFormat === 'pdf' ? '.pdf' : '.docx';
      a.download = doc.originalFileName.replace(/\.docx$/i, `_formatted${ext}`);
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Download started!');
    } catch {
      toast.error('Download failed');
    } finally {
      setDownloading(false);
    }
  };

  const actionConfig: Record<string, { color: string; bgColor: string; borderColor: string; dotColor: string; icon: React.ReactNode; label: string }> = {
    generated: { color: 'text-blue-400', bgColor: 'bg-blue-500/5', borderColor: 'border-blue-500/30', dotColor: 'bg-blue-400', icon: <Sparkles className="h-4 w-4 text-blue-400" />, label: 'AI Generated' },
    enhanced: { color: 'text-amber-400', bgColor: 'bg-amber-500/5', borderColor: 'border-amber-500/30', dotColor: 'bg-amber-400', icon: <PenLine className="h-4 w-4 text-amber-400" />, label: 'Enhanced' },
    unchanged: { color: 'text-emerald-400', bgColor: 'bg-emerald-500/5', borderColor: 'border-emerald-500/30', dotColor: 'bg-emerald-400', icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />, label: 'Unchanged' },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32">
          <p className="text-xl font-semibold mb-4">Document not found</p>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const templateInfo = TEMPLATE_INFO[doc.templateType];
  const generated = doc.changeSummary?.filter(c => c.action === 'generated').length || 0;
  const enhanced = doc.changeSummary?.filter(c => c.action === 'enhanced').length || 0;
  const unchanged = doc.changeSummary?.filter(c => c.action === 'unchanged').length || 0;
  const total = doc.changeSummary?.length || 0;

  const truncate = (text: string, max: number) => {
    if (!text) return '(empty)';
    return text.length > max ? text.substring(0, max) + '...' : text;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-1/4 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute bottom-20 right-1/4 h-96 w-96 rounded-full bg-violet-500/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Success Header */}
        <div className="text-center mb-10 animate-slide-up">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 ring-4 ring-emerald-500/10">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Document Ready!</h1>
          <p className="text-muted-foreground">Your document has been AI-processed and is ready for download</p>
        </div>

        {/* Top Section: Download + Stats in 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* Download Card — spans 2 cols */}
          <Card className="lg:col-span-2 border-border/40 bg-card/50 overflow-hidden animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="bg-gradient-to-r from-violet-600/10 to-cyan-500/10 p-6 border-b border-border/40">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 text-3xl">
                  {templateInfo?.icon || '📄'}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{doc.originalFileName}</h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span>{templateInfo?.label}</span>
                    <span>•</span>
                    <span className="capitalize">{doc.tone} tone</span>
                    <span>•</span>
                    <span className="uppercase">{doc.outputFormat}</span>
                  </div>
                </div>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Clock className="h-4 w-4" />
                <span>Processed {doc.processingCompletedAt ? new Date(doc.processingCompletedAt).toLocaleString() : 'just now'}</span>
              </div>
              <Button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 text-white border-0 h-12 text-base shadow-lg shadow-violet-500/20"
              >
                {downloading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Download className="mr-2 h-5 w-5" />}
                {downloading ? 'Downloading...' : `Download ${doc.outputFormat.toUpperCase()}`}
              </Button>
            </CardContent>
          </Card>

          {/* Stats Sidebar */}
          <Card className="border-border/40 bg-card/50 animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Eye className="h-4 w-4 text-violet-500" />
                AI Summary
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total fields</span>
                  <span className="font-bold text-lg">{total}</span>
                </div>
                <Separator />
                {generated > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-blue-400" />
                      <span className="text-sm">Generated</span>
                    </div>
                    <Badge variant="outline" className="text-blue-400 border-blue-400/30 bg-blue-500/10">{generated}</Badge>
                  </div>
                )}
                {enhanced > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                      <span className="text-sm">Enhanced</span>
                    </div>
                    <Badge variant="outline" className="text-amber-400 border-amber-400/30 bg-amber-500/10">{enhanced}</Badge>
                  </div>
                )}
                {unchanged > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                      <span className="text-sm">Unchanged</span>
                    </div>
                    <Badge variant="outline" className="text-emerald-400 border-emerald-400/30 bg-emerald-500/10">{unchanged}</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Change Summary — Field-by-Field Cards */}
        {doc.changeSummary && doc.changeSummary.length > 0 && (
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-2 mb-6">
              <FileText className="h-5 w-5 text-violet-500" />
              <h2 className="text-xl font-bold">Detailed Changes</h2>
              <span className="text-sm text-muted-foreground ml-2">Click any field to see before → after</span>
            </div>

            <div className="space-y-4">
              {doc.changeSummary.map((change: ChangeSummary, i: number) => {
                const config = actionConfig[change.action];
                const isExpanded = expandedField === i;
                const hasContent = change.originalContent || change.newContent;

                return (
                  <Card
                    key={i}
                    className={`border overflow-hidden transition-all duration-300 ${config.borderColor} ${config.bgColor} ${hasContent ? 'cursor-pointer hover:shadow-lg' : ''}`}
                    onClick={() => hasContent && setExpandedField(isExpanded ? null : i)}
                  >
                    {/* Field Header */}
                    <div className="flex items-center gap-3 p-4">
                      <div className="shrink-0">{config.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{change.field}</span>
                          <Badge variant="outline" className={`text-xs ${config.color} border-current/20`}>
                            {config.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{change.description}</p>
                      </div>
                      {hasContent && (
                        <div className="shrink-0 text-muted-foreground">
                          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </div>
                      )}
                    </div>

                    {/* Expanded Before → After */}
                    {isExpanded && hasContent && (
                      <div className="border-t border-border/40 bg-background/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:divide-x divide-border/40">
                          {/* Original (Before) */}
                          <div className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                                BEFORE
                              </span>
                            </div>
                            <div className="rounded-lg bg-muted/50 border border-border/40 p-4 text-sm leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                              {change.originalContent || <span className="text-muted-foreground italic">No content (field was missing)</span>}
                            </div>
                          </div>

                          {/* Arrow divider on mobile */}
                          <div className="flex items-center justify-center py-2 md:hidden">
                            <ArrowRight className="h-5 w-5 text-violet-500 rotate-90" />
                          </div>

                          {/* New (After) */}
                          <div className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                AFTER
                              </span>
                            </div>
                            <div className="rounded-lg bg-muted/50 border border-emerald-500/20 p-4 text-sm leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                              {change.newContent || <span className="text-muted-foreground italic">No content</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-between mt-10">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <Button
            onClick={() => navigate('/upload')}
            className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 text-white border-0"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Document
          </Button>
        </div>
      </div>
    </div>
  );
}

