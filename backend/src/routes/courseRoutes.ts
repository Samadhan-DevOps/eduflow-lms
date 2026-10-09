import { Router } from 'express';
import { authenticate, authorizeRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { body } from 'express-validator';
import {
  getCourses, getCourse, createCourse, updateCourse, publishCourse, deleteCourse,
  addSection, addLesson, getCategories, getCourseReviews, submitReview,
  getInstructorCourses, courseValidators,
} from '../controllers/courseController';

const router = Router();

// Public
router.get('/categories', getCategories);
router.get('/', getCourses);
router.get('/:id', getCourse);
router.get('/:id/reviews', getCourseReviews);

// Protected
router.post('/:id/reviews', authenticate, [
  body('rating').isInt({ min:1, max:5 }).withMessage('Rating must be 1–5'),
], validate, submitReview);

// Instructor+
router.post('/', authenticate, authorizeRole('instructor','admin'), courseValidators, validate, createCourse);
router.put('/:id', authenticate, authorizeRole('instructor','admin'), courseValidators, validate, updateCourse);
router.put('/:id/publish', authenticate, authorizeRole('instructor','admin'), publishCourse);
router.delete('/:id', authenticate, authorizeRole('instructor','admin'), deleteCourse);
router.get('/instructor/my-courses', authenticate, authorizeRole('instructor','admin'), getInstructorCourses);

// Sections & Lessons
router.post('/:courseId/sections', authenticate, authorizeRole('instructor','admin'),
  [body('title').trim().notEmpty()], validate, addSection);
router.post('/:courseId/sections/:sectionId/lessons', authenticate, authorizeRole('instructor','admin'),
  [body('title').trim().notEmpty()], validate, addLesson);

export default router;
