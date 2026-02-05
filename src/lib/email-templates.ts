const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.nasaraconnect.com";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <tr><td style="background-color:#0d9488;padding:24px 32px;">
          <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:600;">Nasara Connect</h1>
        </td></tr>
        <tr><td style="padding:32px;">
          ${content}
        </td></tr>
        <tr><td style="padding:16px 32px;background-color:#f9fafb;border-top:1px solid #e5e7eb;">
          <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">Nasara Connect &mdash; GRC Platform</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function inviteEmailTemplate(params: {
  inviteId: string;
  organizationName: string;
  role: string;
  inviterName: string | null;
  expiresAt: Date | null;
}): { subject: string; html: string; text: string } {
  const acceptUrl = `${APP_URL}/invites/${encodeURIComponent(params.inviteId)}`;
  const safeOrgName = escapeHtml(params.organizationName);
  const safeRole = escapeHtml(params.role);
  const safeInviterName = params.inviterName ? escapeHtml(params.inviterName) : null;
  const inviterText = safeInviterName ? ` by ${safeInviterName}` : "";
  const expiryText = params.expiresAt
    ? `This invitation expires on ${new Date(params.expiresAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}.`
    : "";

  const subject = `You've been invited to join ${params.organizationName} on Nasara Connect`;

  const html = baseLayout(`
    <h2 style="margin:0 0 16px;color:#111827;font-size:18px;">You've been invited!</h2>
    <p style="margin:0 0 12px;color:#374151;font-size:14px;line-height:1.6;">
      You've been invited${inviterText} to join <strong>${safeOrgName}</strong> as a <strong>${safeRole}</strong> on Nasara Connect.
    </p>
    ${expiryText ? `<p style="margin:0 0 24px;color:#6b7280;font-size:13px;">${expiryText}</p>` : '<div style="margin-bottom:24px;"></div>'}
    <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
      <tr><td style="background-color:#0d9488;border-radius:6px;">
        <a href="${acceptUrl}" style="display:inline-block;padding:12px 32px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;">Accept Invitation</a>
      </td></tr>
    </table>
    <p style="margin:24px 0 0;color:#9ca3af;font-size:12px;">If the button doesn't work, copy and paste this URL: ${acceptUrl}</p>
  `);

  const text = `You've been invited${inviterText} to join ${params.organizationName} as a ${params.role} on Nasara Connect.\n\n${expiryText}\n\nAccept your invitation: ${acceptUrl}`;

  return { subject, html, text };
}

export function roleChangeEmailTemplate(params: {
  organizationName: string;
  newRole: string;
}): { subject: string; html: string; text: string } {
  const safeOrgName = escapeHtml(params.organizationName);
  const safeRole = escapeHtml(params.newRole);
  const subject = `Your role has been updated in ${params.organizationName}`;

  const html = baseLayout(`
    <h2 style="margin:0 0 16px;color:#111827;font-size:18px;">Role Updated</h2>
    <p style="margin:0 0 12px;color:#374151;font-size:14px;line-height:1.6;">
      Your role in <strong>${safeOrgName}</strong> has been changed to <strong>${safeRole}</strong>.
    </p>
    <p style="margin:0;color:#6b7280;font-size:13px;">
      If you believe this was a mistake, please contact your organization administrator.
    </p>
  `);

  const text = `Your role in ${params.organizationName} has been changed to ${params.newRole}.\n\nIf you believe this was a mistake, please contact your organization administrator.`;

  return { subject, html, text };
}

export function memberRemovedEmailTemplate(params: {
  organizationName: string;
}): { subject: string; html: string; text: string } {
  const safeOrgName = escapeHtml(params.organizationName);
  const subject = `You've been removed from ${params.organizationName}`;

  const html = baseLayout(`
    <h2 style="margin:0 0 16px;color:#111827;font-size:18px;">Membership Removed</h2>
    <p style="margin:0 0 12px;color:#374151;font-size:14px;line-height:1.6;">
      You have been removed from <strong>${safeOrgName}</strong> on Nasara Connect.
    </p>
    <p style="margin:0;color:#6b7280;font-size:13px;">
      If you believe this was a mistake, please contact the organization administrator.
    </p>
  `);

  const text = `You have been removed from ${params.organizationName} on Nasara Connect.\n\nIf you believe this was a mistake, please contact the organization administrator.`;

  return { subject, html, text };
}
