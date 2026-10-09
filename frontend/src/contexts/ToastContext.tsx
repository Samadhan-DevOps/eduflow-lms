import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import clsx from 'clsx';

type Kind = 'success' | 'error' | 'warning' | 'info';
interface Toast { id: number; msg: string; kind: Kind }

interface ToastCtx { success(m: string): void; error(m: string): void; warning(m: string): void; info(m: string): void }
const Ctx = createContext<ToastCtx | null>(null);
let _id = 0;

const META: Record<Kind, { icon: React.ReactNode; wrap: string; icon2: string }> = {
  success: { icon: <CheckCircle  className="w-5 h-5" />, wrap: 'bg-green-50 border-green-200 text-green-800', icon2: 'text-green-500' },
  error:   { icon: <XCircle      className="w-5 h-5" />, wrap: 'bg-red-50   border-red-200   text-red-800',   icon2: 'text-red-500'   },
  warning: { icon: <AlertTriangle className="w-5 h-5"/>, wrap: 'bg-amber-50 border-amber-200 text-amber-800', icon2: 'text-amber-500' },
  info:    { icon: <Info          className="w-5 h-5" />, wrap: 'bg-blue-50  border-blue-200  text-blue-800',  icon2: 'text-blue-500'  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const add = useCallback((msg: string, kind: Kind) => {
    const id = ++_id;
    setToasts((p) => [...p, { id, msg, kind }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4500);
  }, []);

  const remove = (id: number) => setToasts((p) => p.filter((t) => t.id !== id));

  const ctx: ToastCtx = {
    success: (m) => add(m, 'success'),
    error:   (m) => add(m, 'error'),
    warning: (m) => add(m, 'warning'),
    info:    (m) => add(m, 'info'),
  };

  return (
    <Ctx.Provider value={ctx}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-80 pointer-events-none">
        {toasts.map((t) => {
          const m = META[t.kind];
          return (
            <div key={t.id} className={clsx('flex items-start gap-3 p-3.5 rounded-xl border shadow-lg pointer-events-auto animate-slide-up', m.wrap)}>
              <span className={clsx('mt-0.5 flex-shrink-0', m.icon2)}>{m.icon}</span>
              <p className="text-sm font-medium flex-1 leading-snug">{t.msg}</p>
              <button onClick={() => remove(t.id)} className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></button>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
}
