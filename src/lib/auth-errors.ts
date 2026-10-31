export function friendlyAuthError(error: string | undefined | null): string {
  if (!error) return "Unable to sign in. Please try again.";

  switch (error) {
    case "CredentialsSignin":
      return "Invalid email or password. If this is the live site, register a new account first — local seed users are not in production.";
    case "Configuration":
      return "Sign-in is not configured. Add NEXTAUTH_SECRET (and a hosted DATABASE_URL) in Vercel environment variables.";
    case "AccessDenied":
      return "Access denied.";
    case "Callback":
    case "OAuthCallback":
    case "Default":
      return "Sign-in could not complete. Check NEXTAUTH_URL in Vercel and try again.";
    default:
      return error;
  }
}
