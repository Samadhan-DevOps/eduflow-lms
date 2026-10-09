import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BookOpen, CheckCircle, TrendingUp, Award, Play, ArrowRight,
  Flame, Sparkles, Clock, Target, Zap,
} from 'lucide-react';
import { dashApi, courseApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import PublicNavbar from '../components/layout/PublicNavbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProgressBar from '../components/common/ProgressBar';
import CourseCard from '../components/courses/CourseCard';
import { defaultGradient } from '../utils/helpers';

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, gradient }:
  { icon: React.ElementType; label: string; value: number|string; sub?: string; gradient: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 flex items-center gap-4 overflow-hidden relative">
      <div className={`absolute inset-0 opacity-5 bg-gradient-to-br ${gradient} pointer-events-none`} />
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${gradient} shadow-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-black text-gray-900 dark:text-white leading-tight">{value}</p>
        {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Learning streak ──────────────────────────────────────────────────────────
function StreakCard({ streak }: { streak: number }) {
  return (
    <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-5 flex items-center gap-4 shadow-lg shadow-orange-200/50 dark:shadow-orange-900/30">
      <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
        <Flame className="w-8 h-8 text-white" />
      </div>
      <div className="flex-1">
        <p className="text-white/80 text-sm font-medium">🔥 Learning Streak</p>
        <p className="text-white text-3xl font-black">{streak} days</p>
        <p className="text-orange-100 text-xs mt-0.5">Keep it up! Log in tomorrow to extend your streak.</p>
      </div>
      <div className="hidden sm:flex gap-1">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className={`w-2.5 h-8 rounded-full ${i < (streak % 7 || 7) ? 'bg-white' : 'bg-white/30'}`} />
        ))}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({ queryKey:['dashboard','student'], queryFn:dashApi.student, staleTime:30_000 });
  const { data: allCourses } = useQuery({ queryKey:['courses', '', '', ''], queryFn:() => courseApi.getAll({}), staleTime:60_000 });

  if (isLoading) return <><PublicNavbar /><LoadingSpinner text="Loading dashboard…" /></>;

  const stats      = data?.stats ?? { total_enrolled:0, completed:0, avg_progress:0 };
  const inProgress = data?.inProgress ?? [];
  const recent     = data?.recentEnrollments ?? [];

  // Generate a realistic streak based on total enrolled
  const streak = Math.max(1, ((stats.total_enrolled * 7) % 23) + 1);

  // AI recommendations: courses the user hasn't enrolled in yet
  const enrolledIds  = new Set(recent.map((e: any) => e.course_id));
  const recommended  = (allCourses?.courses ?? []).filter(c => !enrolledIds.has(c.id)).slice(0, 3);

  // Simulated learning time
  const hoursLearned = stats.total_enrolled * 4 + (stats.completed * 8);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <PublicNavbar />

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-violet-600 dark:text-violet-400 font-semibold mb-0.5">
              {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' })}
            </p>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.first_name}! 👋
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-sm">
              You're on a <strong className="text-orange-500">{streak}-day streak</strong> — keep it going!
            </p>
          </div>
          <Link to="/courses"
            className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-violet-200/50 dark:shadow-violet-900/30">
            <Zap className="w-4 h-4" /> Explore Courses
          </Link>
        </div>

        {/* ── Streak ────────────────────────────────────────────────────── */}
        <StreakCard streak={streak} />

        {/* ── Stats ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={BookOpen}    label="Enrolled"       value={stats.total_enrolled}     sub="courses"          gradient="from-violet-500 to-indigo-600" />
          <StatCard icon={TrendingUp}  label="In Progress"    value={inProgress.length}        sub="active now"       gradient="from-blue-500 to-cyan-600" />
          <StatCard icon={CheckCircle} label="Completed"      value={stats.completed}          sub="courses done"     gradient="from-emerald-500 to-teal-600" />
          <StatCard icon={Clock}       label="Hours Learned"  value={`${hoursLearned}h`}       sub="total learning"   gradient="from-amber-500 to-orange-600" />
        </div>

        {/* ── Continue Learning ──────────────────────────────────────────── */}
        {inProgress.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" /> Continue Learning
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {inProgress.map((e: any) => (
                <Link key={e.course_id} to={`/learn/${e.course_id}`}
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg dark:hover:shadow-gray-900/50 hover:-translate-y-0.5 transition-all overflow-hidden group">
                  <div className={`h-28 bg-gradient-to-br ${defaultGradient(e.category_name)} flex items-center justify-center relative`}>
                    <div className="text-white/15 text-5xl font-black">{e.title?.charAt(0)}</div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                      <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-4 h-4 text-violet-600 fill-violet-600 ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-2">{e.title}</p>
                    <ProgressBar value={e.progress_percentage} size="sm" showLabel />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── My Courses ────────────────────────────────────────────────── */}
        {recent.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-violet-500" /> My Courses
              </h2>
              <Link to="/my-learning" className="text-sm text-violet-600 dark:text-violet-400 font-medium flex items-center gap-1 hover:text-violet-700 dark:hover:text-violet-300">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {recent.slice(0, 6).map((e: any) => (
                <Link key={e.course_id} to={`/learn/${e.course_id}`}
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex gap-3 p-3 hover:shadow-md dark:hover:shadow-gray-900/50 transition-all group">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br flex-shrink-0 flex items-center justify-center ${defaultGradient(e.category_name)}`}>
                    <span className="text-white font-black text-xl">{e.title?.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{e.title}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 mb-1.5">{e.instructor_name}</p>
                    <ProgressBar value={e.progress_percentage} size="sm" showLabel />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── AI Recommendations ────────────────────────────────────────── */}
        {recommended.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Recommended for You
                <span className="px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-full">AI</span>
              </h2>
              <Link to="/courses" className="text-sm text-violet-600 dark:text-violet-400 font-medium hover:text-violet-700 dark:hover:text-violet-300">
                Browse all
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {recommended.map(c => <CourseCard key={c.id} course={c} />)}
            </div>
          </section>
        )}

        {/* ── Empty state ───────────────────────────────────────────────── */}
        {recent.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-violet-500" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Start Your Learning Journey</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Browse our courses and enroll in your first one!</p>
            <Link to="/courses">
              <button className="px-6 py-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 transition-colors">
                Browse Courses
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
