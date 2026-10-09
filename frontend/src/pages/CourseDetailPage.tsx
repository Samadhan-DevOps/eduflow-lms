import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Clock, BookOpen, Users, Award, Play, Lock, ChevronDown, ChevronUp, Star } from 'lucide-react';
import clsx from 'clsx';
import { courseApi, enrollApi, extractError } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import PublicNavbar from '../components/layout/PublicNavbar';
import StarRating from '../components/common/StarRating';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import { LEVEL_STYLES, LEVEL_LABEL, fmtDuration, fmtNumber, defaultGradient } from '../utils/helpers';
import type { Lesson } from '../types';

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const [openSection, setOpenSection] = useState<string | null>(null);

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => courseApi.getById(id!),
    enabled: !!id,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => courseApi.getReviews(id!),
    enabled: !!id,
  });

  const enrollMut = useMutation({
    mutationFn: () => enrollApi.enroll(course!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['course', id] });
      qc.invalidateQueries({ queryKey: ['my-enrollments'] });
      toast.success('Enrolled! Start learning now 🎉');
      nav(`/learn/${course!.id}`);
    },
    onError: (e) => toast.error(extractError(e)),
  });

  if (isLoading) return <><PublicNavbar /><LoadingSpinner text="Loading course…" /></>;
  if (!course) return <><PublicNavbar /><div className="text-center py-20 text-gray-500">Course not found</div></>;

  const gradient = defaultGradient(course.category_name ?? undefined);
  const totalLessons = course.sections.reduce((s, sec) => s + sec.lessons.length, 0);
  const totalMin = course.sections.reduce((s, sec) => s + sec.lessons.reduce((a, l) => a + l.duration_minutes, 0), 0);

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* ─── Hero ──────────────────────────────────────────────────────── */}
      <div className={`bg-gradient-to-r ${gradient} py-10`}>
        <div className="max-w-7xl mx-auto px-6 flex gap-8 items-start">
          <div className="flex-1 min-w-0">
            {course.category_name && (
              <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full mb-3">
                {course.category_name}
              </span>
            )}
            <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-3">{course.title}</h1>
            <p className="text-white/80 text-base mb-4 max-w-2xl">{course.short_description}</p>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className={clsx('px-2 py-1 rounded text-xs font-semibold bg-white/20 text-white', LEVEL_STYLES[course.level])}>
                {LEVEL_LABEL[course.level]}
              </span>
              <StarRating rating={course.rating_average} count={course.rating_count} size="md" />
              <span className="text-white/70 text-sm flex items-center gap-1"><Users className="w-3.5 h-3.5" />{fmtNumber(course.enrollment_count)} students</span>
            </div>

            <p className="text-white/80 text-sm">Created by <span className="text-white font-semibold">{course.instructor_name}</span></p>
          </div>

          {/* Enrollment card */}
          <div className="hidden lg:block w-80 flex-shrink-0 bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className={`h-40 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <div className="text-white/20 text-8xl font-black">{course.title.charAt(0)}</div>
            </div>
            <div className="p-5">
              <div className="text-3xl font-black text-gray-900 mb-4">
                {course.price === 0 ? <span className="text-emerald-600">Free</span> : `$${course.price}`}
              </div>

              {course.is_enrolled ? (
                <Link to={`/learn/${course.id}`}>
                  <Button className="w-full" size="lg"><Play className="w-4 h-4 mr-1" />Continue Learning</Button>
                </Link>
              ) : (
                <Button className="w-full" size="lg" isLoading={enrollMut.isPending}
                  onClick={() => isAuthenticated ? enrollMut.mutate() : nav('/register')}>
                  {isAuthenticated ? 'Enroll Now — Free' : 'Sign Up to Enroll'}
                </Button>
              )}

              {course.is_enrolled && (
                <div className="mt-3 text-center text-sm text-emerald-600 font-semibold flex items-center justify-center gap-1">
                  <CheckCircle className="w-4 h-4" /> {course.user_progress}% complete
                </div>
              )}

              <div className="mt-4 space-y-2.5 text-sm text-gray-600">
                {[
                  [BookOpen, `${totalLessons} lessons`],
                  [Clock,    fmtDuration(totalMin)],
                  [Users,    `${fmtNumber(course.enrollment_count)} enrolled`],
                  [Award,    'Certificate of completion'],
                ].map(([Icon, text]) => {
                  const Ic = Icon as React.ElementType;
                  return (
                    <div key={text as string} className="flex items-center gap-2.5">
                      <span className="w-5 h-5 text-violet-500 flex-shrink-0"><Ic className="w-4 h-4" /></span>
                      <span>{text as string}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        <div className="flex-1 min-w-0 space-y-8">

          {/* What you'll learn */}
          {course.outcomes?.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">What You'll Learn</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-5 bg-violet-50 rounded-2xl border border-violet-100">
                {course.outcomes.map((o, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-violet-600 flex-shrink-0 mt-0.5" />
                    <span>{o}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Curriculum */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Course Curriculum</h2>
              <span className="text-sm text-gray-500">{totalLessons} lessons · {fmtDuration(totalMin)}</span>
            </div>
            <div className="space-y-2">
              {course.sections.map(sec => (
                <div key={sec.id} className="border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenSection(openSection === sec.id ? null : sec.id)}
                    className="w-full flex items-center justify-between px-4 py-3.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      {openSection === sec.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      <span className="font-semibold text-gray-900 text-sm">{sec.title}</span>
                    </div>
                    <span className="text-xs text-gray-400">{sec.lessons?.length} lessons</span>
                  </button>
                  {openSection === sec.id && (
                    <div className="divide-y divide-gray-100">
                      {sec.lessons?.map((lesson: Lesson) => (
                        <div key={lesson.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                          {lesson.is_free_preview
                            ? <Play className="w-4 h-4 text-violet-500 flex-shrink-0" />
                            : <Lock className="w-4 h-4 text-gray-300 flex-shrink-0" />
                          }
                          <span className={clsx('flex-1', lesson.is_free_preview ? 'text-violet-700 font-medium' : 'text-gray-600')}>
                            {lesson.title}
                            {lesson.is_free_preview && <span className="ml-2 text-[10px] bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded font-semibold">Preview</span>}
                          </span>
                          <span className="text-gray-400 text-xs">{lesson.duration_minutes}m</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Instructor */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Instructor</h2>
            <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-black flex-shrink-0">
                {course.instructor_name?.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-base">{course.instructor_name}</p>
                <p className="text-violet-600 text-sm mb-2">{(course as any).instructor_headline}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{(course as any).instructor_bio || 'Experienced educator with a passion for teaching practical skills.'}</p>
              </div>
            </div>
          </section>

          {/* Reviews */}
          {reviews.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                Student Reviews
                <StarRating rating={course.rating_average} count={course.rating_count} size="md" />
              </h2>
              <div className="space-y-4">
                {reviews.slice(0,5).map(r => (
                  <div key={r.id} className="flex gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="w-9 h-9 rounded-full bg-violet-200 flex items-center justify-center text-violet-700 font-bold text-sm flex-shrink-0">
                      {r.reviewer_name?.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-gray-900">{r.reviewer_name}</span>
                        <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} className={clsx('w-3 h-3', s<=r.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300')} />)}</div>
                      </div>
                      {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Mobile enroll button */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
        {course.is_enrolled ? (
          <Link to={`/learn/${course.id}`}><Button className="w-full" size="lg"><Play className="w-4 h-4 mr-1" />Continue Learning</Button></Link>
        ) : (
          <Button className="w-full" size="lg" isLoading={enrollMut.isPending}
            onClick={() => isAuthenticated ? enrollMut.mutate() : nav('/register')}>
            Enroll Now — Free
          </Button>
        )}
      </div>
    </div>
  );
}
