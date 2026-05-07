import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import EditorToolbar from '@/components/editor/EditorToolbar';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, Check, Cloud } from 'lucide-react';

export default function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState('Untitled Project');
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const titleRef = useRef(title);

  // Keep titleRef in sync with title state
  useEffect(() => {
    titleRef.current = title;
  }, [title]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: 'Start typing your document...',
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[calc(100vh-200px)] px-16 py-12',
      },
    },
    onUpdate: () => {
      setSaveStatus('unsaved');
      scheduleSave();
    },
  });

  // Load project
  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        const res = await api.get(`/projects/${id}`);
        const project = res.data.project;
        setTitle(project.title);
        titleRef.current = project.title;
        if (editor && project.content) {
          editor.commands.setContent(project.content);
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          toast.error('Project not found');
          navigate('/dashboard');
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, editor]);

  // Save using refs so we always get the latest title
  const save = useCallback(async () => {
    if (!id || !editor) return;
    setSaveStatus('saving');
    try {
      const currentTitle = titleRef.current;
      await api.put(`/projects/${id}`, {
        title: currentTitle,
        content: editor.getHTML(),
      });
      setSaveStatus('saved');
      // Notify sidebar to refresh project list
      window.dispatchEvent(new CustomEvent('project-updated'));
    } catch {
      setSaveStatus('unsaved');
    }
  }, [id, editor]);

  // Schedule a debounced save (always uses latest title via ref)
  const scheduleSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      save();
    }, 1500);
  }, [save]);

  // Save title on blur (immediate, no debounce)
  const handleTitleBlur = () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    save();
  };

  // Keyboard shortcut: Ctrl+S
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        save();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [save]);

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top bar with title + save status */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border/40 bg-card/30">
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setSaveStatus('unsaved');
            scheduleSave();
          }}
          onBlur={handleTitleBlur}
          placeholder="Untitled Project"
          className="text-lg font-semibold bg-transparent border-none outline-none flex-1 placeholder:text-muted-foreground/40"
        />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
          {saveStatus === 'saved' && (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span>Saved</span>
            </>
          )}
          {saveStatus === 'saving' && (
            <>
              <Cloud className="h-3.5 w-3.5 animate-pulse" />
              <span>Saving...</span>
            </>
          )}
          {saveStatus === 'unsaved' && (
            <>
              <Cloud className="h-3.5 w-3.5 text-amber-400" />
              <span>Unsaved</span>
            </>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <EditorToolbar editor={editor} />

      {/* Editor area — paper-like */}
      <div className="flex-1 overflow-y-auto bg-muted/20">
        <div className="mx-auto max-w-4xl my-8">
          <div className="bg-card border border-border/40 rounded-lg shadow-xl shadow-black/10 min-h-[800px]">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </div>
  );
}
