import { z } from "zod";
import { baseEntitySchema } from "./common.schema";

export const actionItemSchema = baseEntitySchema.extend({
  type: z.enum(["book", "confirm", "upload", "decide", "checkin"]),
  title: z.string().min(1),
  description: z.string(),
  dueDate: z.string().optional(),
  priority: z.enum(["high", "medium", "low"]),
  linkedEntityType: z.string(),
  linkedEntityId: z.string().optional(),
  status: z.enum(["pending", "completed"]).optional(),
  completedAt: z.string().optional(),
});

export type ActionItemZ = z.infer<typeof actionItemSchema>;
