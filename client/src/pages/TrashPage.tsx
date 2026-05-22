import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/lib/api';
import { toast } from 'sonner';
import type { ProjectItem } from '@/types';
import { Trash2, RotateCcw, Loader2, FolderOpen, AlertTriangle } from 'lucide-react';

export default function TrashPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchTrash = async () => {
    try {
      const res = await api.get('/projects/trash');
      setProjects(res.data.projects);
    } catch {
      toast.error('Failed to load trash');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleRestore = async (id: string) => {
    setActionId(id);
    try {
      await api.post(`/projects/${id}/restore`);
      setProjects((prev) => prev.filter((p) => p._id !== id));
      toast.success('Project restored');
    } catch {
      toast.error('Failed to restore');
    } finally {
      setActionId(null);
    }
  };

  const handlePermanentDelete = async (id: string) => {
    setActionId(id);
    try {
      await api.delete(`/projects/${id}/permanent`);
      setProjects((prev) => prev.filter((p) => p._id !== id));
      toast.success('Permanently deleted');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Trash2 className="h-6 w-6 text-muted-foreground" />
          Trash
        </h1>
        <p className="text-muted-foreground mt-1">Deleted projects can be restored or permanently removed</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : projects.length === 0 ? (
        <Card className="border-dashed border-2 border-border/40 bg-card/30">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <Trash2 className="h-16 w-16 text-muted-foreground/20 mb-4" />
            <h3 className="text-lg font-semibold mb-1">Trash is empty</h3>
            <p className="text-sm text-muted-foreground">Deleted projects will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <Card key={project._id} className="border-border/40 bg-card/50">
              <CardContent className="flex items-center gap-4 p-4">
                <FolderOpen className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{project.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Deleted {project.deletedAt ? new Date(project.deletedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'recently'}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestore(project._id)}
                    disabled={actionId === project._id}
                    className="gap-1.5"
                  >
                    {actionId === project._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                    Restore
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePermanentDelete(project._id)}
                    disabled={actionId === project._id}
                    className="text-destructive hover:text-destructive gap-1.5"
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Delete Forever
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
