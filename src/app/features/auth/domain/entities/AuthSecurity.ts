export interface TwoFactorSetup {
  secret?: string | null;
  otpAuthUri?: string | null;
  qrCodeUri?: string | null;
  manualEntryKey?: string | null;
  message?: string | null;
}

export interface MessageResponse {
  message?: string | null;
}
