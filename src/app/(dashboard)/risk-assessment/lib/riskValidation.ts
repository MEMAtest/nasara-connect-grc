import { z } from "zod";
import {
  RISK_CATEGORIES,
  RISK_REVIEW_FREQUENCIES,
  RISK_VELOCITY,
} from "./riskConstants";

export const keyRiskIndicatorSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name is required"),
  metric: z.string().min(2, "Metric is required"),
  threshold: z.object({
    green: z.number().nonnegative(),
    amber: z.number().nonnegative(),
    red: z.number().nonnegative(),
  }),
  currentValue: z.number().nonnegative(),
  direction: z.enum(["up", "down", "steady"]).optional(),
});

export const riskFormSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().min(10),
  category: z.enum(RISK_CATEGORIES),
  subCategory: z.string().min(2).optional(),
  likelihood: z.number().min(1).max(5),
  impact: z.number().min(1).max(5),
  residualLikelihood: z.number().min(1).max(5).optional(),
  residualImpact: z.number().min(1).max(5).optional(),
  velocity: z.enum(RISK_VELOCITY),
  businessUnit: z.string().optional(),
  process: z.string().optional(),
  riskOwner: z.string().min(1),
  regulatoryCategory: z.array(z.string()).optional(),
  reportableToFCA: z.boolean().default(false),
  consumerDutyRelevant: z.boolean().default(false),
  keyRiskIndicators: z.array(keyRiskIndicatorSchema).default([]),
  reviewFrequency: z.enum(RISK_REVIEW_FREQUENCIES),
});

export type RiskFormValues = z.infer<typeof riskFormSchema>;
