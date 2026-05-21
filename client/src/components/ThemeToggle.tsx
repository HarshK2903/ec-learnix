import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Monitor } from 'lucide-react';

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();

  const cycle = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('system');
    else setTheme('dark');
  };

  const icon = theme === 'dark'
    ? <Moon className="h-4 w-4" />
    : theme === 'light'
      ? <Sun className="h-4 w-4" />
      : <Monitor className="h-4 w-4" />;

  const label = theme === 'dark' ? 'Dark' : theme === 'light' ? 'Light' : 'System';

  if (compact) {
    return (
      <button
        onClick={cycle}
        title={`Theme: ${label} — click to switch`}
        className="p-2 rounded-lg border border-border/50 bg-muted/40 text-foreground hover:bg-muted transition-colors"
      >
        {icon}
      </button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={cycle}
      className="gap-2 w-full justify-start px-3 mb-1"
    >
      {icon}
      <span className="text-sm">{label}</span>
    </Button>
  );
}
