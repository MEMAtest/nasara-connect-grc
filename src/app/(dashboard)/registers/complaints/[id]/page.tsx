import { ComplaintDetailView } from "@/components/complaints/ComplaintDetailView";

interface ComplaintDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ComplaintDetailPage({ params }: ComplaintDetailPageProps) {
  const { id } = await params;

  return <ComplaintDetailView complaintId={id} />;
}

export const metadata = {
  title: "Complaint Details | Nasara Connect",
  description: "View and manage complaint details",
};
