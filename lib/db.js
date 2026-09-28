import { sql } from "./sql.js";

// Inserts a signup and returns its new id, or null if submissionId was
// already stored (a retried request after a dropped response) — Postgres
// never treats two NULLs as conflicting, so requests without an
// idempotency key always insert normally.
export async function insertSignup({ formType, name, email, postcode, details, submissionId }) {
  const rows = await sql`
    INSERT INTO signups (form_type, name, email, postcode, details, submission_id)
    VALUES (${formType}, ${name}, ${email}, ${postcode ?? null}, ${JSON.stringify(details)}, ${submissionId ?? null})
    ON CONFLICT (submission_id) DO NOTHING
    RETURNING id
  `;

  return rows[0]?.id ?? null;
}

export async function markConfirmationEmailSent(id) {
  await sql`
    UPDATE signups SET confirmation_email_sent_at = now(), confirmation_email_error = NULL
    WHERE id = ${id}
  `;
}

export async function markSheetSynced(id) {
  await sql`
    UPDATE signups SET sheet_synced_at = now(), sheet_sync_error = NULL
    WHERE id = ${id}
  `;
}

export async function markSheetSyncFailed(id, message) {
  await sql`
    UPDATE signups SET sheet_sync_error = ${message}
    WHERE id = ${id}
  `;
}

export async function markConfirmationEmailFailed(id, message) {
  await sql`
    UPDATE signups SET confirmation_email_error = ${message}
    WHERE id = ${id}
  `;
}
