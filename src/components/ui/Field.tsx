import type { InputHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = '', ...rest } = props;
  return (
    <input
      className={`w-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] placeholder:text-[var(--text-muted)] ${className}`}
      {...rest}
    />
  );
}

export function Select(
  props: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }
) {
  const { className = '', children, ...rest } = props;
  return (
    <select
      className={`w-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] ${className}`}
      {...rest}
    >
      {children}
    </select>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <label className="text-xs font-medium text-[var(--text-muted)] mb-1 block">
      {children}
    </label>
  );
}
