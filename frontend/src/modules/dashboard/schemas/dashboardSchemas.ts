import { z } from "zod";

import { BLOOD_GROUP_OPTIONS } from "@/modules/blood-requests/types/bloodRequest.types";
import { DONOR_SEARCH_RADIUS_OPTIONS } from "../types/dashboard.types";

export const dashboardDonorSearchSchema = z.object({
  blood_request_id: z.coerce.number().int().positive(),
  blood_group: z.enum(BLOOD_GROUP_OPTIONS),
  radius_km: z.coerce.number().refine(
    (value) => DONOR_SEARCH_RADIUS_OPTIONS.includes(value as (typeof DONOR_SEARCH_RADIUS_OPTIONS)[number]),
    "Distance range must be 10, 20, 50, or 100 KM"
  ),
});

export type DashboardDonorSearchValues = z.infer<typeof dashboardDonorSearchSchema>;
