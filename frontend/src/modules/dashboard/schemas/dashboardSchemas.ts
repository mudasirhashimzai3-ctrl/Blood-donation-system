import { z } from "zod";

export const dashboardGroupBySchema = z.enum(["day", "week", "month"]);

const dashboardKpiValueSchema = z.object({
  value: z.number().int().nonnegative(),
  href: z.string(),
});

const dashboardRequestStatusDistributionItemSchema = z.object({
  status: z.string(),
  count: z.number().int().nonnegative(),
  href: z.string(),
});

const dashboardDonationTrendItemSchema = z.object({
  bucket: z.string().nullable(),
  completed: z.number().int().nonnegative(),
  cancelled: z.number().int().nonnegative(),
});

const dashboardBloodGroupSupplyDemandItemSchema = z.object({
  blood_group: z.string(),
  donors: z.number().int().nonnegative(),
  active_requests: z.number().int().nonnegative(),
});

export const dashboardOverviewResponseSchema = z.object({
  generated_at: z.string().datetime(),
  filters: z.object({
    date_from: z.string().datetime(),
    date_to: z.string().datetime(),
    group_by: dashboardGroupBySchema,
  }),
  access: z.object({
    donors: z.boolean(),
    recipients: z.boolean(),
    blood_requests: z.boolean(),
    donations: z.boolean(),
  }),
  kpis: z.object({
    total_donors: dashboardKpiValueSchema.nullable(),
    total_recipients: dashboardKpiValueSchema.nullable(),
    active_requests: dashboardKpiValueSchema.nullable(),
    completed_donations: dashboardKpiValueSchema.nullable(),
  }),
  charts: z.object({
    requests_status_distribution: z.array(dashboardRequestStatusDistributionItemSchema).nullable(),
    donations_trend: z.array(dashboardDonationTrendItemSchema).nullable(),
    blood_group_supply_vs_demand: z.array(dashboardBloodGroupSupplyDemandItemSchema).nullable(),
  }),
  statistics: z.object({
    request_completion_rate: z.number().nullable(),
    donation_completion_rate: z.number().nullable(),
    avg_donation_response_time_minutes: z.number().nullable(),
  }),
  cache: z.object({
    from_cache: z.boolean(),
    ttl_seconds: z.number().int().nonnegative(),
  }),
});

export type DashboardOverviewSchema = z.infer<typeof dashboardOverviewResponseSchema>;
