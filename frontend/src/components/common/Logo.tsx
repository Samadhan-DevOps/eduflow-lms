interface Props { size?: number; showText?: boolean; textClass?: string; }
export default function Logo({ size = 36, showText = true, textClass = '' }: Props) {
  return (
    <div className="flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="ef-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED"/>
            <stop offset="100%" stopColor="#4F46E5"/>
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="10" fill="url(#ef-grad)"/>
        <path d="M20 8L32 14L20 20L8 14Z" fill="white" opacity="0.95"/>
        <path d="M14 17v7c0 0 6 4 12 0v-7" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="32" y1="14" x2="32" y2="22" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
        <circle cx="32" cy="22.5" r="1.5" fill="white"/>
      </svg>
      {showText && (
        <span className={`font-black tracking-tight ${textClass || 'text-gray-900 dark:text-white'}`} style={{ fontSize: size * 0.5 }}>
          EduFlow
        </span>
      )}
    </div>
  );
}
