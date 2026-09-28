function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function layout({ preheader, heading, body }) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(heading)}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f5f1ee;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
    <span style="display:none;max-height:0;overflow:hidden;">${escapeHtml(preheader)}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f1ee;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:480px;background-color:#ffffff;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background:linear-gradient(90deg,#df5b2e 0%,#f08a4b 100%);padding:24px 32px;">
                <span style="color:#ffffff;font-size:18px;font-weight:bold;">TheUrbanNet</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 16px;font-size:22px;">${escapeHtml(heading)}</h1>
                ${body}
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 32px;color:#6b6b6b;font-size:12px;">
                You're receiving this because you joined the TheUrbanNet waitlist. If this
                wasn't you, you can ignore this email.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function customerConfirmationEmail({ name }) {
  const firstName = String(name).trim().split(/\s+/)[0] || "there";

  return {
    subject: "You're on the TheUrbanNet waitlist",
    html: layout({
      preheader: "Thanks for joining the TheUrbanNet waitlist.",
      heading: `Hi ${escapeHtml(firstName)}, you're on the list!`,
      body: `
        <p style="margin:0 0 16px;line-height:1.6;">
          Thanks for signing up to TheUrbanNet. We're building a marketplace that makes it
          easy to find trusted local service providers, and you'll be one of the first to
          know when we launch.
        </p>
        <p style="margin:0;line-height:1.6;">
          No action needed for now &mdash; just watch this inbox.
        </p>
      `,
    }),
  };
}

export function businessConfirmationEmail({ name }) {
  return {
    subject: "You're on the TheUrbanNet provider waitlist",
    html: layout({
      preheader: "Thanks for joining the TheUrbanNet provider waitlist.",
      heading: `Hi ${escapeHtml(name)}, you're on the list!`,
      body: `
        <p style="margin:0 0 16px;line-height:1.6;">
          Thanks for registering your business with TheUrbanNet. We're building a
          marketplace that connects local service providers like you with customers
          looking for exactly what you offer, and we'll be in touch as we get closer to
          launch.
        </p>
        <p style="margin:0;line-height:1.6;">
          No action needed for now &mdash; just watch this inbox.
        </p>
      `,
    }),
  };
}
