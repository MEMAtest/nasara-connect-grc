import { createNotification } from "@/lib/server/notifications-store";
import { REGISTER_LABELS, deriveSeverity, formatRecordSummary } from "@/lib/notifications/formatters";

export async function notifyRegisterCreated(options: {
  organizationId: string;
  registerKey: string;
  record: Record<string, unknown>;
  actor?: string | null;
}) {
  const label = REGISTER_LABELS[options.registerKey] ?? "Register";
  const summary = formatRecordSummary(options.record);
  const messageParts: string[] = [];
  if (summary) messageParts.push(summary);
  if (options.actor) messageParts.push(`by ${options.actor}`);

  return createNotification({
    organizationId: options.organizationId,
    title: `${label} record created`,
    message: messageParts.length ? messageParts.join(" • ") : null,
    severity: deriveSeverity(options.record),
    source: `registers:${options.registerKey}`,
    link: `/registers/${options.registerKey}`,
    metadata: {
      register: options.registerKey,
      recordId: typeof options.record.id === "string" ? options.record.id : null,
    },
  });
}
