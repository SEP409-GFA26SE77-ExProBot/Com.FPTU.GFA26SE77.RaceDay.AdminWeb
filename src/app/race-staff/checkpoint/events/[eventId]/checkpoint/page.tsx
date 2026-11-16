import { redirect } from "next/navigation";

export default async function LegacyCheckpointPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  redirect(`/checkpoint/events/${eventId}`);
}
