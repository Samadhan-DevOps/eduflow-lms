export interface ApiResponse<T = unknown> { success: boolean; data?: T; message?: string; errors?: Array<{ field: string; message: string }>; }

export interface User { id: string; email: string; first_name: string; last_name: string; role: 'student' | 'instructor' | 'admin'; avatar_url: string | null; headline: string | null; bio: string | null; website: string | null; is_active: boolean; created_at: string; updated_at: string; }
export interface AuthResult { user: User; token: string; }
export interface LoginInput { email: string; password: string; }
export interface RegisterInput { email: string; password: string; first_name: string; last_name: string; }

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced' | 'all-levels';

export interface Category { id: string; name: string; slug: string; icon: string | null; color: string; course_count: number; }

export interface Course {
  id: string; title: string; slug: string;
  description: string | null; short_description: string | null;
  thumbnail_url: string | null; preview_video_url: string | null;
  instructor_id: string; instructor_name?: string; instructor_avatar?: string | null; instructor_headline?: string | null; instructor_bio?: string;
  category_id: string | null; category_name?: string | null; category_color?: string | null;
  level: CourseLevel; language: string; price: number;
  is_published: boolean; is_featured: boolean;
  total_lessons: number; total_duration_min: number;
  enrollment_count: number; rating_average: number; rating_count: number;
  requirements: string[]; outcomes: string[]; tags: string[];
  created_at: string; updated_at: string;
}

export interface CourseDetail extends Course {
  sections: Array<Section & { lessons: Lesson[] }>;
  is_enrolled: boolean;
  user_progress: number;
}

export interface Section { id: string; course_id: string; title: string; position: number; created_at: string; lessons?: Lesson[]; }

export interface Lesson { id: string; section_id: string; course_id: string; title: string; content: string | null; video_url: string | null; duration_minutes: number; position: number; type: 'video' | 'text' | 'quiz'; is_free_preview: boolean; created_at: string; }

export interface Enrollment { id: string; user_id: string; course_id: string; progress_percentage: number; last_lesson_id: string | null; completed_at: string | null; enrolled_at: string; title?: string; slug?: string; thumbnail_url?: string | null; total_lessons?: number; level?: CourseLevel; rating_average?: number; instructor_name?: string; category_name?: string; category_color?: string; }

export interface Review { id: string; user_id: string; course_id: string; rating: number; comment: string | null; created_at: string; reviewer_name?: string; reviewer_avatar?: string | null; }

export interface StudentDashboard { stats: { total_enrolled: number; completed: number; avg_progress: number }; recentEnrollments: Enrollment[]; inProgress: Enrollment[]; }
export interface InstructorDashboard { stats: { total_courses: number; published: number; total_students: number; avg_rating: string }; recentEnrollments: any[]; topCourses: Course[]; }
