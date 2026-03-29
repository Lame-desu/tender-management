import { Request, Response, NextFunction } from "express";
import prisma from "../config/db";

export function auditLog(action: string, entityType?: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store the original json method to intercept the response
    const originalJson = res.json.bind(res);

    res.json = function (body: Record<string, unknown>) {
      // Only log on successful responses
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        const entityId =
          req.params?.id ? parseInt(req.params.id, 10) || undefined :
          (body?.data && typeof body.data === "object" && "id" in (body.data as Record<string, unknown>))
            ? (body.data as Record<string, unknown>).id as number
            : undefined;

        prisma.auditLog
          .create({
            data: {
              action,
              entityType: entityType || undefined,
              entityId: entityId || undefined,
              performedBy: req.user.id,
              ipAddress: req.ip || req.socket.remoteAddress || undefined,
              details: undefined,
            },
          })
          .catch((err: Error) => console.error("Audit log error:", err.message));
      }

      return originalJson(body);
    };

    next();
  };
}
