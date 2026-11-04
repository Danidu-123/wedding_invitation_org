import type { Metadata } from "next";
import { Invitation } from "@/components/invite/Invitation";
import { getInvite } from "@/lib/supabase/public";

type Props = { params: Promise<{ code: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const invite = await getInvite((await params).code);
  return invite
    ? { title: `Dear ${invite.name} · Thinidu & Chenaji's Wedding`, robots: { index: false } }
    : { robots: { index: false } };
}

export default async function PersonalInvite({ params }: Props) {
  const { code } = await params;
  const invite = await getInvite(code);
  // Unknown codes still see the general invitation
  return (
    <Invitation
      guest={
        invite
          ? { code, name: invite.name, invitedCount: invite.invited_count, rsvp: invite.rsvp, attendees: invite.attendees }
          : undefined
      }
    />
  );
}
