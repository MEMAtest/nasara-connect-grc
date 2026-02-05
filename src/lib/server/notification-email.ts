import { isEmailConfigured, sendEmail } from "@/lib/email";
import { notificationEmailTemplate } from "@/lib/email-templates";
import type { Notification } from "@/lib/notifications/types";
import { getNotificationPreferences } from "@/lib/server/notification-preferences";

const EMAIL_SEVERITIES = new Set<Notification["severity"]>(["warning", "critical"]);

function looksLikeEmail(value: string | null | undefined): value is string {
  return Boolean(value && value.includes("@"));
}

export async function sendNotificationEmailIfNeeded(params: {
  notification: Notification;
  recipientEmail?: string | null;
}): Promise<void> {
  const recipientEmail = params.recipientEmail;
  if (!looksLikeEmail(recipientEmail)) return;
  if (!EMAIL_SEVERITIES.has(params.notification.severity)) return;

  const preferences = await getNotificationPreferences(recipientEmail);
  if (!preferences.email_notifications) return;

  if (!isEmailConfigured()) return;

  const { subject, html, text } = notificationEmailTemplate({
    title: params.notification.title,
    message: params.notification.message,
    severity: params.notification.severity,
    link: params.notification.link,
    source: params.notification.source,
    createdAt: params.notification.createdAt,
  });

  await sendEmail({
    to: recipientEmail,
    subject,
    html,
    text,
  });
}
