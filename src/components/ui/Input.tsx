import { cn } from '@/lib/utils';
import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  wrapperClassName?: string;
  inputSize?: 'sm' | 'md';
}

export default function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  wrapperClassName,
  className,
  id,
  inputSize = 'md',
  ...props
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;
  
  const sizeStyles = inputSize === 'sm'
    ? 'px-3 py-1.5 text-xs'
    : 'px-4 py-2.5 text-sm';

  return (
    <div className={cn('w-full', wrapperClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className={cn('absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none', inputSize === 'sm' && 'left-2')}>
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={cn(
            'w-full text-gray-900 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-all duration-200 placeholder:text-gray-400',
            sizeStyles,
            leftIcon && (inputSize === 'sm' ? 'pl-8' : 'pl-10'),
            rightIcon && (inputSize === 'sm' ? 'pr-8' : 'pr-10'),
            error ? 'border-danger-400 focus:ring-danger-300 focus:border-danger-400' : 'border-gray-200',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-danger-500">{error}</p>
      )}
    </div>
  );
}
