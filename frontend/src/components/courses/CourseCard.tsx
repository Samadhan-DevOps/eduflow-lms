import { Link } from 'react-router-dom';
import { Clock, Users, BookOpen, Play } from 'lucide-react';
import clsx from 'clsx';
import type { Course } from '../../types';
import StarRating from '../common/StarRating';
import ProgressBar from '../common/ProgressBar';
import { LEVEL_STYLES, LEVEL_LABEL, fmtDuration, fmtNumber, defaultGradient } from '../../utils/helpers';

interface Props { course: Course; progress?: number; enrolled?: boolean; compact?: boolean; }

export default function CourseCard({ course, progress, enrolled, compact }: Props) {
  const gradient = defaultGradient(course.category_name ?? undefined);
  return (
    <Link to={`/courses/${course.slug || course.id}`}
      className={clsx('group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg dark:hover:shadow-gray-900/50 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col', compact && 'flex-row h-28')}>
      <div className={clsx('relative overflow-hidden flex-shrink-0', compact ? 'w-40' : 'aspect-video')}>
        <div className={clsx('w-full h-full bg-gradient-to-br flex items-center justify-center', gradient)}>
          <div className="text-white/20 text-7xl font-black select-none">{course.title.charAt(0)}</div>
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
            <Play className="w-5 h-5 text-violet-700 fill-violet-700 ml-0.5" />
          </div>
        </div>
        {!compact && (
          <div className="absolute top-2 left-2 flex gap-1.5">
            {course.is_featured && <span className="px-2 py-0.5 bg-amber-400 text-amber-900 text-[10px] font-bold rounded-full">⭐ FEATURED</span>}
            {course.price===0 && <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full">FREE</span>}
          </div>
        )}
      </div>
      <div className={clsx('flex flex-col flex-1', compact ? 'px-3 py-2 justify-center' : 'p-4')}>
        {!compact && course.category_name && <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 mb-1.5">{course.category_name}</span>}
        <h3 className={clsx('font-semibold text-gray-900 dark:text-white group-hover:text-violet-700 dark:group-hover:text-violet-400 transition-colors', compact ? 'text-sm line-clamp-1' : 'text-[15px] line-clamp-2 mb-1.5')}>{course.title}</h3>
        {!compact && course.short_description && <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">{course.short_description}</p>}
        {!compact && <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">{course.instructor_name}</p>}
        {!compact && <div className="mb-2"><StarRating rating={course.rating_average} count={course.rating_count} /></div>}
        {!compact && (
          <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500 mb-3">
            <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{course.total_lessons} lessons</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{fmtDuration(course.total_duration_min)}</span>
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{fmtNumber(course.enrollment_count)}</span>
          </div>
        )}
        <div className={clsx('flex items-center', compact ? 'mt-1' : 'mt-auto')}>
          <span className={clsx('px-1.5 py-0.5 rounded text-[10px] font-semibold', LEVEL_STYLES[course.level])}>{LEVEL_LABEL[course.level]}</span>
          {!compact && <span className="ml-auto font-bold text-gray-900 dark:text-white text-base">{course.price===0 ? <span className="text-emerald-600 dark:text-emerald-400">Free</span> : `$${course.price}`}</span>}
        </div>
        {enrolled && progress!==undefined && <div className="mt-2"><ProgressBar value={progress} size="sm" showLabel /></div>}
      </div>
    </Link>
  );
}
