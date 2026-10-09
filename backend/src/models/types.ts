// ─── Entities ─────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'student' | 'instructor' | 'admin';
  avatar_url: string | null;
  headline: string | null;
  bio: string | null;
  website: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string;
  course_count: number;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  thumbnail_url: string | null;
  preview_video_url: string | null;
  instructor_id: string;
  category_id: string | null;
  level: 'beginner' | 'intermediate' | 'advanced' | 'all-levels';
  language: string;
  price: number;
  is_published: boolean;
  is_featured: boolean;
  total_lessons: number;
  total_duration_min: number;
  enrollment_count: number;
  rating_average: number;
  rating_count: number;
  requirements: string[];
  outcomes: string[];
  tags: string[];
  created_at: Date;
  updated_at: Date;
}

export interface CourseWithInstructor extends Course {
  instructor_name: string;
  instructor_avatar: string | null;
  instructor_headline: string | null;
  category_name: string | null;
  category_color: string | null;
}

export interface Section {
  id: string;
  course_id: string;
  title: string;
  position: number;
  created_at: Date;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  section_id: string;
  course_id: string;
  title: string;
  content: string | null;
  video_url: string | null;
  duration_minutes: number;
  position: number;
  type: 'video' | 'text' | 'quiz';
  is_free_preview: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  progress_percentage: number;
  last_lesson_id: string | null;
  completed_at: Date | null;
  enrolled_at: Date;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  course_id: string;
  completed: boolean;
  completed_at: Date | null;
}

export interface Review {
  id: string;
  user_id: string;
  course_id: string;
  rating: number;
  comment: string | null;
  created_at: Date;
  reviewer_name?: string;
  reviewer_avatar?: string | null;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// ─── API ──────────────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

// ─── Express extension ────────────────────────────────────────────────────────
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request { user?: AuthPayload }
  }
}
