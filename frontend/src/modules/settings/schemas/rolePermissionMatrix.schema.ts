import { z } from "zod";

export const rolePermissionMatrixRowSchema = z.object({
  role_name: z.enum(["admin", "recipient", "donor"]),
  module: z.string().min(1, "Module is required"),
  actions: z.array(z.string()).default([]),
});

export const rolePermissionMatrixSchema = z.object({
  matrix: z.array(rolePermissionMatrixRowSchema).min(1, "At least one matrix row is required"),
});

export type RolePermissionMatrixFormValues = z.infer<typeof rolePermissionMatrixSchema>;
