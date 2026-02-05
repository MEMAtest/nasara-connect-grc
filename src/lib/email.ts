import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { logError } from "@/lib/logger";

const sesRegion = process.env.AWS_SES_REGION || "eu-west-2";
const sesAccessKeyId = process.env.AWS_SES_ACCESS_KEY_ID;
const sesSecretAccessKey = process.env.AWS_SES_SECRET_ACCESS_KEY;
const emailFrom = process.env.EMAIL_FROM_ADDRESS || "team@nasaraconnect.com";

let sesClient: SESClient | null = null;

function getClient(): SESClient | null {
  if (!isEmailConfigured()) return null;
  if (!sesClient) {
    sesClient = new SESClient({
      region: sesRegion,
      credentials: {
        accessKeyId: sesAccessKeyId!,
        secretAccessKey: sesSecretAccessKey!,
      },
    });
  }
  return sesClient;
}

export function isEmailConfigured(): boolean {
  return Boolean(sesAccessKeyId && sesSecretAccessKey);
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<boolean> {
  const client = getClient();
  if (!client) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[Email Dev] Would send to ${params.to}: ${params.subject}`);
    }
    return false;
  }

  try {
    await client.send(
      new SendEmailCommand({
        Source: emailFrom,
        Destination: { ToAddresses: [params.to] },
        Message: {
          Subject: { Data: params.subject, Charset: "UTF-8" },
          Body: {
            Html: { Data: params.html, Charset: "UTF-8" },
            Text: { Data: params.text, Charset: "UTF-8" },
          },
        },
      })
    );
    return true;
  } catch (error) {
    logError(error, `Failed to send email to ${params.to}`);
    return false;
  }
}
