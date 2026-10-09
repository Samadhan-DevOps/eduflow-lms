import clsx from 'clsx';

interface Props { value: number; color?: string; size?: 'sm' | 'md' | 'lg'; showLabel?: boolean; className?: string; }

export default function ProgressBar({ value, color = '#7C3AED', size = 'md', showLabel, className }: Props) {
  const H = { sm:'h-1.5', md:'h-2.5', lg:'h-3.5' };
  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <div className={clsx('flex-1 bg-gray-100 rounded-full overflow-hidden', H[size])}>
        <div className={clsx('h-full rounded-full transition-all duration-500')} style={{ width:`${value}%`, backgroundColor: value===100 ? '#10B981' : color }} />
      </div>
      {showLabel && <span className="text-xs font-semibold text-gray-600 w-8 text-right">{value}%</span>}
    </div>
  );
}
