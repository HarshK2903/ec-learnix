import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/ThemeProvider';
import { useAuthStore } from '@/stores/authStore';
import WorkspaceLayout from '@/components/layout/WorkspaceLayout';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import DashboardPage from '@/pages/DashboardPage';
import UploadPage from '@/pages/UploadPage';
import ProcessingPage from '@/pages/ProcessingPage';
import ResultPage from '@/pages/ResultPage';
import EditorPage from '@/pages/EditorPage';
import TrashPage from '@/pages/TrashPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

// Workspace routes get sidebar layout
function WorkspaceRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <WorkspaceLayout>{children}</WorkspaceLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            {/* Guest routes — no sidebar */}
            <Route path="/" element={<GuestRoute><LandingPage /></GuestRoute>} />
            <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />

            {/* Workspace routes — sidebar layout */}
            <Route path="/dashboard" element={<WorkspaceRoute><DashboardPage /></WorkspaceRoute>} />
            <Route path="/upload" element={<WorkspaceRoute><UploadPage /></WorkspaceRoute>} />
            <Route path="/processing/:id" element={<WorkspaceRoute><ProcessingPage /></WorkspaceRoute>} />
            <Route path="/result/:id" element={<WorkspaceRoute><ResultPage /></WorkspaceRoute>} />
            <Route path="/editor/:id" element={<WorkspaceRoute><EditorPage /></WorkspaceRoute>} />
            <Route path="/trash" element={<WorkspaceRoute><TrashPage /></WorkspaceRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster richColors position="top-right" />
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
