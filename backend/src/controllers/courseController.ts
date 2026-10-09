import { Request, Response } from 'express';
import { body } from 'express-validator';
import { courseService } from '../services/courseService';
import { query, queryOne } from '../config/database';
import { ApiResponse } from '../models/types';

export const courseValidators = [
  body('title').trim().notEmpty().isLength({ max: 255 }).withMessage('Title required'),
  body('level').optional().isIn(['beginner','intermediate','advanced','all-levels']),
  body('price').optional().isFloat({ min: 0 }),
];

export const getCourses = async (req: Request, res: Response): Promise<void> => {
  const { search, category, level, featured, page, limit } = req.query;
  const result = await courseService.getAll({
    search: search as string, category: category as string,
    level: level as string, featured: featured === 'true',
    page: page ? parseInt(page as string) : 1,
    limit: limit ? parseInt(limit as string) : 12,
  });
  res.json({ success: true, data: result } as ApiResponse);
};

export const getCourse = async (req: Request, res: Response): Promise<void> => {
  const data = await courseService.getById(req.params['id']!, req.user?.userId);
  res.json({ success: true, data } as ApiResponse);
};

export const createCourse = async (req: Request, res: Response): Promise<void> => {
  const data = await courseService.create(req.user!.userId, req.body);
  res.status(201).json({ success: true, data, message: 'Course created' } as ApiResponse);
};

export const updateCourse = async (req: Request, res: Response): Promise<void> => {
  const data = await courseService.update(req.params['id']!, req.user!.userId, req.body);
  res.json({ success: true, data } as ApiResponse);
};

export const publishCourse = async (req: Request, res: Response): Promise<void> => {
  const data = await courseService.publish(req.params['id']!, req.user!.userId);
  res.json({ success: true, data, message: `Course ${data.is_published ? 'published' : 'unpublished'}` } as ApiResponse);
};

export const deleteCourse = async (req: Request, res: Response): Promise<void> => {
  await courseService.delete(req.params['id']!, req.user!.userId);
  res.json({ success: true, message: 'Course deleted' } as ApiResponse);
};

export const addSection = async (req: Request, res: Response): Promise<void> => {
  const data = await courseService.addSection(req.params['courseId']!, req.user!.userId, req.body.title);
  res.status(201).json({ success: true, data } as ApiResponse);
};

export const addLesson = async (req: Request, res: Response): Promise<void> => {
  const data = await courseService.addLesson(req.params['courseId']!, req.params['sectionId']!, req.user!.userId, req.body);
  res.status(201).json({ success: true, data } as ApiResponse);
};

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  const data = await query('SELECT * FROM categories ORDER BY name');
  res.json({ success: true, data } as ApiResponse);
};

export const getCourseReviews = async (req: Request, res: Response): Promise<void> => {
  const data = await query(
    `SELECT r.*, u.first_name||' '||u.last_name AS reviewer_name, u.avatar_url AS reviewer_avatar
     FROM reviews r JOIN users u ON u.id=r.user_id
     WHERE r.course_id=$1 ORDER BY r.created_at DESC`,
    [req.params['id']]
  );
  res.json({ success: true, data } as ApiResponse);
};

export const submitReview = async (req: Request, res: Response): Promise<void> => {
  const { rating, comment } = req.body;
  const existing = await queryOne('SELECT id FROM reviews WHERE user_id=$1 AND course_id=$2', [req.user!.userId, req.params['id']]);
  if (existing) {
    await query('UPDATE reviews SET rating=$1, comment=$2 WHERE user_id=$3 AND course_id=$4', [rating, comment, req.user!.userId, req.params['id']]);
  } else {
    await query('INSERT INTO reviews (user_id, course_id, rating, comment) VALUES ($1,$2,$3,$4)', [req.user!.userId, req.params['id'], rating, comment]);
  }
  // Update avg rating
  await query(`UPDATE courses SET rating_average=(SELECT AVG(rating) FROM reviews WHERE course_id=$1), rating_count=(SELECT COUNT(*) FROM reviews WHERE course_id=$1) WHERE id=$1`, [req.params['id']]);
  res.json({ success: true, message: 'Review submitted' } as ApiResponse);
};

export const getInstructorCourses = async (req: Request, res: Response): Promise<void> => {
  const result = await courseService.getAll({ instructorId: req.user!.userId, page: 1, limit: 50 });
  res.json({ success: true, data: result } as ApiResponse);
};
