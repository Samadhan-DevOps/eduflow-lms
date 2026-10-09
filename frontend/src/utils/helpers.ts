import type { CourseLevel } from '../types';

export const fmt = (d: string | null | undefined) => d ? new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) : '—';
export const initials = (f: string, l: string) => `${f[0]??''}${l[0]??''}`.toUpperCase();
export const fmtDuration = (mins: number) => { const h=Math.floor(mins/60); const m=mins%60; return h>0 ? `${h}h ${m>0?m+'m':''}`.trim() : `${m}m`; };
export const fmtNumber = (n: number) => n>=1000 ? `${(n/1000).toFixed(1)}k` : n.toString();

export const LEVEL_STYLES: Record<CourseLevel, string> = {
  'beginner':     'bg-emerald-100 text-emerald-700',
  'intermediate': 'bg-amber-100   text-amber-700',
  'advanced':     'bg-red-100     text-red-700',
  'all-levels':   'bg-blue-100    text-blue-700',
};
export const LEVEL_LABEL: Record<CourseLevel, string> = {
  'beginner':'Beginner', 'intermediate':'Intermediate', 'advanced':'Advanced', 'all-levels':'All Levels',
};

export const CAT_GRADIENT: Record<string, string> = {
  'Web Development':    'from-blue-500   to-indigo-600',
  'Data Science':       'from-violet-500 to-purple-700',
  'Mobile Development': 'from-emerald-500 to-teal-600',
  'UI/UX Design':       'from-pink-500   to-rose-600',
  'Business':           'from-amber-500  to-orange-600',
  'Photography':        'from-red-500    to-pink-600',
  'Marketing':          'from-cyan-500   to-blue-600',
  'Cloud & DevOps':     'from-indigo-500 to-violet-700',
};

export const defaultGradient = (name?: string) =>
  (name && CAT_GRADIENT[name]) ? CAT_GRADIENT[name] : 'from-violet-500 to-indigo-600';
