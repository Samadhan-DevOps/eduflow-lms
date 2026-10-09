import React from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const V = {
  primary:   'bg-violet-600 text-white hover:bg-violet-700 focus:ring-violet-500 border-transparent shadow-sm shadow-violet-200 dark:shadow-violet-900/30',
  secondary: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 border-transparent',
  danger:    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 border-transparent',
  ghost:     'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border-transparent',
  outline:   'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700',
};
const S = { sm:'h-8 px-3 text-xs gap-1.5', md:'h-10 px-4 text-sm gap-2', lg:'h-11 px-6 text-sm gap-2.5' };

export default function Button({ variant='primary', size='md', isLoading=false, leftIcon, rightIcon, className, disabled, children, ...rest }: Props) {
  return (
    <button {...rest} disabled={disabled||isLoading}
      className={clsx('inline-flex items-center justify-center font-medium rounded-xl border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed select-none', V[variant], S[size], className)}>
      {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
}
