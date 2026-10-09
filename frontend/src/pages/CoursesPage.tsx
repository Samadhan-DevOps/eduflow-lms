import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, Search, BookOpen } from 'lucide-react';
import { courseApi } from '../services/api';
import CourseCard from '../components/courses/CourseCard';
import PublicNavbar from '../components/layout/PublicNavbar';
import LoadingSpinner from '../components/common/LoadingSpinner';

const LEVELS = [
  { value:'', label:'All Levels' },
  { value:'beginner', label:'Beginner' },
  { value:'intermediate', label:'Intermediate' },
  { value:'advanced', label:'Advanced' },
];

export default function CoursesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch]   = useState(searchParams.get('search') ?? '');
  const [category, setCategory] = useState(searchParams.get('category') ?? '');
  const [level, setLevel]     = useState('');
  useEffect(() => { setSearch(searchParams.get('search') ?? ''); }, [searchParams]);
  const { data: cats } = useQuery({ queryKey:['categories'], queryFn: courseApi.getCategories, staleTime:600_000 });
  const { data, isLoading } = useQuery({ queryKey:['courses', search, category, level], queryFn:() => courseApi.getAll({ search:search||undefined, category:category||undefined, level:level||undefined }), staleTime:30_000 });
  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setSearchParams(search ? { search } : {}); };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <PublicNavbar />
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1">All Courses</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{data?.total ?? 0} courses available</p>
          <form onSubmit={handleSearch} className="mt-4 flex gap-3 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses…"
                className="w-full h-10 pl-9 pr-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent" />
            </div>
            <button type="submit" className="h-10 px-5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition-colors">Search</button>
          </form>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm dark:shadow-gray-900/30 sticky top-24">
            <div className="flex items-center gap-2 mb-4 font-semibold text-gray-900 dark:text-white">
              <SlidersHorizontal className="w-4 h-4 text-violet-600" /> Filters
            </div>
            <div className="mb-5">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Category</p>
              <div className="space-y-1">
                <button onClick={() => setCategory('')} className={`w-full text-left px-2.5 py-1.5 rounded-lg text-sm transition-colors ${!category ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 font-semibold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>All Categories</button>
                {(cats??[]).map(c => (
                  <button key={c.id} onClick={() => setCategory(c.slug)} className={`w-full text-left px-2.5 py-1.5 rounded-lg text-sm transition-colors ${category===c.slug ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 font-semibold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>{c.name}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Level</p>
              <div className="space-y-1">
                {LEVELS.map(l => (
                  <button key={l.value} onClick={() => setLevel(l.value)} className={`w-full text-left px-2.5 py-1.5 rounded-lg text-sm transition-colors ${level===l.value ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 font-semibold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>{l.label}</button>
                ))}
              </div>
            </div>
          </div>
        </aside>
        <div className="flex-1 min-w-0">
          {isLoading ? <LoadingSpinner text="Loading courses…" /> :
           (data?.courses??[]).length===0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center mb-4"><BookOpen className="w-8 h-8 text-violet-500" /></div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">No courses found</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {(data?.courses??[]).map(c => <CourseCard key={c.id} course={c} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
