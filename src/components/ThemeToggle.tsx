import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle({
  theme,
  onToggle,
}: {
  theme: 'light' | 'dark';
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      aria-label="Cambiar tema"
      className="w-9 h-9 flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] hover:bg-[var(--border)]/50 transition-colors"
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
