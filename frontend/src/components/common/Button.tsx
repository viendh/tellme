import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

const variantClasses = {
  primary:
    'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 border border-blue-600',
  secondary:
    'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400 border border-gray-200',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 border border-red-600',
  ghost:
    'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-400 border border-transparent',
  outline:
    'bg-transparent text-blue-600 hover:bg-blue-50 focus:ring-blue-500 border border-blue-600',
};

const sizeClasses = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-md
        focus:outline-none focus:ring-2 focus:ring-offset-1
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-150
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}
