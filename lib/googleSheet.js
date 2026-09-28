// Forwards a submission to the existing Google Apps Script, which appends it
// to the Google Sheet that feeds the Slides deck. The payload matches what the
// forms used to send directly (form_type + the form's own fields, urlencoded),
// so the Apps Script does not need to change. submission_id is deliberately
// left out: the script was never written to expect it.
const DEFAULT_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyLzcA1-lVa3OTawov1OS7U16qbYYRg6K03X8UOG8Ez2gf9FsbhLhVNl1iVOGwjVBi4fg/exec";

export async function forwardToGoogleSheet(body) {
  const { submission_id: _submissionId, ...fields } = body;

  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(fields)) {
    params.append(key, String(value ?? ""));
  }

  const response = await fetch(process.env.GOOGLE_SCRIPT_URL || DEFAULT_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
    body: params,
  });

  if (!response.ok) {
    throw new Error(`Google Apps Script returned ${response.status}.`);
  }
}
