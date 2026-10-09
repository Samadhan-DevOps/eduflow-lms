import { Request, Response } from 'express';
import { enrollmentService } from '../services/enrollmentService';
import { ApiResponse } from '../models/types';

export const enrollInCourse = async (req: Request, res: Response): Promise<void> => {
  const data = await enrollmentService.enroll(req.user!.userId, req.params['courseId']!);
  res.status(201).json({ success: true, data, message: 'Enrolled successfully!' } as ApiResponse);
};

export const getMyEnrollments = async (req: Request, res: Response): Promise<void> => {
  const data = await enrollmentService.getMyEnrollments(req.user!.userId);
  res.json({ success: true, data } as ApiResponse);
};

export const markLessonComplete = async (req: Request, res: Response): Promise<void> => {
  await enrollmentService.markLessonComplete(req.user!.userId, req.params['lessonId']!, req.body.courseId);
  res.json({ success: true, message: 'Lesson marked complete' } as ApiResponse);
};

export const getCourseProgress = async (req: Request, res: Response): Promise<void> => {
  const data = await enrollmentService.getCourseProgress(req.user!.userId, req.params['courseId']!);
  res.json({ success: true, data } as ApiResponse);
};
