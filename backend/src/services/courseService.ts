import { query, queryOne } from '../config/database';
import { Course, CourseWithInstructor, Section, Lesson } from '../models/types';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    + '-' + Math.random().toString(36).slice(2, 7);
}

class CourseService {
  async getAll(filters: {
    search?: string; category?: string; level?: string;
    featured?: boolean; instructorId?: string;
    page?: number; limit?: number;
  }): Promise<{ courses: CourseWithInstructor[]; total: number }> {
    const { search, category, level, featured, instructorId, page = 1, limit = 12 } = filters;
    const offset = (page - 1) * limit;
    const params: unknown[] = [];
    const where: string[] = ['c.is_published = true'];

    if (instructorId) {
      where.length = 0; // instructor can see their own unpublished
      params.push(instructorId);
      where.push(`c.instructor_id = $${params.length}`);
    }
    if (search) { params.push(`%${search}%`); where.push(`(c.title ILIKE $${params.length} OR c.short_description ILIKE $${params.length})`); }
    if (category) { params.push(category); where.push(`cat.slug = $${params.length}`); }
    if (level)    { params.push(level);    where.push(`c.level = $${params.length}`); }
    if (featured) { where.push('c.is_featured = true'); }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [rows, countRow] = await Promise.all([
      query<CourseWithInstructor>(
        `SELECT c.*,
                u.first_name||' '||u.last_name AS instructor_name,
                u.avatar_url                    AS instructor_avatar,
                u.headline                      AS instructor_headline,
                cat.name                        AS category_name,
                cat.color                       AS category_color
         FROM courses c
         JOIN users u ON u.id = c.instructor_id
         LEFT JOIN categories cat ON cat.id = c.category_id
         ${whereClause}
         ORDER BY c.is_featured DESC, c.enrollment_count DESC, c.created_at DESC
         LIMIT $${params.length+1} OFFSET $${params.length+2}`,
        [...params, limit, offset]
      ),
      queryOne<{ count: string }>(
        `SELECT COUNT(*) AS count FROM courses c
         LEFT JOIN categories cat ON cat.id = c.category_id
         ${whereClause}`,
        params
      ),
    ]);

    return { courses: rows, total: parseInt(countRow?.count ?? '0', 10) };
  }

  async getById(idOrSlug: string, userId?: string): Promise<CourseWithInstructor & {
    sections: Array<Section & { lessons: Lesson[] }>;
    is_enrolled: boolean;
    user_progress?: number;
  }> {
    const course = await queryOne<CourseWithInstructor>(
      `SELECT c.*,
              u.first_name||' '||u.last_name AS instructor_name,
              u.avatar_url                    AS instructor_avatar,
              u.headline                      AS instructor_headline,
              u.bio                           AS instructor_bio,
              cat.name                        AS category_name,
              cat.color                       AS category_color
       FROM courses c
       JOIN users u ON u.id = c.instructor_id
       LEFT JOIN categories cat ON cat.id = c.category_id
       WHERE c.id = $1 OR c.slug = $1`,
      [idOrSlug]
    );
    if (!course) throw new AppError('Course not found.', 404);

    const sections = await query<Section>(
      'SELECT * FROM sections WHERE course_id=$1 ORDER BY position', [course.id]
    );
    const lessons = await query<Lesson>(
      'SELECT * FROM lessons WHERE course_id=$1 ORDER BY section_id, position', [course.id]
    );

    const sectionsWithLessons = sections.map(s => ({
      ...s, lessons: lessons.filter(l => l.section_id === s.id),
    }));

    let is_enrolled = false;
    let user_progress = 0;
    if (userId) {
      const enroll = await queryOne<{ progress_percentage: number }>(
        'SELECT progress_percentage FROM enrollments WHERE user_id=$1 AND course_id=$2',
        [userId, course.id]
      );
      is_enrolled = !!enroll;
      user_progress = enroll?.progress_percentage ?? 0;
    }

    return { ...course, sections: sectionsWithLessons, is_enrolled, user_progress };
  }

  async create(instructorId: string, data: Partial<Course>): Promise<Course> {
    const slug = slugify(data.title ?? 'course');
    const c = await queryOne<Course>(
      `INSERT INTO courses (title, slug, description, short_description, category_id,
         level, language, price, requirements, outcomes, tags, instructor_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [data.title, slug, data.description??null, data.short_description??null,
       data.category_id??null, data.level??'beginner', data.language??'English',
       data.price??0, data.requirements??[], data.outcomes??[], data.tags??[], instructorId]
    );
    if (!c) throw new AppError('Failed to create course.', 500);
    logger.info('Course created', { courseId: c.id, instructorId });
    return c;
  }

  async update(courseId: string, userId: string, data: Partial<Course>): Promise<Course> {
    await this.requireInstructor(courseId, userId);
    const c = await queryOne<Course>(
      `UPDATE courses SET
         title             = COALESCE($1, title),
         description       = COALESCE($2, description),
         short_description = COALESCE($3, short_description),
         category_id       = COALESCE($4, category_id),
         level             = COALESCE($5, level),
         price             = COALESCE($6, price),
         requirements      = COALESCE($7, requirements),
         outcomes          = COALESCE($8, outcomes),
         tags              = COALESCE($9, tags)
       WHERE id=$10 RETURNING *`,
      [data.title, data.description, data.short_description, data.category_id,
       data.level, data.price, data.requirements, data.outcomes, data.tags, courseId]
    );
    if (!c) throw new AppError('Course not found.', 404);
    return c;
  }

  async publish(courseId: string, userId: string): Promise<Course> {
    await this.requireInstructor(courseId, userId);
    const c = await queryOne<Course>(
      `UPDATE courses SET is_published = NOT is_published WHERE id=$1 RETURNING *`,
      [courseId]
    );
    if (!c) throw new AppError('Course not found.', 404);
    return c;
  }

  async delete(courseId: string, userId: string): Promise<void> {
    await this.requireInstructor(courseId, userId);
    await query('DELETE FROM courses WHERE id=$1', [courseId]);
    logger.info('Course deleted', { courseId });
  }

  async addSection(courseId: string, userId: string, title: string): Promise<Section> {
    await this.requireInstructor(courseId, userId);
    const pos = await queryOne<{ max: number }>('SELECT COALESCE(MAX(position),-1) AS max FROM sections WHERE course_id=$1', [courseId]);
    const s = await queryOne<Section>(
      'INSERT INTO sections (course_id,title,position) VALUES ($1,$2,$3) RETURNING *',
      [courseId, title, (pos?.max??-1)+1]
    );
    if (!s) throw new AppError('Failed to create section.', 500);
    return s;
  }

  async addLesson(courseId: string, sectionId: string, userId: string, data: Partial<Lesson>): Promise<Lesson> {
    await this.requireInstructor(courseId, userId);
    const pos = await queryOne<{ max: number }>('SELECT COALESCE(MAX(position),-1) AS max FROM lessons WHERE section_id=$1', [sectionId]);
    const l = await queryOne<Lesson>(
      `INSERT INTO lessons (section_id,course_id,title,content,video_url,duration_minutes,type,is_free_preview,position)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [sectionId, courseId, data.title, data.content??null, data.video_url??null,
       data.duration_minutes??5, data.type??'video', data.is_free_preview??false, (pos?.max??-1)+1]
    );
    if (!l) throw new AppError('Failed to create lesson.', 500);
    await query(`UPDATE courses SET total_lessons=total_lessons+1, total_duration_min=total_duration_min+$1 WHERE id=$2`,
      [data.duration_minutes??5, courseId]);
    return l;
  }

  async getFeatured(): Promise<CourseWithInstructor[]> {
    return query<CourseWithInstructor>(
      `SELECT c.*, u.first_name||' '||u.last_name AS instructor_name, u.avatar_url AS instructor_avatar,
              cat.name AS category_name, cat.color AS category_color
       FROM courses c JOIN users u ON u.id=c.instructor_id LEFT JOIN categories cat ON cat.id=c.category_id
       WHERE c.is_published=true ORDER BY c.enrollment_count DESC LIMIT 8`
    );
  }

  private async requireInstructor(courseId: string, userId: string) {
    const row = await queryOne<{ role: string }>(
      'SELECT u.role FROM courses c JOIN users u ON u.id=$2 WHERE c.id=$1 AND (c.instructor_id=$2 OR u.role=\'admin\')',
      [courseId, userId]
    );
    if (!row) throw new AppError('Course not found or insufficient permissions.', 403);
  }
}

export const courseService = new CourseService();
