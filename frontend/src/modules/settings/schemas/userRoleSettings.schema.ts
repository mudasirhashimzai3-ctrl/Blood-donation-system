import { z } from "zod";

export const userRoleSettingsSchema = z.object({
  allow_user_invite: z.boolean(),
  default_new_user_role: z.enum(["admin", "receptionist", "viewer"]),
  allow_role_editing: z.boolean(),
  allow_self_profile_edit: z.boolean(),
  enforce_2fa_for_admin: z.boolean(),
});

export type UserRoleSettingsFormValues = z.infer<typeof userRoleSettingsSchema>;
