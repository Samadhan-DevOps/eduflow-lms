import { Router } from 'express';
import { authenticate, authorizeRole } from '../middleware/auth';
import { getStudentDashboard, getInstructorDashboard, getAdminDashboard } from '../controllers/dashboardController';

const router = Router();
router.use(authenticate);
router.get('/student',    getStudentDashboard);
router.get('/instructor', authorizeRole('instructor','admin'), getInstructorDashboard);
router.get('/admin',      authorizeRole('admin'), getAdminDashboard);
export default router;
