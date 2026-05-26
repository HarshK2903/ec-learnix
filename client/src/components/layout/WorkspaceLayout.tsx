import { useState } from 'react';
import Sidebar from './Sidebar';
import ChatBot from '../ChatBot';

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      <ChatBot />
    </div>
  );
}
