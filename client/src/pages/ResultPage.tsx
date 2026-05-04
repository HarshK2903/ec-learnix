import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Navbar from '@/components/layout/Navbar';
import api from '@/lib/api';
import { toast } from 'sonner';
import { TEMPLATE_INFO, type DocumentItem } from '@/types';
import { Download, ArrowLeft, CheckCircle2, Sparkles, FileText, Clock, Loader2, PenLine, Plus } from 'lucide-react';

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [doc, setDoc] = useState<DocumentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

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

  const actionConfig: Record<string, { color: string; bgColor: string; icon: React.ReactNode; label: string }> = {
    generated: { color: 'text-blue-400', bgColor: 'bg-blue-500/10 border-blue-500/20', icon: <Sparkles className="h-4 w-4 text-blue-400" />, label: 'AI Generated' },
    enhanced: { color: 'text-amber-400', bgColor: 'bg-amber-500/10 border-amber-500/20', icon: <PenLine className="h-4 w-4 text-amber-400" />, label: 'Enhanced' },
    unchanged: { color: 'text-emerald-400', bgColor: 'bg-emerald-500/10 border-emerald-500/20', icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />, label: 'Unchanged' },
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-10 animate-slide-up">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Document Ready!</h1>
          <p className="text-muted-foreground">Your document has been formatted and is ready for download</p>
        </div>

        {/* Download Card */}
        <Card className="border-border/40 bg-card/50 mb-8 overflow-hidden animate-slide-up" style={{ animationDelay: '0.1s' }}>
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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Processed {doc.processingCompletedAt ? new Date(doc.processingCompletedAt).toLocaleString() : 'just now'}</span>
              </div>
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

        {/* Change Summary */}
        {doc.changeSummary && doc.changeSummary.length > 0 && (
          <Card className="border-border/40 bg-card/50 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                <FileText className="h-5 w-5 text-violet-500" />
                Change Summary
              </h3>
              <p className="text-sm text-muted-foreground mb-5">Here&apos;s what AI did to your document</p>

              <div className="space-y-3">
                {doc.changeSummary.map((change, i) => {
                  const config = actionConfig[change.action];
                  return (
                    <div
                      key={i}
                      className={`flex items-start gap-3 rounded-lg border p-4 transition-all ${config.bgColor}`}
                    >
                      <div className="mt-0.5 shrink-0">{config.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{change.field}</span>
                          <Badge variant="outline" className={`text-xs ${config.color} border-current/20`}>
                            {config.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{change.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <Separator className="my-5" />
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-400" /> AI Generated — Content was missing and created by AI</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Enhanced — Existing content improved</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Unchanged — Kept original content</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-8">
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
