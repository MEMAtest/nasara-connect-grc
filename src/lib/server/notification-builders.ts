export async function notifyRegisterCreated(_options: {
  organizationId: string;
  registerKey: string;
  record: object & { id?: string };
  actor?: string | null;
  recipientEmail?: string | null;
}) {
  // Register notifications are currently disabled; keep hook for future use.
}
