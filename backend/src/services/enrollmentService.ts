import { query, queryOne } from '../config/database';
import { Enrollment, LessonProgress } from '../models/types';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

class EnrollmentService {
  async enroll(userId: string, courseId: string): Promise<Enrollment> {
    const course = await queryOne('SELECT id, is_published FROM courses WHERE id=$1', [courseId]);
    if (!course) throw new AppError('Course not found.', 404);

    const exists = await queryOne('SELECT id FROM enrollments WHERE user_id=$1 AND course_id=$2', [userId, courseId]);
    if (exists) throw new AppError('You are already enrolled in this course.', 409);

    const e = await queryOne<Enrollment>(
      'INSERT INTO enrollments (user_id, course_id) VALUES ($1,$2) RETURNING *',
      [userId, courseId]
    );
    if (!e) throw new AppError('Failed to enroll.', 500);
    await query('UPDATE courses SET enrollment_count=enrollment_count+1 WHERE id=$1', [courseId]);
    logger.info('User enrolled', { userId, courseId });
    return e;
  }

  async getMyEnrollments(userId: string) {
    return query(
      `SELECT e.*, c.title, c.slug, c.thumbnail_url, c.total_lessons, c.total_duration_min,
              c.level, c.rating_average, c.category_id,
              u.first_name||' '||u.last_name AS instructor_name,
              cat.name AS category_name, cat.color AS category_color
       FROM enrollments e
       JOIN courses c ON c.id=e.course_id
       JOIN users u ON u.id=c.instructor_id
       LEFT JOIN categories cat ON cat.id=c.category_id
       WHERE e.user_id=$1
       ORDER BY e.enrolled_at DESC`,
      [userId]
    );
  }

  async markLessonComplete(userId: string, lessonId: string, courseId: string): Promise<void> {
    await queryOne(
      `INSERT INTO lesson_progress (user_id, lesson_id, course_id, completed, completed_at)
       VALUES ($1,$2,$3,true,NOW())
       ON CONFLICT (user_id, lesson_id) DO UPDATE SET completed=true, completed_at=NOW()`,
      [userId, lessonId, courseId]
    );

    // Recalculate progress
    const [total, done] = await Promise.all([
      queryOne<{ count: number }>('SELECT COUNT(*)::int AS count FROM lessons WHERE course_id=$1', [courseId]),
      queryOne<{ count: number }>('SELECT COUNT(*)::int AS count FROM lesson_progress WHERE user_id=$1 AND course_id=$2 AND completed=true', [userId, courseId]),
    ]);
    const pct = total?.count ? Math.round(((done?.count ?? 0) / total.count) * 100) : 0;
    await query(
      `UPDATE enrollments SET progress_percentage=$1, last_lesson_id=$2,
         completed_at = CASE WHEN $1=100 AND completed_at IS NULL THEN NOW() ELSE completed_at END
       WHERE user_id=$3 AND course_id=$4`,
      [pct, lessonId, userId, courseId]
    );
  }

  async getCourseProgress(userId: string, courseId: string) {
    const [enrollment, completedLessons] = await Promise.all([
      queryOne<Enrollment>(
        'SELECT * FROM enrollments WHERE user_id=$1 AND course_id=$2', [userId, courseId]
      ),
      query<LessonProgress>(
        'SELECT * FROM lesson_progress WHERE user_id=$1 AND course_id=$2', [userId, courseId]
      ),
    ]);
    if (!enrollment) throw new AppError('Not enrolled in this course.', 404);
    return { enrollment, completedLessons };
  }
}

export const enrollmentService = new EnrollmentService();
