import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

interface Props { size?: 'sm'|'md'|'lg'|'xl'; className?: string; fullScreen?: boolean; text?: string }
const S = { sm:'w-4 h-4', md:'w-6 h-6', lg:'w-8 h-8', xl:'w-12 h-12' };

export default function LoadingSpinner({ size = 'md', className, fullScreen, text }: Props) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
          <p className="text-sm text-gray-500 font-medium">{text ?? 'Loading…'}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className={clsx('animate-spin text-blue-600', S[size], className)} />
      {text && <span className="ml-2 text-sm text-gray-500">{text}</span>}
    </div>
  );
}
