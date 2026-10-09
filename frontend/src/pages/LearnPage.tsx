import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle, Circle, ChevronLeft, ChevronRight,
  BookOpen, FileText, Menu, X, GraduationCap, Award,
  StickyNote, Download, Keyboard, ChevronDown, ChevronUp,
} from 'lucide-react';
import clsx from 'clsx';
import { courseApi, enrollApi, extractError } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import ProgressBar from '../components/common/ProgressBar';
import VideoPlayer from '../components/common/VideoPlayer';
import type { Lesson } from '../types';

// ─── Simple markdown renderer ─────────────────────────────────────────────────
function renderMd(md: string) {
  return md
    .replace(/```[\w]*\n([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*?<\/li>\n?)+/gs, '<ul>$&</ul>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/(?<!\n)\n(?!\n)/g, '<br/>')
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/^(?!<[hup])/m, '<p>')
    .replace(/<p>\s*<\/p>/g, '');
}

export default function LearnPage() {
  const { courseId, lessonId: paramLessonId } = useParams<{ courseId: string; lessonId?: string }>();
  const nav = useNavigate();
  const toast = useToast();
  const qc = useQueryClient();

  const [sidebarOpen,    setSidebarOpen]    = useState(true);
  const [notesOpen,      setNotesOpen]      = useState(false);
  const [activeLesson,   setActiveLesson]   = useState<Lesson | null>(null);
  const [noteText,       setNoteText]       = useState('');
  const [shortcutHint,   setShortcutHint]   = useState(false);
  const [openSections,   setOpenSections]   = useState<Record<string, boolean>>({});

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => courseApi.getById(courseId!),
    enabled: !!courseId,
  });

  const { data: progressData } = useQuery({
    queryKey: ['progress', courseId],
    queryFn: () => enrollApi.getProgress(courseId!).then(r => r.data.data),
    enabled: !!courseId,
    staleTime: 10_000,
  });

  const completedIds = new Set(
    (progressData?.completedLessons ?? [])
      .filter((lp: { completed: boolean }) => lp.completed)
      .map((lp: { lesson_id: string }) => lp.lesson_id)
  );

  const allLessons  = course?.sections.flatMap(s => s.lessons ?? []) ?? [];
  const currentIdx  = allLessons.findIndex(l => l.id === activeLesson?.id);
  const progress    = progressData?.enrollment?.progress_percentage ?? 0;
  const isCompleted = activeLesson ? completedIds.has(activeLesson.id) : false;

  // ─── Initialise active lesson ──────────────────────────────────────────────
  useEffect(() => {
    if (!course || allLessons.length === 0) return;
    const target = paramLessonId
      ? allLessons.find(l => l.id === paramLessonId)
      : allLessons.find(l => l.id === progressData?.enrollment?.last_lesson_id)
        ?? allLessons[0];
    if (target) {
      setActiveLesson(target);
      // Auto-open the section containing this lesson
      const section = course.sections.find(s => s.lessons?.some(l => l.id === target.id));
      if (section) setOpenSections(prev => ({ ...prev, [section.id]: true }));
    }
  }, [course, paramLessonId, progressData]);

  // ─── Load notes from localStorage ─────────────────────────────────────────
  useEffect(() => {
    if (activeLesson) {
      setNoteText(localStorage.getItem(`ef_note_${activeLesson.id}`) ?? '');
    }
  }, [activeLesson?.id]);

  const saveNote = useCallback((val: string) => {
    setNoteText(val);
    if (activeLesson) localStorage.setItem(`ef_note_${activeLesson.id}`, val);
  }, [activeLesson]);

  const downloadNotes = () => {
    const allNotes = allLessons.map(l => {
      const note = localStorage.getItem(`ef_note_${l.id}`);
      return note ? `## ${l.title}\n${note}\n` : '';
    }).filter(Boolean).join('\n---\n');
    if (!allNotes) { toast.info('No notes to download yet'); return; }
    const blob = new Blob([`# ${course?.title} — My Notes\n\n${allNotes}`], { type: 'text/markdown' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url;
    a.download = `${course?.title}-notes.md`; a.click();
    URL.revokeObjectURL(url);
    toast.success('Notes downloaded!');
  };

  // ─── Mutations ─────────────────────────────────────────────────────────────
  const completeMut = useMutation({
    mutationFn: () => enrollApi.markComplete(activeLesson!.id, courseId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['progress', courseId] });
      qc.invalidateQueries({ queryKey: ['my-enrollments'] });
      toast.success('Lesson completed! ✓');
      goToLesson(allLessons[currentIdx + 1] ?? null);
    },
    onError: (e) => toast.error(extractError(e)),
  });

  const goToLesson = (lesson: Lesson | null) => {
    if (!lesson) return;
    setActiveLesson(lesson);
    nav(`/learn/${courseId}/${lesson.id}`, { replace: true });
    const section = course?.sections.find(s => s.lessons?.some(l => l.id === lesson.id));
    if (section) setOpenSections(prev => ({ ...prev, [section.id]: true }));
  };

  // ─── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement) return; // don't intercept in textarea
      if (e.key === 'ArrowRight' || e.key === 'n') { if (currentIdx < allLessons.length - 1) goToLesson(allLessons[currentIdx + 1]); }
      if (e.key === 'ArrowLeft'  || e.key === 'p') { if (currentIdx > 0) goToLesson(allLessons[currentIdx - 1]); }
      if (e.key === 'c') { if (!isCompleted) completeMut.mutate(); }
      if (e.key === 'm') setNotesOpen(prev => !prev);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentIdx, allLessons, isCompleted]);

  if (isLoading) return <LoadingSpinner fullScreen text="Loading course…" />;
  if (!course)   return <div className="flex items-center justify-center h-screen text-gray-500">Course not found</div>;

  /* ─────────────────────────────────────────────────────────────────────────── */
  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden text-white">

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className={clsx(
        'flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col transition-all duration-300',
        sidebarOpen ? 'w-80' : 'w-0 overflow-hidden'
      )}>
        {/* Branding */}
        <div className="px-4 py-3.5 border-b border-gray-800 flex-shrink-0">
          <Link to="/" className="flex items-center gap-2 mb-3 opacity-90 hover:opacity-100 transition-opacity">
            <GraduationCap className="w-5 h-5 text-violet-400" />
            <span className="font-bold text-white text-sm tracking-tight">EduFlow</span>
          </Link>
          <p className="text-white font-semibold text-sm line-clamp-2 leading-snug">{course.title}</p>
          <div className="mt-2.5">
            <div className="flex justify-between text-[11px] text-gray-400 mb-1">
              <span>{completedIds.size}/{allLessons.length} completed</span>
              <span className="font-bold text-violet-400">{progress}%</span>
            </div>
            <ProgressBar value={progress} size="sm" />
          </div>
        </div>

        {/* Curriculum */}
        <nav className="flex-1 overflow-y-auto py-2">
          {course.sections.map((sec, si) => {
            const secOpen = openSections[sec.id] ?? si === 0;
            const doneInSection = sec.lessons?.filter(l => completedIds.has(l.id)).length ?? 0;
            return (
              <div key={sec.id}>
                <button
                  onClick={() => setOpenSections(prev => ({ ...prev, [sec.id]: !secOpen }))}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-800/50 transition-colors text-left sticky top-0 bg-gray-900 z-10"
                >
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Section {si + 1}</p>
                    <p className="text-xs font-semibold text-gray-200">{sec.title}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-[10px] text-gray-500">{doneInSection}/{sec.lessons?.length}</span>
                    {secOpen ? <ChevronUp className="w-3.5 h-3.5 text-gray-500" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-500" />}
                  </div>
                </button>
                {secOpen && sec.lessons?.map(lesson => {
                  const done    = completedIds.has(lesson.id);
                  const active  = lesson.id === activeLesson?.id;
                  return (
                    <button key={lesson.id}
                      onClick={() => goToLesson(lesson)}
                      className={clsx(
                        'w-full text-left px-4 py-2.5 flex items-start gap-3 transition-all',
                        active  ? 'bg-violet-600/20 border-r-2 border-violet-500' :
                        done    ? 'opacity-60 hover:opacity-80 hover:bg-gray-800/30' :
                                  'hover:bg-gray-800/50'
                      )}>
                      <span className={clsx('w-4 h-4 flex-shrink-0 mt-0.5', done ? 'text-emerald-400' : active ? 'text-violet-400' : 'text-gray-600')}>
                        {done ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={clsx('text-xs leading-snug line-clamp-2',
                          active ? 'text-white font-semibold' : done ? 'text-gray-400' : 'text-gray-300')}>
                          {lesson.title}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {lesson.type === 'video'
                            ? <BookOpen className="w-2.5 h-2.5 text-gray-600" />
                            : <FileText  className="w-2.5 h-2.5 text-gray-600" />}
                          <span className="text-[10px] text-gray-600">{lesson.duration_minutes}m</span>
                          {lesson.is_free_preview && (
                            <span className="text-[10px] text-violet-500 font-medium">Preview</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Sidebar bottom actions */}
        <div className="p-3 border-t border-gray-800 flex gap-2">
          <button
            onClick={() => setNotesOpen(p => !p)}
            className={clsx('flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors', notesOpen ? 'bg-violet-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white')}
          >
            <StickyNote className="w-3.5 h-3.5" /> Notes
          </button>
          <button
            onClick={downloadNotes}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
            title="Download all notes"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShortcutHint(p => !p)}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
            title="Keyboard shortcuts"
          >
            <Keyboard className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Keyboard shortcuts hint */}
        {shortcutHint && (
          <div className="mx-3 mb-3 p-3 bg-gray-800 rounded-xl text-[11px] text-gray-400 space-y-1 border border-gray-700">
            <p className="font-bold text-gray-300 text-xs mb-1.5">⌨️ Shortcuts</p>
            {[['→ / N', 'Next lesson'],['← / P', 'Prev lesson'],['C', 'Mark complete'],['M', 'Toggle notes']].map(([k,v]) => (
              <div key={k} className="flex justify-between">
                <kbd className="bg-gray-700 px-1.5 rounded font-mono text-gray-300">{k}</kbd>
                <span>{v}</span>
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* ── Main content area ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center px-4 gap-3 flex-shrink-0">
          <button onClick={() => setSidebarOpen(p => !p)}
            className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-800 transition-colors flex-shrink-0">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-sm truncate">{activeLesson?.title ?? 'Select a lesson'}</p>
            <p className="text-gray-500 text-xs truncate">{course.title}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => goToLesson(allLessons[currentIdx - 1])} disabled={currentIdx <= 0}
              className="p-2 text-gray-400 hover:text-white disabled:opacity-30 hover:bg-gray-800 rounded-lg transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-500 tabular-nums">{currentIdx + 1}/{allLessons.length}</span>
            <button onClick={() => goToLesson(allLessons[currentIdx + 1])} disabled={currentIdx >= allLessons.length - 1}
              className="p-2 text-gray-400 hover:text-white disabled:opacity-30 hover:bg-gray-800 rounded-lg transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
            <Link to="/my-learning"
              className="ml-2 px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
              ← Back
            </Link>
          </div>
        </header>

        {/* Content + Notes panel */}
        <div className="flex-1 flex overflow-hidden">

          {/* Lesson content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            {activeLesson ? (
              <div className="max-w-3xl mx-auto px-6 py-8">

                {/* Lesson header */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mb-2">
                    <span className="capitalize">{activeLesson.type}</span>
                    <span>·</span>
                    <span>{activeLesson.duration_minutes} min</span>
                    {isCompleted && (
                      <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                        <CheckCircle className="w-3.5 h-3.5" /> Completed
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl font-black text-gray-900 dark:text-white">{activeLesson.title}</h1>
                </div>

                {/* Video player — shown when video_url is set */}
                {activeLesson.video_url && (
                  <div className="mb-6">
                    <VideoPlayer
                      videoUrl={activeLesson.video_url}
                      title={activeLesson.title}
                      onEnd={() => { if (!isCompleted) completeMut.mutate(); }}
                    />
                  </div>
                )}

                {/* Lesson text content */}
                {activeLesson.content && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 mb-6">
                    <div
                      className="prose-content"
                      dangerouslySetInnerHTML={{ __html: renderMd(activeLesson.content) }}
                    />
                  </div>
                )}

                {/* Completion area */}
                {progress === 100 ? (
                  <div className="flex flex-col items-center py-10 text-center bg-white dark:bg-gray-800 rounded-2xl border border-emerald-200 dark:border-emerald-900">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mb-4 shadow-xl shadow-emerald-200/50">
                      <Award className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Course Completed! 🎉</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Congratulations on finishing the entire course.</p>
                    <div className="flex gap-3">
                      <Link to="/my-learning">
                        <Button variant="secondary">My Learning</Button>
                      </Link>
                      <Link to="/courses">
                        <Button>Explore More Courses</Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    size="lg"
                    isLoading={completeMut.isPending}
                    variant={isCompleted ? 'secondary' : 'primary'}
                    onClick={() => { if (!isCompleted) completeMut.mutate(); else goToLesson(allLessons[currentIdx + 1]); }}
                  >
                    {isCompleted
                      ? <><ChevronRight className="w-4 h-4" /> Next Lesson</>
                      : <><CheckCircle className="w-4 h-4" /> Mark Complete & Continue</>}
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-600">
                <div className="text-center">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Select a lesson from the sidebar</p>
                </div>
              </div>
            )}
          </main>

          {/* Notes panel */}
          {notesOpen && (
            <aside className="w-80 flex-shrink-0 bg-gray-800 border-l border-gray-700 flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
                <div className="flex items-center gap-2">
                  <StickyNote className="w-4 h-4 text-violet-400" />
                  <span className="font-semibold text-white text-sm">My Notes</span>
                </div>
                <button onClick={() => setNotesOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 p-3 flex flex-col gap-2">
                <p className="text-[11px] text-gray-500">Notes for: <span className="text-gray-400">{activeLesson?.title}</span></p>
                <textarea
                  value={noteText}
                  onChange={e => saveNote(e.target.value)}
                  placeholder="Write your notes here…&#10;&#10;Notes are saved automatically and stored in your browser."
                  className="flex-1 w-full bg-gray-900 text-gray-200 text-sm rounded-xl border border-gray-700 p-3 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-gray-600 leading-relaxed"
                />
                <div className="flex items-center justify-between text-[11px] text-gray-600">
                  <span>{noteText.length} chars</span>
                  <button onClick={downloadNotes} className="text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1">
                    <Download className="w-3 h-3" /> Download all
                  </button>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
