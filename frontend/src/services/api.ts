import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse, AuthResult, LoginInput, RegisterInput, User, Course, CourseDetail, Enrollment, Category, Review, StudentDashboard, InstructorDashboard } from '../types';

export const api = axios.create({ baseURL: '', headers: { 'Content-Type': 'application/json' }, timeout: 15_000 });

api.interceptors.request.use((cfg: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('ef_token');
  if (token) cfg.headers['Authorization'] = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  r => r,
  (err: AxiosError<ApiResponse>) => {
    if (err.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('ef_token'); localStorage.removeItem('ef_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

const unwrap = <T>(p: Promise<{ data: ApiResponse<T> }>): Promise<T> => p.then(r => r.data.data as T);

export const authApi = {
  register:       (d: RegisterInput) => unwrap<AuthResult>(api.post('/api/auth/register', d)),
  login:          (d: LoginInput)    => unwrap<AuthResult>(api.post('/api/auth/login', d)),
  getMe:          ()                 => unwrap<User>(api.get('/api/auth/me')),
  updateProfile:  (d: Partial<User>) => unwrap<User>(api.put('/api/auth/me', d)),
  changePassword: (current: string, next: string) => api.put('/api/auth/me/password', { current_password: current, new_password: next }),
};

export const courseApi = {
  getAll:       (params?: Record<string, unknown>)       => unwrap<{ courses: Course[]; total: number }>(api.get('/api/courses', { params })),
  getById:      (id: string)                             => unwrap<CourseDetail>(api.get(`/api/courses/${id}`)),
  getCategories:()                                       => unwrap<Category[]>(api.get('/api/courses/categories')),
  getReviews:   (id: string)                             => unwrap<Review[]>(api.get(`/api/courses/${id}/reviews`)),
  submitReview: (id: string, d: { rating: number; comment: string }) => api.post(`/api/courses/${id}/reviews`, d),
  create:       (d: Partial<Course>)                     => unwrap<Course>(api.post('/api/courses', d)),
  update:       (id: string, d: Partial<Course>)         => unwrap<Course>(api.put(`/api/courses/${id}`, d)),
  publish:      (id: string)                             => unwrap<Course>(api.put(`/api/courses/${id}/publish`)),
  delete:       (id: string)                             => api.delete(`/api/courses/${id}`),
  getMyCourses: ()                                       => unwrap<{ courses: Course[] }>(api.get('/api/courses/instructor/my-courses')),
};

export const enrollApi = {
  enroll:          (courseId: string)                    => unwrap<Enrollment>(api.post(`/api/enrollments/${courseId}/enroll`)),
  getMyEnrollments:()                                    => unwrap<Enrollment[]>(api.get('/api/enrollments/my')),
  markComplete:    (lessonId: string, courseId: string)  => api.put(`/api/enrollments/lessons/${lessonId}/complete`, { courseId }),
  getProgress:     (courseId: string)                    => api.get(`/api/enrollments/${courseId}/progress`),
};

export const dashApi = {
  student:    () => unwrap<StudentDashboard>(api.get('/api/dashboard/student')),
  instructor: () => unwrap<InstructorDashboard>(api.get('/api/dashboard/instructor')),
};

export function extractError(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const e = err as { response?: { data?: { message?: string } } };
    if (e.response?.data?.message) return e.response.data.message;
  }
  return err instanceof Error ? err.message : 'An unexpected error occurred';
}
