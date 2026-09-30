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

  // Apps Script answers 200 even when doPost throws (with an HTML error page),
  // so the status alone can't tell success from failure — only the script's
  // own JSON reply can.
  const text = await response.text();
  let result = null;

  try {
    result = JSON.parse(text);
  } catch {
    // Not JSON: an error or sign-in page rather than the script's reply.
  }

  if (result?.success !== true) {
    const detail = result?.message ?? summarizeHtml(text);
    throw new Error(`Google Apps Script did not confirm the save: ${detail}`);
  }
}

// Pulls the readable error text (e.g. "TypeError: … (line 12)") out of an
// Apps Script HTML error page, so it fits in sheet_sync_error.
function summarizeHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 500);
}
