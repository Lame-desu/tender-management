import { Response } from "express";

interface ApiResponseData {
  success: boolean;
  message: string;
  data?: unknown;
}

export class ApiResponse {
  static success(res: Response, message: string, data?: unknown, statusCode = 200) {
    const response: ApiResponseData = { success: true, message };
    if (data !== undefined) response.data = data;
    return res.status(statusCode).json(response);
  }

  static created(res: Response, message: string, data?: unknown) {
    return ApiResponse.success(res, message, data, 201);
  }

  static error(res: Response, message: string, statusCode = 500) {
    return res.status(statusCode).json({ success: false, message });
  }
}
