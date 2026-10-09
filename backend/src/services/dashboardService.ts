import { query, queryOne } from '../config/database';

class DashboardService {
  async getStudentStats(userId: string) {
    const [enrollStats, recentEnrollments, inProgress] = await Promise.all([
      queryOne(
        `SELECT
           COUNT(*)::int                                          AS total_enrolled,
           COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END)::int AS completed,
           COALESCE(AVG(progress_percentage),0)::int             AS avg_progress
         FROM enrollments WHERE user_id=$1`, [userId]
      ),
      query(
        `SELECT e.progress_percentage, e.enrolled_at, e.completed_at,
                c.id AS course_id, c.title, c.thumbnail_url, c.total_lessons,
                c.level, u.first_name||' '||u.last_name AS instructor_name,
                cat.color AS category_color
         FROM enrollments e
         JOIN courses c ON c.id=e.course_id
         JOIN users u ON u.id=c.instructor_id
         LEFT JOIN categories cat ON cat.id=c.category_id
         WHERE e.user_id=$1 ORDER BY e.enrolled_at DESC LIMIT 6`, [userId]
      ),
      query(
        `SELECT e.progress_percentage, c.id AS course_id, c.title, c.thumbnail_url
         FROM enrollments e JOIN courses c ON c.id=e.course_id
         WHERE e.user_id=$1 AND e.progress_percentage>0 AND e.progress_percentage<100
         ORDER BY e.enrolled_at DESC LIMIT 4`, [userId]
      ),
    ]);
    return { stats: enrollStats??{}, recentEnrollments, inProgress };
  }

  async getInstructorStats(userId: string) {
    const [courseStats, recentEnrollments, topCourses] = await Promise.all([
      queryOne(
        `SELECT
           COUNT(*)::int                                         AS total_courses,
           COUNT(CASE WHEN is_published THEN 1 END)::int        AS published,
           COALESCE(SUM(enrollment_count),0)::int               AS total_students,
           COALESCE(AVG(rating_average),0)::numeric(3,2)        AS avg_rating
         FROM courses WHERE instructor_id=$1`, [userId]
      ),
      query(
        `SELECT e.enrolled_at, c.title AS course_title,
                u.first_name||' '||u.last_name AS student_name
         FROM enrollments e
         JOIN courses c ON c.id=e.course_id
         JOIN users u ON u.id=e.user_id
         WHERE c.instructor_id=$1
         ORDER BY e.enrolled_at DESC LIMIT 8`, [userId]
      ),
      query(
        `SELECT id, title, enrollment_count, rating_average, rating_count,
                is_published, total_lessons
         FROM courses WHERE instructor_id=$1
         ORDER BY enrollment_count DESC LIMIT 5`, [userId]
      ),
    ]);
    return { stats: courseStats??{}, recentEnrollments, topCourses };
  }

  async getAdminStats() {
    const [users, courses, enrollments, categories] = await Promise.all([
      queryOne(`SELECT COUNT(*)::int AS total, COUNT(CASE WHEN role='student' THEN 1 END)::int AS students, COUNT(CASE WHEN role='instructor' THEN 1 END)::int AS instructors FROM users`),
      queryOne(`SELECT COUNT(*)::int AS total, COUNT(CASE WHEN is_published THEN 1 END)::int AS published FROM courses`),
      queryOne(`SELECT COUNT(*)::int AS total FROM enrollments`),
      query(`SELECT c.name, c.color, COUNT(co.id)::int AS course_count FROM categories c LEFT JOIN courses co ON co.category_id=c.id AND co.is_published=true GROUP BY c.id ORDER BY course_count DESC`),
    ]);
    return { users: users??{}, courses: courses??{}, enrollments: enrollments??{}, categories };
  }
}

export const dashboardService = new DashboardService();
