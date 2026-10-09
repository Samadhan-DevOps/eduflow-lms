import clsx from 'clsx';

interface Props { rating: number; count?: number; size?: 'sm' | 'md'; showCount?: boolean; }

export default function StarRating({ rating, count, size = 'sm', showCount = true }: Props) {
  const stars = [1,2,3,4,5];
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {stars.map(s => (
          <span key={s} className={clsx(size==='md' ? 'text-base' : 'text-sm',
            s <= Math.round(rating) ? 'text-amber-400' : 'text-gray-300')}>★</span>
        ))}
      </div>
      <span className={clsx('font-semibold text-amber-600', size==='md' ? 'text-sm' : 'text-xs')}>{rating.toFixed(1)}</span>
      {showCount && count !== undefined && <span className={clsx('text-gray-400', size==='md' ? 'text-sm' : 'text-xs')}>({count.toLocaleString()})</span>}
    </div>
  );
}
