import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, GraduationCap, Users, BookOpen, Award, ArrowRight, Code, BarChart2, Smartphone, Palette, Briefcase, Cloud, TrendingUp, Camera, Play, CheckCircle } from 'lucide-react';
import { courseApi } from '../services/api';
import CourseCard from '../components/courses/CourseCard';
import PublicNavbar from '../components/layout/PublicNavbar';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ICON_MAP: Record<string, React.ElementType> = {
  Code, BarChart2, Smartphone, Palette, Briefcase, Cloud, TrendingUp, Camera,
};

const STATS = [
  { icon: BookOpen,    value: '500+',    label: 'Expert Courses' },
  { icon: Users,       value: '50,000+', label: 'Active Learners' },
  { icon: GraduationCap, value: '100+',  label: 'Top Instructors' },
  { icon: Award,       value: '25,000+', label: 'Certificates Earned' },
];

export default function HomePage() {
  const nav = useNavigate();
  const [search, setSearch] = useState('');

  const { data: catData } = useQuery({ queryKey: ['categories'], queryFn: courseApi.getCategories, staleTime: 600_000 });
  const { data: featuredData, isLoading } = useQuery({
    queryKey: ['courses', 'featured'],
    queryFn: () => courseApi.getAll({ featured: true }),
    staleTime: 60_000,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) nav(`/courses?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-900 via-violet-800 to-indigo-900 py-20 md:py-32">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full text-violet-200 text-sm font-medium mb-6 border border-white/20">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            New courses added every week
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
            Learn Without
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400"> Limits.</span>
          </h1>

          <p className="text-lg md:text-xl text-violet-200 max-w-2xl mx-auto mb-10 leading-relaxed">
            Join 50,000+ learners growing their skills with world-class courses from expert instructors. Learn at your own pace, earn certificates.
          </p>

          <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="What do you want to learn today?"
                className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white text-gray-900 text-base focus:outline-none focus:ring-4 focus:ring-amber-300/50 shadow-xl" />
            </div>
            <button type="submit" className="h-14 px-8 bg-amber-400 hover:bg-amber-300 text-amber-900 font-bold rounded-2xl transition-colors shadow-lg shadow-amber-400/30 flex-shrink-0">
              Search
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-6 text-sm text-violet-300">
            <span className="text-violet-400">Popular:</span>
            {['React', 'Python', 'Machine Learning', 'Flutter', 'AWS'].map(t => (
              <Link key={t} to={`/courses?search=${t}`} className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 transition-colors">{t}</Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats ──────────────────────────────────────────────────────────── */}
      <section className="bg-violet-950 py-10">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="text-center">
              <div className="flex justify-center mb-2"><Icon className="w-6 h-6 text-violet-400" /></div>
              <p className="text-3xl font-black text-white">{value}</p>
              <p className="text-violet-400 text-sm mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Categories ───────────────────────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-900 mb-3">Explore Top Categories</h2>
            <p className="text-gray-500">Find the perfect course across dozens of topics</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {(catData ?? []).map(cat => {
              const Icon = ICON_MAP[cat.icon ?? ''] ?? BookOpen;
              return (
                <Link key={cat.id} to={`/courses?category=${cat.slug}`}
                  className="group bg-white rounded-2xl border border-gray-200 p-5 hover:border-violet-300 hover:shadow-lg hover:-translate-y-0.5 transition-all text-center">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: cat.color + '20' }}>
                    <Icon className="w-6 h-6" style={{ color: cat.color }} />
                  </div>
                  <p className="font-semibold text-gray-800 text-sm group-hover:text-violet-700 transition-colors">{cat.name}</p>
                  <p className="text-xs text-gray-400 mt-1">{cat.course_count} courses</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Featured Courses ─────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">Featured Courses</h2>
              <p className="text-gray-500">Handpicked by our experts, loved by learners</p>
            </div>
            <Link to="/courses" className="flex items-center gap-1 text-violet-600 font-semibold hover:text-violet-700 text-sm">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {isLoading ? <LoadingSpinner text="Loading courses…" /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {(featuredData?.courses ?? []).slice(0,8).map(c => <CourseCard key={c.id} course={c} />)}
            </div>
          )}
        </div>
      </section>

      {/* ─── How it works ─────────────────────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-br from-violet-50 to-indigo-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-3">How EduFlow Works</h2>
            <p className="text-gray-500">Get started in minutes</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step:'01', icon:Search, title:'Find Your Course', desc:'Browse hundreds of courses across all skill levels and categories.' },
              { step:'02', icon:Play, title:'Start Learning', desc:'Watch video lessons, read articles, and complete hands-on exercises.' },
              { step:'03', icon:Award, title:'Earn Certificate', desc:'Complete the course and earn a certificate to showcase your skills.' },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.step} className="text-center">
                  <div className="relative inline-block mb-5">
                    <div className="w-16 h-16 rounded-2xl bg-white shadow-lg border border-violet-100 flex items-center justify-center mx-auto">
                      <Icon className="w-7 h-7 text-violet-600" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-violet-600 text-white text-xs font-bold rounded-full flex items-center justify-center">{s.step}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-r from-violet-700 to-indigo-700">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Ready to Start Learning?</h2>
          <p className="text-violet-200 text-lg mb-8">Join thousands of learners who are already growing their skills.</p>
          <div className="flex gap-4 justify-center">
            <Link to="/register" className="px-8 py-4 bg-white text-violet-700 font-bold rounded-2xl hover:bg-gray-50 transition-colors shadow-lg">
              Get Started Free
            </Link>
            <Link to="/courses" className="px-8 py-4 bg-violet-600 text-white font-bold rounded-2xl hover:bg-violet-500 border border-white/20 transition-colors">
              Browse Courses
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-violet-300 text-sm">
            {['No credit card required','Free certificate','Lifetime access'].map(t => (
              <span key={t} className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-400" />{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 py-10 text-center text-gray-400 text-sm">
        <div className="flex items-center justify-center gap-2 mb-3">
          <GraduationCap className="w-5 h-5 text-violet-400" />
          <span className="font-bold text-white">EduFlow LMS</span>
        </div>
        <p>© 2026 EduFlow. Built for learners, by learners.</p>
      </footer>
    </div>
  );
}
