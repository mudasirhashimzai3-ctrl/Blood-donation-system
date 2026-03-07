import { z } from "zod";

const optionalTrimmedString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

const reportFiltersBaseSchema = z.object({
    date_from: z.string().datetime().optional(),
    date_to: z.string().datetime().optional(),
    group_by: z.enum(["day", "week", "month"]).default("day"),
    hospital_id: z.number().int().positive().optional(),
    city: optionalTrimmedString,
    blood_group: optionalTrimmedString,
    request_type: optionalTrimmedString,
    priority: optionalTrimmedString,
    emergency_only: z.boolean().optional(),
    status: optionalTrimmedString,
    search: optionalTrimmedString,
    ordering: optionalTrimmedString,
    page: z.number().int().min(1).optional(),
    page_size: z.number().int().min(1).max(100).optional(),
  });

export const reportFiltersSchema = reportFiltersBaseSchema
  .superRefine((value, context) => {
    if (value.date_from && value.date_to) {
      const from = new Date(value.date_from).getTime();
      const to = new Date(value.date_to).getTime();
      if (from > to) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "date_from must be before date_to",
          path: ["date_from"],
        });
      }
      const dayMs = 1000 * 60 * 60 * 24;
      if ((to - from) / dayMs > 365) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Date range cannot exceed 365 days",
          path: ["date_to"],
        });
      }
    }
  });

export const createReportExportSchema = z.object({
  report_type: z.enum([
    "request_analytics",
    "donation_analytics",
    "hospital_performance",
    "emergency_analysis",
    "geographic_distance",
    "system_performance",
  ]),
  format: z.enum(["csv", "pdf"]),
  filters: reportFiltersBaseSchema.partial().optional(),
  include_sections: z.array(z.string()).optional(),
});

export type ReportFiltersSchemaInput = z.infer<typeof reportFiltersSchema>;
export type CreateReportExportSchemaInput = z.infer<typeof createReportExportSchema>;
