import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';

interface Option { value: string; label: string }
interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string; error?: string; options: Option[]; placeholder?: string; wrapClass?: string;
}

const Select = forwardRef<HTMLSelectElement, Props>(
  ({ label, error, options, placeholder, className, wrapClass, id, ...rest }, ref) => {
    const uid = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className={clsx('flex flex-col gap-1', wrapClass)}>
        {label && (
          <label htmlFor={uid} className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}{rest.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          <select ref={ref} id={uid}
            className={clsx(
              'w-full h-10 rounded-xl border bg-white dark:bg-gray-800 pl-3 pr-9 text-sm text-gray-900 dark:text-gray-100 appearance-none',
              'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors',
              'disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:cursor-not-allowed',
              error ? 'border-red-400' : 'border-gray-300 dark:border-gray-600', className
            )}
            {...rest}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
export default Select;
