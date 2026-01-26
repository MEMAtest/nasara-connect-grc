import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AuthorizationPackReviewPage({
  searchParams,
}: {
  searchParams?: Promise<{ packId?: string }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const packId = params?.packId;
  const target = packId
    ? `/authorization-pack/workspace?packId=${packId}#review`
    : "/authorization-pack/workspace#review";
  redirect(target);
}
