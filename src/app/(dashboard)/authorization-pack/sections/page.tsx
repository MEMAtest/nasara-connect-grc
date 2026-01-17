import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function AuthorizationPackSectionsPage({
  searchParams,
}: {
  searchParams?: { packId?: string };
}) {
  const packId = searchParams?.packId;
  redirect(packId ? `/authorization-pack/workspace?packId=${packId}` : "/authorization-pack/workspace");
}
