import React from 'react';
import clsx from 'clsx';

interface Props { children: React.ReactNode; className?: string; dot?: boolean; dotColor?: string }

export default function Badge({ children, className, dot, dotColor }: Props) {
  return (
    <span className={clsx('inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full', className)}>
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full', dotColor ?? 'bg-current')} />}
      {children}
    </span>
  );
}
