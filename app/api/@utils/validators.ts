import { z } from "zod";

export const createHabitSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().optional(),
  startDate: z.string().optional(),
});

export const updateHabitSchema = z.object({
  name: z.string().trim().min(1, "Name is required").optional(),
  description: z.string().optional(),
  startDate: z.string().optional(),
});

export const checkInSchema = z.object({
  date: z.string().optional(),
  value: z.number().min(0).optional(),
});
