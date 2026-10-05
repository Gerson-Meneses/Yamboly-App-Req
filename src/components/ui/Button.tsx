import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-[var(--accent)] text-black hover:opacity-90 shadow-sm',
  secondary:
    'bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--border)]/50',
  ghost: 'bg-transparent text-[var(--text)] hover:bg-[var(--surface-2)]',
  danger: 'bg-[var(--danger)] text-white hover:opacity-90',
};

const sizeClasses: Record<Size, string> = {
  sm: 'text-xs px-2.5 py-1.5 rounded-md',
  md: 'text-sm px-3.5 py-2 rounded-lg',
  lg: 'text-base px-5 py-2.5 rounded-xl',
};

export default function Button({
  variant = 'secondary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    />
  );
}
