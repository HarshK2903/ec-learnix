import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import api from '@/lib/api';
import type { ProjectItem } from '@/types';
import {
  Home, Search, Plus, Trash2, FileText, LogOut, FolderOpen,
  ChevronLeft, ChevronRight, Download
} from 'lucide-react';
import { toast } from 'sonner';
import ThemeToggle from '@/components/ThemeToggle';

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data.projects);
    } catch {
      // silently fail
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [location.pathname]);

  // Listen for project updates from the editor (e.g. title change)
  useEffect(() => {
    const handler = () => fetchProjects();
    window.addEventListener('project-updated', handler);
    return () => window.removeEventListener('project-updated', handler);
  }, []);

  const handleNewProject = async () => {
    try {
      const res = await api.post('/projects', { title: 'Untitled Project' });
      navigate(`/editor/${res.data.project._id}`);
    } catch {
      // handle error
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const filteredProjects = searchQuery
    ? projects.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : projects;

  const navItemClass = (active: boolean) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
      active
        ? 'bg-violet-500/15 text-violet-400'
        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
    }`;

  if (collapsed) {
    return (
      <aside className="flex flex-col items-center w-16 border-r border-border/40 bg-card/30 backdrop-blur-sm py-4 gap-2">
        <button onClick={onToggle} className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground mb-2">
          <ChevronRight className="h-4 w-4" />
        </button>
        <button onClick={() => navigate('/dashboard')} className={`p-2.5 rounded-lg ${isActive('/dashboard') ? 'bg-violet-500/15 text-violet-400' : 'text-muted-foreground hover:bg-muted/50'}`}>
          <Home className="h-5 w-5" />
        </button>
        <button onClick={handleNewProject} className="p-2.5 rounded-lg text-muted-foreground hover:bg-muted/50">
          <Plus className="h-5 w-5" />
        </button>
        <button onClick={() => navigate('/trash')} className={`p-2.5 rounded-lg ${isActive('/trash') ? 'bg-violet-500/15 text-violet-400' : 'text-muted-foreground hover:bg-muted/50'}`}>
          <Trash2 className="h-5 w-5" />
        </button>
        <div className="flex-1" />
        <ThemeToggle compact />
        <button onClick={handleLogout} className="p-2.5 rounded-lg text-muted-foreground hover:bg-destructive/20 hover:text-destructive">
          <LogOut className="h-5 w-5" />
        </button>
      </aside>
    );
  }

  return (
    <aside className="flex flex-col w-64 border-r border-border/40 bg-card/30 backdrop-blur-sm shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 shadow-lg shadow-violet-500/20">
            <FileText className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-lg">
            Doc<span className="gradient-text">Forge</span>
          </span>
        </button>
        <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground">
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation */}
      <div className="px-3 space-y-1">
        <div className={navItemClass(isActive('/dashboard'))} onClick={() => navigate('/dashboard')}>
          <Home className="h-4 w-4" />
          Home
        </div>
        <div
          className={navItemClass(false)}
          onClick={() => setSearchOpen(!searchOpen)}
        >
          <Search className="h-4 w-4" />
          Search
          <span className="ml-auto text-xs text-muted-foreground/60">⌘K</span>
        </div>
      </div>

      {/* Search box */}
      {searchOpen && (
        <div className="px-3 mt-2">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            className="w-full rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50"
          />
        </div>
      )}

      <Separator className="my-3 mx-3" />

      {/* New Project */}
      <div className="px-3">
        <button
          onClick={handleNewProject}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-violet-500/10 hover:text-violet-400 transition-all"
        >
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>

      <Separator className="my-3 mx-3" />

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto px-3">
        <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">
          Projects
        </p>
        <div className="space-y-0.5 mt-1">
          {filteredProjects.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground/40 italic">No projects yet</p>
          ) : (
            filteredProjects.map((project) => (
              <div
                key={project._id}
                className={`group/item ${navItemClass(location.pathname === `/editor/${project._id}`)}`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0" onClick={() => navigate(`/editor/${project._id}`)}>
                  <FolderOpen className="h-4 w-4 shrink-0" />
                  <span className="truncate">{project.title}</span>
                </div>
                <div className="flex items-center gap-0.5 ml-auto opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0">
                  <button
                    title="Download as DOCX"
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        const res = await api.get(`/projects/${project._id}/export`, { responseType: 'blob' });
                        const url = window.URL.createObjectURL(new Blob([res.data]));
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${project.title || 'document'}.docx`;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        window.URL.revokeObjectURL(url);
                      } catch {
                        toast.error('Download failed');
                      }
                    }}
                    className="p-1 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                  >
                    <Download className="h-3 w-3" />
                  </button>
                  <button
                    title="Move to trash"
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        await api.delete(`/projects/${project._id}`);
                        fetchProjects();
                        toast.success('Moved to trash');
                      } catch {
                        toast.error('Failed to delete');
                      }
                    }}
                    className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Trash */}
      <div className="px-3 mb-2">
        <div className={navItemClass(isActive('/trash'))} onClick={() => navigate('/trash')}>
          <Trash2 className="h-4 w-4" />
          Trash
        </div>
      </div>

      <Separator className="mx-3" />

      {/* User footer */}
      <div className="px-3 py-3">
        <ThemeToggle />
        <div className="flex items-center gap-3 mt-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-cyan-500 text-white text-xs font-semibold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
