import React, { forwardRef } from 'react';
import clsx from 'clsx';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string; error?: string; hint?: string;
  leftIcon?: React.ReactNode; rightIcon?: React.ReactNode; wrapClass?: string;
}

const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, error, hint, leftIcon, rightIcon, className, wrapClass, id, ...rest }, ref) => {
    const uid = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className={clsx('flex flex-col gap-1', wrapClass)}>
        {label && (
          <label htmlFor={uid} className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}{rest.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 dark:text-gray-500 pointer-events-none">{leftIcon}</span>}
          <input ref={ref} id={uid}
            className={clsx(
              'w-full h-10 rounded-xl border bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-gray-100',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent',
              'disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:text-gray-500 disabled:cursor-not-allowed',
              error ? 'border-red-400' : 'border-gray-300 dark:border-gray-600',
              leftIcon && 'pl-9', rightIcon && 'pr-9', className
            )}
            {...rest}
          />
          {rightIcon && <span className="absolute inset-y-0 right-3 flex items-center text-gray-400 dark:text-gray-500 pointer-events-none">{rightIcon}</span>}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs text-gray-400 dark:text-gray-500">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
export default Input;
