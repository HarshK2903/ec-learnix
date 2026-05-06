import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Navbar from '@/components/layout/Navbar';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import { toast } from 'sonner';
import { TEMPLATE_INFO, type DocumentItem } from '@/types';
import { Plus, Download, Trash2, Loader2, FolderOpen, Clock, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/documents');
      setDocuments(res.data.documents);
    } catch (err: any) {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDownload = async (doc: DocumentItem) => {
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
      toast.success('Download started');
    } catch {
      toast.error('Download failed');
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await api.delete(`/documents/${id}`);
      setDocuments((prev) => prev.filter((d) => d._id !== id));
      toast.success('Document deleted');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
    uploaded: { label: 'Uploaded', variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
    processing: { label: 'Processing', variant: 'outline', icon: <RefreshCw className="h-3 w-3 animate-spin" /> },
    completed: { label: 'Completed', variant: 'default', icon: <CheckCircle2 className="h-3 w-3" /> },
    failed: { label: 'Failed', variant: 'destructive', icon: <XCircle className="h-3 w-3" /> },
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
            </h1>
            <p className="mt-1 text-muted-foreground">Manage your documents and create new ones</p>
          </div>
          <Button
            onClick={() => navigate('/upload')}
            className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 text-white border-0 shadow-lg shadow-violet-500/20 h-11 px-6"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Document
          </Button>
        </div>

        <Separator className="mb-8" />

        {/* Document List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Loading your documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <Card className="border-dashed border-2 border-border/60 bg-card/30">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <FolderOpen className="h-16 w-16 text-muted-foreground/40 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No documents yet</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Upload your first DOCX file and let AI transform it into a professionally formatted document.
              </p>
              <Button onClick={() => navigate('/upload')} className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 text-white border-0">
                <Plus className="mr-2 h-4 w-4" />
                Upload Your First Document
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => {
              const templateInfo = TEMPLATE_INFO[doc.templateType];
              const status = statusConfig[doc.status];
              return (
                <Card
                  key={doc._id}
                  className="group border-border/40 bg-card/50 backdrop-blur transition-all hover:border-border hover:shadow-md cursor-pointer"
                  onClick={() => {
                    if (doc.status === 'completed') navigate(`/result/${doc._id}`);
                    else if (doc.status === 'processing') navigate(`/processing/${doc._id}`);
                  }}
                >
                  <CardContent className="flex items-center gap-4 p-4 sm:p-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted text-2xl">
                      {templateInfo?.icon || '📄'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">{doc.originalFileName}</p>
                        <Badge variant={status.variant} className="shrink-0 gap-1 text-xs">
                          {status.icon}
                          {status.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{templateInfo?.label}</span>
                        <span>•</span>
                        <span className="capitalize">{doc.tone}</span>
                        <span>•</span>
                        <span className="uppercase">{doc.outputFormat}</span>
                        <span>•</span>
                        <span>{new Date(doc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {doc.status === 'completed' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); handleDownload(doc); }}
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); handleDelete(doc._id); }}
                        disabled={deletingId === doc._id}
                        className="text-destructive hover:text-destructive"
                        title="Delete"
                      >
                        {deletingId === doc._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
