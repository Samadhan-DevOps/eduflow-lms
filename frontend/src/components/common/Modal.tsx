import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  isOpen: boolean; onClose(): void; title: string;
  children: React.ReactNode; footer?: React.ReactNode; size?: 'sm'|'md'|'lg'|'xl';
}
const SIZES = { sm:'max-w-md', md:'max-w-lg', lg:'max-w-2xl', xl:'max-w-4xl' };

export default function Modal({ isOpen, onClose, title, children, footer, size='md' }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  useEffect(() => { document.body.style.overflow = isOpen ? 'hidden' : ''; return () => { document.body.style.overflow=''; }; }, [isOpen]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key==='Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  return (
    <div ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={e => { if (e.target===overlayRef.current) onClose(); }}>
      <div className={clsx('w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] animate-slide-up border border-gray-200 dark:border-gray-700', SIZES[size])}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl">{footer}</div>}
      </div>
    </div>
  );
}
