import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getSocket, joinDocumentRoom, connectSocket, disconnectSocket } from '@/lib/socket';
import api from '@/lib/api';
import type { ProgressEvent } from '@/types';
import { CheckCircle2, Loader2, FileSearch, Brain, Wrench, FileOutput, Sparkles, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StageInfo {
  key: string;
  label: string;
  icon: React.ReactNode;
}

const STAGES: StageInfo[] = [
  { key: 'extracting', label: 'Extracting content', icon: <FileSearch className="h-4 w-4" /> },
  { key: 'analyzing', label: 'Analyzing structure', icon: <Brain className="h-4 w-4" /> },
  { key: 'enhancing', label: 'AI Enhancement', icon: <Sparkles className="h-4 w-4" /> },
  { key: 'assembling', label: 'Building document', icon: <Wrench className="h-4 w-4" /> },
  { key: 'converting', label: 'Format conversion', icon: <FileOutput className="h-4 w-4" /> },
  { key: 'finalizing', label: 'Finalizing', icon: <CheckCircle2 className="h-4 w-4" /> },
];

export default function ProcessingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [progress, setProgress] = useState<ProgressEvent>({ stage: 'waiting', progress: 0 });
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasJoined = useRef(false);

  useEffect(() => {
    if (!id || hasJoined.current) return;
    hasJoined.current = true;

    // Check if document is already completed
    api.get(`/documents/${id}`).then((res) => {
      const doc = res.data.document;
      if (doc.status === 'completed') {
        setCompleted(true);
        setProgress({ stage: 'complete', progress: 100, message: 'Document ready!' });
        setTimeout(() => navigate(`/result/${id}`), 1500);
        return;
      }
      if (doc.status === 'failed') {
        setError(doc.errorMessage || 'Processing failed');
        return;
      }

      // Connect to socket for real-time updates
      connectSocket();
      joinDocumentRoom(id);

      const socket = getSocket();

      socket.on('progress', (data: ProgressEvent) => {
        setProgress(data);
      });

      socket.on('complete', () => {
        setCompleted(true);
        setProgress({ stage: 'complete', progress: 100, message: 'Document ready!' });
        setTimeout(() => navigate(`/result/${id}`), 2000);
      });

      socket.on('error', (data: { message: string }) => {
        setError(data.message);
      });
    }).catch(() => {
      setError('Failed to load document status');
    });

    return () => {
      disconnectSocket();
    };
  }, [id, navigate]);

  const currentStageIdx = STAGES.findIndex((s) => s.key === progress.stage);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-10 animate-fade-in">
          {error ? (
            <>
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
                <XCircle className="h-10 w-10 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Processing Failed</h1>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button variant="outline" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
            </>
          ) : completed ? (
            <>
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 animate-pulse-glow">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Document Ready!</h1>
              <p className="text-muted-foreground">Redirecting to results...</p>
            </>
          ) : (
            <>
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-violet-500/10 animate-pulse-glow">
                <Loader2 className="h-10 w-10 text-violet-500 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Processing Your Document</h1>
              <p className="text-muted-foreground">
                {progress.message || 'Please wait while AI formats your document...'}
              </p>
            </>
          )}
        </div>

        {!error && (
          <>
            {/* Progress Bar */}
            <Card className="border-border/40 bg-card/50 mb-8 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm font-semibold text-violet-500">{Math.round(progress.progress)}%</span>
                </div>
                <Progress value={progress.progress} className="h-3" />
                {progress.field && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Currently processing: <span className="font-medium text-foreground">{progress.field}</span>
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Stages */}
            <Card className="border-border/40 bg-card/50">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {STAGES.map((stage, i) => {
                    const isActive = stage.key === progress.stage;
                    const isDone = i < currentStageIdx || completed;

                    return (
                      <div key={stage.key} className="flex items-center gap-4">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all ${
                          isDone ? 'bg-emerald-500/10 text-emerald-500' :
                          isActive ? 'bg-violet-500/10 text-violet-500' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {isDone ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : isActive ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            stage.icon
                          )}
                        </div>
                        <span className={`text-sm ${
                          isDone ? 'text-emerald-500 font-medium' :
                          isActive ? 'text-foreground font-medium' :
                          'text-muted-foreground'
                        }`}>
                          {stage.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
