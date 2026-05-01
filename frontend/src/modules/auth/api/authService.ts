import apiClient from "@/lib/api";

// Request/Response Types
export interface ForgotPasswordRequest {
  email_or_username: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  masked_email?: string; // Partially masked: "s*****@example.com"
}

export interface VerifyResetCodeRequest {
  email_or_username: string;
  code: string;
}

export interface VerifyResetCodeResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordRequest {
  email_or_username: string;
  code: string;
  new_password: string;
  confirm_password: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface VerifyEmailResponse {
  message: string;
  email: string;
}

export interface SignupRequest {
  first_name: string;
  last_name: string;
  username: string;
  email?: string;
  phone: string;
  donor_blood_group?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  donor_latitude?: number;
  donor_longitude?: number;
  recipient_required_blood_group?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  password: string;
  confirm_password: string;
  role: "donor" | "recipient";
}

export interface SignupResponse {
  message: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    phone: string;
    role: "donor" | "recipient";
  };
  profile: {
    donor_blood_group?: string | null;
    donor_latitude?: number | null;
    donor_longitude?: number | null;
    recipient_required_blood_group?: string | null;
  };
}

export interface LoginAttemptInfo {
  attempts: number;
  remaining: number;
  lockedUntil?: string; // ISO timestamp
}

/**
 * Authentication Service
 * Handles password reset, email verification, and session management
 */
export const authService = {
  /**
   * Public signup for donor/recipient accounts
   */
  signup: (data: SignupRequest) =>
    apiClient.post<SignupResponse>("/accounts/auth/signup/", data),

  /**
   * Request password reset code via email
   * @param data Email or username
   * @returns Success message with masked email
   */
  forgotPassword: (data: ForgotPasswordRequest) =>
    apiClient.post<ForgotPasswordResponse>(
      "/accounts/auth/forgot-password/",
      data
    ),

  /**
   * Verify the reset code
   * @param data Email/username and verification code
   * @returns Success status
   */
  verifyResetCode: (data: VerifyResetCodeRequest) =>
    apiClient.post<VerifyResetCodeResponse>(
      "/accounts/auth/verify-reset-code/",
      data
    ),

  /**
   * Reset password using verification code
   * @param data Email/username, code, and new password
   * @returns Success message
   */
  resetPassword: (data: ResetPasswordRequest) =>
    apiClient.post<ResetPasswordResponse>(
      "/accounts/auth/reset-password/",
      data
    ),

  /**
   * Verify email using token
   * @param data Verification token
   * @returns Success message with email
   */
  verifyEmail: (data: VerifyEmailRequest) =>
    apiClient.post<VerifyEmailResponse>("/accounts/auth/verify-email/", data),

  /**
   * Resend verification email
   * @param email User email address
   * @returns Success message
   */
  resendVerificationEmail: (email: string) =>
    apiClient.post("/accounts/auth/resend-verification/", { email }),

  /**
   * Get login attempt status for username
   * @param username Username to check
   * @returns Attempt count and lockout info
   */
  getLoginAttempts: (username: string) =>
    apiClient.get<LoginAttemptInfo>(
      `/accounts/auth/login-attempts/${username}/`
    ),

  /**
   * Refresh session to keep user logged in
   * @returns Success response
   */
  refreshSession: () => apiClient.post("/accounts/auth/refresh-session/"),
};
