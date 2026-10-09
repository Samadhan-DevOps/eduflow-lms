import { Request, Response } from 'express';
import { dashboardService } from '../services/dashboardService';
import { ApiResponse } from '../models/types';

export const getStudentDashboard = async (req: Request, res: Response): Promise<void> => {
  const data = await dashboardService.getStudentStats(req.user!.userId);
  res.json({ success: true, data } as ApiResponse);
};

export const getInstructorDashboard = async (req: Request, res: Response): Promise<void> => {
  const data = await dashboardService.getInstructorStats(req.user!.userId);
  res.json({ success: true, data } as ApiResponse);
};

export const getAdminDashboard = async (_req: Request, res: Response): Promise<void> => {
  const data = await dashboardService.getAdminStats();
  res.json({ success: true, data } as ApiResponse);
};
