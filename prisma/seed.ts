import { prisma } from "../src/lib/prisma";
import { DEFAULT_ORGANIZATION_ID } from "../src/lib/constants";

async function main() {
  const domain = process.env.DEFAULT_ORG_DOMAIN || "default.local";
  const name = process.env.DEFAULT_ORG_NAME || "Default Organization";
  const plan = process.env.DEFAULT_ORG_PLAN || "starter";

  await prisma.organization.upsert({
    where: { id: DEFAULT_ORGANIZATION_ID },
    update: { name, domain, plan },
    create: {
      id: DEFAULT_ORGANIZATION_ID,
      name,
      domain,
      plan,
      settings: {},
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
