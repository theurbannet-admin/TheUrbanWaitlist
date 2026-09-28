import { validateCustomerSubmission, validateBusinessSubmission } from "../lib/validate.js";
import {
  insertSignup,
  markConfirmationEmailSent,
  markConfirmationEmailFailed,
  markSheetSynced,
  markSheetSyncFailed,
} from "../lib/db.js";
import { forwardToGoogleSheet } from "../lib/googleSheet.js";
import { getResendClient, getFromAddress } from "../lib/resend.js";
import { customerConfirmationEmail, businessConfirmationEmail } from "../lib/emails/confirmation.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, message: "Method not allowed." });
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const formType = body.form_type;
  const submissionId = typeof body.submission_id === "string" ? body.submission_id : null;

  if (formType !== "customer" && formType !== "business") {
    return res.status(400).json({ success: false, message: "Unknown or missing form_type." });
  }

  const validation =
    formType === "customer" ? validateCustomerSubmission(body) : validateBusinessSubmission(body);

  if (!validation.valid) {
    return res.status(400).json({ success: false, message: validation.message });
  }

  const { name, email, details } = validation;

  let signupId;

  try {
    signupId = await insertSignup({
      formType,
      name,
      email,
      postcode: details.postcode,
      details,
      submissionId,
    });
  } catch (error) {
    console.error("Failed to store signup:", error);
    return res.status(500).json({ success: false, message: "Could not save your submission." });
  }

  if (signupId === null) {
    // submission_id already stored — this is a retry of a request whose
    // response was lost, not a new signup. Treat it as a success without
    // inserting a duplicate row or sending a second email.
    return res.status(200).json({ success: true });
  }

  // The signup is saved at this point, which is what matters most. The Google
  // Sheet copy and the confirmation email are both best-effort: a failure is
  // logged and recorded on the row for follow-up, but does not fail the
  // request or make the form show an error — the user is on the list either
  // way. They run in parallel so neither delays the other.
  await Promise.all([
    runBestEffort("Google Sheet forward", signupId, markSheetSyncFailed, async () => {
      await forwardToGoogleSheet(body);
      await markSheetSynced(signupId);
    }),
    runBestEffort("confirmation email", signupId, markConfirmationEmailFailed, async () => {
      const template =
        formType === "customer" ? customerConfirmationEmail({ name }) : businessConfirmationEmail({ name });

      await getResendClient().emails.send({
        from: getFromAddress(),
        to: email,
        subject: template.subject,
        html: template.html,
      });

      await markConfirmationEmailSent(signupId);
    }),
  ]);

  return res.status(200).json({ success: true });
}

async function runBestEffort(label, signupId, recordFailure, task) {
  try {
    await task();
  } catch (error) {
    console.error(`Failed: ${label}:`, error);

    try {
      await recordFailure(signupId, String(error?.message ?? error));
    } catch (updateError) {
      console.error(`Failed to record ${label} failure:`, updateError);
    }
  }
}
