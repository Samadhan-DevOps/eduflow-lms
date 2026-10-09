import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { enrollInCourse, getMyEnrollments, markLessonComplete, getCourseProgress } from '../controllers/enrollmentController';

const router = Router();
router.use(authenticate);
router.post('/:courseId/enroll', enrollInCourse);
router.get('/my', getMyEnrollments);
router.put('/lessons/:lessonId/complete', markLessonComplete);
router.get('/:courseId/progress', getCourseProgress);
export default router;
