import { z } from "zod";
import {
  baseEntitySchema,
  moneySchema,
  budgetCategorySchema,
} from "./common.schema";

export const budgetItemSchema = baseEntitySchema.extend({
  tripId: z.string().min(1),
  dayId: z.string().optional(),
  activityId: z.string().optional(),
  description: z.string().min(1),
  category: budgetCategorySchema,
  amount: moneySchema,
  isEstimate: z.boolean(),
  splitType: z.enum(["all", "per_person", "custom"]),
  splitAmounts: z.record(z.string(), moneySchema).optional(),
  paidBy: z.string().optional(),
  receiptFileId: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().optional(),
});

export type BudgetItemZ = z.infer<typeof budgetItemSchema>;
