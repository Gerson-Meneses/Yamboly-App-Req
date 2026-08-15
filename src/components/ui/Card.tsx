import type { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = 'default',
}: {
  children: ReactNode;
  tone?: 'default' | 'accent' | 'success' | 'muted';
}) {
  const tones: Record<string, string> = {
    default: 'bg-[var(--surface-2)] text-[var(--text)] border-[var(--border)]',
    accent: 'bg-[var(--accent)]/15 text-[var(--accent)] border-[var(--accent)]/30',
    success: 'bg-[var(--accent-2)]/15 text-[var(--accent-2)] border-[var(--accent-2)]/30',
    muted: 'bg-transparent text-[var(--text-muted)] border-[var(--border)]',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium border rounded-full px-2.5 py-1 ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
