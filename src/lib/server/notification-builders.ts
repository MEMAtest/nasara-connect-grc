import { createNotification } from "@/lib/server/notifications-store";
import { REGISTER_LABELS, deriveSeverity, formatRecordSummary } from "@/lib/notifications/formatters";

export async function notifyRegisterCreated(options: {
  organizationId: string;
  registerKey: string;
  record: object & { id?: string };
  actor?: string | null;
  recipientEmail?: string | null;
}) {
  const label = REGISTER_LABELS[options.registerKey] ?? "Register";
  const rec = options.record as unknown as Record<string, unknown>;
  const summary = formatRecordSummary(rec);
  const messageParts: string[] = [];
  if (summary) messageParts.push(summary);
  if (options.actor) messageParts.push(`by ${options.actor}`);
  const recipientEmail =
    options.recipientEmail ?? (options.actor && options.actor.includes("@") ? options.actor : null);

  return createNotification({
    organizationId: options.organizationId,
    recipientEmail,
    title: `${label} record created`,
    message: messageParts.length ? messageParts.join(" • ") : null,
    severity: deriveSeverity(rec),
    source: `registers:${options.registerKey}`,
    link: `/registers/${options.registerKey}`,
    metadata: {
      register: options.registerKey,
      recordId: typeof rec.id === "string" ? rec.id : null,
    },
  });
}
