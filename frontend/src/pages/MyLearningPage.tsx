import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Play, CheckCircle, BookOpen, Award } from 'lucide-react';
import clsx from 'clsx';
import { enrollApi } from '../services/api';
import PublicNavbar from '../components/layout/PublicNavbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProgressBar from '../components/common/ProgressBar';
import { LEVEL_STYLES, LEVEL_LABEL, defaultGradient } from '../utils/helpers';
import type { CourseLevel } from '../types';

export default function MyLearningPage() {
  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: enrollApi.getMyEnrollments,
  });

  const inProgress = enrollments.filter((e: any) => e.progress_percentage > 0 && !e.completed_at);
  const completed  = enrollments.filter((e: any) => e.completed_at);
  const notStarted = enrollments.filter((e: any) => e.progress_percentage === 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <PublicNavbar />
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">My Learning</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-0.5">{enrollments.length} course{enrollments.length!==1?'s':''} enrolled</p>
          </div>
          <Link to="/courses" className="px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition-colors flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Find New Courses
          </Link>
        </div>

        {isLoading ? <LoadingSpinner text="Loading your courses…" /> : (
          <>
            {enrollments.length === 0 && (
              <div className="text-center py-24">
                <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4"><BookOpen className="w-8 h-8 text-violet-500" /></div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">No courses yet</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Start your learning journey today</p>
                <Link to="/courses"><button className="px-6 py-3 bg-violet-600 text-white font-semibold rounded-xl">Browse Courses</button></Link>
              </div>
            )}

            {inProgress.length > 0 && <CourseSection title="Continue Learning" courses={inProgress} />}
            {notStarted.length > 0 && <CourseSection title="Not Started" courses={notStarted} />}
            {completed.length > 0 && <CourseSection title="Completed" courses={completed} completed />}
          </>
        )}
      </div>
    </div>
  );
}

function CourseSection({ title, courses, completed: isDone }: { title: string; courses: any[]; completed?: boolean }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        {isDone && <Award className="w-5 h-5 text-amber-500" />}
        {title}
        <span className="text-sm font-normal text-gray-400 dark:text-gray-500">({courses.length})</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {courses.map((e: any) => <EnrollCard key={e.id} enrollment={e} />)}
      </div>
    </section>
  );
}

function EnrollCard({ enrollment: e }: { enrollment: any }) {
  const gradient = defaultGradient(e.category_name);
  const isCompleted = !!e.completed_at;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all overflow-hidden group">
      <div className={`relative h-36 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
        <div className="text-white/15 text-7xl font-black select-none">{e.title?.charAt(0)}</div>
        {isCompleted && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="flex flex-col items-center gap-1 text-white">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
              <span className="text-xs font-bold">Completed!</span>
            </div>
          </div>
        )}
        <div className={clsx('absolute inset-0 flex items-center justify-center transition-opacity', isCompleted ? 'opacity-0' : 'opacity-0 group-hover:opacity-100')}>
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
            <Play className="w-5 h-5 text-violet-600 fill-violet-600 ml-0.5" />
          </div>
        </div>
      </div>
      <div className="p-4">
        <p className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-0.5">{e.title}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">{e.instructor_name}</p>
        {e.level && (
          <span className={clsx('text-[10px] font-semibold px-1.5 py-0.5 rounded', LEVEL_STYLES[e.level as CourseLevel])}>{LEVEL_LABEL[e.level as CourseLevel]}</span>
        )}
        <div className="mt-3">
          <ProgressBar value={e.progress_percentage} size="sm" showLabel />
        </div>
        <Link to={`/learn/${e.course_id}`}
          className={clsx('mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors',
            isCompleted ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600' : 'bg-violet-600 text-white hover:bg-violet-700')}>
          {isCompleted ? <><Award className="w-4 h-4" /> Review Course</> : <><Play className="w-4 h-4 fill-current" /> {e.progress_percentage > 0 ? 'Continue' : 'Start'} Learning</>}
        </Link>
      </div>
    </div>
  );
}
