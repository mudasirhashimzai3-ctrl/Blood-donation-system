import { z } from "zod";

/**
 * Forgot Password Schema
 * Accepts either email or username
 */
export const forgotPasswordSchema = z.object({
  email_or_username: z
    .string()
    .min(1, "Email or username is required")
    .refine(
      (val) => {
        // Accept either email format or username
        if (val.includes("@")) {
          return z.string().email().safeParse(val).success;
        }
        return val.length >= 3;
      },
      {
        message: "Invalid email or username format",
      }
    ),
});

/**
 * Verify Reset Code Schema
 * Validates 6-digit verification code
 */
export const verifyResetCodeSchema = z.object({
  code: z
    .string()
    .length(6, "Code must be 6 digits")
    .regex(/^\d{6}$/, "Code must contain only numbers"),
});

/**
 * Reset Password Schema (for form only - code comes from navigation state)
 * Validates password strength and confirmation
 */
export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Must contain at least one special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

/**
 * Verify Email Schema
 * Validates verification token
 */
export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Invalid verification token"),
});

/**
 * Signup Schema
 * Creates donor or recipient accounts
 */
export const signupSchema = z
  .object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(50, "Username must be at most 50 characters"),
    email: z.union([z.string().email("Invalid email address"), z.literal("")]),
    phone: z.string().min(1, "Phone is required"),
    role: z.enum(["donor", "recipient"], {
      required_error: "Role is required",
      invalid_type_error: "Role is required",
    }),
    donor_blood_group: z
      .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
      .optional(),
    donor_latitude: z.coerce.number().optional(),
    donor_longitude: z.coerce.number().optional(),
    recipient_required_blood_group: z
      .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
      .optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .superRefine((data, ctx) => {
    if (data.role === "donor") {
      if (!data.donor_blood_group) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Blood group is required for donor signup",
          path: ["donor_blood_group"],
        });
      }
      const lat = data.donor_latitude;
      if (lat !== undefined && !Number.isNaN(lat) && (lat < -90 || lat > 90)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Latitude must be between -90 and 90",
          path: ["donor_latitude"],
        });
      }
      const lon = data.donor_longitude;
      if (lon !== undefined && !Number.isNaN(lon) && (lon < -180 || lon > 180)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Longitude must be between -180 and 180",
          path: ["donor_longitude"],
        });
      }
    }
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

/**
 * Enhanced Login Schema
 * Includes rate limiting support
 */
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .max(50, "Username must be at most 50 characters"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be at most 100 characters"),
  rememberMe: z.boolean().optional(),
});

// Type exports for TypeScript
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type VerifyResetCodeInput = z.infer<typeof verifyResetCodeSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
