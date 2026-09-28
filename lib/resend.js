import { Resend } from "resend";

let client = null;

// Lazily constructed so a missing RESEND_API_KEY only breaks the request
// that actually needs to send an email, not every cold start.
export function getResendClient() {
  if (!client) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set.");
    }

    client = new Resend(process.env.RESEND_API_KEY);
  }

  return client;
}

export function getFromAddress() {
  return process.env.RESEND_FROM_EMAIL || "TheUrbanNet <onboarding@resend.dev>";
}
