import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import { toast } from 'sonner';
import { TEMPLATE_INFO, type DocumentItem, type ProjectItem } from '@/types';
import type { TemplateType } from '@/types';
import {
  Plus, FileText, Loader2, FolderOpen, Clock, CheckCircle2, XCircle,
  RefreshCw, Upload, ArrowRight, Sparkles, Download, Trash2
} from 'lucide-react';

// Quick start template cards
const QUICK_TEMPLATES = [
  { key: 'journal', color: 'from-violet-500 to-violet-600', icon: '📝' },
  { key: 'cv', color: 'from-cyan-500 to-cyan-600', icon: '📄' },
  { key: 'blogpost', color: 'from-amber-500 to-orange-600', icon: '✍️' },
  { key: 'report', color: 'from-emerald-500 to-emerald-600', icon: '📊' },
  { key: 'blank', color: 'from-gray-500 to-gray-600', icon: '📃', label: 'Blank Project', description: 'Start with a blank canvas' },
] as const;

interface RecentItem {
  type: 'project' | 'document';
  _id: string;
  title: string;
  updatedAt: string;
  status?: string;
  templateType?: string;
  icon: string;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [docRes, projRes] = await Promise.all([
        api.get('/documents'),
        api.get('/projects'),
      ]);
      setDocuments(docRes.data.documents);
      setProjects(projRes.data.projects);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleNewProject = async (templateType?: string) => {
    try {
      const res = await api.post('/projects', {
        title: 'Untitled Project',
        templateType: templateType || null,
      });
      navigate(`/editor/${res.data.project._id}`);
    } catch {
      toast.error('Failed to create project');
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    if (f) {
      if (f.size > 10 * 1024 * 1024) {
        toast.error('File size must be under 10MB');
        return;
      }
      navigate('/upload');
    }
  }, [navigate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    maxFiles: 1,
    noClick: false,
  });

  const handleDeleteProject = async (id: string) => {
    setDeletingId(id);
    try {
      await api.delete(`/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p._id !== id));
      toast.success('Moved to trash');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownloadDoc = async (doc: DocumentItem) => {
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
    } catch {
      toast.error('Download failed');
    }
  };

  // Merge projects + documents into recent items, sorted by date
  const recentItems: RecentItem[] = [
    ...projects.map((p) => ({
      type: 'project' as const,
      _id: p._id,
      title: p.title,
      updatedAt: p.updatedAt,
      icon: '📝',
      templateType: p.templateType || undefined,
    })),
    ...documents.map((d) => ({
      type: 'document' as const,
      _id: d._id,
      title: d.originalFileName,
      updatedAt: d.createdAt,
      status: d.status,
      templateType: d.templateType,
      icon: TEMPLATE_INFO[d.templateType]?.icon || '📄',
    })),
  ].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
    uploaded: { label: 'Uploaded', variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
    processing: { label: 'Processing', variant: 'outline', icon: <RefreshCw className="h-3 w-3 animate-spin" /> },
    completed: { label: 'Completed', variant: 'default', icon: <CheckCircle2 className="h-3 w-3" /> },
    failed: { label: 'Failed', variant: 'destructive', icon: <XCircle className="h-3 w-3" /> },
  };

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto">
      {/* Welcome Header */}
      <div className="flex items-center gap-4 mb-10">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 text-2xl shadow-lg shadow-violet-500/20">
          <Sparkles className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-muted-foreground text-sm">Ready to create something amazing?</p>
        </div>
      </div>

      {/* Quick Start Templates */}
      <section className="mb-10">
        <h2 className="text-lg font-bold mb-1">Quick Start Templates</h2>
        <p className="text-sm text-muted-foreground mb-5">Choose a template to get started with your document</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {QUICK_TEMPLATES.map((tmpl) => {
            const info = tmpl.key !== 'blank' ? TEMPLATE_INFO[tmpl.key as TemplateType] : null;
            return (
              <Card
                key={tmpl.key}
                className="group cursor-pointer border-border/30 bg-card/40 backdrop-blur-sm transition-all duration-300 hover:border-border/60 hover:shadow-xl hover:-translate-y-1"
                onClick={() => tmpl.key === 'blank' ? handleNewProject() : navigate('/upload')}
              >
                <CardContent className="p-5">
                  <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tmpl.color} text-lg shadow-md transition-transform group-hover:scale-110`}>
                    {tmpl.icon}
                  </div>
                  <h3 className="font-semibold text-sm mb-0.5">{info?.label || tmpl.label}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {info?.description || tmpl.description}
                  </p>
                  <div className="flex items-center gap-1 mt-3 text-xs text-violet-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    {tmpl.key === 'blank' ? 'Create Now' : 'Use Template'}
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Upload Section — Two Options */}
      <section className="mb-10">
        <h2 className="text-lg font-bold mb-1">Upload Document</h2>
        <p className="text-sm text-muted-foreground mb-5">Choose how you want to work with your uploaded document</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Option 1: AI Enhancement (existing flow) */}
          <div
            {...getRootProps()}
            className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-all cursor-pointer ${
              isDragActive
                ? 'border-violet-500 bg-violet-500/5'
                : 'border-border/40 hover:border-violet-500/50 hover:bg-muted/30'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 mb-3 shadow-md">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <p className="font-semibold text-sm mb-1">AI Enhancement</p>
            <p className="text-xs text-muted-foreground text-center max-w-[200px]">
              Upload a DOCX and let AI enhance, format, and fill missing fields
            </p>
            <p className="text-xs text-violet-400 mt-3 font-medium">Drop file or click to browse</p>
          </div>

          {/* Option 2: Import to Edit */}
          <label
            className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-all cursor-pointer border-border/40 hover:border-emerald-500/50 hover:bg-muted/30"
          >
            <input
              type="file"
              accept=".docx"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.size > 10 * 1024 * 1024) {
                  toast.error('File size must be under 10MB');
                  return;
                }
                try {
                  const formData = new FormData();
                  formData.append('file', file);
                  const res = await api.post('/projects/import', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                  });
                  toast.success('Document imported!');
                  navigate(`/editor/${res.data.project._id}`);
                } catch {
                  toast.error('Failed to import document');
                }
              }}
            />
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 mb-3 shadow-md">
              <Upload className="h-5 w-5 text-white" />
            </div>
            <p className="font-semibold text-sm mb-1">Import to Edit</p>
            <p className="text-xs text-muted-foreground text-center max-w-[200px]">
              Upload a DOCX and edit it directly in the editor — no AI processing
            </p>
            <p className="text-xs text-emerald-400 mt-3 font-medium">Click to browse files</p>
          </label>
        </div>
      </section>

      {/* Recent Pages */}
      <section>
        <h2 className="text-lg font-bold mb-5">Recent Pages</h2>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : recentItems.length === 0 ? (
          <Card className="border-dashed border-2 border-border/40 bg-card/30">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FolderOpen className="h-12 w-12 text-muted-foreground/20 mb-3" />
              <h3 className="font-semibold mb-1">No projects yet</h3>
              <p className="text-sm text-muted-foreground mb-5 text-center max-w-md">
                Create a new project or upload a document to get started.
              </p>
              <Button onClick={() => handleNewProject()} className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 text-white border-0">
                <Plus className="mr-2 h-4 w-4" />
                Create First Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {recentItems.slice(0, 12).map((item) => (
              <Card
                key={`${item.type}-${item._id}`}
                className="group cursor-pointer border-border/30 bg-card/40 backdrop-blur-sm transition-all duration-300 hover:border-border/60 hover:shadow-lg"
                onClick={() => {
                  if (item.type === 'project') navigate(`/editor/${item._id}`);
                  else if (item.status === 'completed') navigate(`/result/${item._id}`);
                  else if (item.status === 'processing') navigate(`/processing/${item._id}`);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50 text-xl">
                      {item.icon}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.type === 'document' && item.status === 'completed' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const doc = documents.find(d => d._id === item._id);
                            if (doc) handleDownloadDoc(doc);
                          }}
                          className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground"
                          title="Download"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {item.type === 'project' && (
                        <>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                const res = await api.get(`/projects/${item._id}/export`, { responseType: 'blob' });
                                const url = window.URL.createObjectURL(new Blob([res.data]));
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `${item.title || 'document'}.docx`;
                                document.body.appendChild(a);
                                a.click();
                                a.remove();
                                window.URL.revokeObjectURL(url);
                              } catch {
                                toast.error('Download failed');
                              }
                            }}
                            className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground"
                            title="Download as DOCX"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(item._id);
                            }}
                            disabled={deletingId === item._id}
                            className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                            title="Move to trash"
                          >
                            {deletingId === item._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {new Date(item.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  <h3 className="font-semibold text-sm truncate">{item.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    {item.type === 'project' ? (
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <FileText className="h-2.5 w-2.5" />
                        Project
                      </Badge>
                    ) : item.status && statusConfig[item.status] ? (
                      <Badge variant={statusConfig[item.status].variant} className="text-[10px] gap-1">
                        {statusConfig[item.status].icon}
                        {statusConfig[item.status].label}
                      </Badge>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
