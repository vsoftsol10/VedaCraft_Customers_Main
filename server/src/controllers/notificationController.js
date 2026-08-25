import { AppError, sendError, sendSuccess } from '../utils/apiResponse.js';
import * as notificationService from '../services/notificationService.js';

export const getNotifications = async (req, res) => {
  try {
    const data = await notificationService.getNotifications(req.user.id, req.accessToken);
    return sendSuccess(res, data, 'Notifications retrieved successfully');
  } catch (error) {
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    return sendError(res, statusCode, error.message || 'Failed to fetch notifications');
  }
};

export const markAsRead = async (req, res) => {
  try {
    const data = await notificationService.markAsRead(req.user.id, req.params.id, req.accessToken);
    return sendSuccess(res, data, 'Notification marked as read');
  } catch (error) {
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    return sendError(res, statusCode, error.message || 'Failed to update notification');
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const data = await notificationService.markAllAsRead(req.user.id, req.accessToken);
    return sendSuccess(res, data, 'All notifications marked as read');
  } catch (error) {
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    return sendError(res, statusCode, error.message || 'Failed to update notifications');
  }
};